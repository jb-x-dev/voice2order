import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Package, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Articles() {
  const [searchQuery, setSearchQuery] = useState("");
  
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
          </Link>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {supplierArticles?.map((article) => (
                        <div
                          key={article.id}
                          className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-100 rounded-lg p-2">
                              <Package className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">
                                {article.articleName}
                              </h4>
                              <div className="mt-1 space-y-1">
                                {article.ean && (
                                  <p className="text-xs text-gray-500">
                                    EAN: {article.ean}
                                  </p>
                                )}
                                {article.unit && (
                                  <p className="text-xs text-gray-500">
                                    Einheit: {article.unit}
                                  </p>
                                )}
                                {article.lastPrice && (
                                  <p className="text-xs font-semibold text-green-600">
                                    {(article.lastPrice / 100).toFixed(2)} €
                                  </p>
                                )}
                                <p className="text-xs text-gray-400">
                                  {article.orderCount}× bestellt
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
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

