import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Download, Loader2, Printer, QrCode } from "lucide-react";
import { Link } from "wouter";

export default function PrintQRCodes() {
  const { data: articles, isLoading } = trpc.articleHistory.list.useQuery();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In production: generate PDF with QR codes
    alert("PDF-Download wird vorbereitet...");
  };

  // Group articles by supplier
  const articlesBySupplier = articles?.reduce((acc, article) => {
    const supplier = article.supplier || "Unbekannt";
    if (!acc[supplier]) {
      acc[supplier] = [];
    }
    acc[supplier].push(article);
    return acc;
  }, {} as Record<string, typeof articles>);

  return (
    <div className="min-h-screen bg-white">
      {/* Header - nur für Screen, nicht für Druck */}
      <header className="bg-white border-b print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/catalog">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zum Katalog
              </Button>
            </Link>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                PDF herunterladen
              </Button>
              <Button onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Drucken
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Info Card - nur für Screen */}
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle>QR-Code Etiketten</CardTitle>
              <CardDescription>
                Drucken Sie QR-Code Etiketten für Ihre Artikel aus. 
                Scannen Sie die Codes später mit der Katalog-Funktion für schnelle Bestellungen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>💡 Tipp:</strong> Kleben Sie die QR-Code Etiketten auf Ihre Lagerregale 
                  oder Produktverpackungen. So können Sie beim Inventur-Gang direkt per Smartphone scannen und bestellen.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* QR Codes by Supplier */}
          {!isLoading && articlesBySupplier && (
            <div className="space-y-8">
              {Object.entries(articlesBySupplier).map(([supplier, supplierArticles]) => (
                <div key={supplier} className="break-before-page">
                  <h2 className="text-2xl font-bold mb-6 print:text-black">{supplier}</h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
                    {supplierArticles?.map((article) => (
                      <div
                        key={article.id}
                        className="border-2 border-dashed border-gray-300 p-4 text-center break-inside-avoid print:border-black print:p-2"
                      >
                        {/* QR Code Placeholder */}
                        <div className="bg-gray-100 w-32 h-32 mx-auto mb-3 flex items-center justify-center print:bg-white print:border print:border-black">
                          <div className="text-center">
                            <QrCode className="h-12 w-12 mx-auto text-gray-400 print:hidden" />
                            {/* In production: render actual QR code with library like qrcode.react */}
                            <div className="text-xs text-gray-500 mt-2 print:text-black print:text-[8px]">
                              QR: {article.ean || article.articleId}
                            </div>
                          </div>
                        </div>
                        
                        {/* Article Info */}
                        <div className="space-y-1">
                          <h3 className="font-semibold text-xs line-clamp-2 print:text-[10px] print:text-black">
                            {article.articleName}
                          </h3>
                          <p className="text-xs text-gray-600 print:text-[8px] print:text-black">
                            Art.-Nr: {article.articleId}
                          </p>
                          {article.ean && (
                            <p className="text-xs text-gray-500 print:text-[8px] print:text-black">
                              EAN: {article.ean}
                            </p>
                          )}
                          {article.lastPrice && (
                            <p className="text-sm font-bold text-green-600 print:text-[10px] print:text-black">
                              {(article.lastPrice / 100).toFixed(2)} €
                            </p>
                          )}
                          <p className="text-xs text-gray-500 print:text-[8px] print:text-black">
                            {article.unit}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Print Footer */}
          <div className="hidden print:block text-center text-xs text-gray-500 mt-8 pt-4 border-t">
            Voice2Order - Artikel-Katalog mit QR-Codes | Erstellt am {new Date().toLocaleDateString('de-DE')}
          </div>
        </div>
      </main>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .break-before-page {
            page-break-before: always;
          }
          
          .break-inside-avoid {
            page-break-inside: avoid;
          }
          
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}

