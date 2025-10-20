import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CheckCircle, Loader2, Package, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";

export default function OrderDetail() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;

  const { data, isLoading, refetch } = trpc.voiceOrder.get.useQuery(
    { id: orderId! },
    { enabled: !!orderId }
  );

  const confirmItemMutation = trpc.voiceOrder.confirmItem.useMutation({
    onSuccess: () => refetch(),
  });

  const updateItemMutation = trpc.voiceOrder.updateItem.useMutation({
    onSuccess: () => refetch(),
  });

  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [editUnit, setEditUnit] = useState<string>("");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Bestellung nicht gefunden</p>
      </div>
    );
  }

  const { order, items } = data;

  const handleEdit = (item: typeof items[0]) => {
    setEditingItem(item.id);
    setEditQuantity(item.quantity);
    setEditUnit(item.unit || "");
  };

  const handleSave = async (itemId: string) => {
    await updateItemMutation.mutateAsync({
      itemId,
      quantity: editQuantity,
      unit: editUnit,
    });
    setEditingItem(null);
  };

  const handleConfirm = async (itemId: string, confirmed: boolean) => {
    await confirmItemMutation.mutateAsync({
      itemId,
      confirmed,
    });
  };

  const confirmedItems = items.filter((i) => i.confirmed);
  const totalValue = confirmedItems.reduce(
    (sum, item) => sum + (item.matchedPrice || 0) * item.quantity,
    0
  );

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
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle>Bestelldetails</CardTitle>
              <CardDescription>
                Erstellt am {new Date(order.createdAt!).toLocaleString("de-DE")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.transcription && (
                <div>
                  <Label>Transkription</Label>
                  <p className="text-sm text-gray-700 mt-1 p-3 bg-gray-50 rounded">
                    {order.transcription}
                  </p>
                </div>
              )}
              {order.audioUrl && (
                <div>
                  <Label>Audioaufnahme</Label>
                  <audio controls src={order.audioUrl} className="w-full mt-2" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bestellpositionen</CardTitle>
                  <CardDescription>
                    {items.length} Artikel erkannt
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Bestätigt</p>
                  <p className="text-2xl font-bold">
                    {confirmedItems.length} / {items.length}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`
                      p-4 rounded-lg border-2 transition-all
                      ${
                        item.confirmed
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 bg-white"
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        {/* Article Name */}
                        <div>
                          <p className="font-medium">{item.articleName}</p>
                          {item.matchedArticleName && (
                            <p className="text-sm text-gray-600">
                              → {item.matchedArticleName}
                            </p>
                          )}
                        </div>

                        {/* Quantity */}
                        {editingItem === item.id ? (
                          <div className="flex gap-2 items-center">
                            <Input
                              type="number"
                              value={editQuantity}
                              onChange={(e) =>
                                setEditQuantity(Number(e.target.value))
                              }
                              className="w-24"
                            />
                            <Input
                              type="text"
                              value={editUnit}
                              onChange={(e) => setEditUnit(e.target.value)}
                              className="w-32"
                              placeholder="Einheit"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSave(item.id)}
                              disabled={updateItemMutation.isPending}
                            >
                              Speichern
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingItem(null)}
                            >
                              Abbrechen
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {item.quantity} {item.unit}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(item)}
                            >
                              Bearbeiten
                            </Button>
                          </div>
                        )}

                        {/* Supplier & Price */}
                        {item.matchedSupplier && (
                          <div className="text-sm text-gray-600">
                            <p>Lieferant: {item.matchedSupplier}</p>
                            {item.matchedPrice && (
                              <p>
                                Preis: {(item.matchedPrice / 100).toFixed(2)} € ×{" "}
                                {item.quantity} ={" "}
                                {((item.matchedPrice * item.quantity) / 100).toFixed(
                                  2
                                )}{" "}
                                €
                              </p>
                            )}
                          </div>
                        )}

                        {/* Confidence */}
                        {item.confidence !== null && (
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  item.confidence >= 80
                                    ? "bg-green-500"
                                    : item.confidence >= 60
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${item.confidence}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {item.confidence}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Confirm Button */}
                      <div>
                        {item.confirmed ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConfirm(item.id, false)}
                            disabled={confirmItemMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            Bestätigt
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleConfirm(item.id, true)}
                            disabled={confirmItemMutation.isPending}
                          >
                            Bestätigen
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          {confirmedItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Zusammenfassung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Gesamtwert (geschätzt)</span>
                  <span>{(totalValue / 100).toFixed(2)} €</span>
                </div>

                <Button className="w-full" size="lg">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  An jb-x business suite senden
                </Button>

                <p className="text-xs text-center text-gray-500">
                  Die Bestellung wird als Warenkorb an Ihr jb-x Portal übertragen
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

