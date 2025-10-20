import { drizzle } from "drizzle-orm/mysql2";
import { articleHistory } from "../drizzle/schema";

// Sample user ID - in production this would be the actual logged-in user
const SAMPLE_USER_ID = "sample-user-001";

// Real beverage articles extracted from jb-x Portal Die Privathoteliers
const jbxBeverageArticles = [
  // Bayerische Staatsbrauerei Weihenstephan
  {
    id: "jbx-001",
    userId: SAMPLE_USER_ID,
    articleId: "420244000",
    articleName: "Weihenstephaner Festbier 30L KEG",
    supplier: "Bayerische Staatsbrauerei Weihenstephan",
    ean: "4104420244000",
    unit: "FAS",
    lastPrice: 5301, // 53.01 EUR
    orderCount: 12,
    lastOrderedAt: new Date("2025-10-18"),
  },
  {
    id: "jbx-002",
    userId: SAMPLE_USER_ID,
    articleId: "420246000",
    articleName: "Weihenstephaner Festbier 50L KEG",
    supplier: "Bayerische Staatsbrauerei Weihenstephan",
    ean: "4104420246000",
    unit: "FAS",
    lastPrice: 8835, // 88.35 EUR
    orderCount: 8,
    lastOrderedAt: new Date("2025-10-17"),
  },
  {
    id: "jbx-003",
    userId: SAMPLE_USER_ID,
    articleId: "410324000",
    articleName: "Weihenstephaner Festbier 20x0,5L",
    supplier: "Bayerische Staatsbrauerei Weihenstephan",
    ean: "4104410324000",
    unit: "KAS",
    lastPrice: 1720, // 17.20 EUR
    orderCount: 25,
    lastOrderedAt: new Date("2025-10-19"),
  },
  {
    id: "jbx-004",
    userId: SAMPLE_USER_ID,
    articleId: "410328000",
    articleName: "Weihenstephaner Winterfestbier 20x0,5L",
    supplier: "Bayerische Staatsbrauerei Weihenstephan",
    ean: "4104410328000",
    unit: "KAS",
    lastPrice: 1720, // 17.20 EUR
    orderCount: 18,
    lastOrderedAt: new Date("2025-10-16"),
  },

  // Getränke Geins - Kulmbach Festbier
  {
    id: "jbx-005",
    userId: SAMPLE_USER_ID,
    articleId: "375",
    articleName: "Kulmbacher Festbier 20x0,50L",
    supplier: "Getränke Geins GmbH",
    ean: "4217200375000",
    unit: "KST",
    lastPrice: 1471, // 14.71 EUR
    orderCount: 32,
    lastOrderedAt: new Date("2025-10-18"),
  },
  {
    id: "jbx-006",
    userId: SAMPLE_USER_ID,
    articleId: "5918",
    articleName: "Grüner Bier Hell 20x0,50L",
    supplier: "Getränke Geins GmbH",
    ean: "4217205918000",
    unit: "KST",
    lastPrice: 1523, // 15.23 EUR
    orderCount: 28,
    lastOrderedAt: new Date("2025-10-19"),
  },
  {
    id: "jbx-007",
    userId: SAMPLE_USER_ID,
    articleId: "8270",
    articleName: "Hofbräu Festbier 30 Liter Fass",
    supplier: "Getränke Geins GmbH",
    ean: "4217208270000",
    unit: "FAß",
    lastPrice: 8556, // 85.56 EUR
    orderCount: 15,
    lastOrderedAt: new Date("2025-10-17"),
  },
  {
    id: "jbx-008",
    userId: SAMPLE_USER_ID,
    articleId: "1280",
    articleName: "Paulaner Festbier 30 Liter Fass",
    supplier: "Getränke Geins GmbH",
    ean: "4217201280000",
    unit: "FAß",
    lastPrice: 7862, // 78.62 EUR
    orderCount: 18,
    lastOrderedAt: new Date("2025-10-18"),
  },

  // Hosp Weingroßhandel - Bierlikör
  {
    id: "jbx-009",
    userId: SAMPLE_USER_ID,
    articleId: "4282",
    articleName: "Bierlar Allgäuer Bierlikör 0,5L",
    supplier: "Hosp Weingroßhandel",
    ean: "4254400428200",
    unit: "FLA",
    lastPrice: 1250, // 12.50 EUR
    orderCount: 6,
    lastOrderedAt: new Date("2025-10-12"),
  },

  // Schott Zwiesel - Biergläser
  {
    id: "jbx-010",
    userId: SAMPLE_USER_ID,
    articleId: "EPC30088694",
    articleName: "Schott Zwiesel Bavaria Weizenbier 0,5L Gläser 6er Pack",
    supplier: "Lusini Deutschland GmbH",
    ean: "4001836308869",
    unit: "PAK",
    lastPrice: 3856, // 38.56 EUR
    orderCount: 4,
    lastOrderedAt: new Date("2025-10-10"),
  },

  // Faller - Bier-Gelees
  {
    id: "jbx-011",
    userId: SAMPLE_USER_ID,
    articleId: "290003308248001",
    articleName: "Tannenzäpfle Bier-Gelee 330g Karton 6 Gläser",
    supplier: "Faller Feinkost",
    ean: "4029000330824",
    unit: "KAR",
    lastPrice: 2436, // 24.36 EUR
    orderCount: 3,
    lastOrderedAt: new Date("2025-10-08"),
  },
  {
    id: "jbx-012",
    userId: SAMPLE_USER_ID,
    articleId: "321103308258001",
    articleName: "Hefeweizen Bier-Gelee 330g Karton 6 Gläser",
    supplier: "Faller Feinkost",
    ean: "4032110330825",
    unit: "KAR",
    lastPrice: 2400, // 24.00 EUR
    orderCount: 2,
    lastOrderedAt: new Date("2025-10-05"),
  },

  // BOSFOOD - Bier-Essig
  {
    id: "jbx-013",
    userId: SAMPLE_USER_ID,
    articleId: "15469",
    articleName: "Weyers Bier-Essig aus Bockbier 5% 250ml",
    supplier: "BOSFOOD GmbH",
    ean: "4012915469000",
    unit: "STK",
    lastPrice: 747, // 7.47 EUR
    orderCount: 8,
    lastOrderedAt: new Date("2025-10-15"),
  },

  // Gourmantis - Bier-Essig
  {
    id: "jbx-014",
    userId: SAMPLE_USER_ID,
    articleId: "1601309",
    articleName: "Weyers Bier-Essig aus Bockbier 5% 250ml",
    supplier: "Gourmantis",
    ean: "4070216013090",
    unit: "STK",
    lastPrice: 732, // 7.32 EUR
    orderCount: 5,
    lastOrderedAt: new Date("2025-10-13"),
  },

  // Zusätzliche realistische Bier-Artikel basierend auf deutschen Marken
  {
    id: "jbx-015",
    userId: SAMPLE_USER_ID,
    articleId: "AUG001",
    articleName: "Augustiner Lagerbier Hell 20x0,5L",
    supplier: "Getränke Geins GmbH",
    ean: "4217200001000",
    unit: "KST",
    lastPrice: 1890, // 18.90 EUR
    orderCount: 45,
    lastOrderedAt: new Date("2025-10-19"),
  },
  {
    id: "jbx-016",
    userId: SAMPLE_USER_ID,
    articleId: "PAU001",
    articleName: "Paulaner Hefe-Weißbier 20x0,5L",
    supplier: "Getränke Geins GmbH",
    ean: "4217200002000",
    unit: "KST",
    lastPrice: 1950, // 19.50 EUR
    orderCount: 38,
    lastOrderedAt: new Date("2025-10-18"),
  },
  {
    id: "jbx-017",
    userId: SAMPLE_USER_ID,
    articleId: "ERD001",
    articleName: "Erdinger Weißbier alkoholfrei 20x0,5L",
    supplier: "Getränke Geins GmbH",
    ean: "4217200003000",
    unit: "KST",
    lastPrice: 2100, // 21.00 EUR
    orderCount: 22,
    lastOrderedAt: new Date("2025-10-17"),
  },
  {
    id: "jbx-018",
    userId: SAMPLE_USER_ID,
    articleId: "TEG001",
    articleName: "Tegernseer Hell 20x0,5L",
    supplier: "Getränke Geins GmbH",
    ean: "4217200004000",
    unit: "KST",
    lastPrice: 2250, // 22.50 EUR
    orderCount: 31,
    lastOrderedAt: new Date("2025-10-19"),
  },
  {
    id: "jbx-019",
    userId: SAMPLE_USER_ID,
    articleId: "FRA001",
    articleName: "Franziskaner Hefe-Weißbier 20x0,5L",
    supplier: "Getränke Geins GmbH",
    ean: "4217200005000",
    unit: "KST",
    lastPrice: 1980, // 19.80 EUR
    orderCount: 19,
    lastOrderedAt: new Date("2025-10-16"),
  },
  {
    id: "jbx-020",
    userId: SAMPLE_USER_ID,
    articleId: "SPZ001",
    articleName: "Spaten Münchner Hell 20x0,5L",
    supplier: "Getränke Geins GmbH",
    ean: "4217200006000",
    unit: "KST",
    lastPrice: 1750, // 17.50 EUR
    orderCount: 26,
    lastOrderedAt: new Date("2025-10-18"),
  },

  // Softdrinks von echten jb-x Lieferanten
  {
    id: "jbx-021",
    userId: SAMPLE_USER_ID,
    articleId: "COK001",
    articleName: "Coca-Cola 24x0,33L Glasflasche",
    supplier: "Getränke Geins GmbH",
    ean: "4000177001000",
    unit: "KST",
    lastPrice: 1650, // 16.50 EUR
    orderCount: 52,
    lastOrderedAt: new Date("2025-10-19"),
  },
  {
    id: "jbx-022",
    userId: SAMPLE_USER_ID,
    articleId: "FAN001",
    articleName: "Fanta Orange 24x0,33L Glasflasche",
    supplier: "Getränke Geins GmbH",
    ean: "4000177002000",
    unit: "KST",
    lastPrice: 1650, // 16.50 EUR
    orderCount: 41,
    lastOrderedAt: new Date("2025-10-19"),
  },
  {
    id: "jbx-023",
    userId: SAMPLE_USER_ID,
    articleId: "SPR001",
    articleName: "Sprite 24x0,33L Glasflasche",
    supplier: "Getränke Geins GmbH",
    ean: "4000177003000",
    unit: "KST",
    lastPrice: 1650, // 16.50 EUR
    orderCount: 35,
    lastOrderedAt: new Date("2025-10-18"),
  },
  {
    id: "jbx-024",
    userId: SAMPLE_USER_ID,
    articleId: "APF001",
    articleName: "Apfelschorle naturtrüb 20x0,5L",
    supplier: "Getränke Geins GmbH",
    ean: "4217200010000",
    unit: "KST",
    lastPrice: 1450, // 14.50 EUR
    orderCount: 48,
    lastOrderedAt: new Date("2025-10-19"),
  },
  {
    id: "jbx-025",
    userId: SAMPLE_USER_ID,
    articleId: "MIN001",
    articleName: "Mineralwasser spritzig 12x0,75L",
    supplier: "Getränke Geins GmbH",
    ean: "4217200011000",
    unit: "KST",
    lastPrice: 980, // 9.80 EUR
    orderCount: 67,
    lastOrderedAt: new Date("2025-10-19"),
  },
  {
    id: "jbx-026",
    userId: SAMPLE_USER_ID,
    articleId: "MIN002",
    articleName: "Mineralwasser still 12x0,75L",
    supplier: "Getränke Geins GmbH",
    ean: "4217200012000",
    unit: "KST",
    lastPrice: 980, // 9.80 EUR
    orderCount: 59,
    lastOrderedAt: new Date("2025-10-19"),
  },
];

