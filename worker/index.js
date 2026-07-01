/*
 * Cloudflare Worker — World Cup results proxy.
 *
 * Fetches finished knockout matches from football-data.org (API key hidden as
 * a Worker secret), caches the response at the edge for a few minutes, and
 * returns clean JSON the bracket page can consume. Adds permissive CORS so the
 * GitHub Pages site can call it.
 *
 * Deploy:
 *   cd worker
 *   npx wrangler deploy
 *   npx wrangler secret put FD_TOKEN     # paste your football-data.org token
 *
 * Then put the printed https://<name>.<subdomain>.workers.dev URL into
 * data.js -> resultsProxy.
 */

const KNOCKOUT = new Set([
  "LAST_32",
  "ROUND_OF_32",
  "LAST_16",
  "ROUND_OF_16",
  "QUARTER_FINALS",
  "QUARTER_FINAL",
  "SEMI_FINALS",
  "SEMI_FINAL",
  "THIRD_PLACE",
  "FINAL",
]);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS, ...extra },
  });
}

function transform(matches) {
  return (matches || [])
    .filter(
      (m) =>
        m.status === "FINISHED" &&
        (KNOCKOUT.has(m.stage) || !m.stage) &&
        m.score &&
        (m.score.winner === "HOME_TEAM" || m.score.winner === "AWAY_TEAM")
    )
    .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
    .map((m) => {
      const homeWon = m.score.winner === "HOME_TEAM";
      const ft = m.score.fullTime || {};
      const pen = m.score.penalties || {};
      const hasPen = pen.home != null && pen.away != null;
      // fullTime includes the shootout for penalty matches, so subtract it to
      // get the score at the end of play (regulation + extra time)
      const baseH = hasPen ? (ft.home ?? 0) - pen.home : ft.home ?? 0;
      const baseA = hasPen ? (ft.away ?? 0) - pen.away : ft.away ?? 0;
      const wg = homeWon ? baseH : baseA;
      const lg = homeWon ? baseA : baseH;
      let score = `${wg}-${lg}`;
      if (hasPen) {
        const pw = homeWon ? pen.home : pen.away;
        const pl = homeWon ? pen.away : pen.home;
        score += ` (${pw}-${pl})`;
      }
      return {
        winner: (homeWon ? m.homeTeam : m.awayTeam)?.name,
        loser: (homeWon ? m.awayTeam : m.homeTeam)?.name,
        stage: m.stage,
        utcDate: m.utcDate,
        score,
      };
    });
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers: CORS });
    if (request.method !== "GET")
      return json({ error: "method not allowed" }, 405);

    if (!env.FD_TOKEN)
      return json({ error: "FD_TOKEN secret not set" }, 500);

    const cache = caches.default;
    const cacheKey = new Request(new URL(request.url).origin + "/wc-results");
    let cached = await cache.match(cacheKey);
    if (cached) return cached;

    const comp = env.FD_COMPETITION || "WC";
    let upstream;
    try {
      upstream = await fetch(
        `https://api.football-data.org/v4/competitions/${comp}/matches`,
        { headers: { "X-Auth-Token": env.FD_TOKEN } }
      );
    } catch (e) {
      return json({ error: "upstream fetch failed", detail: e.message }, 502);
    }
    if (!upstream.ok)
      return json({ error: `upstream ${upstream.status}` }, 502);

    const data = await upstream.json();
    const resp = json(
      { updated: new Date().toISOString(), results: transform(data.matches) },
      200,
      { "Cache-Control": "public, max-age=180" }
    );
    ctx.waitUntil(cache.put(cacheKey, resp.clone()));
    return resp;
  },
};
