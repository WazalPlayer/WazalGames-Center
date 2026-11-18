# WazalGames Center

Game distribution app: web version (Firebase Hosting) and a Windows desktop build (Electron).

Live site: https://wazalgames-center.web.app

## Commands

```bash
npm install          # install dependencies
npm run dev          # web version at http://localhost:5173
npm run build        # production web build into dist/
npm run dist:exe     # Windows portable build into dist-app/WazalGamesCenter.exe
npm run electron-dev # desktop window against the dev server
```

Deploy the web version:

```bash
npm run build
firebase deploy --only hosting --project wazalgames-center
```

## Game files

`games/pc/` holds the local game executables. They are git-ignored (too large for GitHub) and are not bundled into the desktop build.

`scripts/load-local-games.js` adds game records from `games/pc/` to Firestore.

## Admin

An account with `role: "admin"` in its `users/{uid}` document sees the admin panel at `/admin`.
