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
    { name: "France",               code: "fr" },
    { name: "Paraguay",             code: "py" }
  ],

  /*
   * OPTIONAL: highlight a team's run through the bracket (like the white
   * "Canada" path in the reference image). List team names that have advanced.
   * A connector lights up only when exactly one of its two feeders is a winner.
   */
  winners: [
    // "Canada"
  ]
};
