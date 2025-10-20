import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Play } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const DEMO_ORDERS = [
  {
    id: "demo-1",
    title: "Bier-Bestellung",
    text: "Wir brauchen 3 Kisten Augustiner Helles und 2 Kisten Paulaner Weißbier",
    category: "Bier",
  },
  {
    id: "demo-2",
    title: "Softdrinks",
    text: "Bestelle 5 Kisten Coca Cola, 3 Kisten Fanta und 4 Kisten Mineralwasser spritzig",
    category: "Softdrinks",
  },
  {
    id: "demo-3",
    title: "Säfte",
    text: "2 Karton Orangensaft und 3 Karton Apfelsaft naturtrüb bitte",
    category: "Säfte",
  },
  {
    id: "demo-4",
    title: "Kaffee & Tee",
    text: "Ich brauche 2 Kilo Espresso Bohnen Arabica und 5 Pack Kaffee Crema gemahlen",
    category: "Kaffee & Tee",
  },
  {
    id: "demo-5",
    title: "Wein",
    text: "1 Karton Grauburgunder trocken und 2 Karton Prosecco Spumante",
    category: "Wein",
  },
  {
    id: "demo-6",
    title: "Milchprodukte",
    text: "Wir benötigen 3 Karton Vollmilch, 2 Karton Hafermilch Barista und 5 Liter Sahne",
    category: "Milch",
  },
  {
    id: "demo-7",
    title: "Spirituosen",
    text: "Bestelle 2 Flaschen Gin London Dry, 1 Flasche Vodka Premium und 3 Flaschen Grappa",
    category: "Spirituosen",
  },
  {
    id: "demo-8",
    title: "Gemischte Bestellung",
    text: "Ich brauche 2 Kisten Tegernseer Hell, 4 Kisten Apfelschorle, 1 Karton Riesling Spätlese und 3 Pack Kräutertee",
    category: "Gemischt",
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
                  <strong>💡 Hinweis:</strong> Die Datenbank enthält 35 Getränkeartikel aus verschiedenen Kategorien
                  (Bier, Wein, Softdrinks, Säfte, Kaffee, Tee, Spirituosen, Milchprodukte). 
                  Die KI erkennt automatisch Artikel und Mengen aus der Sprachbestellung.
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
                      <CardDescription className="mt-1">
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {demoOrder.category}
                        </span>
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
              <CardTitle>Verfügbare Artikel in der Datenbank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <div className="font-semibold text-amber-900">🍺 Bier</div>
                  <div className="text-amber-700 text-xs mt-1">5 Artikel</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <div className="font-semibold text-purple-900">🍷 Wein</div>
                  <div className="text-purple-700 text-xs mt-1">4 Artikel</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <div className="font-semibold text-red-900">🥤 Softdrinks</div>
                  <div className="text-red-700 text-xs mt-1">6 Artikel</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <div className="font-semibold text-orange-900">🧃 Säfte</div>
                  <div className="text-orange-700 text-xs mt-1">4 Artikel</div>
                </div>
                <div className="bg-brown-50 p-3 rounded-lg border border-brown-200">
                  <div className="font-semibold text-brown-900">☕ Kaffee & Tee</div>
                  <div className="text-brown-700 text-xs mt-1">5 Artikel</div>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                  <div className="font-semibold text-indigo-900">🥃 Spirituosen</div>
                  <div className="text-indigo-700 text-xs mt-1">6 Artikel</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="font-semibold text-blue-900">🥛 Milchprodukte</div>
                  <div className="text-blue-700 text-xs mt-1">5 Artikel</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="font-semibold text-green-900">📦 Gesamt</div>
                  <div className="text-green-700 text-xs mt-1">35 Artikel</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

