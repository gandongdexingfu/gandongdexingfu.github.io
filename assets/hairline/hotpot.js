/**
 * Hotpot: the film's loop as one table. The freezer stands at the back; the
 * big round pot fills the middle with its cast in the red soup (the tallow
 * block, the chillies, the splash, the tripe on its chopsticks, the duck-blood
 * cubes); chopsticks lie across the rim as the diving board; the oil dish waits
 * at the right, a dashed arc showing the leap into it; and the steam curls back
 * to the freezer, where the film begins again. The beef roll is the bright dot:
 * at rest in the freezer, it travels the stations in film order to the one
 * under the pointer, which rises and lights. "大合照" lights the whole cast.
 *
 * Picking tests each station's rest outline, small ones first (rule 01).
 * Painted back to front: freezer, pot, what is in it, its front lip, the dish (rule 06).
 */
const {
  Cam, circ, clamp, facing, fit, lerp, open, poly, prism, proj, rings, ringAt, run, hull, seg,
  tween, tset, tval, tdone, flatDot, mk, place, pointer, put, register, disposer, solid,
} = HL;

const NAMES = ["冷凍庫", "牛油泡溫泉", "紅湯派對", "筷子跳水板", "撲通", "七上八下", "鴨血豆腐", "油碟跳水隊", "飛撲油碟", "大合照", "回到冷凍庫"];
const R = 42, H = 20, SOUP = 16, LIFT = 8, PI = Math.PI;
const DISH = [58, -36], DR = 10;
/** A round ring centred at (cx, cy). */
const ring = (cx, cy, r, n = 64) => circ(r, n).map((q) => ({ ...q, u: q.u + cx, v: q.v + cy }));
/** A chilli lying on the soup: a thin crescent at (cx, cy), turned by a. */
const chilli = (cx, cy, a) => {
  const pts = [];
  for (let k = 0; k <= 8; k++) { const t = k / 8; pts.push([-7 + 14 * t, 2.2 * Math.sin(PI * t) + 1.4 * (1 - t)]); }
  for (let k = 8; k >= 0; k--) { const t = k / 8; pts.push([-7 + 14 * t, 2.2 * Math.sin(PI * t) * 0.2 - 1.2 * (1 - t)]); }
  const c = Math.cos(a), s = Math.sin(a);
  return pts.map(([u, v]) => [cx + u * c - v * s, cy + u * s + v * c]);
};
/** The leap from the pot to the dish, as world points. */
const LEAP = Array.from({ length: 24 }, (_, k) => {
  const t = k / 23;
  return [lerp(26, DISH[0], t), lerp(8, DISH[1], t), lerp(22, 7, t) + 26 * Math.sin(PI * t)];
});
/** The steam that curls back to the freezer, as world points. */
const STEAM = Array.from({ length: 40 }, (_, k) => {
  const t = k / 39, w = 4 * Math.sin(t * 6 * PI) * (1 - t * 0.5);
  return [lerp(-6, -60, t) + w, lerp(-6, -60, t) - w, 24 + 20 * Math.sin(PI * t) + 6 * t];
});
const flake = (P, x, y, z, r) => [0, 1, 2].map((k) => {
  const a = (k * PI) / 3, du = Math.cos(a) * r, dz = Math.sin(a) * r;
  return seg(P(x - du * 0.7, y + du * 0.7, z - dz), P(x + du * 0.7, y - du * 0.7, z + dz));
}).join("");

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let step = value, act = -1;
  const C = Cam(45, 0.5, 1.62);
  fit(C, [[-82, -82, -4], [74, 50, -4], [74, -82, -4], [-82, 50, -4], [-62, -62, 46], [24, -12, 58]], 200, 160);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const [tr, ti] = rings(-82, -82, 74, 50, 10, 2);
  put(solid(g), prism(P, front, tr, ti, -4, 0));

  const S = []; // stations, by film order
  const add = (i, o) => { S[i] = { ...o, z: tween(0), drawn: NaN }; };

  // 01 freezer, at the back corner
  {
    const grp = mk("g", {}, g), [fr, fi] = rings(-74, -74, -52, -52, 3, 1.2), el = solid(grp);
    const seam = mk("path", { class: "nf lo" }, grp), snow = mk("path", { class: "nf" }, grp);
    add(0, { light: [el.sil, snow], at: [-63, -63, 22], draw(l) {
      put(el, prism(P, front, fr, fi, l, 20 + l));
      seam.setAttribute("d", open(ringAt(P, run(fr, front), 16 + l)));
      snow.setAttribute("d", flake(P, -63, -63, 25 + l, 3.4));
    }, hit: () => ringAt(P, fr, 0).concat(ringAt(P, fr, 28)) });
  }
  // the pot: body, rim and soup; its station is "大合照"
  const pr = ring(0, 0, R), pi = ring(0, 0, R - 2.4), pot = solid(g);
  put(pot, prism(P, front, pr, pi, 0, H));
  mk("path", { class: "nf lo", d: poly(ringAt(P, ring(0, 0, R - 4), SOUP)) }, g);
  const ax = 0.7071;
  [-1, 1].forEach((sd) => {
    const cx = sd * (R + 1) * ax, cy = -sd * (R + 1) * ax, a0 = Math.atan2(cy, cx);
    const loop = (z) => open(Array.from({ length: 9 }, (_, k) => { const t = a0 - PI / 2 + (PI * k) / 8; return P(cx + 6 * Math.cos(t), cy + 6 * Math.sin(t), z); }));
    mk("path", { class: "nf sil", d: loop(H - 3) }, g);
  });
  const inside = mk("g", {}, g);

  // 02 the tallow block at the back left, leaning on the rim
  {
    const grp = mk("g", {}, inside), [br, bi] = rings(-30, -22, -14, -6, 2.4, 1), el = solid(grp), dots = mk("path", { class: "nf lo" }, grp);
    add(1, { light: [el.sil], at: [-22, -14, 26], draw(l) {
      put(el, prism(P, front, br, bi, 12 + l, 25 + l));
      dots.setAttribute("d", [[-25, -17], [-19, -11], [-22, -18]].map(([x, y]) => seg(P(x - 1, y + 1, 25 + l), P(x + 1, y - 1, 25 + l))).join(""));
    }, hit: () => ringAt(P, br, 12).concat(ringAt(P, br, 28)) });
  }
  // 03 chillies floating at the left
  {
    const grp = mk("g", {}, inside), CH = [chilli(-26, 12, 0.6), chilli(-14, 24, -0.4), chilli(-32, -2, 1.3)];
    const paths = CH.map(() => mk("path", {}, grp));
    add(2, { light: paths, at: [-24, 12, SOUP + 1], draw(l) {
      CH.forEach((c, k) => paths[k].setAttribute("d", poly(c.map(([x, y]) => P(x, y, SOUP + 0.5 + l)))));
    }, hit: () => CH.flat().map(([x, y]) => P(x, y, SOUP)) });
  }
  // 05 the splash in the middle
  {
    const grp = mk("g", {}, inside), a = mk("path", { class: "nf" }, grp), b = mk("path", { class: "nf dash" }, grp), d = mk("path", { class: "nf" }, grp);
    add(4, { light: [a, d], at: [4, 4, SOUP + 1], draw(l) {
      const z = SOUP + 0.5;
      a.setAttribute("d", poly(ringAt(P, ring(4, 4, 5, 24), z)));
      b.setAttribute("d", poly(ringAt(P, ring(4, 4, 10, 32), z)));
      d.setAttribute("d", [0, 1, 2, 3, 4].map((k) => {
        const t = (k / 5) * 2 * PI + 0.4, x = 4 + Math.cos(t) * 7, y = 4 + Math.sin(t) * 7;
        return seg(P(x, y, z + 2 + l * 0.6), P(x * 1.06, y * 1.06, z + 5 + l * 1.4));
      }).join(""));
    }, hit: () => ringAt(P, ring(4, 4, 12, 16), SOUP).concat([P(4, 4, SOUP + 12)]) });
  }
  // 07 duck-blood cubes at the front right
  {
    const grp = mk("g", {}, inside);
    const CUBES = [[16, 14], [24, 4], [10, 24]].map(([x, y]) => [x, y, ...rings(x - 4, y - 4, x + 4, y + 4, 1.2, 0.6)]);
    CUBES.sort((p, q) => p[0] + p[1] - (q[0] + q[1]));
    const els = CUBES.map(() => solid(grp));
    add(6, { light: els.map((e) => e.sil), at: [16, 14, 23], draw(l) {
      CUBES.forEach(([, , r, n], k) => put(els[k], prism(P, front, r, n, 13 + l, 21 + l)));
    }, hit: () => CUBES.flatMap(([, , r]) => ringAt(P, r, 13).concat(ringAt(P, r, 24))) });
  }
  // 06 the tripe, dipped on a pair of chopsticks: up seven, down eight
  {
    const grp = mk("g", {}, inside), sticks = mk("path", { class: "nf sil" }, grp), sheet = mk("path", {}, grp), fur = mk("path", { class: "nf lo" }, grp);
    const X = 26, Y = -12;
    add(5, { light: [sheet, sticks], at: [X, Y, 30], draw(l) {
      sticks.setAttribute("d", seg(P(X - 1.5, Y + 1.5, 31 + l), P(X - 4, Y + 4, 58)) + seg(P(X + 1.5, Y - 1.5, 31 + l), P(X + 3, Y - 3, 58)));
      const top = 31 + l, bot = 21 + l;
      const edge = Array.from({ length: 9 }, (_, k) => { const t = k / 8; return [X - 6 + 12 * t, Y + 6 - 12 * t, bot + 1.6 * Math.sin(t * 4 * PI)]; });
      sheet.setAttribute("d", poly([P(X - 6, Y + 6, top), ...edge.map((p) => P(...p)), P(X + 6, Y - 6, top)]));
      fur.setAttribute("d", [0.2, 0.4, 0.6, 0.8].map((t) => seg(P(X - 6 + 12 * t, Y + 6 - 12 * t, top - 1.5), P(X - 6 + 12 * t, Y + 6 - 12 * t, bot + 3))).join(""));
    }, hit: () => [P(X - 7, Y + 7, 20), P(X + 7, Y - 7, 20), P(X - 7, Y + 7, 34), P(X + 7, Y - 7, 34), P(X, Y, 58)] });
  }
  // the front lip of the pot, over what floats near it
  mk("path", { class: "sil nf", d: open(ringAt(P, run(pr, front), H)) }, g);
  // 04 chopsticks across the back of the rim: the diving board
  {
    const grp = mk("g", {}, g), A = [[-20, -39], [36, -24]], N = [0.26, 0.97];
    const sticks = [0, 3.4].map(() => mk("path", {}, grp));
    add(3, { light: sticks, at: [8, -30, H + 2], draw(l) {
      [0, 3.4].forEach((o, k) => {
        const a = [A[0][0] + N[0] * o, A[0][1] + N[1] * o], b = [A[1][0] + N[0] * o, A[1][1] + N[1] * o], w = 0.8;
        sticks[k].setAttribute("d", poly([P(a[0] - N[0] * w, a[1] - N[1] * w, H + 1 + l), P(b[0], b[1], H + 1 + l), P(a[0] + N[0] * w, a[1] + N[1] * w, H + 1 + l)]));
      });
    }, hit: () => [P(-22, -42, H), P(38, -27, H), P(36, -18, H), P(-20, -33, H), P(8, -30, H + 8)] });
  }
  // 08 the oil dish, with garlic bits
  {
    const grp = mk("g", {}, g), dr = ring(DISH[0], DISH[1], DR, 48), di = ring(DISH[0], DISH[1], DR - 1.6, 48), el = solid(grp);
    const oil = mk("path", { class: "nf lo" }, grp), bits = mk("path", { class: "nf" }, grp);
    add(7, { light: [el.sil, bits], at: [DISH[0], DISH[1], 6], draw(l) {
      put(el, prism(P, front, dr, di, l, 5 + l));
      oil.setAttribute("d", poly(ringAt(P, ring(DISH[0], DISH[1], DR - 3, 32), 4 + l)));
      bits.setAttribute("d", [[-3, 2], [2, -3], [4, 3], [-1, -1]].map(([u, v]) => poly(ringAt(P, ring(DISH[0] + u, DISH[1] + v, 1, 6), 4.5 + l))).join(""));
    }, hit: () => ringAt(P, dr, 0).concat(ringAt(P, dr, 10)) });
  }
  // 09 the leap into the dish
  {
    const a = mk("path", { class: "nf dash" }, g);
    add(8, { light: [a], at: LEAP[12], draw(l) {
      a.setAttribute("d", open(LEAP.map(([x, y, z], k) => P(x, y, z + l * Math.sin((PI * k) / 23)))));
    }, hit: () => LEAP.slice(4, 20).flatMap(([x, y, z]) => { const [sx, sy] = P(x, y, z); return [[sx - 5, sy - 5], [sx + 5, sy + 5], [sx + 5, sy - 5], [sx - 5, sy + 5]]; }) });
  }
  // 10 the group photo: the pot and its whole cast
  add(9, { light: [pot.sil], at: [30, 30, H], draw() {}, hit: () => ringAt(P, pr, 0).concat(ringAt(P, pr, H)) });
  // 11 the steam that goes back to being frost
  {
    const a = mk("path", { class: "nf dash" }, g), f = mk("path", { class: "nf lo" }, g);
    add(10, { light: [a, f], at: STEAM[36], draw(l) {
      a.setAttribute("d", open(STEAM.map(([x, y, z], k) => P(x, y, z + l * (k / 39)))));
      const [x, y, z] = STEAM[39];
      f.setAttribute("d", flake(P, x + 6, y - 6, z + 6 + l, 3));
    }, hit: () => STEAM.slice(14).flatMap(([x, y, z]) => { const [sx, sy] = P(x, y, z); return [[sx - 6, sy - 6], [sx + 6, sy + 6], [sx + 6, sy - 6], [sx - 6, sy + 6]]; }) });
  }

  // the beef roll: a bright dot that travels the stations in film order
  const dot = flatDot(g, C, 2.4, "dot"), s = tween(0);
  const dotAt = (x, now) => {
    const a = clamp(Math.floor(x), 0, S.length - 1), b = Math.min(a + 1, S.length - 1), f = x - a;
    const pa = S[a].at, pb = S[b].at, la = tval(S[a].z, now), lb = tval(S[b].z, now);
    return P(lerp(pa[0], pb[0], f), lerp(pa[1], pb[1], f), lerp(pa[2] + la, pb[2] + lb, f) + 8 * Math.sin(PI * f));
  };

  const B = register(stage, (_dt, now) => {
    let m = !tdone(s, now);
    S.forEach((T) => { const l = tval(T.z, now); if (l !== T.drawn) { T.drawn = l; T.draw(l); } if (!tdone(T.z, now)) m = true; });
    place(dot, dotAt(tval(s, now), now));
    return m;
  });
  bag.add(B.unregister);

  const area = S.map((T) => hull(T.hit()));
  const inPoly = (pt, pg) => {
    let c = false;
    for (let i = 0, j = pg.length - 1; i < pg.length; j = i++) {
      const [xi, yi] = pg[i], [xj, yj] = pg[j];
      if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const ORDER = [4, 1, 2, 6, 5, 3, 7, 8, 10, 0, 9]; // small first, the pot last
  const pick = (p) => { for (const k of ORDER) if (inPoly(p, area[k])) return k; return -1; };
  const CAST = [1, 2, 4, 5, 6];

  function setAct(a) {
    if (a === act) return;
    const now = performance.now();
    act = a;
    S.forEach((T, i) => {
      const on = a === i || (a === 9 && CAST.includes(i));
      tset(T.z, on && i !== 9 ? (a === 9 ? LIFT * 0.5 : LIFT) : 0, now, a === 9 ? CAST.indexOf(i) * step : 0);
      T.light.forEach((el) => el.classList.toggle("hi", on));
    });
    tset(s, a < 0 ? 0 : a, now, 0);
    read.textContent = a < 0 ? "rest" : `${String(a + 1).padStart(2, "0")} · ${NAMES[a]}`;
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => setAct(pick(p)), leave: () => setAct(-1) }));
  bag.add(() => svg.replaceChildren());
  return { set: (v) => { step = clamp(v, 0, 120); }, destroy: bag.dispose };
}

hairline({
  name: "hotpot",
  means: "A hotpot table as the film's loop: freezer, pot and its cast, chopsticks, oil dish, steam back to the freezer. The beef roll travels to the station under the pointer, which rises and lights.",
  rules: [1, 2, 4, 5],
  range: [20, 40, 70],
  tour: [[130, 70], [190, 170], [320, 170], null],
  mount,
});
