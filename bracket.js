(function () {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const XLINK = "http://www.w3.org/1999/xlink";

  const CFG = window.WORLD_CUP || { teams: [], winners: [] };
  const teams = CFG.teams || [];
  const winnerSet = new Set(CFG.winners || []);

  // ---- geometry ---------------------------------------------------------
  const SIZE = 1000;
  const CX = SIZE / 2;
  const CY = SIZE / 2;

  // radius per level, from the outer flag ring inward to the trophy (0)
  const RADII = [420, 330, 250, 180, 110, 0];
  const FLAG_R = 30; // flag circle radius

  function polar(angleDeg, r) {
    const a = (angleDeg * Math.PI) / 180;
    return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
  }

  function el(name, attrs) {
    const node = document.createElementNS(SVG_NS, name);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  // ---- build the tree ---------------------------------------------------
  const n = teams.length;
  if (n < 2 || (n & (n - 1)) !== 0) {
    document.getElementById("chart").outerHTML =
      '<p style="color:#f88;text-align:center">data.js must contain a power-of-two number of teams (2, 4, 8, 16, 32...). Found ' +
      n +
      ".</p>";
    return;
  }

  const step = 360 / n;
  const startAngle = -90; // top of the circle

  // leaves
  let level = teams.map((t, i) => ({
    angle: startAngle + i * step,
    r: RADII[0],
    team: t,
    win: winnerSet.has(t.name),
  }));
  const levels = [level];

  // merge upward until a single center node remains
  let li = 1;
  while (level.length > 1) {
    const parents = [];
    for (let i = 0; i < level.length; i += 2) {
      const a = level[i];
      const b = level[i + 1];
      parents.push({
        angle: (a.angle + b.angle) / 2,
        r: RADII[Math.min(li, RADII.length - 1)],
        children: [a, b],
        // parent "wins" downstream only if exactly one child advanced
        win: a.win !== b.win,
      });
      // propagate the surviving winner so the highlighted path continues
      parents[parents.length - 1].winFlag = a.win || b.win;
    }
    levels.push(parents);
    level = parents;
    li++;
  }

  // ---- render -----------------------------------------------------------
  const svg = document.getElementById("chart");
  svg.setAttribute("viewBox", `0 0 ${SIZE} ${SIZE}`);

  const gLinks = el("g", {});
  const gNodes = el("g", {});
  const gFlags = el("g", {});
  svg.append(gLinks, gNodes, gFlags);

  // connectors: for every parent, link each child in with an "elbow"
  // (radial segment out to the child's angle, then a tangential arc to meet
  //  its sibling at the parent point).
  for (let L = 1; L < levels.length; L++) {
    for (const parent of levels[L]) {
      const pPt = polar(parent.angle, parent.r);
      for (const child of parent.children) {
        const cPt = polar(child.angle, child.r);
        const kneePt = polar(child.angle, parent.r); // drop to parent radius
        const lit = child.win && parent.winFlag;

        // radial part
        gLinks.appendChild(
          el("path", {
            class: "link" + (lit ? " win" : ""),
            d: `M ${cPt.x} ${cPt.y} L ${kneePt.x} ${kneePt.y}`,
          })
        );
        // tangential part (arc along the parent radius toward the parent angle)
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
      // junction dot
      if (parent.r > 0) {
        gNodes.appendChild(
          el("circle", {
            class: "junction" + (parent.win ? " win" : ""),
            cx: pPt.x,
            cy: pPt.y,
            r: 4,
          })
        );
      }
    }
  }

  // flags on the outer ring
  levels[0].forEach((leaf, i) => {
    const p = polar(leaf.angle, leaf.r);
    const clipId = "clip" + i;

    const g = el("g", { class: "flag-node" });

    const clip = el("clipPath", { id: clipId });
    clip.appendChild(el("circle", { cx: p.x, cy: p.y, r: FLAG_R }));
    g.appendChild(clip);

    g.appendChild(
      el("circle", { class: "flag-ring", cx: p.x, cy: p.y, r: FLAG_R + 2 })
    );

    const img = el("image", {
      class: "flag-img",
      x: p.x - FLAG_R * 1.35,
      y: p.y - FLAG_R,
      width: FLAG_R * 2.7,
      height: FLAG_R * 2,
      "clip-path": `url(#${clipId})`,
      preserveAspectRatio: "xMidYMid slice",
    });
    const url = `https://flagcdn.com/w160/${leaf.team.code}.png`;
    img.setAttributeNS(XLINK, "xlink:href", url);
    img.setAttribute("href", url);
    g.appendChild(img);

    // native tooltip + a label that appears on hover, pushed outward
    const title = el("title", {});
    title.textContent = leaf.team.name;
    g.appendChild(title);

    const lbl = polar(leaf.angle, leaf.r + FLAG_R + 16);
    const text = el("text", {
      class: "flag-label",
      x: lbl.x,
      y: lbl.y,
    });
    text.textContent = leaf.team.name;
    g.appendChild(text);

    gFlags.appendChild(g);
  });

  // trophy in the middle, with a warm glow
  const glow = el("circle", { cx: CX, cy: CY, r: 70, fill: "url(#glow)" });
  const defs = el("defs", {});
  const grad = el("radialGradient", { id: "glow" });
  grad.appendChild(el("stop", { offset: "0%", "stop-color": "rgba(244,193,75,0.55)" }));
  grad.appendChild(el("stop", { offset: "100%", "stop-color": "rgba(244,193,75,0)" }));
  defs.appendChild(grad);
  svg.appendChild(defs);
  gNodes.appendChild(glow);

  const trophy = el("text", { class: "trophy", x: CX, y: CY });
  trophy.textContent = "🏆";
  gFlags.appendChild(trophy);

  // set the header
  const h = document.getElementById("title");
  if (h && CFG.title) h.textContent = CFG.title;
})();
