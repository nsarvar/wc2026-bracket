(function () {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const XLINK = "http://www.w3.org/1999/xlink";

  const CFG = window.WORLD_CUP || { teams: [], winners: [] };
  const teams = CFG.teams || [];

  // ---- live results (optional) -----------------------------------------
  // If CFG.resultsProxy is set, fetch live winners from the Cloudflare Worker
  // proxy and render those; otherwise fall back to the static CFG.winners.
  const norm = (s) =>
    (s || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  const ALIASES = {
    ivorycoast: "Côte d'Ivoire",
    cotedivoire: "Côte d'Ivoire",
    congodr: "DR Congo",
    drcongo: "DR Congo",
    democraticrepublicofcongo: "DR Congo",
    usa: "United States",
    unitedstatesofamerica: "United States",
    caboverde: "Cape Verde",
    capeverdeislands: "Cape Verde",
    bosniaandherzegovina: "Bosnia & Herzegovina",
  };

  function mapResults(results) {
    const byNorm = new Map();
    for (const t of teams) byNorm.set(norm(t.name), t.name);
    for (const [k, v] of Object.entries(ALIASES))
      if (!byNorm.has(k)) byNorm.set(k, v);
    const overrides = CFG.scoreOverrides || {};
    const seen = {}; // count wins per team, to index per-round overrides
    const out = [];
    for (const r of results || []) {
      const name = byNorm.get(norm(r.winner));
      if (!name) continue;
      let score = r.score || null;
      const ov = overrides[name];
      if (ov != null) {
        score = Array.isArray(ov) ? ov[seen[name] || 0] ?? score : ov;
      }
      seen[name] = (seen[name] || 0) + 1;
      out.push({ name, score });
    }
    return out;
  }

  async function resolveWinners() {
    const url = CFG.resultsProxy;
    if (!url) return CFG.winners || [];
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("proxy " + res.status);
      const data = await res.json();
      const mapped = mapResults(data.results);
      return mapped.length ? mapped : CFG.winners || [];
    } catch (e) {
      console.warn("Live results unavailable, using static data:", e.message);
      return CFG.winners || [];
    }
  }

  // ---- geometry ---------------------------------------------------------
  const SIZE = 1000;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const RADII = [420, 330, 250, 180, 110, 0]; // outer ring -> trophy
  const LEAF_R = 30; // flag radius at the outer ring
  const NODE_R = 24; // flag radius for an advanced team at an inner junction

  const polar = (deg, r) => {
    const a = (deg * Math.PI) / 180;
    return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
  };
  const el = (name, attrs) => {
    const node = document.createElementNS(SVG_NS, name);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  };

  // ---- render (called once winners are resolved) -----------------------
  function render(winnersList) {
    // Winners can be listed once per round a team wins. The NUMBER of entries
    // for a team = how many rounds it advanced; each entry's score is that
    // round's result.
    const winCount = {};
    const scoreList = {};
    for (const w of winnersList || []) {
      const name = typeof w === "string" ? w : w && w.name;
      if (!name) continue;
      const score = typeof w === "object" && w.score ? w.score : null;
      winCount[name] = (winCount[name] || 0) + 1;
      (scoreList[name] = scoreList[name] || []).push(score);
    }
    const roundsWon = (name) => winCount[name] || 0;

  // ---- validate & build the tree ---------------------------------------
  const n = teams.length;
  if (n < 2 || (n & (n - 1)) !== 0) {
    document.getElementById("chart").outerHTML =
      '<p style="color:#f88;text-align:center">data.js must contain a power-of-two number of teams (2, 4, 8, 16, 32...). Found ' +
      n +
      ".</p>";
    return;
  }

  const step = 360 / n;
  // Where the bracket tree starts in the circular team order. The final's spine
  // sits just BEFORE this leaf, so with the WC 2026 field the split lands
  // between Germany and Brazil at the top — matching the reference. This makes
  // the groupings nest correctly: (Sweden,France) is a Round-of-16 sibling of
  // (Paraguay,Germany), and the Brazil/Norway winner meets the Mexico/England
  // winner in the quarterfinal. Positions stay monotonic (no modulo) so parent
  // angles average cleanly across the seam; polar() wraps at render time.
  const TREE_START = 2 % n;
  let level = [];
  for (let k = 0; k < n; k++) {
    const pos = TREE_START + k;
    level.push({
      angle: -90 + pos * step,
      r: RADII[0],
      level: 0,
      team: teams[pos % n],
    });
  }
  const levels = [level];
  let li = 1;
  while (level.length > 1) {
    const parents = [];
    for (let i = 0; i < level.length; i += 2) {
      const a = level[i];
      const b = level[i + 1];
      parents.push({
        angle: (a.angle + b.angle) / 2,
        r: RADII[Math.min(li, RADII.length - 1)],
        level: li,
        children: [a, b],
      });
    }
    levels.push(parents);
    level = parents;
    li++;
  }

  // ---- resolve who advanced --------------------------------------------
  // A round-L match is won by the child whose surviving team has won >= L
  // rounds. The loser is marked eliminated (dimmed at its position).
  levels[0].forEach((leaf) => (leaf.emerged = leaf.team));
  for (let L = 1; L < levels.length; L++) {
    for (const node of levels[L]) {
      const winners = node.children.filter(
        (c) => c.emerged && roundsWon(c.emerged.name) >= L
      );
      if (winners.length === 1) {
        const w = winners[0];
        node.emerged = w.emerged;
        node.decided = true;
        node.winnerChild = w;
        node.loserChild = node.children.find((c) => c !== w);
        node.loserChild.eliminated = true;
        node.score = (scoreList[w.emerged.name] || [])[L - 1] || null;
      } else {
        node.emerged = null;
      }
    }
  }

  // ---- render -----------------------------------------------------------
  const svg = document.getElementById("chart");
  // crop the empty ring around the outermost flags so the bracket fills more
  const M = RADII[0] + LEAF_R + 8; // half-extent: reach of the outer flag ring
  const vb = CX - M;
  svg.setAttribute("viewBox", `${vb} ${vb} ${M * 2} ${M * 2}`);

  const defs = el("defs", {});
  const grad = el("radialGradient", { id: "glow" });
  grad.appendChild(el("stop", { offset: "0%", "stop-color": "rgba(244,193,75,0.55)" }));
  grad.appendChild(el("stop", { offset: "100%", "stop-color": "rgba(244,193,75,0)" }));
  defs.appendChild(grad);
  svg.appendChild(defs);

  const gLinks = el("g", {});
  const gNodes = el("g", {});
  const gFlags = el("g", {});
  const gScores = el("g", {});
  svg.append(gLinks, gNodes, gFlags, gScores);

  // connectors + junction dots
  for (let L = 1; L < levels.length; L++) {
    for (const parent of levels[L]) {
      const pPt = polar(parent.angle, parent.r);
      for (const child of parent.children) {
        const cPt = polar(child.angle, child.r);
        const kneePt = polar(child.angle, parent.r);
        const lit = parent.decided && child === parent.winnerChild;

        gLinks.appendChild(
          el("path", {
            class: "link" + (lit ? " win" : ""),
            d: `M ${cPt.x} ${cPt.y} L ${kneePt.x} ${kneePt.y}`,
          })
        );
        const sweep = parent.angle > child.angle ? 1 : 0;
        gLinks.appendChild(
          el("path", {
            class: "link" + (lit ? " win" : ""),
            d:
              parent.r === 0
                ? `M ${kneePt.x} ${kneePt.y} L ${pPt.x} ${pPt.y}`
                : `M ${kneePt.x} ${kneePt.y} A ${parent.r} ${parent.r} 0 0 ${sweep} ${pPt.x} ${pPt.y}`,
          })
        );
      }
      if (parent.r > 0) {
        gNodes.appendChild(
          el("circle", {
            class: "junction" + (parent.decided ? " win" : ""),
            cx: pPt.x,
            cy: pPt.y,
            r: 4,
          })
        );
      }
    }
  }

  // flag drawing helper (used for outer teams AND advanced teams inward)
  let clipId = 0;
  function drawFlag(node, r, opts) {
    opts = opts || {};
    const p = polar(node.angle, node.r);
    const g = el("g", {
      class:
        "flag-node" +
        (opts.dim ? " dim" : "") +
        (opts.advanced ? " adv" : ""),
    });

    const id = "clip" + clipId++;
    const clip = el("clipPath", { id });
    clip.appendChild(el("circle", { cx: p.x, cy: p.y, r }));
    g.appendChild(clip);

    g.appendChild(el("circle", { class: "flag-ring", cx: p.x, cy: p.y, r: r + 2 }));

    const img = el("image", {
      class: "flag-img",
      x: p.x - r * 1.35,
      y: p.y - r,
      width: r * 2.7,
      height: r * 2,
      "clip-path": `url(#${id})`,
      preserveAspectRatio: "xMidYMid slice",
    });
    const url = `https://flagcdn.com/w160/${node.emerged.code}.png`;
    img.setAttributeNS(XLINK, "xlink:href", url);
    img.setAttribute("href", url);
    g.appendChild(img);

    const title = el("title", {});
    title.textContent = node.emerged.name;
    g.appendChild(title);

    const lbl = polar(node.angle, node.r + r + 14);
    const text = el("text", { class: "flag-label", x: lbl.x, y: lbl.y });
    text.textContent = node.emerged.name;
    g.appendChild(text);

    gFlags.appendChild(g);
  }

  // outer ring (every team) — winners keep a bright/white ring, losers dim
  levels[0].forEach((leaf) => {
    drawFlag(leaf, LEAF_R, {
      dim: leaf.eliminated,
      advanced: roundsWon(leaf.team.name) > 0,
    });
  });

  // advanced teams shown again at each inner junction they reached
  for (let L = 1; L < levels.length; L++) {
    for (const node of levels[L]) {
      if (!node.decided || node.r === 0) continue;
      drawFlag(node, NODE_R, { dim: node.eliminated, advanced: true });
      if (node.score) {
        // scores are stored winner-first; if the winner is the second (later,
        // clockwise) team of the pair, flip the digits so the score reads in
        // matchup order as the two flags sit around the circle
        const flip = node.winnerChild === node.children[1];
        const scoreText = flip
          ? node.score.replace(/(\d+)\s*-\s*(\d+)/g, "$2-$1")
          : node.score;
        const sp = polar(node.angle, node.r + NODE_R + 16);
        // orient the score along the ring (tangent to the circle), flipping
        // whenever it would otherwise read upside down
        let rot = (((node.angle + 90) % 360) + 360) % 360;
        if (rot > 90 && rot < 270) rot += 180;
        const t = el("text", {
          class: "score",
          x: sp.x,
          y: sp.y,
          transform: `rotate(${rot} ${sp.x} ${sp.y})`,
        });
        t.textContent = scoreText;
        gScores.appendChild(t);
      }
    }
  }

  // trophy + glow in the centre
  gNodes.insertBefore(
    el("circle", { cx: CX, cy: CY, r: 70, fill: "url(#glow)" }),
    gNodes.firstChild
  );
  const trophy = el("text", { class: "trophy", x: CX, y: CY });
  trophy.textContent = "🏆";
  gScores.appendChild(trophy);

  const h = document.getElementById("title");
  if (h && CFG.title) h.textContent = CFG.title;
  } // end render()

  // ---- bootstrap --------------------------------------------------------
  // Render immediately with static data so the bracket paints instantly, then
  // (if a proxy is configured) refresh with live results when they arrive.
  render(CFG.winners || []);
  if (CFG.resultsProxy) {
    resolveWinners().then((winners) => {
      const svg = document.getElementById("chart");
      if (svg) svg.replaceChildren(); // clear the initial paint
      render(winners);
    });
  }
})();
