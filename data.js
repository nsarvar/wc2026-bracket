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
   * SCORE ORDER: write the score in matchup order — the two teams as they sit
   * next to each other around the circle, the earlier one (going clockwise from
   * the top) first. So Sweden vs France where France won is "0-3". Penalties go
   * the same way, e.g. Paraguay beat Germany "1-1 (4-2)".
   * A plain string ("Canada") also works if you don't want a score shown.
   */
  winners: [
    { name: "Paraguay", score: "1-1 (4-2)" },   // over Germany
    { name: "Brazil",   score: "2-1" },         // over Japan
    { name: "Norway",   score: "1-2" },         // Côte d'Ivoire 1–2 Norway
    { name: "Mexico",   score: "2-0" },         // over Ecuador
    { name: "Canada",   score: "1-0" },         // over South Africa
    { name: "France",   score: "0-3" },         // Sweden 0–3 France
    { name: "Morocco",  score: "1-1 (3-2)" }    // over Netherlands
  ]
};
