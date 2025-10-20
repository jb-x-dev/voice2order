import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { transcribeAudio } from "./_core/voiceTranscription";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

// Helper to generate unique IDs
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  voiceOrder: router({
    // Create a new voice order
    create: protectedProcedure
      .input(z.object({
        audioUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const orderId = generateId();
        const order = await db.createVoiceOrder({
          id: orderId,
          userId: ctx.user.id,
          audioUrl: input.audioUrl,
          status: "pending",
        });
        return order;
      }),

    // Transcribe audio
    transcribe: protectedProcedure
      .input(z.object({
        orderId: z.string(),
        audioUrl: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          await db.updateVoiceOrderStatus(input.orderId, "processing");
          
          const result = await transcribeAudio({
            audioUrl: input.audioUrl,
            language: "de",
            prompt: "Transkribiere die Bestellung von Lebensmitteln und Waren für ein Hotel oder Restaurant. Achte auf Mengenangaben und Artikelnamen.",
          });

          if ('error' in result) {
            throw new Error(result.error);
          }

          await db.updateVoiceOrderStatus(input.orderId, "completed", result.text);
          
          return {
            transcription: result.text,
            language: result.language,
          };
        } catch (error) {
          await db.updateVoiceOrderStatus(input.orderId, "error");
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Transkription fehlgeschlagen",
          });
        }
      }),

    // Parse transcription into order items using LLM
    parseTranscription: protectedProcedure
      .input(z.object({
        orderId: z.string(),
        transcription: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `Du bist ein Assistent für die Verarbeitung von Bestellungen in Hotels und Restaurants. 
Extrahiere aus der gesprochenen Bestellung alle Artikel mit Mengen und Einheiten.
Gib das Ergebnis als JSON-Array zurück mit folgender Struktur:
[
  {
    "articleName": "Name des Artikels",
    "quantity": Anzahl als Zahl,
    "unit": "Einheit (z.B. Kilo, Liter, Stück, Packung)"
  }
]`
              },
              {
                role: "user",
                content: `Bestellung: ${input.transcription}`
              }
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "order_items",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          articleName: { type: "string" },
                          quantity: { type: "number" },
                          unit: { type: "string" }
                        },
                        required: ["articleName", "quantity", "unit"],
                        additionalProperties: false
                      }
                    }
                  },
                  required: ["items"],
                  additionalProperties: false
                }
              }
            }
          });

          const content = response.choices[0].message.content;
          if (!content || typeof content !== 'string') {
            throw new Error("Keine Antwort vom LLM");
          }

          const parsed = JSON.parse(content);
          const items = parsed.items || [];

          // Create order items in database
          const createdItems = [];
          for (const item of items) {
            const orderItem = await db.createOrderItem({
              id: generateId(),
              voiceOrderId: input.orderId,
              articleName: item.articleName,
              quantity: Math.round(item.quantity),
              unit: item.unit,
              confirmed: false,
            });
            createdItems.push(orderItem);
          }

          return createdItems;
        } catch (error) {
          console.error("Parse error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Parsing der Bestellung fehlgeschlagen",
          });
        }
      }),

    // Match order items with article history
    matchArticles: protectedProcedure
      .input(z.object({
        orderId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const items = await db.getOrderItems(input.orderId);
        const history = await db.getUserArticleHistory(ctx.user.id);

        for (const item of items) {
          // Simple fuzzy matching - find best match in history
          let bestMatch = null;
          let bestScore = 0;

          for (const historyItem of history) {
            const score = calculateSimilarity(
              item.articleName.toLowerCase(),
              historyItem.articleName.toLowerCase()
            );
            if (score > bestScore && score > 0.6) {
              bestScore = score;
              bestMatch = historyItem;
            }
          }

          if (bestMatch) {
            await db.updateOrderItem(item.id, {
              matchedArticleId: bestMatch.articleId,
              matchedArticleName: bestMatch.articleName,
              matchedSupplier: bestMatch.supplier,
              matchedPrice: bestMatch.lastPrice,
              confidence: Math.round(bestScore * 100),
            });
          }
        }

        return db.getOrderItems(input.orderId);
      }),

    // Get user's voice orders
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserVoiceOrders(ctx.user.id);
    }),

    // Get single voice order with items
    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const order = await db.getVoiceOrder(input.id);
        if (!order || order.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const items = await db.getOrderItems(input.id);
        return { order, items };
      }),

    // Confirm order item
    confirmItem: protectedProcedure
      .input(z.object({
        itemId: z.string(),
        confirmed: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        await db.updateOrderItem(input.itemId, {
          confirmed: input.confirmed,
        });
        return { success: true };
      }),

    // Update order item
    updateItem: protectedProcedure
      .input(z.object({
        itemId: z.string(),
        quantity: z.number().optional(),
        unit: z.string().optional(),
        matchedArticleId: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const updates: any = {};
        if (input.quantity !== undefined) updates.quantity = input.quantity;
        if (input.unit !== undefined) updates.unit = input.unit;
        if (input.matchedArticleId !== undefined) updates.matchedArticleId = input.matchedArticleId;
        
        await db.updateOrderItem(input.itemId, updates);
        return { success: true };
      }),
  }),

  articleHistory: router({
    // Get user's article history
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserArticleHistory(ctx.user.id);
    }),

    // Search article history
    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.searchArticleHistory(ctx.user.id, input.query);
      }),

    // Add article to history
    add: protectedProcedure
      .input(z.object({
        articleId: z.string(),
        articleName: z.string(),
        supplier: z.string().optional(),
        ean: z.string().optional(),
        unit: z.string().optional(),
        price: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertArticleHistory({
          id: generateId(),
          userId: ctx.user.id,
          articleId: input.articleId,
          articleName: input.articleName,
          supplier: input.supplier,
          ean: input.ean,
          unit: input.unit,
          lastPrice: input.price ? Math.round(input.price * 100) : undefined,
          orderCount: 1,
          lastOrderedAt: new Date(),
        });
        return { success: true };
      }),
  }),

  jbxSettings: router({
    // Get jb-x settings
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getJbxSettings(ctx.user.id);
    }),

    // Update jb-x settings
    update: protectedProcedure
      .input(z.object({
        jbxUsername: z.string().optional(),
        jbxPassword: z.string().optional(),
        jbxOrganization: z.string().optional(),
        defaultCostCenter: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertJbxSettings({
          id: generateId(),
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

// Simple string similarity calculation (Levenshtein-based)
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

