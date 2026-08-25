# Octane × TanStack Table v9

A performance showcase for [`@octanejs/tanstack-table`](https://www.npmjs.com/package/@octanejs/tanstack-table), authored in [Beast](https://www.npmjs.com/package/beast-tsrx) and rendered by [Octane](https://octanejs.dev/).

The three panel tabs demonstrate:

- filtering, multi-column sorting, pagination, and row selection across 50,000 rows;
- nested grouping, expansion, and live aggregation across the same dataset;
- a 12,000-row updating stream with sorting, column visibility, and resizing.

All records are deterministically seeded with Faker.js.

```bash
bun install
bun run dev
```

Run `bun run check` to compile the BTSX components, type-check their generated
TSRX, and create a production build.
