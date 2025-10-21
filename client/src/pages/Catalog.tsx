import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ShoppingCartWidget from "@/components/ShoppingCartWidget";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Package, Plus, QrCode, Search, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Catalog() {
  const { user } = useAuth();
  const { addToCart, totalItems, totalPrice } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("all");
  const [showScanner, setShowScanner] = useState(false);
  
  const { data: articles, isLoading } = trpc.articleHistory.list.useQuery();
  const { data: searchResults } = trpc.articleHistory.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 2 }
  );

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

  const handleScanCode = (code: string) => {
    const article = articles?.find(a => a.ean === code || a.articleId === code);
    if (article) {
      handleAddToCart(article);
      setShowScanner(false);
    } else {
      toast.error("Artikel nicht gefunden");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Katalog...</p>
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
          {/* Left: Article Catalog */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Artikel-Katalog</CardTitle>
                <CardDescription>
                  {articles?.length || 0} Artikel verfügbar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Artikel suchen..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowScanner(!showScanner)}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Scannen
                  </Button>
                </div>

                {/* Scanner Input */}
                {showScanner && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900 mb-2">
                      Scannen Sie einen QR-Code oder EAN-Code:
                    </p>
                    <Input
                      placeholder="Code hier eingeben oder scannen..."
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleScanCode(e.currentTarget.value);
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                  </div>
                )}

                {/* Supplier Filter */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={selectedSupplier === "all" ? "default" : "outline"}
                    onClick={() => setSelectedSupplier("all")}
                  >
                    Alle ({articles?.length || 0})
                  </Button>
                  {allSuppliers.map((supplier) => {
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
                </div>

                {/* QR Code Print Link */}
                <div className="bg-gray-50 border rounded-lg p-3">
                  <Link href="/print-qr-codes">
                    <Button variant="outline" size="sm">
                      <QrCode className="h-4 w-4 mr-2" />
                      QR-Code Etiketten drucken
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Articles List */}
            <div className="space-y-3">
              {displayArticles?.map((article) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{article.articleName}</div>
                        <div className="text-sm text-gray-600 mt-1 space-x-3">
                          <span className="inline-flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {article.supplier || "Unbekannt"}
                          </span>
                          <span>Art-Nr: {article.articleId}</span>
                          {article.ean && <span>EAN: {article.ean}</span>}
                          <span className="font-semibold text-blue-600">
                            {((article.lastPrice || 0) / 100).toFixed(2)} EUR
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
                  </CardContent>
                </Card>
              ))}

              {displayArticles?.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>Keine Artikel gefunden</p>
                  </CardContent>
                </Card>
              )}
            </div>
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

