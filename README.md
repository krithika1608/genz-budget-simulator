# Thirty: ₹10,000 for 30 days

A personal-finance simulator for Gen Z. You get a ₹10,000 budget and 30 days. Every
decision (a purchase, a subscription, a goal deposit, a surprise bill) visibly changes
your **balance, daily allowance, month-end forecast, savings goals, financial risk and
financial health**. Test any decision in the **What-if** tab before you commit to it.

## Stack

| Layer | Choice |
|-------|--------|
| UI | **React 18** (function components + hooks) |
| Build | **Vite 5** + `@vitejs/plugin-react` |
| Styling | **Tailwind CSS 3** utilities for layout, plus CSS variables for 3 switchable palettes (light and dark) |
| State | React `useState` / `useMemo`, with pure reducer-style functions in `src/lib/model.js` |
| Charts | Hand-written SVG (no chart library) |
| Persistence | `localStorage` (progress, theme, palette) |

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the production build
```

Node 18+ is required. Deploys as a static site (Vercel, Netlify, GitHub Pages: build
command `npm run build`, output directory `dist`).

## Project structure

```
src/
  main.jsx                 entry point
  App.jsx                  app shell: state, navigation, toasts, modals
  index.css                Tailwind directives + design tokens (3 palettes x light/dark)
  lib/
    constants.js           budget, categories, surprise events, simulator presets
    format.js              money formatting, clamp, seeded RNG
    model.js               pure state transitions (spend, deposit, advance day, resolve event, apply decision)
    analytics.js           calc(): allowance, forecast, risk, health; insights; badges
  components/
    ui.jsx                 Ring, LineChart, Donut, Stat, Field, CatPicker, InsightRow
    Header.jsx             30-day timeline, day controls, palette + theme switch
    Home.jsx               dashboard
    Spend.jsx              log expenses and income, activity feed
    Simulator.jsx          What-if: before/after, runway overlay, goal impact, verdict
    Plan.jsx               bills and subscriptions
    Goals.jsx              savings goals
    Health.jsx             health score and risk breakdown
    Modals.jsx             surprise-expense and month-summary dialogs
single-file/
  ThirtyApp.jsx            the same app as one self-contained component
```

## How the pieces connect

All numbers come from one function, `calc(state)` in `src/lib/analytics.js`, so every
screen always agrees.

- **Daily allowance** = (balance − bills and renewals still due − what goals still need) ÷ days left
- **Forecast** = day-by-day projection using your average spend, scheduled dues and an expected-surprise allowance
- **Goal funding** = forecast cash allocated to goals in priority order
- **Risk (0–100)** = runway, cash buffer, burn rate vs allowance, subscription load, emergency-fund coverage
- **Health (0–100)** = savings habit, spending discipline, bills on time, subscription value, safety buffer, shock resilience

The simulator runs the *same* pure functions on a copy of your state, so the preview is
exactly what committing the decision will do.

## Single-file version

`single-file/ThirtyApp.jsx` is one React component with a default export. Add Tailwind
via CDN in your `index.html`:

```html
<script src="https://cdn.tailwindcss.com"></script>
```

then `import ThirtyApp from './ThirtyApp.jsx'` and render `<ThirtyApp />`. Theme CSS is
injected by the component itself.

## Notes

- Surprise expenses use a seeded random generator, so a run is reproducible. The 🎲
  button on Home triggers one on demand.
- Restart clears saved progress; theme and palette choices are kept.
