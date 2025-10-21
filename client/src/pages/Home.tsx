import { useAuth } from "@/_core/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Mic, MicOff, Loader2, CheckCircle, XCircle, History, Package, ShoppingCart } from "lucide-react";
import { useState, useRef } from "react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const { totalItems, totalPrice } = useCart();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const createOrderMutation = trpc.voiceOrder.create.useMutation();
  const transcribeMutation = trpc.voiceOrder.transcribe.useMutation();
  const parseMutation = trpc.voiceOrder.parseTranscription.useMutation();
  const matchMutation = trpc.voiceOrder.matchArticles.useMutation();

  const { data: recentOrders } = trpc.voiceOrder.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Fehler beim Starten der Aufnahme:", error);
      alert("Mikrofon-Zugriff wurde verweigert oder ist nicht verfügbar.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processOrder = async () => {
    if (!audioBlob) return;

    try {
      // 1. Create order
      const order = await createOrderMutation.mutateAsync({});
      
      // 2. Upload audio (simplified - in production use storage)
      const audioDataUrl = await blobToDataUrl(audioBlob);
      
      // 3. Transcribe
      const transcription = await transcribeMutation.mutateAsync({
        orderId: order.id,
        audioUrl: audioDataUrl,
      });

      // 4. Parse transcription
      const items = await parseMutation.mutateAsync({
        orderId: order.id,
        transcription: transcription.transcription,
      });

      // 5. Match with history
      await matchMutation.mutateAsync({
        orderId: order.id,
      });

      // Reset
      setAudioBlob(null);
      setAudioUrl(null);
      
      // Navigate to order detail
      window.location.href = `/order/${order.id}`;
    } catch (error) {
      console.error("Fehler bei der Verarbeitung:", error);
      alert("Fehler bei der Verarbeitung der Bestellung");
    }
  };

  const blobToDataUrl = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">{APP_TITLE}</h1>
            <p className="text-lg text-gray-600">
              Sprachgesteuerte Bestellerfassung für Hotels und Gastronomie
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Willkommen</CardTitle>
              <CardDescription>
                Erfassen Sie Ihren Bestellbedarf einfach per Sprache
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Sprechen Sie Ihren Bedarf ins Mikrofon</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>KI erkennt Artikel und Mengen automatisch</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Zuordnung zu Lieferanten aus Historie</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Export zu jb-x business suite</span>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Jetzt anmelden
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mic className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.name || user?.email}
            </span>
            <Link href="/demo">
              <Button variant="default" size="sm">
                🎯 Demo
              </Button>
            </Link>
              <Link href="/catalog">
                <Button variant="default" size="lg" className="w-full">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Katalog
                </Button>
              </Link>
              <Link href="/suppliers">
                <Button variant="default" size="lg" className="w-full">
                  <Package className="h-5 w-5 mr-2" />
                  Lieferanten
                </Button>
              </Link>
              <Link href="/cart">
                <Button 
                  variant={totalItems > 0 ? "default" : "outline"} 
                  size="lg" 
                  className="w-full relative"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Warenkorb
                  {totalItems > 0 && (
                    <span className="ml-2 bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/order-suggestions">
                <Button variant="outline" size="lg" className="w-full">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Bestellvorschläge
                </Button>
              </Link>
            <Link href="/articles">
              <Button variant="outline" size="sm">
                <Package className="h-4 w-4 mr-2" />
                Artikel
              </Button>
            </Link>
            <Link href="/history">
              <Button variant="outline" size="sm">
                <History className="h-4 w-4 mr-2" />
                Verlauf
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" size="sm">
                Einstellungen
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Recording Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Neue Bestellung aufnehmen</CardTitle>
              <CardDescription>
                Sprechen Sie Ihren Bestellbedarf ins Mikrofon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recording Button */}
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={createOrderMutation.isPending || transcribeMutation.isPending}
                  className={`
                    relative w-32 h-32 rounded-full flex items-center justify-center
                    transition-all duration-300 shadow-lg
                    ${isRecording 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-primary hover:bg-primary/90'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {isRecording ? (
                    <MicOff className="h-16 w-16 text-white" />
                  ) : (
                    <Mic className="h-16 w-16 text-white" />
                  )}
                </button>
                
                <p className="text-center text-sm text-gray-600">
                  {isRecording 
                    ? "Aufnahme läuft... Klicken zum Stoppen" 
                    : audioBlob 
                      ? "Aufnahme bereit zur Verarbeitung"
                      : "Klicken zum Starten der Aufnahme"
                  }
                </p>
              </div>

              {/* Audio Preview */}
              {audioUrl && (
                <div className="space-y-4">
                  <audio controls src={audioUrl} className="w-full" />
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={processOrder}
                      disabled={
                        createOrderMutation.isPending ||
                        transcribeMutation.isPending ||
                        parseMutation.isPending ||
                        matchMutation.isPending
                      }
                      className="flex-1"
                    >
                      {(createOrderMutation.isPending ||
                        transcribeMutation.isPending ||
                        parseMutation.isPending ||
                        matchMutation.isPending) && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Bestellung verarbeiten
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAudioBlob(null);
                        setAudioUrl(null);
                      }}
                    >
                      Verwerfen
                    </Button>
                  </div>
                </div>
              )}

              {/* Processing Status */}
              {(createOrderMutation.isPending ||
                transcribeMutation.isPending ||
                parseMutation.isPending ||
                matchMutation.isPending) && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {createOrderMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <span>Bestellung erstellen...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {transcribeMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : transcribeMutation.isSuccess ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4" />
                    )}
                    <span>Sprache transkribieren...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {parseMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : parseMutation.isSuccess ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4" />
                    )}
                    <span>Artikel erkennen...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {matchMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : matchMutation.isSuccess ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4" />
                    )}
                    <span>Mit Lieferanten abgleichen...</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          {recentOrders && recentOrders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Letzte Bestellungen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentOrders.slice(0, 5).map((order) => (
                    <Link key={order.id} href={`/order/${order.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer border">
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {order.transcription?.substring(0, 60)}
                            {order.transcription && order.transcription.length > 60 ? "..." : ""}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt!).toLocaleString("de-DE")}
                          </p>
                        </div>
                        <div>
                          {order.status === "completed" && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          {order.status === "processing" && (
                            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                          )}
                          {order.status === "error" && (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

