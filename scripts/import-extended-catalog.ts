import { drizzle } from "drizzle-orm/mysql2";
import { articleHistory } from "../drizzle/schema";

const SAMPLE_USER_ID = "sample-user-001";

// Extended catalog with more suppliers from jb-x Portal
const extendedCatalog = [
  // Otto Pachmayr - Softdrinks
  {
    id: "jbx-101",
    userId: SAMPLE_USER_ID,
    articleId: "3655",
    articleName: "Sprite 0,2L Pfand",
    supplier: "Otto Pachmayr",
    ean: "5000112637830",
    unit: "KAS",
    lastPrice: 1078, // 10.78 EUR
    orderCount: 24,
    lastOrderedAt: new Date("2025-10-19"),
  },
  {
    id: "jbx-102",
    userId: SAMPLE_USER_ID,
    articleId: "2766",
    articleName: "Coca Cola 24x0,2L",
    supplier: "Baer-Mühle",
    ean: "5000112548907",
    unit: "KAS",
    lastPrice: 1065, // 10.65 EUR
    orderCount: 42,
    lastOrderedAt: new Date("2025-10-19"),
  },

  // Hamberger Lieferservice - Milchprodukte
  {
    id: "jbx-103",
    userId: SAMPLE_USER_ID,
    articleId: "9040",
    articleName: "JEDEN TAG H-MILCH 3,5% FETT 1L",
    supplier: "Hamberger Lieferservice",
    ean: "4311501325520",
    unit: "UKT",
    lastPrice: 1103, // 11.03 EUR (für 12 Stück)
    orderCount: 35,
    lastOrderedAt: new Date("2025-10-18"),
  },
  {
    id: "jbx-104",
    userId: SAMPLE_USER_ID,
    articleId: "451740",
    articleName: "HENDRICK'S GIN 0,7L",
    supplier: "Hamberger Lieferservice",
    ean: "5010327324005",
    unit: "FLA",
    lastPrice: 2479, // 24.79 EUR
    orderCount: 8,
    lastOrderedAt: new Date("2025-10-15"),
  },
  {
    id: "jbx-105",
    userId: SAMPLE_USER_ID,
    articleId: "451984",
    articleName: "CRODINO ALKOHOLFREIER BITTER 8x98ML PAK",
    supplier: "Hamberger Lieferservice",
    ean: "8001440003011",
    unit: "UKT",
    lastPrice: 3312, // 33.12 EUR
    orderCount: 12,
    lastOrderedAt: new Date("2025-10-17"),
  },

  // BOSFOOD
  {
    id: "jbx-106",
    userId: SAMPLE_USER_ID,
    articleId: "23530",
    articleName: "Julabo Schutzgitter für ED-EH-ME Sour",
    supplier: "BOSFOOD",
    ean: "4012923530000",
    unit: "STK",
    lastPrice: 13070, // 130.70 EUR
    orderCount: 2,
    lastOrderedAt: new Date("2025-09-20"),
  },
  {
    id: "jbx-107",
    userId: SAMPLE_USER_ID,
    articleId: "11437",
    articleName: "Gänsestopfleber ganz Osteuropa ca.750g",
    supplier: "BOSFOOD",
    ean: "4012911437000",
    unit: "KG",
    lastPrice: 9900, // 99.00 EUR
    orderCount: 4,
    lastOrderedAt: new Date("2025-10-10"),
  },

  // Delta Hamburg - Premium Fleisch
  {
    id: "jbx-108",
    userId: SAMPLE_USER_ID,
    articleId: "12107",
    articleName: "Delta Dry Aged Roastbeef ohne Knochen Frisch",
    supplier: "Delta Hamburg",
    ean: "4009512107000",
    unit: "STK",
    lastPrice: 13396, // 133.96 EUR
    orderCount: 6,
    lastOrderedAt: new Date("2025-10-18"),
  },
  {
    id: "jbx-109",
    userId: SAMPLE_USER_ID,
    articleId: "180",
    articleName: "I.B.P US Roastbeef/Striploin Frisch",
    supplier: "Delta Hamburg",
    ean: "4009500180000",
    unit: "STK",
    lastPrice: 18475, // 184.75 EUR
    orderCount: 3,
    lastOrderedAt: new Date("2025-10-16"),
  },
  {
    id: "jbx-110",
    userId: SAMPLE_USER_ID,
    articleId: "28206",
    articleName: "D-Dry Aged Rib Roast Prime frisch Frisc",
    supplier: "Delta Hamburg",
    ean: "4009528206000",
    unit: "STK",
    lastPrice: 14963, // 149.63 EUR
    orderCount: 5,
    lastOrderedAt: new Date("2025-10-17"),
  },
  {
    id: "jbx-111",
    userId: SAMPLE_USER_ID,
    articleId: "5055",
    articleName: "Kalbs-Tomahawk 7 Rippen Frisch",
    supplier: "Delta Hamburg",
    ean: "4009505055000",
    unit: "STK",
    lastPrice: 9433, // 94.33 EUR
    orderCount: 7,
    lastOrderedAt: new Date("2025-10-18"),
  },

  // Deutsche See - Fisch & Meeresfrüchte
  {
    id: "jbx-112",
    userId: SAMPLE_USER_ID,
    articleId: "86317",
    articleName: "Seeteufel mit Haut ohne Kopf frisch 2-4kg",
    supplier: "Deutsche See",
    ean: "4013086317000",
    unit: "KIS",
    lastPrice: 13194, // 131.94 EUR
    orderCount: 8,
    lastOrderedAt: new Date("2025-10-17"),
  },
  {
    id: "jbx-113",
    userId: SAMPLE_USER_ID,
    articleId: "81913",
    articleName: "Wolfsbarschfilet mit Haut TK 10% Gl. 80-120g 5kg",
    supplier: "Deutsche See",
    ean: "4013081913000",
    unit: "KAR",
    lastPrice: 8845, // 88.45 EUR
    orderCount: 12,
    lastOrderedAt: new Date("2025-10-18"),
  },
  {
    id: "jbx-114",
    userId: SAMPLE_USER_ID,
    articleId: "305295",
    articleName: "Dorade Royalefilet mit Haut 160/200g TK 5kg",
    supplier: "R+S Gourmets",
    ean: "4073730529500",
    unit: "KI",
    lastPrice: 1599, // 15.99 EUR
    orderCount: 15,
    lastOrderedAt: new Date("2025-10-19"),
  },

  // EDNA - Gastro-Ausstattung
  {
    id: "jbx-115",
    userId: SAMPLE_USER_ID,
    articleId: "35036",
    articleName: "HUG Windbeute 7,5cm",
    supplier: "EDNA",
    ean: "4016235036000",
    unit: "CT",
    lastPrice: 8568, // 85.68 EUR
    orderCount: 6,
    lastOrderedAt: new Date("2025-10-14"),
  },
  {
    id: "jbx-116",
    userId: SAMPLE_USER_ID,
    articleId: "555",
    articleName: "Finnenbrötchen",
    supplier: "EDNA",
    ean: "4016200555000",
    unit: "CT",
    lastPrice: 1554, // 15.54 EUR
    orderCount: 18,
    lastOrderedAt: new Date("2025-10-19"),
  },
  {
    id: "jbx-117",
    userId: SAMPLE_USER_ID,
    articleId: "60275",
    articleName: "Poensgen Körnerbrötchen glutenfrei",
    supplier: "EDNA",
    ean: "4016260275000",
    unit: "CT",
    lastPrice: 2145, // 21.45 EUR
    orderCount: 9,
    lastOrderedAt: new Date("2025-10-16"),
  },
  {
    id: "jbx-118",
    userId: SAMPLE_USER_ID,
    articleId: "60271",
    articleName: "Poensgen Kaisersemmel glutenfrei",
    supplier: "EDNA",
    ean: "4016260271000",
    unit: "CT",
    lastPrice: 1875, // 18.75 EUR
    orderCount: 11,
    lastOrderedAt: new Date("2025-10-17"),
  },

  // AllAboutWine - Champagner & Wein
  {
    id: "jbx-119",
    userId: SAMPLE_USER_ID,
    articleId: "220027",
    articleName: "Champagne Henriot Brut Souverain 0,375L",
    supplier: "AllAboutWine GmbH",
    ean: "3359130220027",
    unit: "FLA",
    lastPrice: 2120, // 21.20 EUR
    orderCount: 14,
    lastOrderedAt: new Date("2025-10-18"),
  },
  {
    id: "jbx-120",
    userId: SAMPLE_USER_ID,
    articleId: "220024",
    articleName: "Champagne Henriot Brut Blanc de Blancs",
    supplier: "AllAboutWine GmbH",
    ean: "3359130220024",
    unit: "FLA",
    lastPrice: 9200, // 92.00 EUR
    orderCount: 7,
    lastOrderedAt: new Date("2025-10-15"),
  },
  {
    id: "jbx-121",
    userId: SAMPLE_USER_ID,
    articleId: "2742",
    articleName: "Pink Vineyard trocken Rose Cuvee",
    supplier: "Karl Pfaffmann",
    ean: "4034027420000",
    unit: "FLA",
    lastPrice: 423, // 4.23 EUR
    orderCount: 28,
    lastOrderedAt: new Date("2025-10-19"),
  },
  {
    id: "jbx-122",
    userId: SAMPLE_USER_ID,
    articleId: "69",
    articleName: "Secco Carlo trocken weiß",
    supplier: "Karl Pfaffmann",
    ean: "4034000069000",
    unit: "FLA",
    lastPrice: 430, // 4.30 EUR
    orderCount: 32,
    lastOrderedAt: new Date("2025-10-19"),
  },

  // Tabak Grätz - Premium Spirituosen
  {
    id: "jbx-123",
    userId: SAMPLE_USER_ID,
    articleId: "308173",
    articleName: "Balvenie 21 Years Port Wood 40% 0,7L",
    supplier: "Tabak Grätz",
    ean: "5010327308173",
    unit: "FLA",
    lastPrice: 20494, // 204.94 EUR
    orderCount: 2,
    lastOrderedAt: new Date("2025-10-10"),
  },
  {
    id: "jbx-124",
    userId: SAMPLE_USER_ID,
    articleId: "316566",
    articleName: "Monkey 47 Dry Gin 47% 0,5L",
    supplier: "Tabak Grätz",
    ean: "4260108316566",
    unit: "FLA",
    lastPrice: 2868, // 28.68 EUR
    orderCount: 16,
    lastOrderedAt: new Date("2025-10-18"),
  },
  {
    id: "jbx-125",
    userId: SAMPLE_USER_ID,
    articleId: "308327",
    articleName: "Caol Ila 18 Years 43% 0,7L",
    supplier: "Tabak Grätz",
    ean: "5010327308327",
    unit: "FLA",
    lastPrice: 17854, // 178.54 EUR
    orderCount: 3,
    lastOrderedAt: new Date("2025-10-12"),
  },
  {
    id: "jbx-126",
    userId: SAMPLE_USER_ID,
    articleId: "306592",
    articleName: "Glenfarclas 25 Years 43% 0,7L",
    supplier: "Tabak Grätz",
    ean: "5010327306592",
    unit: "FLA",
    lastPrice: 15214, // 152.14 EUR
    orderCount: 4,
    lastOrderedAt: new Date("2025-10-14"),
  },
  {
    id: "jbx-127",
    userId: SAMPLE_USER_ID,
    articleId: "308283",
    articleName: "Slyrs Malt Whisky 12 Jahre American Oak 43% 0,7L",
    supplier: "Tabak Grätz",
    ean: "4260148308283",
    unit: "FLA",
    lastPrice: 8051, // 80.51 EUR
    orderCount: 9,
    lastOrderedAt: new Date("2025-10-17"),
  },

  // Bioteaque - Bio-Tee
  {
    id: "jbx-128",
    userId: SAMPLE_USER_ID,
    articleId: "BT2015-B",
    articleName: "Bio Grüntee-Kräutermischung Gojibeere Detoq 500g",
    supplier: "Bioteaque GmbH & Co. KG",
    ean: "4260148201500",
    unit: "STK",
    lastPrice: 800, // 8.00 EUR
    orderCount: 11,
    lastOrderedAt: new Date("2025-10-16"),
  },
  {
    id: "jbx-129",
    userId: SAMPLE_USER_ID,
    articleId: "BT3001",
    articleName: "Bio Kräutertee Mischung 500g loser Tee",
    supplier: "Bioteaque GmbH & Co. KG",
    ean: "4260148300100",
    unit: "STK",
    lastPrice: 720, // 7.20 EUR
    orderCount: 14,
    lastOrderedAt: new Date("2025-10-18"),
  },

  // Lusini - Gastro-Ausstattung
  {
    id: "jbx-130",
    userId: SAMPLE_USER_ID,
    articleId: "EPC30151775",
    articleName: "Bratpfanne aus Aluminium mit Teflonbeschichtung",
    supplier: "Lusini Deutschland GmbH",
    ean: "4001836301517",
    unit: "STK",
    lastPrice: 2309, // 23.09 EUR
    orderCount: 5,
    lastOrderedAt: new Date("2025-10-12"),
  },

  // Bierbichler - Fleischwaren
  {
    id: "jbx-131",
    userId: SAMPLE_USER_ID,
    articleId: "99613",
    articleName: "Kalbs Hackfleisch ca.2kg",
    supplier: "Bierbichler",
    ean: "4028599613000",
    unit: "PAK",
    lastPrice: 2852, // 28.52 EUR
    orderCount: 19,
    lastOrderedAt: new Date("2025-10-19"),
  },

  // Manutan - Bürobedarf
  {
    id: "jbx-132",
    userId: SAMPLE_USER_ID,
    articleId: "A000148",
    articleName: "Schubkarre Ges.Inh. 80L Behälter",
    supplier: "Manutan GmbH",
    ean: "4029000001480",
    unit: "STK",
    lastPrice: 10900, // 109.00 EUR
    orderCount: 1,
    lastOrderedAt: new Date("2025-09-15"),
  },

  // Fritz Gutskunst - Konserven
  {
    id: "jbx-133",
    userId: SAMPLE_USER_ID,
    articleId: "58",
    articleName: "Karotten Sack 10kg",
    supplier: "Fritz Gutskunst",
    ean: "4066400058000",
    unit: "KG",
    lastPrice: 72, // 0.72 EUR
    orderCount: 45,
    lastOrderedAt: new Date("2025-10-19"),
  },

  // Metzgerei Ludwig Haller - Wurstwaren
  {
    id: "jbx-134",
    userId: SAMPLE_USER_ID,
    articleId: "41210",
    articleName: "R Hackfleisch",
    supplier: "Metzgerei Ludwig Haller GmbH",
    ean: "4019641210000",
    unit: "KG",
    lastPrice: 800, // 8.00 EUR
    orderCount: 38,
    lastOrderedAt: new Date("2025-10-19"),
  },

  // CHEFSCULINAR - Gewürze & Zutaten
  {
    id: "jbx-135",
    userId: SAMPLE_USER_ID,
    articleId: "10857540",
    articleName: "Sekt Kartoffel-Schupfnudeln 2,5kg",
    supplier: "CHEFSCULINAR Region Zusmarshausen",
    ean: "4343108575400",
    unit: "KAR",
    lastPrice: 3620, // 36.20 EUR
    orderCount: 13,
    lastOrderedAt: new Date("2025-10-17"),
  },
];

