# Nupoo 
- v2.0.3

Nupoo je lehký local-first **blokový workspace** postavený na Next.js, Reactu, TypeScriptu, Tailwind CSS, Tiptapu, dnd-kit a Zustandu. Cíl je rychlé psaní bez serveru, s robustními daty, přehledným designem a zero friction.

## Aktuální funkce

- Rich text: tučné, kurzíva, podtržení, přeškrtnutí, highlight, inline code a odkazy
- H1/H2/H3, odrážky, číslování, checklist, citace, oddělovače
- tabulky s možností resize buněk
- code blocks se syntax highlightingem a tab indentací
- Markdown-like shortcuts (`# `, `## `, `### `, `- `, `1. `, `[ ] `, `> `, ``` ``` ```)
- slash menu `/` pro rychlý výběr typu bloku
- drag & drop řazení bloků s jemnou motion animací
- block toolbar zarovnaný na skutečnou textovou řádku
- selection toolbar přichycený ke skutečnému výběru textu
- kontextové menu bloku: duplikovat, mazat, změnit typ
- stránky a vnořené podstránky ve stromu
- favorites, recent pages a breadcrumbs
- fulltextové hledání + Command Palette
- Undo / Redo
- koš a obnova
- Focus Mode
- automatické ukládání s debounce a indikátorem stavu
- JSON export / import celého workspace
- bezpečná migrace starších `nupoo.pages.v1/v2/v3` dat
- světlý / tmavý režim
- responzivní desktop + mobile UI
- statický export kompatibilní s GitHub Pages

## Architektura

```text
app/
  layout.tsx
  page.tsx
  globals.css
  shadcn-theme.css      # hlavní tema s neumorphism
  neumorphism.css       # fallback a doplňující styly

components/
  Workspace.tsx
  Editor.tsx
  CommandPalette.tsx
  TrashDialog.tsx
  PageTree.tsx
  Sidebar.tsx

lib/
  storage.ts              # typy, migrace a persistence
  data-service.ts         # datová abstrakce
  editor-extensions.ts    # centrální Tiptap konfigurace
  markdown-shortcuts.ts   # vlastní Markdown shortcuts
  export.ts               # workspace export/import
  store.ts                # Zustand state
  indexeddb.ts            # IndexedDB adapter
  storage.test.ts         # unit testy datového modelu
```

### Datový model

```ts
type Page = {
  id: string
  title: string
  icon?: string
  favorite?: boolean
  parentId?: string | null
  blocks: Block[]
  createdAt?: string
  updatedAt: string
  lastOpenedAt?: string
  trashedAt?: string | null
}

type Block = {
  id: string
  type:
    | 'paragraph'
    | 'heading'
    | 'bulletList'
    | 'orderedList'
    | 'taskList'
    | 'blockquote'
    | 'codeBlock'
    | 'horizontalRule'
    | 'table'
  level?: 1 | 2 | 3
  text: string
  content?: JSONContent
}
```

`content` obsahuje skutečný Tiptap JSON dokument. `text` zůstává jako jednoduchý textový fallback pro search, migrace a kompatibilitu starších dat.

## Lokální vývoj

```bash
npm install
npm run dev
```

Aplikace poběží na `http://localhost:3000`.

### Kontrola před commitem

```bash
npm run type-check
npm run lint
npm run test
npm run format:check
npm run build
```

## Deployment

GitHub Pages používá `.github/workflows/pages.yml` a Next.js static export. V GitHub Actions se automaticky použije `basePath=/nupoo`.

Pro lokální produkční kontrolu:

```bash
npm run preview
```

## Data a zálohy

Workspace je local-first a ukládá dokumenty do browser persistence. Data se automaticky ukládají po krátkém debounce intervalu.

Před větším refaktorem lze použít:

```text
Exportovat → nupoo-YYYY-MM-DD.json
```

Import workspace nahrazuje aktuální data importovaným snapshotem.

## Vývoj nového typu bloku

1. Přidat typ do `BlockType` v `lib/storage.ts`.
2. Přidat fallback strukturu do `blockContent()`.
3. Přidat položku do `BLOCK_TYPES` v `components/Editor.tsx`.
4. Přidat odpovídající Tiptap extension do `lib/editor-extensions.ts`.
5. Přidat test do `lib/storage.test.ts`.

## Roadmap

### Core

- IndexedDB adapter (in progress)
- granular page/content persistence
- recovery snapshoty
- page history

### Editor

- image/file blocks
- richer link UI
- equation/LaTeX block
- improved table controls
- backlinks a page mentions

### UX

- animovaný page transition
- drag & drop stromu stránek
- reorder stabilizovaný přes persistent sort index
- customizable typography a page appearance

### Platform

- Markdown / HTML export
- offline service worker
- backend adapter
- multi-device sync
- collaboration

## Licence

Nupoo je distribuován pod licencí MIT. Viz `LICENSE`.
