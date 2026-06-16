# Universe

React/Vite anniversary experience rendered as a starfield of memories.

## Data

- Runtime data is loaded from `data.json`.
- Source data lives at the repository root in `data/memories.json`.
- `npm run prepare:data` copies the source data into `public/data.json` before dev or build.

## Scripts

- `npm run dev`: sync data, then start Vite dev server
- `npm run build`: sync data, type-check, then build production assets
- `npm run lint`: run ESLint

## Publish path

GitHub Pages publishes the built app under `/universe/`.
