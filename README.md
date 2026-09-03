# NeoNEI-Web

Ultra-fast, modern Minecraft NEI recipe explorer web platform powered by the next-generation **NativeSurface** rendering engine.

---

## Key Capabilities

* **NativeSurface Canvas Engine**: Pure pixel batched rendering via Canvas / OffscreenCanvas with zero heavy DOM layout thrashing, achieving 60 FPS smooth paging and zooming.
* **Absolute Slot Positioning Contract**: Every slot strictly follows physical `(x, y, w, h)` coordinates, supporting item, fluid, and catalyst roles directly.
* **Global 20Hz Animation Timeline**: Unified clock broadcast across all dynamic fluids and animated textures with $O(1)$ CPU overhead.
* **Safe Atlas Paging (≤4096px)**: Hardware-safe texture atlas pagination preventing mobile and low-end GPU driver crashes.
* **Dark Industrial Design System**: High-contrast, deep slate industrial aesthetic (`#0D1117`, `#161B22`, `#12151A`) with tactile Minecraft-style bevels.
* **Ultra-Lean Read/Write Decoupled Backend**: 100% immutable static cache delivery for recipe packs, plus dedicated AE2 pattern encoding service in under 150 lines of code.

---

## Project Structure

```
web/
├── frontend/             # Vite 6 + Vue 3 + TypeScript NativeSurface Frontend
│   ├── src/
│   │   ├── components/   # NativeSurface.vue & RecipeTooltip.vue
│   │   ├── surface/      # Renderer, spatial hit testing, atlas, and timeline
│   │   └── types.ts      # Strict recipe & slot interfaces
│   └── package.json
│
├── backend/              # Node.js + Express Static Proxy & AE2 Pattern Service
│   ├── src/
│   │   ├── patterns/     # Pattern encoder & decoder
│   │   └── server.ts     # Lean HTTP server (<150 LOC)
│   └── package.json
│
└── package.json          # Root orchestration scripts
```

---

## Quick Start

```bash
# 1. Install dependencies
npm --prefix backend install
npm --prefix frontend install

# 2. Run tests
npm test

# 3. Start development servers
npm run dev:frontend    # http://127.0.0.1:5173
npm run dev:backend     # http://127.0.0.1:3000
```

---

## License

MIT
