import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Minus, Package, Plus, QrCode, Search, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

interface CartItem {
  articleId: string;
  articleName: string;
  supplier: string;
  unit: string;
  price: number;
  quantity: number;
  ean?: string;
}

export default function Catalog() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  
  const { data: articles, isLoading } = trpc.articleHistory.list.useQuery();
  const { data: searchResults, isLoading: isSearching } = trpc.articleHistory.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 2 }
  );

  const createOrderMutation = trpc.voiceOrder.create.useMutation();

  let displayArticles = searchQuery.length > 2 ? searchResults : articles;
  
  // Filter by supplier if selected
  if (selectedSupplier !== "all" && displayArticles) {
    displayArticles = displayArticles.filter(a => a.supplier === selectedSupplier);
  }

  // Get unique suppliers for filter
  const allSuppliers = articles?.reduce((acc, article) => {
    const supplier = article.supplier || "Unbekannt";
    if (!acc.includes(supplier)) {
      acc.push(supplier);
    }
    return acc;
  }, [] as string[]).sort() || [];

  // Group articles by supplier
  const articlesBySupplier = displayArticles?.reduce((acc, article) => {
    const supplier = article.supplier || "Unbekannt";
    if (!acc[supplier]) {
      acc[supplier] = [];
    }
    acc[supplier].push(article);
    return acc;
  }, {} as Record<string, typeof articles>);

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
        unit: article.unit || "STK",
        price: article.lastPrice || 0,
        quantity: 1,
        ean: article.ean || undefined,
      }]);
    }
    
    toast.success(`${article.articleName} zum Warenkorb hinzugefügt`);
  };

  const updateQuantity = (articleId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.articleId === articleId) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const getCartQuantity = (articleId: string) => {
    return cart.find(item => item.articleId === articleId)?.quantity || 0;
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Warenkorb ist leer");
      return;
    }

    try {
      // Create voice order
      const order = await createOrderMutation.mutateAsync({});
      
      // Generate transcription from cart
      const transcription = cart.map(item => 
        `${item.quantity} ${item.unit} ${item.articleName}`
      ).join(", ");
      
      // Navigate to order detail with cart data
      setLocation(`/order/${order.id}?cart=${encodeURIComponent(JSON.stringify(cart))}&transcription=${encodeURIComponent(transcription)}`);
      
      toast.success("Bestellung wird erstellt...");
    } catch (error) {
      console.error("Fehler beim Erstellen der Bestellung:", error);
      toast.error("Fehler beim Erstellen der Bestellung");
    }
  };

  const scanQRCode = () => {
    setShowScanner(true);
    toast.info("QR-Code Scanner wird geöffnet...");
    // In production: integrate with device camera API
    // For now: show input field for manual EAN entry
  };

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
            
            {cart.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="font-semibold">{getTotalItems()}</span> Artikel
                  <span className="mx-2">•</span>
                  <span className="font-semibold">{(getTotalPrice() / 100).toFixed(2)} €</span>
                </div>
                <Button onClick={handleCheckout}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Bestellen
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle>Artikel-Katalog</CardTitle>
              <CardDescription>
                Wählen Sie Artikel aus dem Katalog oder scannen Sie QR-Codes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Artikel suchen..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" onClick={scanQRCode}>
                    <QrCode className="h-4 w-4 mr-2" />
                    QR scannen
                  </Button>
                  <Link href="/print-qr">
                    <Button variant="outline">
                      <QrCode className="h-4 w-4 mr-2" />
                      QR drucken
                    </Button>
                  </Link>
                </div>

                {/* Supplier Filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-700">Lieferant:</span>
                  <Button
                    size="sm"
                    variant={selectedSupplier === "all" ? "default" : "outline"}
                    onClick={() => setSelectedSupplier("all")}
                  >
                    Alle ({articles?.length || 0})
                  </Button>
                  {allSuppliers.slice(0, 8).map((supplier) => {
                    const count = articles?.filter(a => a.supplier === supplier).length || 0;
                    return (
                      <Button
                        key={supplier}
                        size="sm"
                        variant={selectedSupplier === supplier ? "default" : "outline"}
                        onClick={() => setSelectedSupplier(supplier)}
                      >
                        {supplier} ({count})
                      </Button>
                    );
                  })}
                  {allSuppliers.length > 8 && (
                    <select
                      className="text-sm border rounded px-2 py-1"
                      value={selectedSupplier}
                      onChange={(e) => setSelectedSupplier(e.target.value)}
                    >
                      <option value="all">Weitere Lieferanten...</option>
                      {allSuppliers.slice(8).map((supplier) => {
                        const count = articles?.filter(a => a.supplier === supplier).length || 0;
                        return (
                          <option key={supplier} value={supplier}>
                            {supplier} ({count})
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>
              </div>

              {showScanner && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 mb-3">
                    <strong>📱 QR-Code / EAN Scanner:</strong> Geben Sie die EAN-Nummer ein oder verwenden Sie die Kamera
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="EAN-Code eingeben..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const ean = e.currentTarget.value;
                          const article = displayArticles?.find(a => a.ean === ean);
                          if (article) {
                            addToCart(article);
                            e.currentTarget.value = '';
                            toast.success(`Artikel per EAN hinzugefügt: ${article.articleName}`);
                          } else {
                            toast.error("Artikel nicht gefunden");
                          }
                        }
                      }}
                    />
                    <Button variant="ghost" onClick={() => setShowScanner(false)}>
                      Schließen
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Loading State */}
          {(isLoading || isSearching) && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Articles by Supplier */}
          {!isLoading && !isSearching && articlesBySupplier && (
            <div className="space-y-6">
              {Object.entries(articlesBySupplier).map(([supplier, supplierArticles]) => (
                <Card key={supplier}>
                  <CardHeader>
                    <CardTitle className="text-lg">{supplier}</CardTitle>
                    <CardDescription>
                      {supplierArticles?.length || 0} Artikel verfügbar
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {supplierArticles?.map((article) => {
                        const cartQty = getCartQuantity(article.articleId);
                        
                        return (
                          <div
                            key={article.id}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                          >
                            <div className="flex items-start gap-3">
                              <div className="bg-blue-100 rounded-lg p-2">
                                <Package className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm mb-2">
                                  {article.articleName}
                                </h4>
                                <div className="space-y-1 mb-3">
                                  {article.ean && (
                                    <div className="flex items-center gap-2">
                                      <QrCode className="h-3 w-3 text-gray-400" />
                                      <p className="text-xs text-gray-500">
                                        {article.ean}
                                      </p>
                                    </div>
                                  )}
                                  {article.unit && (
                                    <p className="text-xs text-gray-500">
                                      Einheit: {article.unit}
                                    </p>
                                  )}
                                  {article.lastPrice && (
                                    <p className="text-sm font-semibold text-green-600">
                                      {(article.lastPrice / 100).toFixed(2)} € / {article.unit}
                                    </p>
                                  )}
                                </div>

                                {cartQty === 0 ? (
                                  <Button 
                                    size="sm" 
                                    className="w-full"
                                    onClick={() => addToCart(article)}
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    In den Warenkorb
                                  </Button>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateQuantity(article.articleId, -1)}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="flex-1 text-center font-semibold">
                                      {cartQty}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateQuantity(article.articleId, 1)}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isSearching && (!displayArticles || displayArticles.length === 0) && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>
                    {searchQuery.length > 2
                      ? "Keine Artikel gefunden"
                      : "Noch keine Artikel im Katalog"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cart Summary (Mobile) */}
          {cart.length > 0 && (
            <Card className="lg:hidden sticky bottom-4">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">{getTotalItems()} Artikel</div>
                    <div className="text-sm text-gray-500">
                      {(getTotalPrice() / 100).toFixed(2)} €
                    </div>
                  </div>
                  <Button onClick={handleCheckout}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Bestellen
                  </Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.articleId} className="text-xs flex justify-between">
                      <span className="truncate flex-1">{item.quantity}x {item.articleName}</span>
                      <span className="font-semibold ml-2">
                        {((item.price * item.quantity) / 100).toFixed(2)} €
                      </span>
                    </div>
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

