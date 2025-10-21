import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowLeft, Mic, Package, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

interface CartItem {
  articleId: string;
  articleName: string;
  supplier: string;
  quantity: number;
  unit: string;
  price: number;
  ean?: string;
}

export default function Suppliers() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);

  const { data: articles, isLoading } = trpc.articleHistory.list.useQuery();
  const createOrderMutation = trpc.voiceOrder.create.useMutation();
  const parseMutation = trpc.voiceOrder.parseTranscription.useMutation();
  const matchMutation = trpc.voiceOrder.matchArticles.useMutation();

  // Group articles by supplier
  const articlesBySupplier = articles?.reduce((acc, article) => {
    const supplier = article.supplier || "Unbekannt";
    if (!acc[supplier]) {
      acc[supplier] = [];
    }
    acc[supplier].push(article);
    return acc;
  }, {} as Record<string, typeof articles>);

  // Get supplier statistics
  const supplierStats = Object.entries(articlesBySupplier || {}).map(([supplier, items]) => ({
    supplier,
    articleCount: items.length,
    totalOrders: items.reduce((sum, item) => sum + (item.orderCount || 0), 0),
    lastOrder: items.reduce((latest, item) => {
      if (!item.lastOrderedAt) return latest;
      if (!latest) return item.lastOrderedAt;
      return item.lastOrderedAt > latest ? item.lastOrderedAt : latest;
    }, null as Date | null),
  })).sort((a, b) => b.totalOrders - a.totalOrders);

  const addToCart = (article: NonNullable<typeof articles>[0]) => {
    if (!article) return;
    
    const existingItem = cart.find(item => item.articleId === article.articleId);
    if (existingItem) {
      setCart(cart.map(item => 
        item.articleId === article.articleId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        articleId: article.articleId,
        articleName: article.articleName,
        supplier: article.supplier || "Unbekannt",
        quantity: 1,
        unit: article.unit || "STK",
        price: article.lastPrice || 0,
        ean: article.ean || undefined,
      }]);
    }
  };

  const removeFromCart = (articleId: string) => {
    setCart(cart.filter(item => item.articleId !== articleId));
  };

  const updateQuantity = (articleId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(articleId);
      return;
    }
    setCart(cart.map(item => 
      item.articleId === articleId ? { ...item, quantity } : item
    ));
  };

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

      // Navigate to order detail
      setLocation(`/order/${order.id}`);
    } catch (error) {
      console.error("Fehler beim Erstellen der Bestellung:", error);
      alert("Fehler beim Erstellen der Bestellung");
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Lieferanten...</p>
        </div>
      </div>
    );
  }

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Suppliers List */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ihre Top-Lieferanten</CardTitle>
                <CardDescription>
                  {supplierStats.length} Lieferanten mit {articles?.length || 0} Artikeln
                </CardDescription>
              </CardHeader>
            </Card>

            {supplierStats.map(({ supplier, articleCount, totalOrders, lastOrder }) => {
              const supplierArticles = articlesBySupplier?.[supplier] || [];
              const isExpanded = selectedSupplier === supplier;

              return (
                <Card key={supplier} className="overflow-hidden">
                  <CardHeader 
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedSupplier(isExpanded ? null : supplier)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{supplier}</CardTitle>
                        <CardDescription className="mt-1 space-y-1">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {articleCount} Artikel
                            </span>
                            <span className="text-gray-500">
                              {totalOrders} Bestellungen
                            </span>
                            {lastOrder && (
                              <span className="text-gray-500">
                                Zuletzt: {new Date(lastOrder).toLocaleDateString('de-DE')}
                              </span>
                            )}
                          </div>
                        </CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="ml-2"
                      >
                        {isExpanded ? "Einklappen" : "Artikel anzeigen"}
                      </Button>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {supplierArticles.map((article) => (
                          <div 
                            key={article.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-sm">{article.articleName}</div>
                              <div className="text-xs text-gray-600 mt-1 space-x-3">
                                <span>Art-Nr: {article.articleId}</span>
                                {article.ean && <span>EAN: {article.ean}</span>}
                                <span className="font-semibold text-blue-600">
                                  {((article.lastPrice || 0) / 100).toFixed(2)} EUR
                                </span>
                                <span className="text-gray-500">
                                  {article.orderCount}x bestellt
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => addToCart(article)}
                              className="ml-4"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              In Warenkorb
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Right: Shopping Cart */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Warenkorb
                </CardTitle>
                <CardDescription>
                  {cart.length} Artikel
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
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Bestellung erstellen
                      </Button>
                      <Button 
                        onClick={() => setCart([])}
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
          </div>
        </div>
      </main>
    </div>
  );
}

