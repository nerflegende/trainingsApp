# TrainingsApp

Eine moderne Web-App zum Tracken von Krafttraining und Calisthenics.

## Features

- 🏋️ **Training Tracking**: Übungen, Sätze, Wiederholungen und Gewichte tracken
- 📋 **Trainingspläne**: Eigene Pläne erstellen und speichern
- 📅 **Kalender**: Trainingshistorie im Monatsüberblick
- 🔥 **Streak System**: Motivation durch Wochenstreaks
- ⏱️ **Timer**: Pausentimer und Stoppuhr während des Trainings
- 📊 **Körpermaße**: Gewicht und Größe tracken
- 🌙 **Dark/Light Mode**: Wählbares App-Design
- 👤 **Account System**: Daten auf allen Geräten synchronisieren

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4
- **Build Tool**: Vite
- **Backend**: Firebase (Authentication + Firestore)
- **Icons**: Lucide React

## Installation

1. Repository klonen:
\`\`\`bash
git clone https://github.com/nerflegende/trainingsApp.git
cd trainingsApp
\`\`\`

2. Dependencies installieren:
\`\`\`bash
npm install
\`\`\`

3. Firebase-Projekt einrichten:
   - Neues Projekt auf [Firebase Console](https://console.firebase.google.com) erstellen
   - Authentication aktivieren (Email/Password)
   - Firestore Database erstellen
   - \`.env.example\` zu \`.env\` kopieren und Firebase-Credentials eintragen

4. Entwicklungsserver starten:
\`\`\`bash
npm run dev
\`\`\`

## Environment Variables

Kopiere \`.env.example\` zu \`.env\` und fülle die Firebase-Credentials aus:

\`\`\`env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
\`\`\`

## Scripts

- \`npm run dev\` - Entwicklungsserver starten
- \`npm run build\` - Produktionsbuild erstellen
- \`npm run preview\` - Produktionsbuild lokal testen
- \`npm run lint\` - Code-Linting

## License

MIT
