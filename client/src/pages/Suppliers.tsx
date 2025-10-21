import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ShoppingCartWidget from "@/components/ShoppingCartWidget";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Package, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Suppliers() {
  const { addToCart, totalItems, totalPrice } = useCart();
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);

  const { data: articles, isLoading } = trpc.articleHistory.list.useQuery();

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

  const handleAddToCart = (article: NonNullable<typeof articles>[0]) => {
    if (!article) return;
    
    addToCart({
      articleId: article.articleId,
      articleName: article.articleName,
      supplier: article.supplier || "Unbekannt",
      unit: article.unit || "STK",
      price: article.lastPrice || 0,
      ean: article.ean || undefined,
    });
  };

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
                              onClick={() => handleAddToCart(article)}
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
            <ShoppingCartWidget />
          </div>
        </div>
      </main>
    </div>
  );
}

