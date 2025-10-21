import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Mic, Package, ShoppingCart, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
  const [, setLocation] = useLocation();

  const createOrderMutation = trpc.voiceOrder.create.useMutation();
  const parseMutation = trpc.voiceOrder.parseTranscription.useMutation();
  const matchMutation = trpc.voiceOrder.matchArticles.useMutation();

  const submitOrder = async () => {
    if (cart.length === 0) {
      alert("Warenkorb ist leer");
      return;
    }

    try {
      // Create order
      const order = await createOrderMutation.mutateAsync({});
      
      // Build transcription from cart
      const transcription = cart.map(item => 
        `${item.quantity} ${item.unit} ${item.articleName}`
      ).join(", ");

      // Parse and match
      await parseMutation.mutateAsync({
        orderId: order.id,
        transcription,
      });

      await matchMutation.mutateAsync({
        orderId: order.id,
      });

      // Clear cart and navigate to order detail
      clearCart();
      setLocation(`/order/${order.id}`);
    } catch (error) {
      console.error("Fehler beim Erstellen der Bestellung:", error);
      alert("Fehler beim Erstellen der Bestellung");
    }
  };

  // Group cart items by supplier
  const itemsBySupplier = cart.reduce((acc, item) => {
    if (!acc[item.supplier]) {
      acc[item.supplier] = [];
    }
    acc[item.supplier].push(item);
    return acc;
  }, {} as Record<string, typeof cart>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-700">
                {totalItems} Artikel - {(totalPrice / 100).toFixed(2)} EUR
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                Warenkorb
              </CardTitle>
              <CardDescription>
                {cart.length} Position{cart.length !== 1 ? "en" : ""} • {totalItems} Artikel gesamt
              </CardDescription>
            </CardHeader>
          </Card>

          {cart.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-20 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Ihr Warenkorb ist leer
                </h3>
                <p className="text-gray-500 mb-6">
                  Fügen Sie Artikel aus dem Katalog oder von Ihren Lieferanten hinzu
                </p>
                <div className="flex gap-3 justify-center">
                  <Link href="/catalog">
                    <Button>
                      <Package className="h-4 w-4 mr-2" />
                      Zum Katalog
                    </Button>
                  </Link>
                  <Link href="/suppliers">
                    <Button variant="outline">
                      <Package className="h-4 w-4 mr-2" />
                      Zu Lieferanten
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Items grouped by supplier */}
              {Object.entries(itemsBySupplier).map(([supplier, items]) => (
                <Card key={supplier}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {supplier}
                    </CardTitle>
                    <CardDescription>
                      {items.length} Artikel • {((items.reduce((sum, item) => sum + (item.price * item.quantity), 0)) / 100).toFixed(2)} EUR
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {items.map((item) => (
                      <div key={item.articleId} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{item.articleName}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {item.ean && <span className="mr-3">EAN: {item.ean}</span>}
                              <span className="font-semibold text-blue-600">
                                {(item.price / 100).toFixed(2)} EUR / {item.unit}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.articleId)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Menge:</label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.articleId, parseInt(e.target.value) || 0)}
                              className="w-24 h-9"
                            />
                            <span className="text-sm text-gray-600">{item.unit}</span>
                          </div>
                          <div className="ml-auto">
                            <div className="text-sm text-gray-600">Summe:</div>
                            <div className="text-lg font-bold text-blue-600">
                              {((item.price * item.quantity) / 100).toFixed(2)} EUR
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}

              {/* Summary and Actions */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold">Gesamtsumme:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {(totalPrice / 100).toFixed(2)} EUR
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={submitOrder}
                      size="lg"
                      className="w-full"
                      disabled={createOrderMutation.isPending}
                    >
                      <Mic className="h-5 w-5 mr-2" />
                      {createOrderMutation.isPending ? "Erstelle..." : "Bestellung erstellen"}
                    </Button>
                    <Button 
                      onClick={clearCart}
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      <Trash2 className="h-5 w-5 mr-2" />
                      Warenkorb leeren
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

