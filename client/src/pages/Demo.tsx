import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Play } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const DEMO_ORDERS = [
  {
    id: "demo-1",
    title: "Premium Bier (jb-x)",
    text: "Wir brauchen 3 Kisten Augustiner Hell und 2 Kisten Paulaner Weißbier",
    category: "Bier",
  },
  {
    id: "demo-2",
    title: "Fass-Bier (jb-x)",
    text: "Bestelle 2 Fass Hofbräu Festbier und 1 Fass Paulaner Festbier",
    category: "Fass-Bier",
  },
  {
    id: "demo-3",
    title: "Softdrinks (jb-x)",
    text: "5 Kisten Coca Cola, 3 Kisten Fanta und 4 Kisten Mineralwasser spritzig",
    category: "Softdrinks",
  },
  {
    id: "demo-4",
    title: "Weihenstephan (jb-x)",
    text: "Ich brauche 2 Kisten Weihenstephaner Festbier und 1 Weihenstephaner 30L KEG",
    category: "Premium",
  },
  {
    id: "demo-5",
    title: "Spezialitäten (jb-x)",
    text: "1 Karton Tannenzäpfle Bier-Gelee und 2 Flaschen Allgäuer Bierlikör",
    category: "Spezialitäten",
  },
  {
    id: "demo-6",
    title: "Weißbier Mix (jb-x)",
    text: "Wir benötigen 3 Kisten Erdinger alkoholfrei, 2 Kisten Franziskaner Weißbier und 1 Kiste Paulaner Hefe-Weißbier",
    category: "Weißbier",
  },
  {
    id: "demo-7",
    title: "Bayrische Klassiker (jb-x)",
    text: "Bestelle 2 Kisten Tegernseer Hell, 3 Kisten Spaten Münchner Hell und 1 Kiste Kulmbacher Festbier",
    category: "Bayrisch",
  },
  {
    id: "demo-8",
    title: "Gastro-Ausstattung (jb-x)",
    text: "Ich brauche 2 Pack Weizenbier Gläser von Schott Zwiesel und 5 Flaschen Weyers Bier-Essig",
    category: "Ausstattung",
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
                  <strong>🏨 jb-x Portal Integration:</strong> Die Datenbank enthält jetzt echte Getränkeartikel 
                  aus dem jb-x Portal der Privathoteliers mit Original-Preisen und Lieferanten. 
                  Alle Demo-Bestellungen verwenden reale Artikel-IDs und EAN-Codes.
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
                  <div className="font-semibold text-amber-900">🍺 Premium Bier</div>
                  <div className="text-amber-700 text-xs mt-1">Augustiner, Tegernseer, Spaten</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="font-semibold text-blue-900">🍻 Weißbier</div>
                  <div className="text-blue-700 text-xs mt-1">Paulaner, Erdinger, Franziskaner</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="font-semibold text-green-900">🍺 Weihenstephan</div>
                  <div className="text-green-700 text-xs mt-1">Festbier, KEG 30L/50L</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <div className="font-semibold text-red-900">🥤 Softdrinks</div>
                  <div className="text-red-700 text-xs mt-1">Coca-Cola, Fanta, Sprite</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <div className="font-semibold text-purple-900">🏺 Fass-Bier</div>
                  <div className="text-purple-700 text-xs mt-1">Hofbräu, Paulaner 30L</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <div className="font-semibold text-orange-900">🍯 Spezialitäten</div>
                  <div className="text-orange-700 text-xs mt-1">Bier-Gelee, Bierlikör, Essig</div>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                  <div className="font-semibold text-indigo-900">🍽️ Ausstattung</div>
                  <div className="text-indigo-700 text-xs mt-1">Gläser, Zubehör</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="font-semibold text-gray-900">🏨 jb-x Portal</div>
                  <div className="text-gray-700 text-xs mt-1">Echte Preise & Artikel-IDs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

