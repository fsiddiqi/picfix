# PicFix PWA

Offline-first PWA for scanning physical photos into digital albums.

## Dev

```sh
npm install
npm run dev          # HTTPS dev server on local network
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server (HTTPS via mkcert) |
| `npm test` | Run vitest |
| `npm run build` | TypeScript check + production build |
| `npm run lint` | oxlint |
| `npx tsc --noEmit` | TypeScript check only |

## Stack

- React 19, TypeScript, Vite 8
- Dexie.js (IndexedDB)
- Canvas 2D (image processing)
- Vitest + jsdom (testing)

## Notes

- HTTPS is required for `getUserMedia` on non-localhost — uses `@vitejs/plugin-basic-ssl` with mkcert certs
- No server uploads in client-only mode; optional FastAPI backend for advanced processing
