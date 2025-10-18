# FastFood – AI agent guide

Purpose: minimal context so AI agents can work productively in this repo. Prefer concrete edits over generic advice.

## Architecture
- Monorepo with two apps:
  - `fe/` React 18 + Vite 5 (client-only). Routing is manual via React Router in `fe/src/App.jsx`. Pages live under `fe/app/**` (Next.js-like folders but not file-routed).
  - `be/` Node/Express + Sequelize (MySQL). Models under `be/src/models/**` with relations in `be/src/models/init-models.js`. Server bootstrap `be/src/index.js` is currently empty.

## Front-end (fe/)
- Alias: `@` resolves to `fe/` root (see `vite.config.js`). Example: `@/components/header`.
- Routing: add routes in `fe/src/App.jsx` and implement components under `fe/app/.../page.jsx`. Dynamic params use `:id`, `:orderId` etc.
- UI: Tailwind + Radix primitives + shadcn styles in `fe/components/ui/**`; utility `cn` in `fe/lib/utils.js`.
- Toasts: import `useToast` from `fe/hooks/use-toast.js` and render `<Toaster />` from `fe/components/ui/toaster.jsx`. Current `TOAST_LIMIT = 1` and long removal delay.
- Tailwind: configured in `fe/tailwind.config.js` (dark mode `class`). Note some migrated class typos exist (e.g., `flex:col`, `md:pb:0`); prefer standard Tailwind hyphen classes when editing.
- Mixed JS/TSX: some UI files are `.tsx` (compiled by Vite without type-checking). Default to `.jsx` unless adding TS config.

## Back-end (be/)
- Sequelize setup: config in `be/src/config/config.json` (dev DB `food` on 127.0.0.1). Models auto-loaded in `be/src/models/index.js`; relations wired in `be/src/models/init-models.js`.
- Model names: lower-case plural exports (e.g., `users`, `products`, `orders`). Use: `const db = require('../models'); const { users } = db;`.
- Key relations: users↔carts/orders; carts→cart_items→cart_item_addons; products↔categories/skus/product_tags; orders→order_items→order_item_addons; skus link items.
- `be/src/controllers/auth.controllers.js` looks Mongoose-based (not aligned with Sequelize models). If using, refactor to Sequelize before wiring routes.
 - SQL schema note: `fastfood-DB.txt` defines a richer schema (roles, restaurants, menu_items, payments, drones, deliveries, locations) under DB `fastfood_poc`, which diverges from the current Sequelize config (`database: "food"`) and model set (e.g., `products/skus` vs `menu_items`). If you intend to adopt that schema, update `be/src/config/config.json` and regenerate models; otherwise keep using the existing models/relations.

## Dev workflows
- Front-end: in `fe/` run `npm run dev` (Vite, port 3000), `npm run build`, `npm run preview`.
- Back-end: in `be/` run `npm run dev` (nodemon). You must implement `be/src/index.js` (Express app, JSON body, cookie-parser, routes) to expose APIs. No API calls are wired in the FE yet.

## Patterns to follow
- New page/route: create `fe/app/.../page.jsx` and add `<Route path="..." element={<Page/>} />` in `fe/src/App.jsx`.
- API client: create `fe/lib/api.js` (base URL + helpers), use React Router hooks (`useNavigate`, `useParams`) and toasts for UX.
- DB usage (server): `await users.findOne({ where: { phone } })`, include associations defined in `init-models.js` when needed.

## Gotchas
- No file-based routing; everything goes through `fe/src/App.jsx`.
- Respect `@` alias (fe root) in imports.
- Avoid Mongoose patterns on the server; align with Sequelize (`users`, etc.).

If planned API contracts/env vars are defined elsewhere, share them and I’ll update these notes.
