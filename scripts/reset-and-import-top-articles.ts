import { drizzle } from "drizzle-orm/mysql2";
import { articleHistory } from "../drizzle/schema";
import { sql } from "drizzle-orm";

const SAMPLE_USER_ID = "sample-user-001";

// Top-Bestellartikel basierend auf echten jb-x Portal Daten
const topArticles = [
  // Getränke - Otto Pachmayr, Baer-Mühle
  {
    id: "top-001",
    userId: SAMPLE_USER_ID,
    articleId: "3833",
    articleName: "Sprite 0,2L Pfand 24er Kiste",
    supplier: "Otto Pachmayr",
    ean: "5000112637830",
    unit: "KAS",
    lastPrice: 1078,
    orderCount: 45,
    lastOrderedAt: new Date("2025-10-19"),
  },
  {
    id: "top-002",
    userId: SAMPLE_USER_ID,
    articleId: "2766",
    articleName: "Coca Cola 24x0,2L Kiste",
    supplier: "Baer-Mühle",
    ean: "5000112548907",
    unit: "KAS",
    lastPrice: 1065,
    orderCount: 52,
    lastOrderedAt: new Date("2025-10-19"),
  },

  // Milchprodukte - Hamberger Lieferservice
  {
    id: "top-003",
    userId: SAMPLE_USER_ID,
    articleId: "80410",
    articleName: "H-MILCH 3,5% FETT 1L 12er Pack",
    supplier: "Hamberger Lieferservice",
    ean: "4311501325520",
    unit: "UKT",
    lastPrice: 1103,
    orderCount: 38,
    lastOrderedAt: new Date("2025-10-19"),
  },
  {
    id: "top-004",
    userId: SAMPLE_USER_ID,
    articleId: "451740",
    articleName: "HENDRICK'S GIN 0,7L",
    supplier: "Hamberger Lieferservice",
    ean: "5010327324005",
    unit: "FLA",
    lastPrice: 2479,
    orderCount: 12,
    lastOrderedAt: new Date("2025-10-18"),
  },
  {
    id: "top-005",
    userId: SAMPLE_USER_ID,
    articleId: "451984",
    articleName: "CRODINO ALKOHOLFREIER BITTER 8x98ML",
    supplier: "Hamberger Lieferservice",
    ean: "8001440003011",
    unit: "UKT",
    lastPrice: 3312,
    orderCount: 15,
    lastOrderedAt: new Date("2025-10-18"),
  },
  {
    id: "top-006",
    userId: SAMPLE_USER_ID,
    articleId: "294133",
    articleName: "SENEGAL-ZUNGE 400-500G",
    supplier: "Hamberger Lieferservice",
    ean: "4029429413300",
    unit: "KG",
    lastPrice: 2499,
    orderCount: 8,
    lastOrderedAt: new Date("2025-10-17"),
  },

  // Fisch & Meeresfrüchte - Deutsche See, R+S Gourmets
  {
    id: "top-007",
    userId: SAMPLE_USER_ID,
    articleId: "86317",
    articleName: "Seeteufel mit Haut ohne Kopf frisch 2-4kg",
    supplier: "Deutsche See",
    ean: "4013086317000",
    unit: "KIS",
    lastPrice: 13194,
    orderCount: 6,
    lastOrderedAt: new Date("2025-10-18"),
  },
  {
    id: "top-008",
    userId: SAMPLE_USER_ID,
    articleId: "81913",
    articleName: "Wolfsbarschfilet mit Haut TK 10% Gl. 80-120g 5kg",
    supplier: "Deutsche See",
    ean: "4013081913000",
    unit: "KAR",
    lastPrice: 8845,
    orderCount: 14,
    lastOrderedAt: new Date("2025-10-19"),
  },
  {
    id: "top-009",
    userId: SAMPLE_USER_ID,
    articleId: "305295",
    articleName: "Dorade Royalefilet mit Haut 160/200g TK 5kg",
    supplier: "R+S Gourmets",
    ean: "4073730529500",
    unit: "KI",
    lastPrice: 1599,
    orderCount: 18,
    lastOrderedAt: new Date("2025-10-19"),
  },

  // Premium Fleisch - Delta Hamburg
  {
    id: "top-010",
    userId: SAMPLE_USER_ID,
    articleId: "12107",
    articleName: "Delta Dry Aged Roastbeef ohne Knochen Frisch",
    supplier: "Delta Hamburg",
    ean: "4009512107000",
    unit: "STK",
    lastPrice: 13396,
    orderCount: 9,
    lastOrderedAt: new Date("2025-10-18"),
  },
  {
    id: "top-011",
    userId: SAMPLE_USER_ID,
    articleId: "180",
    articleName: "I.B.P US Roastbeef/Striploin Frisch",
    supplier: "Delta Hamburg",
    ean: "4009500180000",
    unit: "STK",
    lastPrice: 18475,
    orderCount: 5,
    lastOrderedAt: new Date("2025-10-17"),
  },
  {
    id: "top-012",
    userId: SAMPLE_USER_ID,
    articleId: "28206",
    articleName: "D-Dry Aged Rib Roast Prime frisch",
    supplier: "Delta Hamburg",
    ean: "4009528206000",
    unit: "STK",
    lastPrice: 14963,
    orderCount: 7,
    lastOrderedAt: new Date("2025-10-18"),
  },
  {
    id: "top-013",
    userId: SAMPLE_USER_ID,
    articleId: "5055",
    articleName: "Kalbs-Tomahawk 7 Rippen Frisch",
    supplier: "Delta Hamburg",
    ean: "4009505055000",
    unit: "STK",
    lastPrice: 9433,
    orderCount: 11,
    lastOrderedAt: new Date("2025-10-19"),
  },
  {
    id: "top-014",
    userId: SAMPLE_USER_ID,
    articleId: "644",
    articleName: "Puten-Brustfilet Frisch ca. 2,75kg",
    supplier: "Delta Hamburg",
    ean: "4009500644000",
    unit: "BG",
    lastPrice: 3286,
    orderCount: 22,
    lastOrderedAt: new Date("2025-10-19"),
  },

  // Backwaren - EDNA
  {
    id: "top-015",
    userId: SAMPLE_USER_ID,
    articleId: "35036",
    articleName: "HUG Windbeute 7,5cm 120 Stück",
    supplier: "EDNA",
    ean: "4016235036000",
    unit: "CT",
    lastPrice: 8568,
    orderCount: 8,
    lastOrderedAt: new Date("2025-10-16"),
  },
  {
    id: "top-016",
    userId: SAMPLE_USER_ID,
    articleId: "11271",
    articleName: "Butter-Windbeute 9cm 96 Stück",
    supplier: "EDNA",
    ean: "4016211271000",
    unit: "CT",
    lastPrice: 8352,
    orderCount: 10,
    lastOrderedAt: new Date("2025-10-17"),
  },
  {
    id: "top-017",
    userId: SAMPLE_USER_ID,
    articleId: "555",
    articleName: "Finnenbrötchen 60 Stück",
    supplier: "EDNA",
    ean: "4016200555000",
    unit: "CT",
    lastPrice: 1554,
    orderCount: 28,
    lastOrderedAt: new Date("2025-10-19"),
  },
  {
    id: "top-018",
    userId: SAMPLE_USER_ID,
    articleId: "60275",
    articleName: "Poensgen Körnerbrötchen glutenfrei 5 Stück",
    supplier: "EDNA",
    ean: "4016260275000",
    unit: "CT",
    lastPrice: 2145,
    orderCount: 12,
    lastOrderedAt: new Date("2025-10-18"),
  },
  {
    id: "top-019",
    userId: SAMPLE_USER_ID,
    articleId: "60271",
    articleName: "Poensgen Kaisersemmel glutenfrei 5 Stück",
    supplier: "EDNA",
    ean: "4016260271000",
    unit: "CT",
    lastPrice: 1875,
    orderCount: 14,
    lastOrderedAt: new Date("2025-10-18"),
  },

  // Wein & Champagner - AllAboutWine, Karl Pfaffmann
  {
    id: "top-020",
    userId: SAMPLE_USER_ID,
    articleId: "220027",
    articleName: "Champagne Henriot Brut Souverain 0,375L",
    supplier: "AllAboutWine GmbH",
    ean: "3359130220027",
    unit: "FLA",
    lastPrice: 2120,
    orderCount: 16,
    lastOrderedAt: new Date("2025-10-18"),
  },
  {
    id: "top-021",
    userId: SAMPLE_USER_ID,
    articleId: "220024",
    articleName: "Champagne Henriot Brut Blanc de Blancs 0,75L",
    supplier: "AllAboutWine GmbH",
    ean: "3359130220024",
    unit: "FLA",
    lastPrice: 9200,
    orderCount: 9,
    lastOrderedAt: new Date("2025-10-16"),
  },
  {
    id: "top-022",
    userId: SAMPLE_USER_ID,
    articleId: "242",
    articleName: "Pink Vineyard trocken Rose Cuvee 0,75L",
    supplier: "Karl Pfaffmann",
    ean: "4034027420000",
    unit: "FLA",
    lastPrice: 423,
    orderCount: 35,
    lastOrderedAt: new Date("2025-10-19"),
  },
  {
    id: "top-023",
    userId: SAMPLE_USER_ID,
    articleId: "69",
    articleName: "Secco Carlo trocken weiß 0,75L",
    supplier: "Karl Pfaffmann",
    ean: "4034000069000",
    unit: "FLA",
    lastPrice: 430,
    orderCount: 38,
    lastOrderedAt: new Date("2025-10-19"),
  },

  // Premium Spirituosen - Tabak Grätz
  {
    id: "top-024",
    userId: SAMPLE_USER_ID,
    articleId: "308173",
    articleName: "Balvenie 21 Years Port Wood 40% 0,7L",
    supplier: "Tabak Grätz",
    ean: "5010327308173",
    unit: "FLA",
    lastPrice: 20494,
    orderCount: 3,
    lastOrderedAt: new Date("2025-10-12"),
  },
  {
    id: "top-025",
    userId: SAMPLE_USER_ID,
    articleId: "316566",
    articleName: "Monkey 47 Dry Gin 47% 0,5L",
    supplier: "Tabak Grätz",
    ean: "4260108316566",
    unit: "FLA",
    lastPrice: 2868,
    orderCount: 18,
    lastOrderedAt: new Date("2025-10-18"),
  },
  {
    id: "top-026",
    userId: SAMPLE_USER_ID,
    articleId: "308327",
    articleName: "Caol Ila 18 Years 43% 0,7L",
    supplier: "Tabak Grätz",
    ean: "5010327308327",
    unit: "FLA",
    lastPrice: 17854,
    orderCount: 4,
    lastOrderedAt: new Date("2025-10-14"),
  },
  {
    id: "top-027",
    userId: SAMPLE_USER_ID,
    articleId: "308392",
    articleName: "Glenfarclas 25 Years 43% 0,7L",
    supplier: "Tabak Grätz",
    ean: "5010327308392",
    unit: "FLA",
    lastPrice: 15214,
    orderCount: 5,
    lastOrderedAt: new Date("2025-10-15"),
  },
  {
    id: "top-028",
    userId: SAMPLE_USER_ID,
    articleId: "308283",
    articleName: "Slyrs Malt Whisky 12 Jahre American Oak 43% 0,7L",
    supplier: "Tabak Grätz",
    ean: "4260148308283",
    unit: "FLA",
    lastPrice: 8051,
    orderCount: 11,
    lastOrderedAt: new Date("2025-10-18"),
  },
  {
    id: "top-029",
    userId: SAMPLE_USER_ID,
    articleId: "300256",
    articleName: "Sambuca Ramazzotti 38% 0,7L",
    supplier: "Tabak Grätz",
    ean: "5010327300256",
    unit: "FLA",
    lastPrice: 1143,
    orderCount: 24,
    lastOrderedAt: new Date("2025-10-19"),
  },

  // Gastro-Bedarf - BOSFOOD
  {
    id: "top-030",
    userId: SAMPLE_USER_ID,
    articleId: "23530",
    articleName: "Julabo Schutzgitter für ED-EH-ME Sour",
    supplier: "BOSFOOD",
    ean: "4012923530000",
    unit: "STK",
    lastPrice: 13070,
    orderCount: 2,
    lastOrderedAt: new Date("2025-09-20"),
  },
  {
    id: "top-031",
    userId: SAMPLE_USER_ID,
    articleId: "11437",
    articleName: "Gänsestopfleber ganz Osteuropa ca.750g",
    supplier: "BOSFOOD",
    ean: "4012911437000",
    unit: "KG",
    lastPrice: 9900,
    orderCount: 6,
    lastOrderedAt: new Date("2025-10-15"),
  },

  // Convenience - CHEFSCULINAR
  {
    id: "top-032",
    userId: SAMPLE_USER_ID,
    articleId: "10857540",
    articleName: "Sekt Kartoffel-Schupfnudeln 2,5kg 10kg Karton",
    supplier: "CHEFSCULINAR Region Zusmarshausen",
    ean: "4343108575400",
    unit: "KAR",
    lastPrice: 3620,
    orderCount: 16,
    lastOrderedAt: new Date("2025-10-18"),
  },

  // Fleischwaren - Metzgerei Haller, Bierbichler
  {
    id: "top-033",
    userId: SAMPLE_USER_ID,
    articleId: "41210",
    articleName: "Rinder Hackfleisch 1kg",
    supplier: "Metzgerei Ludwig Haller GmbH",
    ean: "4019641210000",
    unit: "KG",
    lastPrice: 800,
    orderCount: 42,
    lastOrderedAt: new Date("2025-10-19"),
  },
  {
    id: "top-034",
    userId: SAMPLE_USER_ID,
    articleId: "99613",
    articleName: "Kalbs Hackfleisch ca.2kg",
    supplier: "Bierbichler",
    ean: "4028599613000",
    unit: "PAK",
    lastPrice: 2852,
    orderCount: 25,
    lastOrderedAt: new Date("2025-10-19"),
  },

  // Gemüse - Fritz Gutskunst, Kagerer
  {
    id: "top-035",
    userId: SAMPLE_USER_ID,
    articleId: "58",
    articleName: "Karotten Sack 10kg",
    supplier: "Fritz Gutskunst",
    ean: "4066400058000",
    unit: "KG",
    lastPrice: 72,
    orderCount: 55,
    lastOrderedAt: new Date("2025-10-19"),
  },
  {
    id: "top-036",
    userId: SAMPLE_USER_ID,
    articleId: "4306",
    articleName: "Miesmuscheln in ganzer Schale 1kg",
    supplier: "Kagerer",
    ean: "4015043060000",
    unit: "KG",
    lastPrice: 395,
    orderCount: 32,
    lastOrderedAt: new Date("2025-10-19"),
  },

  // Bio-Tee - Bioteaque
  {
    id: "top-037",
    userId: SAMPLE_USER_ID,
    articleId: "BT2015-B",
    articleName: "Bio Grüntee-Kräutermischung Gojibeere Detoq 500g",
    supplier: "Bioteaque GmbH & Co. KG",
    ean: "4260148201500",
    unit: "STK",
    lastPrice: 800,
    orderCount: 13,
    lastOrderedAt: new Date("2025-10-17"),
  },

  // Gastro-Ausstattung - Lusini
  {
    id: "top-038",
    userId: SAMPLE_USER_ID,
    articleId: "EPC30151775",
    articleName: "Bratpfanne aus Aluminium mit Teflonbeschichtung",
    supplier: "Lusini Deutschland GmbH",
    ean: "4001836301517",
    unit: "STK",
    lastPrice: 2309,
    orderCount: 7,
    lastOrderedAt: new Date("2025-10-14"),
  },

  // Betriebsausstattung - Manutan
  {
    id: "top-039",
    userId: SAMPLE_USER_ID,
    articleId: "A000148",
    articleName: "Schubkarre Ges.Inh. 80L Behälter",
    supplier: "Manutan GmbH",
    ean: "4029000001480",
    unit: "STK",
    lastPrice: 10900,
    orderCount: 1,
    lastOrderedAt: new Date("2025-09-15"),
  },
];

