## Build Log

timestamp ⸬ Tue Sep 01, 2026 22:00:11 pm - +08:00

---

```zsh

$ vite build
vite v8.2.2 building client environment for production...
✓ 806 modules transformed.
computing gzip size...
dist/index.html                           0.93 kB │ gzip:   0.57 kB
dist/assets/favicon-CvYjqyJY.ico         15.08 kB
dist/assets/index-DvdJuaCp.css           90.03 kB │ gzip:  17.16 kB
dist/assets/Metric-BoLRuiHI.js            2.28 kB │ gzip:   1.12 kB
dist/assets/AnalyticsTable-D0W_HIE9.js   15.77 kB │ gzip:   5.66 kB
dist/assets/StreamTable-jNbWYQKE.js      19.28 kB │ gzip:   6.56 kB
dist/assets/table-config-DX1eh-C4.js     89.66 kB │ gzip:  24.22 kB
dist/assets/ExplorerTable-BZ8GRX1q.js   424.58 kB │ gzip: 143.87 kB
dist/assets/en_US-DVpxQcDr.js           429.11 kB │ gzip: 159.42 kB
dist/assets/index-BGSZ4HQw.js           459.05 kB │ gzip: 151.37 kB

✓ built in 8.53s
[PLUGIN_TIMINGS] Your build spent 98% of 8.5s inside plugin hooks (8.4s).
Measured inside the callback, so queue time is excluded and time the callback itself awaited is not:
  - @tailwindcss/vite:generate:build transform (62%, 5.3s, 1 call)
Those rows are 62% of the build; the rest of the 98% is below.
Not measurable — 1 hook whose calls overlap, so elapsed time covers work other calls were doing. Profile with `node --cpu-prof`:
  - octane transform (806 calls)
See https://rolldown.rs/reference/InputOptions.checks#plugintimings for more details.
```

## Deps

```json
{
  "dependencies": {
    "@dnd-kit/abstract": "0.5.0",
    "@dnd-kit/collision": "0.5.0",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/dom": "0.5.0",
    "@dnd-kit/modifiers": "^9.0.0",
    "@faker-js/faker": "^10.6.0",
    "@octanejs/base-ui": "^0.1.48",
    "@octanejs/cmdk": "^0.1.33",
    "@octanejs/dnd-kit": "^0.1.45",
    "@octanejs/gsap": "^0.0.19",
    "@octanejs/motion": "^0.1.49",
    "@octanejs/nuqs": "^0.1.39",
    "@octanejs/radix": "^0.1.49",
    "@octanejs/tanstack-table": "^0.1.47",
    "@tanstack/match-sorter-utils": "^9.1.2",
    "beast-tsrx": "0.2.9",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "gsap": "^3.15.0",
    "octane": "^0.1.50",
    "tailwind-merge": "^3.6.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.8",
    "@tsrx/typescript-plugin": "0.3.128",
    "@types/node": "^26.4.0",
    "tailwindcss": "^4.1.8",
    "typescript": "^5.9.3",
    "vite": "^8.0.16"
  }
}
```
