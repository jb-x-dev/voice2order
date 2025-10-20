import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Play } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const DEMO_ORDERS = [
  {
    id: "demo-1",
    title: "Softdrinks",
    text: "3 Kisten Coca Cola und 2 Kisten Sprite",
    category: "Getränke",
    supplier: "Baer-Mühle & Otto Pachmayr",
  },
  {
    id: "demo-2",
    title: "Hackfleisch",
    text: "5 Kilo Rinder Hackfleisch und 2 Packungen Kalbs Hackfleisch",
    category: "Fleisch",
    supplier: "Metzgerei Haller & Bierbichler",
  },
  {
    id: "demo-3",
    title: "Champagner",
    text: "2 Flaschen Champagne Henriot Brut Souverain und 1 Flasche Blanc de Blancs",
    category: "Wein",
    supplier: "AllAboutWine GmbH",
  },
  {
    id: "demo-4",
    title: "Premium Gin",
    text: "1 Flasche Monkey 47 Gin und 1 Flasche Hendricks Gin",
    category: "Spirituosen",
    supplier: "Tabak Grätz & Hamberger",
  },
  {
    id: "demo-5",
    title: "Premium Fleisch",
    text: "3 Stück Delta Dry Aged Roastbeef und 2 Kalbs-Tomahawk",
    category: "Fleisch",
    supplier: "Delta Hamburg",
  },
  {
    id: "demo-6",
    title: "Fisch",
    text: "5 Karton Wolfsbarschfilet und 3 Kilo Dorade Royalefilet",
    category: "Fisch",
    supplier: "Deutsche See & R+S Gourmets",
  },
  {
    id: "demo-7",
    title: "Backwaren",
    text: "10 Packungen Finnenbrötchen und 5 Karton HUG Windbeute",
    category: "Backwaren",
    supplier: "EDNA",
  },
  {
    id: "demo-8",
    title: "Wein",
    text: "2 Flaschen Pink Vineyard Rose und 3 Flaschen Secco Carlo",
    category: "Wein",
    supplier: "Karl Pfaffmann",
  },
  {
    id: "demo-9",
    title: "Frischware",
    text: "20 Kilo Karotten und 5 Kilo Miesmuscheln",
    category: "Gemüse & Fisch",
    supplier: "Fritz Gutskunst & Kagerer",
  },
  {
    id: "demo-10",
    title: "Premium Whisky",
    text: "1 Flasche Balvenie 21 Years und 1 Flasche Caol Ila 18 Years",
    category: "Spirituosen",
    supplier: "Tabak Grätz",
  },
];

export default function Demo() {
  const [, setLocation] = useLocation();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const createOrderMutation = trpc.voiceOrder.create.useMutation();
  const parseMutation = trpc.voiceOrder.parseTranscription.useMutation();
  const matchMutation = trpc.voiceOrder.matchArticles.useMutation();

  const processDemoOrder = async (demoOrder: typeof DEMO_ORDERS[0]) => {
    setProcessingId(demoOrder.id);
    
    try {
      // 1. Create order
      const order = await createOrderMutation.mutateAsync({});
      
      // 2. Simulate transcription (skip audio step in demo)
      // Update order with transcription directly via database
      
      // 3. Parse transcription
      const items = await parseMutation.mutateAsync({
        orderId: order.id,
        transcription: demoOrder.text,
      });

      // 4. Match with history
      await matchMutation.mutateAsync({
        orderId: order.id,
      });

      // Navigate to order detail
      setLocation(`/order/${order.id}`);
    } catch (error) {
      console.error("Fehler bei der Demo-Verarbeitung:", error);
      alert("Fehler bei der Verarbeitung der Demo-Bestellung");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zur Hauptseite
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle>Demo-Bestellungen</CardTitle>
              <CardDescription>
                Klicken Sie auf eine Beispiel-Bestellung, um die KI-gestützte Artikelerkennung zu testen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>🏨 Ihre Top-Bestellartikel:</strong> Die Datenbank enthält <strong>39 Artikel</strong>, 
                  die Sie am häufigsten bei den Privathoteliers bestellen - mit Original-Preisen, EAN-Codes und echten Lieferanten 
                  aus Ihrem jb-x Portal-Account.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Demo Orders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEMO_ORDERS.map((demoOrder) => (
              <Card key={demoOrder.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{demoOrder.title}</CardTitle>
                      <CardDescription className="mt-1 space-y-1">
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {demoOrder.category}
                        </span>
                        <div className="text-xs text-gray-600 mt-1">
                          {demoOrder.supplier}
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-sm text-gray-700 italic">
                      "{demoOrder.text}"
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => processDemoOrder(demoOrder)}
                    disabled={processingId !== null}
                    className="w-full"
                  >
                    {processingId === demoOrder.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verarbeite...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Demo starten
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Available Articles Info */}
          <Card>
            <CardHeader>
              <CardTitle>Ihre Top-Lieferanten</CardTitle>
              <CardDescription>
                Die 19 Lieferanten, von denen Sie am häufigsten bestellen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="font-semibold text-blue-900">Tabak Grätz</div>
                  <div className="text-blue-700 text-xs mt-1">6 Spirituosen</div>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <div className="font-semibold text-amber-900">Delta Hamburg</div>
                  <div className="text-amber-700 text-xs mt-1">5 Premium Fleisch</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <div className="font-semibold text-orange-900">EDNA</div>
                  <div className="text-orange-700 text-xs mt-1">5 Backwaren</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="font-semibold text-green-900">Hamberger</div>
                  <div className="text-green-700 text-xs mt-1">4 Lebensmittel</div>
                </div>
                <div className="bg-cyan-50 p-3 rounded-lg border border-cyan-200">
                  <div className="font-semibold text-cyan-900">Deutsche See</div>
                  <div className="text-cyan-700 text-xs mt-1">2 Fisch</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <div className="font-semibold text-purple-900">AllAboutWine</div>
                  <div className="text-purple-700 text-xs mt-1">2 Champagner</div>
                </div>
                <div className="bg-pink-50 p-3 rounded-lg border border-pink-200">
                  <div className="font-semibold text-pink-900">Karl Pfaffmann</div>
                  <div className="text-pink-700 text-xs mt-1">2 Wein</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <div className="font-semibold text-red-900">BOSFOOD</div>
                  <div className="text-red-700 text-xs mt-1">2 Gastro-Bedarf</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="font-semibold text-gray-900">+ 11 weitere</div>
                  <div className="text-gray-700 text-xs mt-1">je 1 Artikel</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

