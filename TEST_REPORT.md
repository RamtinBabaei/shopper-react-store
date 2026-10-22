# Verification

- Fresh standalone `npm ci --ignore-scripts`: passed (122 packages); no backend workspace dependencies.
- TypeScript checking and production Vite build: passed.
- Four automated workflow tests: passed. Catalog search/filter/pagination, cart persistence/quantity limits, favorite toggle, demo checkout/discount/idempotency/cancellation.
- Source data adapter uses browser storage only and contains no fetch calls.
- Browser visual/end-to-end inspection could not be completed in this environment: Chromium was unavailable and its download failed. Automated tests do not substitute for visual browser review.

Manual review: run `npm run dev`; check desktop and mobile layout, browse all collections, search and sort, choose a product size, toggle a favorite twice, add to bag, change quantity, reload to check persistence, complete checkout with fictional details, inspect and cancel the demo order. Verify no `/api` requests in browser DevTools. Contact/newsletter must show a demonstration notice and send no email.
