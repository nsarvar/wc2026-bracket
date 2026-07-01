# World Cup 2026 — Knockout Bracket

An interactive, circular knockout bracket for the FIFA World Cup 2026. Teams sit
around the ring and converge on the trophy in the middle. As results come in,
the winner's flag marches inward round by round with a highlighted path and the
score, while eliminated teams dim out.

**Live demo:** https://nsarvar.github.io/wc2026-bracket/

## Features

- **Radial bracket** rendered as pure SVG — 32 teams down to the trophy.
- **Data-driven** — edit one file ([`data.js`](data.js)) and reload. No build step,
  no dependencies, no framework.
- **Winners advance** inward with a white path and the match score printed along
  the ring; **losers stay in color but darken**.
- **Scales to any power of two** (16, 32, 64…) — the tree rebuilds itself.
- Round flags via [flagcdn.com](https://flagcdn.com); hover a flag for the team name.

## Run locally

It's a static site — just open the file:

```bash
open index.html          # macOS
# or serve it, e.g.
python3 -m http.server    # then visit http://localhost:8000
```

(Flags load from flagcdn.com over HTTPS, so an internet connection is needed the
first time.)

## Editing the data

Everything lives in [`data.js`](data.js).

### Teams

`teams` is the Round-of-32 in bracket order, walking **clockwise from the top**.
Adjacent pairs (`0&1`, `2&3`, …) are the first-round matchups.

```js
teams: [
  { name: "Germany", code: "de" },     // name shows on hover
  { name: "Brazil",  code: "br" },     // code = ISO flag code (flagcdn)
  // ...
]
```

Use `gb-eng` for England, `gb-sct` for Scotland, `gb-wls` for Wales.

### Results

`winners` records who won each match. **List a team once per round it wins**, in
round order — the number of entries equals how many rounds it advanced.

```js
winners: [
  { name: "Canada", score: "1-0" },   // won Round of 32
  { name: "Canada", score: "2-1" },   // ...then won Round of 16
]
```

**Score order:** write the **winner's** goals first (`"3-0"`, penalties
`"1-1 (4-2)"`). The chart automatically flips it to read in matchup order around
the circle, so you don't have to think about left/right. A plain string
(`"Canada"`) also works if you don't want a score shown.

## Live results (optional)

Instead of editing results by hand, the chart can fetch live winners on load
from a small **Cloudflare Worker** that proxies [football-data.org](https://www.football-data.org).
The API key stays server-side; the site stays static on GitHub Pages; results
are cached at the edge (~3 min). If the proxy is unreachable, the chart falls
back to the static `winners` in `data.js`.

**Setup (one time):**

1. Get a free API token at
   <https://www.football-data.org/client/register>.
2. Deploy the Worker:
   ```bash
   cd worker
   npx wrangler deploy
   npx wrangler secret put FD_TOKEN   # paste your token
   ```
   Wrangler prints a URL like `https://wc2026-results.<you>.workers.dev`.
3. Put that URL in [`data.js`](data.js) → `resultsProxy: "https://…workers.dev"`,
   commit, and push.

How it maps: the Worker returns finished knockout matches (winner + score); the
page matches each winner name to a bracket team. If the API spells a country
differently, add it to the `ALIASES` map in [`bracket.js`](bracket.js) (unmatched
winners are logged to the browser console).

The proxy code lives in [`worker/`](worker/).

## Deploy to GitHub Pages

The site is served from the repo root, so no build is required:

1. **Settings → Pages → Build and deployment**
2. **Source:** Deploy from a branch
3. **Branch:** `main`, folder `/ (root)` → **Save**

Live at `https://<user>.github.io/<repo>/` after ~1 minute. (The repo must be
public for free Pages.)

## Project structure

```
index.html          markup + footer
styles.css          theme, flags, dimming, layout
data.js             teams + results + proxy URL  ← edit this
bracket.js          SVG renderer (geometry, advancement, live-results fetch)
worker/index.js     Cloudflare Worker proxy (hides API key, caches, CORS)
worker/wrangler.toml Worker config
```

## Credits

Made by **Sarvar** with help of AI · 2026 · Uzbekistan 🇺🇿

[Twitter](https://x.com/nsarvar) ·
[LinkedIn](https://www.linkedin.com/in/sarvar-nishonboyev-5937b635/) ·
[GitHub](https://github.com/nsarvar/wc2026-bracket)
