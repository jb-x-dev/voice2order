import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Database, Loader2 } from "lucide-react";

export default function Admin() {
  const [isImporting, setIsImporting] = useState(false);
  const seedMutation = trpc.admin.seedData.useMutation();

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const result = await seedMutation.mutateAsync();
      if (result.skipped) {
        toast.info("Daten bereits importiert", {
          description: "Die Platzl-Bestelldaten sind bereits in der Datenbank vorhanden."
        });
      } else {
        toast.success("Daten erfolgreich importiert!", {
          description: `${result.articles} Artikel und ${result.suggestions} Bestellvorschläge wurden importiert.`
        });
      }
    } catch (error: any) {
      toast.error("Import fehlgeschlagen", {
        description: error.message || "Ein Fehler ist aufgetreten."
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          Voice2Order Admin
        </h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-6 h-6" />
              Platzl-Bestelldaten importieren
            </CardTitle>
            <CardDescription>
              Importieren Sie die Bestellhistorie vom Betrieb Platzl (415 Artikel, 4 Bestellvorschläge)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Dieser Import lädt automatisch:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>415 Artikel aus der Bestellhistorie (24 Monate)</li>
                <li>4 wöchentliche Bestellvorschläge (KW 43-46/2025)</li>
                <li>Artikel-Statistiken (Bestellhäufigkeit, Durchschnittspreise)</li>
              </ul>

              <Button
                onClick={handleImport}
                disabled={isImporting}
                className="w-full"
                size="lg"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Importiere Daten...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-5 w-5" />
                    Daten jetzt importieren
                  </>
                )}
              </Button>

              {seedMutation.isSuccess && !seedMutation.data.skipped && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">
                    ✅ Import erfolgreich abgeschlossen!
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    Sie können jetzt den Katalog, Lieferanten und Bestellvorschläge nutzen.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Hinweis: Der Import kann nur einmal ausgeführt werden.</p>
          <p>Bereits vorhandene Daten werden nicht überschrieben.</p>
        </div>
      </div>
    </div>
  );
}

