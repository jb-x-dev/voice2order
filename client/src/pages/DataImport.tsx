import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, Loader2, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function DataImport() {
  const [, setLocation] = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if it's an Excel file
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      
      if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
        toast.error("Ungültiger Dateityp", {
          description: "Bitte wählen Sie eine Excel-Datei (.xlsx, .xls) oder CSV-Datei aus."
        });
        return;
      }
      
      setSelectedFile(file);
      toast.success("Datei ausgewählt", {
        description: `${file.name} (${(file.size / 1024).toFixed(2)} KB)`
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Keine Datei ausgewählt");
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Upload to server
      const response = await fetch('/api/import/excel', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Upload fehlgeschlagen');
      }

      const result = await response.json();
      
      toast.success("Import erfolgreich!", {
        description: `${result.articles || 0} Artikel und ${result.orders || 0} Bestellungen importiert.`
      });

      // Reset
      setSelectedFile(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      toast.error("Import fehlgeschlagen", {
        description: error.message || "Ein Fehler ist aufgetreten."
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zur Startseite
        </Button>

        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          📊 Daten-Import
        </h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6" />
              Excel-Datei importieren
            </CardTitle>
            <CardDescription>
              Laden Sie eine Excel-Datei mit Bestellhistorie hoch, um Artikel und Bestellvorschläge zu aktualisieren
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="file-upload">Excel-Datei auswählen</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="mt-2"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Ausgewählt: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="w-full"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Importiere Daten...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Daten importieren
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📋 Erwartetes Dateiformat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-700">
              <p>Die Excel-Datei sollte folgende Spalten enthalten:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Lieferant</strong> - Name des Lieferanten</li>
                <li><strong>Artikelnr</strong> - Eindeutige Artikelnummer</li>
                <li><strong>Artikelbezeichnung</strong> - Name des Artikels</li>
                <li><strong>Bestelldatum</strong> - Datum der Bestellung (YYYY-MM-DD)</li>
                <li><strong>Menge</strong> - Bestellte Menge</li>
                <li><strong>Einheit</strong> - Mengeneinheit (z.B. ST, KG, L)</li>
                <li><strong>Ø Einzelpreis</strong> - Durchschnittspreis pro Einheit</li>
                <li><strong>Bestellvolumen</strong> - Gesamtvolumen der Bestellung</li>
              </ul>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="font-medium text-blue-900">💡 Tipp:</p>
                <p className="text-blue-800 mt-1">
                  Exportieren Sie die Bestellhistorie aus dem jb-x Portal im gleichen Format wie die Platzl-Daten.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

