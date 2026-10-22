# Shopper — Frontend Portfolio


Live version : https://ramtinbabaei.github.io/shopper-react-store/



Standalone responsive clothing storefront built with React 19, TypeScript, Vite, Tailwind CSS, React Router and TanStack Query.

## Run on Windows / VS Code

Install Node.js 22.12+ (or Node.js 24), extract this ZIP and open the `shopper-frontend` folder. In its terminal:

```powershell
npm ci
npm run dev
```

Open http://localhost:4173 and keep the terminal open. No MongoDB, Docker, API keys, cloud account, `.env` or backend server is required. The first npm installation needs internet; product images are bundled locally.

```powershell
npm test
npm run typecheck
npm run build
npm run preview
```

Deploy `dist` to a static host. Hash routing allows refreshes and deep links without server rewrite rules. Relative asset paths and Vite base `./` support both a root domain and a GitHub Pages repository subpath.

## Features

- Responsive home page and women / men / kids collections
- 36 bundled products, search, sorting, filters and pagination
- Product detail, size and quantity selection, stock limits
- Persistent browser cart and favorites
- Validated demonstration checkout, WELCOME10 coupon, local order history and cancellation
- Demo profile, contact and newsletter UI, informational pages
- Lazy route loading and optimized WebP images

## Frontend only

`src/api.ts` is an in-browser data adapter, not an HTTP API. It does not call a server. `src/catalog.ts` contains sample products; `src/shared.ts` contains types, validation and pricing helpers. Browser localStorage keeps the demo cart, favorites and fictional orders. Clear browser site data to reset the demo.

There is no actual authentication, admin panel, email delivery, payment processing, delivery or shared inventory. The demo profile is fixed, and orders are editable browser data, not secure business records. Use fictional checkout information. Contact/newsletter forms validate and show a demo confirmation without storing or sending submissions.

## Portfolio description

“Built a responsive e-commerce frontend using React, TypeScript and Tailwind CSS, with product discovery, persistent shopping cart, favorites, form validation and a simulated checkout workflow.”

Credit the GreatStack reference and media. The supplied code is a starting point for study and customization; describe your own contributions accurately. See THIRD_PARTY_NOTICES.md for image provenance and license limits.

## Verification

Four automated workflow tests cover catalog filtering/pagination, persistent cart and stock limits, favorites, and checkout/discount/idempotency/cancellation. Production TypeScript and Vite build checks are available through the scripts above.