async function importExtendedCatalog() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);

  console.log("🏨 Importing extended jb-x catalog...");

  for (const article of extendedCatalog) {
    try {
      await db.insert(articleHistory).values(article);
      console.log(`✓ Added: ${article.articleName} - ${(article.lastPrice / 100).toFixed(2)} EUR (${article.supplier})`);
    } catch (error) {
      console.error(`✗ Failed to add ${article.articleName}:`, error);
    }
  }

  console.log(`\n✅ Imported ${extendedCatalog.length} additional articles`);
  console.log("\n📊 Summary by supplier:");
  
  const supplierCounts = extendedCatalog.reduce((acc, article) => {
    acc[article.supplier] = (acc[article.supplier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(supplierCounts).forEach(([supplier, count]) => {
    console.log(`   ${supplier}: ${count} articles`);
  });

  console.log("\n🎯 New categories available:");
  console.log("- Premium Fleisch (Delta Hamburg)");
  console.log("- Fisch & Meeresfrüchte (Deutsche See, R+S Gourmets)");
  console.log("- Champagner & Wein (AllAboutWine, Karl Pfaffmann)");
  console.log("- Premium Spirituosen (Tabak Grätz)");
  console.log("- Bio-Tee (Bioteaque)");
  console.log("- Gastro-Ausstattung (EDNA, Lusini)");
  console.log("- Milchprodukte (Hamberger Lieferservice)");
  
  process.exit(0);
}

importExtendedCatalog();

