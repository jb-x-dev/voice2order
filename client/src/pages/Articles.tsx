import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calendar, ChevronDown, ChevronUp, Loader2, Package, Plus, Search, ShoppingCart, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Articles() {
  const { addToCart, totalItems, totalPrice } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  
  const { data: articles, isLoading } = trpc.articleHistory.list.useQuery();
  const { data: searchResults, isLoading: isSearching } = trpc.articleHistory.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 2 }
  );

  const displayArticles = searchQuery.length > 2 ? searchResults : articles;

  // Group articles by supplier
  const articlesBySupplier = displayArticles?.reduce((acc, article) => {
    const supplier = article.supplier || "Unbekannt";
    if (!acc[supplier]) {
      acc[supplier] = [];
    }
    acc[supplier].push(article);
    return acc;
  }, {} as Record<string, typeof articles>);

  const handleAddToCart = (article: NonNullable<typeof articles>[0]) => {
    addToCart({
      articleId: article.articleId,
      articleName: article.articleName,
      supplier: article.supplier || "Unbekannt",
      unit: article.unit || "STK",
      price: article.lastPrice || 0,
      ean: article.ean || undefined,
    });
    toast.success(`${article.articleName} zum Warenkorb hinzugefügt`);
  };

  const toggleExpand = (articleId: string) => {
    setExpandedArticle(expandedArticle === articleId ? null : articleId);
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
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-700">
                {totalItems} Artikel - {(totalPrice / 100).toFixed(2)} EUR
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle>Artikel-Datenbank</CardTitle>
              <CardDescription>
                {articles?.length || 0} Artikel aus früheren Bestellungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Artikel suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
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
                      {supplierArticles?.length || 0} Artikel
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {supplierArticles?.map((article) => {
                        const isExpanded = expandedArticle === article.id;
                        return (
                          <div
                            key={article.id}
                            className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                          >
                            <div className="p-4 bg-white">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-start gap-3">
                                    <div className="bg-blue-100 rounded-lg p-2 flex-shrink-0">
                                      <Package className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-base">
                                        {article.articleName}
                                      </h4>
                                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                                        <span>Art-Nr: {article.articleId}</span>
                                        {article.ean && <span>EAN: {article.ean}</span>}
                                        {article.unit && <span>Einheit: {article.unit}</span>}
                                        {article.lastPrice && (
                                          <span className="font-semibold text-blue-600">
                                            {(article.lastPrice / 100).toFixed(2)} EUR
                                          </span>
                                        )}
                                      </div>
                                      <div className="mt-2 flex items-center gap-4 text-sm">
                                        <span className="flex items-center gap-1 text-gray-500">
                                          <TrendingUp className="h-4 w-4" />
                                          {article.orderCount}× bestellt
                                        </span>
                                        {article.lastOrderedAt && (
                                          <span className="flex items-center gap-1 text-gray-500">
                                            <Calendar className="h-4 w-4" />
                                            Zuletzt: {new Date(article.lastOrderedAt).toLocaleDateString('de-DE')}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                  <Button
                                    size="sm"
                                    onClick={() => handleAddToCart(article)}
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    In Warenkorb
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => toggleExpand(article.id)}
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                              <div className="bg-gray-50 border-t p-4 space-y-3">
                                <h5 className="font-semibold text-sm text-gray-700">Bestellhistorie</h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="bg-white rounded-lg p-3 border">
                                    <div className="text-xs text-gray-600 mb-1">Bestellhäufigkeit</div>
                                    <div className="text-lg font-bold text-blue-600">
                                      {article.orderCount}× bestellt
                                    </div>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 border">
                                    <div className="text-xs text-gray-600 mb-1">Letzte Bestellung</div>
                                    <div className="text-sm font-semibold">
                                      {article.lastOrderedAt 
                                        ? new Date(article.lastOrderedAt).toLocaleDateString('de-DE', { 
                                            day: '2-digit', 
                                            month: '2-digit', 
                                            year: 'numeric' 
                                          })
                                        : 'Unbekannt'
                                      }
                                    </div>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 border">
                                    <div className="text-xs text-gray-600 mb-1">Durchschnittspreis</div>
                                    <div className="text-lg font-bold text-green-600">
                                      {article.lastPrice 
                                        ? `${(article.lastPrice / 100).toFixed(2)} EUR`
                                        : 'N/A'
                                      }
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Simulated order intervals */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <div className="text-xs text-blue-900 font-semibold mb-2">
                                    Geschätzte Bestellintervalle
                                  </div>
                                  <div className="text-sm text-blue-800">
                                    {article.orderCount && article.orderCount > 1 ? (
                                      <span>
                                        Durchschnittlich alle{' '}
                                        <strong>
                                          {Math.max(1, Math.round(30 / Math.min(article.orderCount, 10)))} Tage
                                        </strong>
                                      </span>
                                    ) : (
                                      <span className="text-gray-600">
                                        Nicht genügend Daten für Intervall-Berechnung
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
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
                      : "Noch keine Artikel in der Datenbank"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

