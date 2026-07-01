/*
 * World Cup 2026 — Knockout bracket data
 * ---------------------------------------
 * Edit this file, then reload index.html. No build step required.
 *
 * `teams` is the Round-of-32 in bracket order, walking CLOCKWISE around the
 * circle starting from the top. Adjacent pairs (0&1, 2&3, ...) are the first
 * matchups. Change the order / codes / names and the chart rebuilds itself.
 *
 *   name : label shown on hover
 *   code : ISO country code used for the round flag (flagcdn.com).
 *          Use "gb-eng" for England, "gb-sct" for Scotland, "gb-wls" for Wales.
 */
window.WORLD_CUP = {
  title: "FIFA World Cup 2026 — Knockout Stage",

  /*
   * OPTIONAL live results. Paste your Cloudflare Worker proxy URL here and the
   * chart will fetch live winners on load (falling back to the static `winners`
   * below if the proxy is unreachable). Leave "" to use only the static data.
   * See worker/ and the README for how to deploy the proxy.
   */
  resultsProxy: "https://wc2026-results.sarvar-nishonboyev.workers.dev/",

  /*
   * Escape hatch to correct a score the live feed reports wrong. Keyed by the
   * WINNER's name, winner-first score (e.g. "Morocco": "1-1 (3-2)"); use an
   * array ["r1", "r2"] if the team wins multiple rounds. Usually empty — the
   * proxy handles regulation + shootout scores correctly.
   */
  scoreOverrides: {},

  teams: [
    { name: "Paraguay",             code: "py" },
    { name: "Germany",              code: "de" },
    { name: "Brazil",               code: "br" },
    { name: "Japan",                code: "jp" },
    { name: "Côte d'Ivoire",        code: "ci" },
    { name: "Norway",               code: "no" },
    { name: "Mexico",               code: "mx" },
    { name: "Ecuador",              code: "ec" },
    { name: "England",              code: "gb-eng" },
    { name: "DR Congo",             code: "cd" },
    { name: "Argentina",            code: "ar" },
    { name: "Cape Verde",           code: "cv" },
    { name: "Australia",            code: "au" },
    { name: "Egypt",                code: "eg" },
    { name: "Switzerland",          code: "ch" },
    { name: "Algeria",              code: "dz" },
    { name: "Colombia",             code: "co" },
    { name: "Ghana",                code: "gh" },
    { name: "Senegal",              code: "sn" },
    { name: "Belgium",              code: "be" },
    { name: "Bosnia & Herzegovina", code: "ba" },
    { name: "United States",        code: "us" },
    { name: "Austria",              code: "at" },
    { name: "Spain",                code: "es" },
    { name: "Croatia",              code: "hr" },
    { name: "Portugal",             code: "pt" },
    { name: "Morocco",              code: "ma" },
    { name: "Netherlands",          code: "nl" },
    { name: "Canada",               code: "ca" },
    { name: "South Africa",         code: "za" },
    { name: "Sweden",               code: "se" },
    { name: "France",               code: "fr" }
  ],

  /*
   * Match results. Each entry is a team that WON a match, with that match's
   * score. The winner's flag advances inward to the next junction and its path
   * lights up (white); the loser's flag goes dark.
   *
   * IMPORTANT: list a team once PER ROUND it wins, in round order. The number
   * of entries = how many rounds it advanced.
   *   { name: "Canada", score: "1-0" }        // won Round of 32
   *   { name: "Canada", score: "2-1" }        // ...then won Round of 16, etc.
   *
   * SCORE ORDER: write the WINNER's goals first ("3-0", penalties "1-1 (4-2)").
   * The chart automatically re-orients each score to the matchup as it reads
   * around the circle, so you don't have to think about left/right.
   * A plain string ("Canada") also works if you don't want a score shown.
   *
   * The block between AUTO:START / AUTO:END is rewritten by
   * scripts/update-results.mjs (the GitHub Action). Hand-editing is fine too.
   */
  winners: [
    /* AUTO:START */
    { name: "Paraguay", score: "1-1 (4-2)" }, // beat Germany
    { name: "Brazil",   score: "2-1" },       // beat Japan
    { name: "Norway",   score: "2-1" },       // beat Côte d'Ivoire
    { name: "Mexico",   score: "2-0" },       // beat Ecuador
    { name: "Canada",   score: "1-0" },       // beat South Africa
    { name: "France",   score: "3-0" },       // beat Sweden
    { name: "Morocco",  score: "1-1 (3-2)" }, // beat Netherlands
    /* AUTO:END */
  ]
};
