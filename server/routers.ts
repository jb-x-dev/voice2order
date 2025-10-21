import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { transcribeAudio } from "./_core/voiceTranscription";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { adminRouter } from "./adminRouter";
import { publicSeedRouter } from "./publicSeedRouter";
import { importRouter } from "./importRouter";
import { autoSeedForUser } from "./autoSeedMiddleware";
import * as db from "./db";

// Helper to generate unique IDs
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const appRouter = router({
  system: systemRouter,
  admin: adminRouter,
  seed: publicSeedRouter,
  import: importRouter,

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
        const order = await db.createOrder({
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
          await db.updateOrderStatus(input.orderId, "processing");
          
          const result = await transcribeAudio({
            audioUrl: input.audioUrl,
            language: "de",
            prompt: "Transkribiere die Bestellung von Lebensmitteln und Waren für ein Hotel oder Restaurant. Achte auf Mengenangaben und Artikelnamen.",
          });

          if ('error' in result) {
            throw new Error(result.error);
          }

          await db.updateOrderStatus(input.orderId, "completed", result.text);
          
          return {
            transcription: result.text,
            language: result.language,
          };
        } catch (error) {
          await db.updateOrderStatus(input.orderId, "failed");
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Transkription fehlgeschlagen",
          });
        }
      }),



    // Get user's orders
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserOrders(ctx.user.id);
    }),

    // Get single order
    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const order = await db.getOrder(input.id);
        if (!order || order.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return order;
      }),
  }),

  articleHistory: router({
    // Get user article history
    list: protectedProcedure.query(async ({ ctx }) => {
      // Auto-seed data for joachim.braun@jb-x.com on first access
      await autoSeedForUser(ctx.user.id);
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

  weeklyOrderSuggestions: router({
    // Get weekly order suggestions
    list: protectedProcedure.query(async ({ ctx }) => {
      const suggestions = await db.getWeeklyOrderSuggestions(ctx.user.id);
      return suggestions.map(s => ({
        ...s,
        items: JSON.parse(s.items as string),
      }));
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