async function resetAndImportTopArticles() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);

  console.log("🗑️  Clearing existing articles...");
  await db.execute(sql`DELETE FROM ${articleHistory}`);
  console.log("✓ Database cleared");

  console.log("\n🏨 Importing Top-Bestellartikel from jb-x Portal...");

  for (const article of topArticles) {
    try {
      await db.insert(articleHistory).values(article);
      console.log(`✓ Added: ${article.articleName} - ${(article.lastPrice / 100).toFixed(2)} EUR (${article.supplier})`);
    } catch (error) {
      console.error(`✗ Failed to add ${article.articleName}:`, error);
    }
  }

  console.log(`\n✅ Imported ${topArticles.length} Top-Bestellartikel`);
  console.log("\n📊 Summary by supplier:");
  
  const supplierCounts = topArticles.reduce((acc, article) => {
    acc[article.supplier] = (acc[article.supplier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(supplierCounts).sort((a, b) => b[1] - a[1]).forEach(([supplier, count]) => {
    console.log(`   ${supplier}: ${count} articles`);
  });

  console.log("\n🎯 Categories:");
  console.log("- Getränke (Softdrinks, Wein, Spirituosen)");
  console.log("- Premium Fleisch & Fisch");
  console.log("- Backwaren & Convenience");
  console.log("- Gemüse & Frischware");
  console.log("- Gastro-Ausstattung");
  console.log("- Bio-Produkte");
  
  process.exit(0);
}

resetAndImportTopArticles();
