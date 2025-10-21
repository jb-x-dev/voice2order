import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { Mic, ShoppingCart, Trash2 } from "lucide-react";
import { useLocation } from "wouter";

export default function ShoppingCartWidget() {
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

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Warenkorb
        </CardTitle>
        <CardDescription>
          {cart.length} Position{cart.length !== 1 ? "en" : ""} • {totalItems} Artikel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cart.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Warenkorb ist leer</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.articleId} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-2">
                      <div className="font-medium text-sm">{item.articleName}</div>
                      <div className="text-xs text-gray-600">{item.supplier}</div>
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
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.articleId, parseInt(e.target.value) || 0)}
                      className="w-20 h-8 text-sm"
                    />
                    <span className="text-sm text-gray-600">{item.unit}</span>
                    <span className="text-sm font-semibold text-blue-600 ml-auto">
                      {((item.price * item.quantity) / 100).toFixed(2)} EUR
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Gesamt:</span>
                <span className="text-xl font-bold text-blue-600">
                  {(totalPrice / 100).toFixed(2)} EUR
                </span>
              </div>
              <Button 
                onClick={submitOrder}
                className="w-full"
                size="lg"
                disabled={createOrderMutation.isPending}
              >
                <Mic className="h-4 w-4 mr-2" />
                {createOrderMutation.isPending ? "Erstelle..." : "Bestellung erstellen"}
              </Button>
              <Button 
                onClick={clearCart}
                variant="outline"
                className="w-full"
              >
                Warenkorb leeren
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

