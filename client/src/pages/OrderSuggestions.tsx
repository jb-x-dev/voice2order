import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, TrendingUp, ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLocation } from "wouter";

export default function OrderSuggestions() {
  const { user, loading: authLoading } = useAuth();
  const { data: suggestions, isLoading } = trpc.weeklyOrderSuggestions.list.useQuery(undefined, {
    enabled: !!user,
  });
  const { addToCart } = useCart();
  const [, setLocation] = useLocation();
  const [addedSuggestions, setAddedSuggestions] = useState<Set<string>>(new Set());

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Anmeldung erforderlich</CardTitle>
            <CardDescription>Bitte melden Sie sich an, um Bestellvorschläge zu sehen.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleAddToCart = (suggestion: any) => {
    // Add all items from suggestion to cart
    for (const item of suggestion.items) {
      addToCart({
        articleId: item.articleId,
        articleName: item.articleName,
        supplier: item.supplier,
        unit: item.unit,
        price: item.price,
        ean: undefined,
        quantity: item.quantity,
      });
    }
    
    setAddedSuggestions(prev => new Set(prev).add(suggestion.id));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Bestellvorschläge
          </h1>
          <p className="text-gray-600">
            Intelligente Bestellvorschläge basierend auf Ihrer Bestellhistorie
          </p>
        </div>

        {!suggestions || suggestions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Keine Bestellvorschläge verfügbar</p>
              <p className="text-sm text-gray-500 mt-2">
                Bestellvorschläge werden automatisch basierend auf Ihrer Bestellhistorie generiert.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {suggestions.map((suggestion) => {
              const isAdded = addedSuggestions.has(suggestion.id);
              
              return (
                <Card key={suggestion.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          KW {suggestion.weekNumber}/{suggestion.year}
                        </CardTitle>
                        <CardDescription className="text-blue-100 mt-1">
                          {formatDate(suggestion.weekStartDate.toString())} - {formatDate(suggestion.weekEndDate.toString())}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {formatPrice(suggestion.totalAmount || 0)} €
                        </div>
                        <Badge variant="secondary" className="mt-1">
                          {suggestion.confidence}% Konfidenz
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {suggestion.items.length} Artikel vorgeschlagen
                      </div>
                      <Button
                        onClick={() => handleAddToCart(suggestion)}
                        disabled={isAdded}
                        className={isAdded ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        {isAdded ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Zum Warenkorb hinzugefügt
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Alle zum Warenkorb
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {suggestion.items.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{item.articleName}</div>
                            <div className="text-sm text-gray-500">{item.supplier}</div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">
                                {item.quantity} {item.unit}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatPrice(item.price)} € / {item.unit}
                              </div>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {item.confidence}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" onClick={() => setLocation("/")}>
            Zurück zur Startseite
          </Button>
          <Button onClick={() => setLocation("/cart")}>
            Zum Warenkorb
          </Button>
        </div>
      </div>
    </div>
  );
}