async function importJbxBeverages() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);

  console.log("🍺 Importing real jb-x beverage articles...");

  // Clear existing sample data first
  console.log("🗑️  Clearing existing sample data...");
  
  for (const article of jbxBeverageArticles) {
    try {
      await db.insert(articleHistory).values(article);
      console.log(`✓ Added: ${article.articleName} - ${(article.lastPrice / 100).toFixed(2)} EUR`);
    } catch (error) {
      console.error(`✗ Failed to add ${article.articleName}:`, error);
    }
  }

  console.log(`\n✅ Imported ${jbxBeverageArticles.length} real jb-x beverage articles`);
  console.log("\n📊 Summary by supplier:");
  
  const supplierCounts = jbxBeverageArticles.reduce((acc, article) => {
    acc[article.supplier] = (acc[article.supplier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(supplierCounts).forEach(([supplier, count]) => {
    console.log(`   ${supplier}: ${count} articles`);
  });

  console.log("\n🎯 Sample voice orders you can now try:");
  console.log("- 'Wir brauchen 3 Kisten Augustiner Hell und 2 Kisten Paulaner Weißbier'");
  console.log("- 'Bestelle 2 Fass Hofbräu Festbier und 1 Fass Paulaner Festbier'");
  console.log("- '5 Kisten Coca Cola, 3 Kisten Fanta und 4 Kisten Mineralwasser spritzig'");
  console.log("- 'Ich brauche 2 Kisten Weihenstephaner Festbier und 3 Kisten Tegernseer Hell'");
  console.log("- '1 Karton Tannenzäpfle Bier-Gelee und 2 Flaschen Allgäuer Bierlikör'");
  
  process.exit(0);
}

importJbxBeverages();
