# PicFix

Scan physical photos into digital albums — a fully offline PWA.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Storage:** Dexie.js (IndexedDB) — all data stays on-device
- **Processing:** Canvas 2D — no server uploads (client-side)
- **Backend** (optional): FastAPI + OpenCV for server-side photo detection and color correction
- **Testing:** Vitest + jsdom, pytest (backend)
- **Linting:** oxlint

## Quick Start

```sh
cd pwa
npm install
npm run dev        # HTTPS dev server on local network
```

```sh
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --reload --port 8000
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start HTTPS dev server |
| `npm test` | Run vitest |
| `npx tsc --noEmit` | TypeScript check |
| `npx oxlint` | Lint |
| `npx vite build` | Production build |

## Project Structure

```
picfix/
├── pwa/                   # PWA frontend
│   └── src/
│       ├── capture/       # Camera viewfinder
│       ├── albums/        # Album list, photo grid, crop
│       ├── shell/         # App shell, tabs, PWA prompts
│       ├── processing/    # Image processing utilities
│       └── storage/       # Dexie.js database layer
├── backend/               # FastAPI server (optional)
│   └── app/
│       ├── processing/    # OpenCV detection + correction
│       ├── routers/       # API endpoints
│       └── tests/         # pytest suite
└── conductor/             # Track planning & progress
```

## License

MIT
