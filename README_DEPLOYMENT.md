# Voice2Order - Deployment Guide

Voice2Order ist eine sprachgesteuerte Bestellerfassung für Hotels und Gastronomie mit KI-gestützter Artikelerkennung und intelligenten Bestellvorschlägen.

## Features

- 🎤 **Sprachaufnahme** mit Whisper AI-Transkription
- 🤖 **GPT-4 Artikelerkennung** mit Fuzzy-Matching
- 📊 **Wöchentliche Bestellvorschläge** basierend auf historischen Daten
- 🛒 **Intelligenter Warenkorb** mit automatischer Artikel-Konsolidierung
- 📦 **Lieferanten-Management** mit 19 Top-Lieferanten
- 📈 **425 Artikel** aus echten Platzl-Bestelldaten

## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui
- **Backend**: Express 4 + tRPC 11
- **Database**: MySQL (TiDB/PlanetScale compatible)
- **Auth**: Manus OAuth
- **AI**: OpenAI Whisper + GPT-4

## Deployment auf Render.com

### Voraussetzungen

1. **GitHub Account** (kostenlos)
2. **Render.com Account** (kostenlos)
3. **PlanetScale Account** (kostenlos) oder andere MySQL-Datenbank

### Schritt 1: GitHub Repository erstellen

1. Gehen Sie zu https://github.com/new
2. Repository-Name: `voice2order`
3. Visibility: Private (empfohlen)
4. Klicken Sie auf "Create repository"

### Schritt 2: Code zu GitHub pushen

```bash
# Im voice2order Verzeichnis
git remote add origin https://github.com/IHR_USERNAME/voice2order.git
git add .
git commit -m "Initial commit: Voice2Order deployment ready"
git branch -M main
git push -u origin main
```

### Schritt 3: PlanetScale Datenbank erstellen

1. Gehen Sie zu https://planetscale.com
2. Erstellen Sie eine neue Datenbank: `voice2order-db`
3. Notieren Sie die Connection String:
   ```
   mysql://user:password@host/database?ssl={"rejectUnauthorized":true}
   ```

### Schritt 4: Datenbank-Schema importieren

```bash
# Exportiere Schema aus aktueller Datenbank
pnpm drizzle-kit generate

# Importiere in PlanetScale
# Verwenden Sie die PlanetScale CLI oder das Web-Interface
```

### Schritt 5: Render.com Web Service erstellen

1. Gehen Sie zu https://render.com
2. Klicken Sie auf "New +" → "Web Service"
3. Verbinden Sie Ihr GitHub Repository
4. Konfiguration:
   - **Name**: `voice2order`
   - **Environment**: `Node`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
   - **Instance Type**: Free

### Schritt 6: Environment Variables setzen

In Render.com unter "Environment":

```env
# Database
DATABASE_URL=mysql://user:password@host/database

# JWT
JWT_SECRET=<generieren Sie einen zufälligen String>

# OAuth (Manus)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
VITE_APP_ID=<Ihre Manus App ID>

# App Branding
VITE_APP_TITLE=Voice2Order
VITE_APP_LOGO=https://your-logo-url.com/logo.png

# Owner
OWNER_OPEN_ID=<Ihre Manus User ID>
OWNER_NAME=<Ihr Name>

# Manus Built-in APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=<Ihr Manus API Key>

# Node Environment
NODE_ENV=production
```

### Schritt 7: Deploy

1. Klicken Sie auf "Create Web Service"
2. Render.com baut und deployed automatisch
3. Nach ~5 Minuten ist die App unter `https://voice2order.onrender.com` verfügbar

## Datenbank-Migration

### Bestehende Daten importieren

Wenn Sie die Platzl-Bestelldaten importieren möchten:

```bash
# 1. Exportiere Daten aus aktueller Datenbank
mysqldump -h OLD_HOST -u USER -p DATABASE > voice2order_data.sql

# 2. Importiere in PlanetScale
mysql -h NEW_HOST -u USER -p DATABASE < voice2order_data.sql
```

### Oder: Neuer Import

```bash
# Führen Sie die Import-Scripts aus:
npx tsx scripts/import-platzl-orders.ts
npx tsx scripts/generate-weekly-suggestions.ts
```

## Kosten

- **Render.com Free Tier**: 
  - 750 Stunden/Monat kostenlos
  - App schläft nach 15 Min Inaktivität
  - Kaltstarts ~30 Sekunden

- **PlanetScale Free Tier**:
  - 5 GB Storage
  - 1 Milliarde Row Reads/Monat
  - Ausreichend für kleine bis mittlere Nutzung

## Upgrade-Optionen

### Render.com Paid ($7/Monat)
- Keine Schlafzeit
- Schnellere Instanzen
- Eigene Domain

### PlanetScale Paid ($29/Monat)
- 10 GB Storage
- Automatische Backups
- Branching für Entwicklung

## Troubleshooting

### App startet nicht
- Prüfen Sie die Logs in Render.com Dashboard
- Stellen Sie sicher, dass alle Environment Variables gesetzt sind
- Prüfen Sie DATABASE_URL Verbindung

### Datenbank-Verbindung fehlgeschlagen
- Prüfen Sie PlanetScale Connection String
- Stellen Sie sicher, dass SSL aktiviert ist
- Whitelist Render.com IP-Adressen (nicht nötig bei PlanetScale)

### OAuth funktioniert nicht
- Prüfen Sie OAUTH_SERVER_URL und VITE_OAUTH_PORTAL_URL
- Stellen Sie sicher, dass die Manus App ID korrekt ist
- Redirect URL in Manus App Settings: `https://voice2order.onrender.com/api/oauth/callback`

## Support

Bei Fragen oder Problemen:
- GitHub Issues: https://github.com/IHR_USERNAME/voice2order/issues
- Manus Support: https://help.manus.im

## Lizenz

Proprietär - Alle Rechte vorbehalten

