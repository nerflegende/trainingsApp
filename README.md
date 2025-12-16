# TrainingsApp

Eine selbst-hostbare Web-App zum Tracken von Krafttraining und Calisthenics.

## Features

- 🏋️ **Training Tracking**: Übungen, Sätze, Wiederholungen und Gewichte tracken
- 📋 **Trainingspläne**: Eigene Pläne erstellen und speichern
- 📅 **Kalender**: Trainingshistorie im Monatsüberblick
- 🔥 **Streak System**: Motivation durch Wochenstreaks
- ⏱️ **Timer**: Pausentimer und Stoppuhr während des Trainings
- 📊 **Körpermaße**: Gewicht und Größe tracken
- 🌙 **Dark/Light Mode**: Wählbares App-Design
- 👤 **Account System**: Daten auf allen Geräten synchronisieren
- 🏠 **Self-Hosted**: Komplett auf deinem eigenen Server lauffähig

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4
- **Backend**: Node.js, Express, SQLite
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Deployment**: Docker

## Self-Hosting mit Docker (empfohlen)

### Schnellstart

1. Repository klonen:
\`\`\`bash
git clone https://github.com/nerflegende/trainingsApp.git
cd trainingsApp
\`\`\`

2. Docker Container starten:
\`\`\`bash
docker-compose up -d
\`\`\`

Die App ist jetzt unter \`http://localhost:3001\` erreichbar.

### Konfiguration

Erstelle eine \`.env\` Datei für benutzerdefinierte Einstellungen:

\`\`\`env
# Sicherer JWT Secret Key (unbedingt ändern!)
JWT_SECRET=dein-super-sicherer-geheimer-schluessel

# CORS Origin (für Reverse Proxy)
CORS_ORIGIN=https://training.deine-domain.de

# Port (Standard: 3001)
PORT=3001
\`\`\`

### Mit Reverse Proxy (Nginx/Traefik)

Beispiel für Nginx:

\`\`\`nginx
server {
    listen 80;
    server_name training.deine-domain.de;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

### Daten-Backup

Die SQLite Datenbank wird in einem Docker Volume gespeichert. Für Backups:

\`\`\`bash
# Backup erstellen
docker cp trainingsapp:/app/data/trainingsapp.db ./backup.db

# Backup wiederherstellen
docker cp ./backup.db trainingsapp:/app/data/trainingsapp.db
\`\`\`

## Manuelle Installation

### Voraussetzungen

- Node.js 20+
- npm oder yarn

### Frontend + Backend

1. Dependencies installieren:
\`\`\`bash
# Frontend
npm install

# Backend
cd server && npm install
\`\`\`

2. Frontend bauen:
\`\`\`bash
npm run build
\`\`\`

3. Server starten:
\`\`\`bash
cd server
npm run build
npm start
\`\`\`

Die App ist unter \`http://localhost:3001\` erreichbar.

### Entwicklung

Terminal 1 - Backend:
\`\`\`bash
cd server && npm run dev
\`\`\`

Terminal 2 - Frontend:
\`\`\`bash
npm run dev
\`\`\`

Frontend: \`http://localhost:5173\`
Backend: \`http://localhost:3001\`

## API Endpunkte

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| POST | /api/auth/register | Registrierung |
| POST | /api/auth/login | Anmeldung |
| GET | /api/auth/me | Aktueller Benutzer |
| PATCH | /api/auth/me | Benutzer aktualisieren |
| GET | /api/plans | Alle Pläne |
| POST | /api/plans | Plan erstellen |
| DELETE | /api/plans/:id | Plan löschen |
| GET | /api/workouts | Workout-Historie |
| POST | /api/workouts | Workout speichern |
| GET | /api/measurements | Körpermaße |
| POST | /api/measurements | Messung hinzufügen |

## Proxmox Deployment

Für Proxmox-User empfehlen wir:

1. **LXC Container** mit Docker installieren
2. Repository klonen und \`docker-compose up -d\` ausführen
3. Reverse Proxy (Nginx Proxy Manager oder Traefik) für HTTPS einrichten

## License

MIT
