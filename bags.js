// Every bag on the shelf: purchase data + a hand-drawn SVG of its packaging.
// Each drawing is sized in "shelf pixels" (W x H) so bags keep their real relative sizes.

const INK = "#2b211c";
const F = {
  hand: "'Patrick Hand', cursive",
  script: "'Caveat', cursive",
  brush: "'Caveat Brush', cursive",
  marker: "'Gochi Hand', cursive",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'Fredoka', system-ui, sans-serif",
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const st = (w = 2.6, c = INK) => `stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

function t(x, y, size, txt, o = {}) {
  const { f = F.sans, fill = INK, w = 400, a = "middle", ls = 0, rot = 0, style = "" } = o;
  return `<text x="${x}" y="${y}" font-family="${f}" font-size="${size}" font-weight="${w}" fill="${fill}" text-anchor="${a}" letter-spacing="${ls}"${style ? ` font-style="${style}"` : ""}${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ""}>${esc(txt)}</text>`;
}

// wavy line standing in for small print
function scrib(x, y, w, o = {}) {
  const { c = INK, op = 0.5, sw = 1.2 } = o;
  const n = Math.max(2, Math.round(w / 5));
  const step = w / n;
  let d = `M${x},${y}`;
  for (let i = 0; i < n; i++) d += ` q${(step / 2).toFixed(2)},${i % 2 ? 1.4 : -1.4} ${step.toFixed(2)},0`;
  return `<path d="${d}" fill="none" stroke="${c}" stroke-opacity="${op}" stroke-width="${sw}" stroke-linecap="round"/>`;
}

const shine = (x, y, h, op = 0.5) =>
  `<path d="M${x},${y} q-2.5,${h / 2} 0,${h}" fill="none" stroke="#fff" stroke-opacity="${op}" stroke-width="4" stroke-linecap="round"/>
   <path d="M${x + 1},${y + h + 7} l0,4" fill="none" stroke="#fff" stroke-opacity="${op}" stroke-width="4" stroke-linecap="round"/>`;

let uidN = 0;
const uid = () => "c" + (++uidN);

// ---------- package shapes ----------
// Each takes a fill and an inner(frame) function that draws the label/art on the front face.

function pouch(W, H, fill, inner, o = {}) {
  const { zip = true, notch = true, shade = 0.16 } = o;
  const x = 5, y = 5, w = W - 10, h = H - 10, r = 12;
  const d = `M${x + 3},${y} L${x + w - 3},${y} C${x + w + 2},${y + h * 0.35} ${x + w + 3},${y + h * 0.7} ${x + w},${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} L${x + r},${y + h} Q${x},${y + h} ${x},${y + h - r} C${x - 3},${y + h * 0.7} ${x - 2},${y + h * 0.35} ${x + 3},${y} Z`;
  const id = uid();
  return `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs>
  <path d="${d}" fill="${fill}"/>
  <g clip-path="url(#${id})">
    ${inner({ x, y, w, h })}
    <path d="M${x + w * 0.82},${y} C${x + w * 0.9},${y + h * 0.4} ${x + w * 0.88},${y + h * 0.8} ${x + w * 0.84},${y + h} L${x + w + 5},${y + h} L${x + w + 5},${y} Z" fill="${INK}" fill-opacity="${shade}"/>
    <path d="M${x + 10},${y + h - 16} Q${x + w / 2},${y + h - 5} ${x + w - 10},${y + h - 16}" fill="none" stroke="${INK}" stroke-opacity=".35" stroke-width="1.5"/>
  </g>
  <path d="M${x + 4},${y + 8} L${x + w - 4},${y + 8}" stroke="${INK}" stroke-opacity=".35" stroke-width="1.4"/>
  ${zip ? `<path d="M${x + 3},${y + h * 0.13} L${x + w - 3},${y + h * 0.13}" stroke="${INK}" stroke-opacity=".4" stroke-width="1.4" stroke-dasharray="3 2.5"/>` : ""}
  ${notch ? `<path d="M${x - 1},${y + 13} l4,2 l-4,2 M${x + w + 1},${y + 13} l-4,2 l4,2" fill="none" ${st(1.4)}/>` : ""}
  <path d="${d}" fill="none" ${st()}/>
  ${shine(x + 8, y + h * 0.22, h * 0.32)}`;
}

function flatBag(W, H, fill, inner, o = {}) {
  const { g = 12, crimp = true, sideFill = fill } = o;
  const x = 5, y = 5, w = W - 10 - g, h = H - 10;
  const side = `M${x + w},${y} L${x + w + g},${y + 5} L${x + w + g},${y + h - 3} L${x + w},${y + h} Z`;
  return `<path d="${side}" fill="${sideFill}" ${st()}/><path d="${side}" fill="${INK}" fill-opacity=".2"/>
  <path d="M${x + w + g / 2},${y + 6} L${x + w + g / 2},${y + h - 4}" stroke="${INK}" stroke-opacity=".3" stroke-width="1.2"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${fill}"/>
  ${inner({ x, y, w, h })}
  ${crimp ? Array.from({ length: Math.floor(w / 4) }, (_, i) => `<path d="M${x + 3 + i * 4},${y + 2} l0,7" stroke="${INK}" stroke-opacity=".28" stroke-width="1"/>`).join("") + `<path d="M${x},${y + 11} L${x + w},${y + 11}" stroke="${INK}" stroke-opacity=".4" stroke-width="1.4"/>` : ""}
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="none" ${st()}/>
  ${shine(x + 7, y + h * 0.25, h * 0.3)}`;
}

function box(W, H, fill, inner, o = {}) {
  const { d = 9 } = o;
  const x = 5, y = 5 + d, w = W - 10 - d, h = H - 10 - d;
  const top = `M${x},${y} L${x + d},${y - d} L${x + w + d},${y - d} L${x + w},${y} Z`;
  const side = `M${x + w},${y} L${x + w + d},${y - d} L${x + w + d},${y + h - d} L${x + w},${y + h} Z`;
  return `<path d="${side}" fill="${fill}" ${st()}/><path d="${side}" fill="${INK}" fill-opacity=".24"/>
  <path d="${top}" fill="${fill}" ${st()}/><path d="${top}" fill="#fff" fill-opacity=".35"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>
  ${inner({ x, y, w, h })}
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" ${st()}/>
  ${shine(x + 7, y + h * 0.2, h * 0.28, 0.4)}`;
}

// ---------- shared brand pieces ----------

function blendinBox(label, kicker, notes, name1, name2, origin) {
  return (W, H) => box(W, H, "#EEEEE6", (f) => {
    const cx = f.x + f.w / 2, lx = f.x + f.w * 0.12, lw = f.w * 0.76, ly = f.y + 26;
    return `
    <g fill="none" stroke="#9A6A3A" stroke-width="1.6">
      <path d="M${cx - 7},${f.y + 19} q-2,-9 6,-12 q2,8 -6,12z"/><path d="M${cx + 7},${f.y + 19} q2,-9 -6,-12 q-2,8 6,12z"/>
    </g>
    <path d="M${f.x + f.w - 6},${f.y + 6} q-8,8 -2,16 q6,8 -3,18" fill="none" stroke="#fff" stroke-width="2.5"/>
    <path d="M${f.x + f.w - 5},${f.y + 7} q-8,8 -2,16 q6,8 -3,18" fill="none" stroke="${INK}" stroke-opacity=".12" stroke-width="1.2"/>
    <rect x="${lx}" y="${ly}" width="${lw}" height="46" fill="${label}" ${st(1.8)}/>
    ${t(cx, ly + 7.5, 3.8, kicker, { fill: "#fff", ls: 1, w: 500 })}
    <path d="M${lx + 4},${ly + 10} L${lx + lw - 4},${ly + 10} M${lx + 4},${ly + 16} L${lx + lw - 4},${ly + 16} M${lx + 4},${ly + 34} L${lx + lw - 4},${ly + 34}" stroke="#fff" stroke-width=".8"/>
    ${t(cx, ly + 14.3, 3.2, notes, { fill: "#fff", w: 500 })}
    ${t(cx, ly + 24, 8.6, name1, { f: F.serif, fill: "#fff", w: 700 })}
    ${t(cx, ly + 31.5, 6.2, name2, { f: F.serif, fill: "#fff", w: 700 })}
    ${t(cx, ly + 40.5, 5, origin, { fill: "#fff", w: 600, ls: 1.2 })}
    ${t(cx, f.y + f.h - 12, 12, "BLENDIN", { fill: "#5A554C", w: 300, ls: 3 })}`;
  });
}

function seyBox(wedge, txtFill, name, subs, origin, o = {}) {
  // Text is drawn first so the white sweep covers it, like the real sleeve.
  const lines = Array.isArray(subs) ? subs : [subs];
  return (W, H) => box(W, H, o.boxFill || "#F2F2F2", (f) => `
    <rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" fill="${wedge}"/>
    ${t(f.x + 5, f.y + 10, 6.4, name, { f: F.serif, fill: txtFill, a: "start", w: 700 })}
    ${lines.map((l, i) => t(f.x + 5, f.y + 15 + i * 3.6, 2.4, l, { fill: txtFill, a: "start", ls: 0.35, w: 500 })).join("")}
    ${t(f.x + 5, f.y + 20 + (lines.length - 1) * 3.6, 5, origin, { f: F.serif, fill: txtFill, a: "start" })}
    <path d="M${f.x},${f.y + f.h * 0.75} A${f.w * 1.035},${f.h * 1.035} 0 0 1 ${f.x + f.w * 0.72},${f.y} L${f.x + f.w},${f.y} L${f.x + f.w},${f.y + f.h} L${f.x},${f.y + f.h} Z" fill="${o.boxFill || "#F2F2F2"}" ${st(1.8)}/>
    ${o.linen ? Array.from({ length: 14 }, (_, i) => `<circle cx="${f.x + 30 + (i * 37) % 70}" cy="${f.y + 40 + (i * 23) % 60}" r=".7" fill="${INK}" fill-opacity=".2"/>`).join("") : ""}
    ${t(f.x + f.w - 7, f.y + f.h - 9, 19, "SEY", { fill: "#111", a: "end", w: 700, ls: 4 })}`);
}

function tanatPouch() {
  return (W, H) => pouch(W, H, "#E8622F", (f) => {
    const lx = f.x + f.w * 0.17, lw = f.w * 0.66, ly = f.y + f.h * 0.26, lh = f.h * 0.58;
    const ax = lx + 5, ay = ly + 17, aw = lw - 10, ah = 24;
    const cid = uid();
    return `
    <rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" fill="#fff" ${st(1.8)}/>
    ${t(lx + 5, ly + 13, 12, "TANAT", { f: F.serif, a: "start", w: 700 })}
    ${t(lx + 47, ly + 7, 4, "®", { a: "start" })}
    <defs><clipPath id="${cid}"><rect x="${ax}" y="${ay}" width="${aw}" height="${ah}"/></clipPath></defs>
    <g clip-path="url(#${cid})">
      <rect x="${ax}" y="${ay}" width="${aw}" height="${ah}" fill="#F7DD6B"/>
      <path d="M${ax},${ay + 8} L${ax + aw},${ay - 4} L${ax + aw},${ay + ah} L${ax},${ay + ah} Z" fill="#F5C542"/>
      <path d="M${ax},${ay + 15} L${ax + aw},${ay + 4} L${ax + aw},${ay + ah} L${ax},${ay + ah} Z" fill="#F0906A"/>
      <path d="M${ax},${ay + 21} L${ax + aw},${ay + 12} L${ax + aw},${ay + ah} L${ax},${ay + ah} Z" fill="#E8733A"/>
      <path d="M${ax + aw * 0.45},${ay} L${ax + aw},${ay + 16}" stroke="#C9C9C9" stroke-width="3"/>
    </g>
    <rect x="${ax}" y="${ay}" width="${aw}" height="${ah}" fill="none" ${st(1.2)}/>
    ${t(lx + 5, ay + ah + 8, 5, "Éthiopie - Alo Bombe [ZFWA]", { a: "start", w: 500 })}
    ${t(lx + 5, ay + ah + 14, 4, "Torréfié filtre", { a: "start" })}
    ${scrib(lx + 5, ay + ah + 19, aw - 4, { op: 0.4 })}
    <rect x="${lx + 5}" y="${ly + lh - 13}" width="9" height="9" fill="${INK}"/>
    <rect x="${lx + 7}" y="${ly + lh - 11}" width="2" height="2" fill="#fff"/><rect x="${lx + 10.5}" y="${ly + lh - 8}" width="2" height="2" fill="#fff"/>
    ${scrib(lx + 18, ly + lh - 10, 12, { op: 0.35 })}${scrib(lx + 33, ly + lh - 10, 12, { op: 0.35 })}${scrib(lx + 18, ly + lh - 6, 26, { op: 0.35 })}`;
  });
}

function bigSurBag(top, base, lower, name, weight, hyunah) {
  return (W, H) => flatBag(W, H, base, (f) => {
    const lx = f.x + 4, lw = f.w - 8, ly = f.y + 12, lh = f.h * 0.7, th = lh * (hyunah ? 0.58 : 0.5);
    return `
    <rect x="${lx}" y="${ly}" width="${lw}" height="${th}" fill="${top}"/>
    ${hyunah ? `${t(lx + lw - 4, ly + th - 10, 8.5, "HYUNAH", { f: F.marker, fill: "#F3D9DE", a: "end" })}${t(lx + lw - 4, ly + th - 4, 3.4, "COFFEE CLUB", { f: F.marker, fill: "#F3D9DE", a: "end", ls: 0.5 })}`
             : `<path d="M${lx + 6},${ly + 10} q10,-4 18,2 M${lx + 12},${ly + 26} q14,4 20,-3" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="1"/>${scrib(lx + lw - 18, ly + th - 5, 14, { c: "#fff", op: 0.8, sw: 1 })}`}
    <rect x="${lx}" y="${ly + th}" width="${lw}" height="${lh - th}" fill="${lower}"/>
    ${t(lx + lw / 2, ly + th + 8, 5.4, name, { f: F.serif, w: 700 })}
    ${scrib(lx + 6, ly + th + 14, lw - 12, { op: 0.45 })}
    ${scrib(lx + 9, ly + th + 19, lw - 18, { op: 0.35 })}
    ${scrib(lx + 6, ly + th + 24, lw - 12, { op: 0.35 })}
    ${t(lx + lw / 2, ly + lh - 3, 4, weight, { w: 500 })}
    <rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" fill="none" ${st(1.6)}/>
    ${t(f.x + f.w / 2, f.y + f.h - 7, 5.6, "BIG SUR COFFEE", { w: 600, ls: 0.4 })}`;
  }, { g: 9 });
}

// Bean's Beans: kawaii notebook label on a white pouch
function beansPouch(frame, band, bandText, notes, info, bottom, fruit, fonk) {
  return (W, H) => pouch(W, H, "#1f1d1c", (f) => {
    const lx = f.x + 7, lw = f.w - 14, ly = f.y + 20, lh = f.h - 30;
    const nx = lx + 5, nw = lw - 10, ny = ly + 17, nh = lh - 34;
    let rules = "";
    for (let yy = ny + 7; yy < ny + nh - 2; yy += 6) rules += `<path d="M${nx},${yy} L${nx + nw},${yy}" stroke="#A8CDE6" stroke-width=".8"/>`;
    const fruitArt = {
      peach: `<circle cx="${nx + 14}" cy="${ny + nh - 12}" r="10" fill="#FBF59A"/>
        <circle cx="${nx + 11}" cy="${ny + nh - 11}" r="7" fill="#F5A88A" ${st(1.3)}/><path d="M${nx + 11},${ny + nh - 18} q-1,-3 1,-4" fill="none" stroke="#7A4A2E" stroke-width="1.3"/>
        <path d="M${nx + 12},${ny + nh - 18} q5,-4 7,0 q-4,2 -7,0z" fill="#7BB661" ${st(1)}/>
        <g transform="translate(${nx + 22},${ny + nh - 8})"><circle r="2" fill="#F7D64A"/>${[0, 72, 144, 216, 288].map((a) => `<ellipse rx="1.8" ry="3" cy="-4" fill="#fff" stroke="${INK}" stroke-width=".7" transform="rotate(${a})"/>`).join("")}<circle r="1.6" fill="#F7D64A"/></g>`,
      blueberry: `<circle cx="${nx + 8}" cy="${ny + nh - 14}" r="7" fill="#F98FAA"/><circle cx="${nx + 16}" cy="${ny + nh - 5}" r="6" fill="#FDFBDC" ${st(.8)}/>
        <circle cx="${nx + 15}" cy="${ny + nh - 12}" r="8.5" fill="#2F6FB0" ${st(1.3)}/><circle cx="${nx + 12}" cy="${ny + nh - 15}" r="2.4" fill="#8FD3F2" fill-opacity=".8"/>
        <path d="M${nx + 18},${ny + nh - 19} l1.5,1.5 l2,-.5 l-1,2 l1.5,1.5 l-2,0 l-1,2 l-.5,-2 l-2,-.5 l1.8,-1z" fill="#12306B"/>`,
      watermelon: `<g transform="rotate(-20 ${nx + 13} ${ny + nh - 10})"><path d="M${nx + 2},${ny + nh - 14} A12,12 0 0 0 ${nx + 26},${ny + nh - 14} Z" fill="#7CC6A0" ${st(1.3)}/>
        <path d="M${nx + 4.5},${ny + nh - 14} A9.5,9.5 0 0 0 ${nx + 23.5},${ny + nh - 14} Z" fill="#FFF7E0"/>
        <path d="M${nx + 6},${ny + nh - 14} A8,8 0 0 0 ${nx + 22},${ny + nh - 14} Z" fill="#FF7F86"/>
        <ellipse cx="${nx + 10}" cy="${ny + nh - 11}" rx=".9" ry="1.5" fill="${INK}"/><ellipse cx="${nx + 14}" cy="${ny + nh - 9}" rx=".9" ry="1.5" fill="${INK}"/><ellipse cx="${nx + 18}" cy="${ny + nh - 11}" rx=".9" ry="1.5" fill="${INK}"/></g>`,
    }[fruit];
    const paw = (px, py) => `<ellipse cx="${px}" cy="${py + 3}" rx="4.5" ry="3.6" fill="#F9BCC4" ${st(1)}/>
      ${[[-5, -2], [-2, -5], [2, -5], [5, -2]].map(([dx, dy]) => `<ellipse cx="${px + dx}" cy="${py + dy}" rx="1.6" ry="2.2" fill="#7A4A2E" transform="rotate(${dx * 6} ${px + dx} ${py + dy})"/><path d="M${px + dx},${py + dy - 1.4} l0,2.8" stroke="#C49A72" stroke-width=".5"/>`).join("")}`;
    return `
    <rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" rx="7" fill="${frame}" ${st(1.8)}/>
    <path d="M${lx + 4},${ly + 4} L${lx + lw - 4},${ly + 4} L${lx + lw - 4},${ly + 13} Q${lx + lw / 2},${ly + 17} ${lx + 4},${ly + 13} Z" fill="${band}"/>
    ${t(lx + lw / 2, ly + 12, 7.5, "Bean's Beans", { fill: bandText, w: 700 })}
    <path d="M${nx},${ny} q${nw / 4},-2 ${nw / 2},0 t${nw / 2},0 L${nx + nw},${ny + nh} q-${nw / 4},2 -${nw / 2},0 t-${nw / 2},0 Z" fill="#fff"/>
    ${rules}<path d="M${nx + 6},${ny} L${nx + 6},${ny + nh}" stroke="#F4A6A6" stroke-width=".8"/>
    ${notes.map((n, i) => t(nx + 8, ny + 6 + i * 6, 3.3, n, { f: F.marker, a: "start" })).join("")}
    ${fonk ? `<rect x="${nx + 8}" y="${ny + 20}" width="23" height="5" fill="#F9EE4A" transform="rotate(-3 ${nx + 8} ${ny + 20})"/>${t(nx + 9, ny + 24, 3.3, fonk, { f: F.marker, a: "start" })}` : ""}
    ${info.map((n, i) => t(nx + nw - 2, ny + 31 + i * 6, 3, n, { f: F.marker, a: "end" })).join("")}
    ${t(nx + nw - 2, ny + nh - 3, 3, "100G", { f: F.marker, a: "end" })}
    ${paw(nx + nw - 8, ny + 6)}
    ${fruitArt}
    <path d="M${lx + 4},${ly + lh - 4} L${lx + lw - 4},${ly + lh - 4} L${lx + lw - 4},${ly + lh - 14} Q${lx + lw / 2},${ly + lh - 18} ${lx + 4},${ly + lh - 14} Z" fill="${band}"/>
    ${bottom.length > 1
      ? t(lx + lw / 2, ly + lh - 10.5, 4.8, bottom[0], { fill: bandText, w: 700 }) + t(lx + lw / 2, ly + lh - 5.5, 4.8, bottom[1], { fill: bandText, w: 700 })
      : t(lx + lw / 2, ly + lh - 6.5, bottom[0].length > 12 ? 6 : 7, bottom[0], { fill: bandText, w: 700 })}`;
  }, { zip: true, shade: 0.3 });
}

// CETO: kraft paper bag, rough top edge, blue + orange label lower-left (from the user's photo)
function cetoBag(name, origin, notes, funk) {
  return (W, H) => {
    const x = 5, y = 9, w = W - 10, h = H - 14;
    let top = `M${x},${y + 3}`;
    for (let i = 1; i <= 16; i++) top += ` L${x + (w * i) / 16},${y + (i % 2 ? -1.5 : 1.8) + (i % 3) * 0.6}`;
    const body = `${top} L${x + w + 1},${y + h - 4} Q${x + w},${y + h} ${x + w - 6},${y + h} L${x + 6},${y + h} Q${x},${y + h} ${x - 1},${y + h - 4} Z`;
    const lx = x + w * 0.09, ly = y + h * 0.5, lw = w * 0.42, lh = h * 0.45;
    return `
    <path d="${body}" fill="#C9A273"/>
    <path d="M${x + w * 0.3},${y + 22} q12,8 30,2 M${x + w * 0.55},${y + 40} q8,10 2,24 M${x + 12},${y + 32} q10,-3 18,4" fill="none" stroke="#8C6A42" stroke-opacity=".45" stroke-width="1.2"/>
    <path d="M${x + w * 0.86},${y + 4} C${x + w * 0.92},${y + h * 0.4} ${x + w * 0.9},${y + h * 0.8} ${x + w * 0.88},${y + h} L${x + w + 1},${y + h} L${x + w + 1},${y} Z" fill="${INK}" fill-opacity=".12"/>
    <rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" rx="2.5" fill="#F08A3C" ${st(1.6)}/>
    <path d="M${lx},${ly + 2.5} q0,-2.5 2.5,-2.5 L${lx + lw - 2.5},${ly} q2.5,0 2.5,2.5 L${lx + lw},${ly + lh * 0.24} L${lx},${ly + lh * 0.24} Z" fill="#2D6683"/>
    <path d="M${lx},${ly + lh * 0.24} L${lx + lw},${ly + lh * 0.24}" stroke="#fff" stroke-width="1.6"/>
    ${t(lx + 3, ly + lh * 0.2, 9, "CETO", { f: F.serif, fill: "#fff", a: "start", w: 700 })}
    ${t(lx + lw - 2.5, ly + lh * 0.2, 2.6, ".coffee", { fill: "#F08A3C", a: "start", rot: -90 })}
    ${t(lx + 3, ly + lh * 0.38, name.length > 14 ? 3.4 : 4, name, { a: "start", w: 600 })}
    ${t(lx + 3, ly + lh * 0.46, 2.4, origin, { a: "start", style: "italic" })}
    ${notes.length ? notes.map((n, i) => t(lx + 3, ly + lh * 0.59 + i * 4.2, 3, n, { a: "start", w: 600 })).join("") : [0, 1, 2].map((i) => scrib(lx + 3, ly + lh * 0.57 + i * 4.2, lw * 0.6, { op: 0.55, sw: 1 })).join("")}
    ${funk == null ? "" : t(lx + 4, ly + lh - 8, 2.4, `Funk ${funk}/5`, { a: "start" })}
    ${scrib(lx + 4, ly + lh - 4, lw * 0.55, { op: 0.4, sw: 0.9 })}
    ${t(lx + lw - 2, ly + lh - 3, 3, "115g", { a: "end", w: 600 })}
    <path d="${body}" fill="none" ${st()}/>
    ${shine(x + 8, y + h * 0.15, h * 0.25, 0.35)}`;
  };
}

function apollonPouch(sticker) {
  return (W, H) => pouch(W, H, "#1a1a1a", (f) => {
    const cx = f.x + f.w / 2, cy = f.y + f.h * 0.38, G = "#D9A066";
    const sq = (rot) => `<rect x="${cx - 11}" y="${cy - 11}" width="22" height="22" fill="none" stroke="${G}" stroke-width="1.6" stroke-dasharray="9 3" transform="rotate(${rot} ${cx} ${cy})"/>`;
    return `${sq(0)}${sq(45)}
      <path d="M${cx},${cy - 7} L${cx + 6},${cy + 6} L${cx + 2.5},${cy + 6} L${cx},${cy} L${cx - 2.5},${cy + 6} L${cx - 6},${cy + 6} Z" fill="${G}"/>
      <path d="M${cx - 3.2},${cy + 2.5} L${cx + 3.2},${cy + 2.5}" stroke="#1a1a1a" stroke-width="1"/>
      ${t(cx, cy + 25, 5.2, "APOLLON'S GOLD", { fill: G, ls: 1, w: 500 })}
      ${t(cx, f.y + f.h - 20, 2.8, "APOLLONS-GOLD.COM", { fill: G, ls: 0.8 })}
      <g transform="rotate(-7 ${cx} ${f.y + f.h * 0.75})">
        <rect x="${cx - 21}" y="${f.y + f.h * 0.68}" width="42" height="13" rx="1.5" fill="#E9D8B4" ${st(1.4)}/>
        ${t(cx, f.y + f.h * 0.68 + 9.5, 8.5, sticker, { f: F.script, w: 700 })}
      </g>`;
  }, { shade: 0.3 });
}

function flowerChildBag(art) {
  return (W, H) => flatBag(W, H, "#EDEDE6", (f) => {
    const lx = f.x + f.w * 0.1, lw = f.w * 0.8, ly = f.y + f.h * 0.2, lh = f.h * 0.64;
    return `<rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" fill="#FBFAF7" ${st(1.6)}/>${art(lx, ly, lw, lh)}`;
  }, { g: 12 });
}

function barrettsBag(sticker, stickerFill) {
  return (W, H) => flatBag(W, H, "#86E2C4", (f) => {
    const bx = f.x, by = f.y, bw = f.w, bh = f.h;
    const cups = [[20, 26], [70, 34], [44, 60], [82, 132], [58, 150], [30, 168]].map(([cx, cy]) =>
      `<path d="M${bx + cx - 4},${by + cy - 3} l1,6 q3,2 6,0 l1,-6 z M${bx + cx + 4},${by + cy - 1.5} q3,0 2,3 l-2,0" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1"/>`).join("");
    const beans = [[60, 20], [86, 58], [18, 140], [76, 166]].map(([cx, cy]) =>
      `<ellipse cx="${bx + cx}" cy="${by + cy}" rx="3" ry="2" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1"/><path d="M${bx + cx - 2},${by + cy} q2,-1 4,0" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width=".8"/>`).join("");
    return `
    <path d="M${bx},${by + bh * 0.72} q${bw * 0.3},-6 ${bw * 0.6},-2 t${bw * 0.4},-1 L${bx + bw},${by + bh} L${bx},${by + bh} Z" fill="#5f6b66" fill-opacity=".38"/>
    ${[[22, 0.8], [40, 0.84], [62, 0.79], [80, 0.86], [52, 0.92], [30, 0.94], [72, 0.95]].map(([cx, cy]) => `<ellipse cx="${bx + cx}" cy="${by + bh * cy}" rx="3.2" ry="2.2" fill="#4a4440" fill-opacity=".45"/>`).join("")}
    ${cups}${beans}
    <path d="M${bx},${by + 74} L${bx + bw},${by + 74} L${bx + bw},${by + 112} l-8,0 l0,5 l-12,0 l0,-5 L${bx},${by + 112} Z" fill="#6CD3B0" ${st(1.3)}/>
    ${t(bx + bw * 0.62, by + 98, 21, "Barrett's", { f: F.brush })}
    ${t(bx + bw * 0.62, by + 106, 3.6, "COFFEE ROASTERS • ATX", { w: 600, ls: 0.4 })}
    <path d="M${bx - 1},${by + bh} C${bx + 14},${by + 150} ${bx + 2},${by + 120} ${bx + 10},${by + 92} C${bx + 14},${by + 76} ${bx + 18},${by + 62} ${bx + 22},${by + 56}" fill="#fff" ${st(2.2)}/>
    <path d="M${bx - 1},${by + bh} L${bx - 1},${by + 120} C${bx + 4},${by + 100} ${bx + 6},${by + 80} ${bx + 10},${by + 66}" fill="#fff" stroke="none"/>
    <path d="M${bx + 6},${by + 70} C${bx + 4},${by + 54} ${bx + 14},${by + 44} ${bx + 24},${by + 46} C${bx + 32},${by + 48} ${bx + 32},${by + 58} ${bx + 22},${by + 62}" fill="#fff" ${st(2.2)}/>
    <path d="M${bx + 28},${by + 50} l11,3 l-10,4 z" fill="#F08A3C" ${st(1.6)}/>
    <ellipse cx="${bx + 21}" cy="${by + 52}" rx="4" ry="3.4" fill="${INK}"/>
    <path d="M${bx + 10},${by + 48} L${bx + 29},${by + 55}" stroke="${INK}" stroke-width="1.2"/>
    <circle cx="${bx + 13}" cy="${by + 55}" r="1.4" fill="#8FB4E8" ${st(.8)}/>
    <g transform="rotate(${sticker.length > 12 ? 4 : -5} ${bx + bw * 0.55} ${by + 30})">
      <rect x="${bx + bw * 0.55 - 30}" y="${by + 22}" width="60" height="16" rx="2" fill="${stickerFill}" ${st(1.4)}/>
      ${t(bx + bw * 0.55, by + 34, sticker.length > 12 ? 9 : 11, sticker, { f: F.script, w: 700 })}
    </g>`;
  }, { g: 14 });
}

// ---------- the bags ----------

const BAGS = [
  // ---- August 2026
  {
    id: "blendin-el-diviso", date: "2026-08-16", roaster: "BlendIn Coffee Club", vendor: "BlendIn Coffee Club",
    coffee: "El Diviso Typica Mejorado", detail: "Thermal shock washed · Colombia", size: "284 g",
    W: 104, H: 124, draw: blendinBox("#8FC398", "THE DAILY", "WATERMELON • LYCHEE • YOGURT", "El Diviso", "Typica Mejorado", "COLOMBIA"),
  },
  // ---- September 2026
  {
    id: "barretts-fruit-punch", date: "2026-09-02", roaster: "Barrett's Coffee", vendor: "Barrett's Coffee",
    coffee: "Fruit Punch", detail: "Whole bean, local delivery", size: "1 lb",
    W: 126, H: 194, draw: barrettsBag("fruit punch", "#FFD6E0"),
  },
  {
    id: "barretts-sugarcane-decaf", date: "2026-09-02", roaster: "Barrett's Coffee", vendor: "Barrett's Coffee",
    coffee: "Sugarcane Decaf", detail: "Mexico Esmeralda", size: "1 lb",
    W: 126, H: 194, draw: barrettsBag("sugarcane decaf", "#F3E3B5"),
  },
  {
    id: "hyunah-milky-cake", date: "2026-09-03", roaster: "DAK", vendor: "HYUNAH",
    coffee: "Milky Cake", detail: "Castillo, advanced fermentation · Colombia · filter roast", size: "250 g",
    W: 108, H: 136, draw: (W, H) => box(W, H, "#EEF0F3", (f) => {
      const cx = f.x + f.w / 2, my = f.y + 52;
      return `
      <rect x="${f.x + 5}" y="${f.y + 5}" width="${f.w - 10}" height="34" fill="#F7F7F7" ${st(1.5)}/>
      ${t(f.x + 9, f.y + 16, 9.5, "MILKY CAKE", { a: "start", w: 600 })}
      ${t(f.x + 9, f.y + 22.5, 3.3, "CASTILLO, ADVANCED FERMENTATION", { a: "start", w: 500 })}
      ${t(f.x + 9, f.y + 27.5, 3.3, "CAUCA, COLOMBIA", { a: "start", w: 500 })}
      ${t(f.x + 9, f.y + 34, 3.4, "Cardamom, Pistachio, Vanilla Cake", { a: "start" })}
      <circle cx="${f.x + f.w - 15}" cy="${f.y + 15}" r="7.5" fill="#D9D9D9"/>${t(f.x + f.w - 15, f.y + 16.5, 3.6, "FILTER", { w: 600 })}
      <rect x="${cx - 25}" y="${my - 6}" width="50" height="${f.h - 50}" rx="16" fill="#fff" stroke="#333" stroke-width="1" stroke-dasharray="2 2"/>
      <g fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M${cx - 13},${my + 20} C${cx - 16},${my + 4} ${cx - 10},${my - 2} ${cx},${my - 2} C${cx + 10},${my - 2} ${cx + 16},${my + 4} ${cx + 13},${my + 20}"/>
        <path d="M${cx - 13},${my + 20} q4,-6 4,-14 q8,-2 16,-6 q2,10 6,20"/>
        <path d="M${cx - 6},${my + 13} q2,1.5 4,0 M${cx + 3},${my + 13} q2,1.5 4,0"/>
        <path d="M${cx - 2},${my + 19} q2,1.5 4,0"/>
        <path d="M${cx - 18},${my + 46} q2,-16 18,-20 q16,4 18,20"/>
        <rect x="${cx - 7}" y="${my + 30}" width="14" height="12" rx="2"/>
        <path d="M${cx + 7},${my + 33} q5,0 4,5 q-1,3 -4,2"/>
        <path d="M${cx - 12},${my + 40} q4,-6 5,-2 M${cx + 12},${my + 40} q-3,-6 -5,-3"/>
      </g>`;
    }, { d: 8 }),
  },
  {
    id: "friend-sey-sike-bokasso", date: "2026-09-14", roaster: "SEY", vendor: "HYUNAH",
    coffee: "Sike Bokasso", detail: "Ethiopian landrace, washed · Ethiopia", size: "250 g",
    W: 120, H: 120, draw: seyBox("#9A1D21", "#fff", "Sike Bokasso", "ETHIOPIAN LANDRACE - WASHED", "Ethiopia", { boxFill: "#EEECEA", linen: true }),
  },
  {
    id: "friend-tanat-alo-bombe", date: "2026-09-14", roaster: "Tanat", vendor: "HYUNAH",
    coffee: "Alo Bombe ZFWA", detail: "74158, zero fermentation washed · Ethiopia", size: "200 g",
    W: 110, H: 142, draw: tanatPouch(),
  },
  // ---- October 2026
  {
    id: "hyunah-advent-2026", date: "2026-10-08", roaster: "HYUNAH Advent Calendar", vendor: "HYUNAH",
    coffee: "Advent Calendar 2026", detail: "15 washed coffees from 15 roasters, 15 g each", size: "15 × 15 g",
    W: 150, H: 178, draw: (W, H) => box(W, H, "#3F1216", (f) => {
      const cx = f.x + f.w / 2, C = "#F3DCC4";
      const slice = (yy) => `<path d="M${f.x + 10},${yy} L${f.x + f.w - 10},${yy - 3}" stroke="#3F1216" stroke-width="1.6"/>`;
      return `
      <path d="M${f.x + 8},${f.y + 10} L${f.x + f.w - 14},${f.y + 7} q10,-1 7,-6 q-4,-3 -6,3 L${f.x + f.w - 8},${f.y + f.h - 6} L${f.x + 6},${f.y + f.h - 9} Z" fill="none" stroke="${C}" stroke-width="1.8" stroke-linejoin="round"/>
      ${t(cx, f.y + 52, 25, "advent", { fill: C, w: 600 })}
      ${t(cx, f.y + 78, 25, "calendar", { fill: C, w: 600 })}
      ${t(cx, f.y + 106, 22, "2026", { fill: C, w: 600 })}
      ${slice(f.y + 45)}${slice(f.y + 71)}${slice(f.y + 99)}
      ${t(cx, f.y + f.h - 18, 9, "HYUNAH", { f: F.marker, fill: C, ls: 1 })}`;
    }, { d: 10 }),
  },
  {
    id: "blendin-adaura", date: "2026-10-13", roaster: "BlendIn Coffee Club", vendor: "BlendIn Coffee Club",
    coffee: "Adaura Catuai", detail: "Washed · Panama", size: "10 oz",
    W: 104, H: 124, draw: blendinBox("#F2B630", "THE DAILY", "NECTARINE • STARFRUIT • JUJUBE", "Adaura", "Catuai Washed", "PANAMA"),
  },
  {
    id: "blendin-el-itacayo", date: "2026-10-13", roaster: "BlendIn Coffee Club", vendor: "BlendIn Coffee Club",
    coffee: "El Itacayo Geisha", detail: "Washed · Honduras", size: "10 oz",
    W: 104, H: 124, draw: blendinBox("#7FC2A0", "YEAR ROUND COFFEE", "MEYER LEMON • SAGE • JASMINE", "El Itacayo", "Washed Geisha", "HONDURAS"),
  },
  {
    id: "hyunah-chorso-bule", date: "2026-10-13", roaster: "SEY", vendor: "HYUNAH",
    coffee: "Chorso Bule", detail: "Ethiopian landrace, washed · Ethiopia", size: "250 g",
    W: 120, H: 120, draw: seyBox("#0B5A8E", "#fff", "Chorso Bule", ["HIGHEST ELEVATION PROJECT", "ETHIOPIAN LANDRACE - WASHED"], "Ethiopia"),
  },
  {
    id: "hyunah-alo-bombe", date: "2026-10-19", roaster: "Tanat", vendor: "HYUNAH",
    coffee: "Alo Bombe ZFWA", detail: "74158, zero fermentation washed · Ethiopia", size: "200 g",
    W: 110, H: 142, draw: tanatPouch(),
  },
  {
    id: "hyunah-vista-linda", date: "2026-10-19", roaster: "Scenery × HYUNAH", vendor: "HYUNAH",
    coffee: "Vista Linda Gesha", detail: "Natural · Panama", size: "100 g",
    W: 100, H: 132, draw: (W, H) => pouch(W, H, "#F2EEE6", (f) => {
      const lx = f.x + 8, lw = f.w - 16, ly = f.y + 24, lh = f.h - 36, iy = ly + 17, ih = lh - 17;
      const cid = uid();
      let checks = "";
      for (let i = 0; i < 9; i++) for (let j = 0; j < 3; j++) if ((i + j) % 2) checks += `<rect x="${lx + i * (lw / 9)}" y="${iy + ih - 14 + j * 4.7}" width="${lw / 9}" height="4.7" fill="#7E1F31"/>`;
      return `
      <rect x="${lx}" y="${ly}" width="${lw}" height="8" fill="#fff"/>
      ${t(lx + lw / 2, ly + 5.6, 3.5, "PANAMA — VISTA LINDA GESHA", { w: 600 })}
      <rect x="${lx}" y="${ly + 8}" width="${lw}" height="9" fill="#7A1F3D"/>
      ${t(lx + 3, ly + 12, 2.2, "TASTING GUIDE", { fill: "#fff", a: "start" })}${t(lx + 3, ly + 15.5, 2.6, "Raspberry, Mille-feuille, Earl Grey", { fill: "#fff", a: "start" })}
      ${t(lx + lw - 3, ly + 12, 2.2, "ROAST STYLE", { fill: "#fff", a: "end" })}${t(lx + lw - 3, ly + 15.5, 2.6, "Lightest ●", { fill: "#fff", a: "end" })}
      <defs><clipPath id="${cid}"><rect x="${lx}" y="${iy}" width="${lw}" height="${ih}"/></clipPath></defs>
      <g clip-path="url(#${cid})">
        <rect x="${lx}" y="${iy}" width="${lw}" height="${ih}" fill="#9E2A3F"/>
        <path d="M${lx + lw * 0.6},${iy + ih - 14} L${lx + lw * 0.6},${iy + 22} a${lw * 0.15},${lw * 0.15} 0 0 1 ${lw * 0.3},0 L${lx + lw * 0.9},${iy + ih - 14} Z" fill="#F2A27E" ${st(1.2)}/>
        <circle cx="${lx + lw * 0.7}" cy="${iy + 32}" r="4" fill="#E86A8A"/><circle cx="${lx + lw * 0.8}" cy="${iy + 28}" r="5" fill="#E86A8A"/><circle cx="${lx + lw * 0.78}" cy="${iy + 38}" r="3.5" fill="#d85578"/>
        <path d="M${lx + lw * 0.42},${iy} L${lx + lw * 0.42},${iy + 14}" stroke="#fff" stroke-width=".8"/>
        <path d="M${lx + lw * 0.42 - 6},${iy + 20} L${lx + lw * 0.42},${iy + 13} L${lx + lw * 0.42 + 6},${iy + 20} Z" fill="#fff" ${st(1)}/>
        ${checks}
        <path d="M${lx + 2},${iy + ih} q4,-8 0,-16 q-4,-8 2,-16 L${lx - 2},${iy + ih - 32} Z" fill="#F7C6CF"/>
        <rect x="${lx + 9}" y="${iy + ih - 24}" width="16" height="4" fill="#C8622E" ${st(1)}/><path d="M${lx + 11},${iy + ih - 20} l0,8 M${lx + 23},${iy + ih - 20} l0,8" stroke="#C8622E" stroke-width="1.5"/>
        <circle cx="${lx + 17}" cy="${iy + ih - 27}" r="3" fill="#bbb"/>
      </g>
      ${t(lx + 4, iy + 15, 15, "Scenery", { f: F.brush, fill: "#fff", a: "start", rot: -6 })}
      ${t(lx + lw - 3, iy + ih - 18, 4.6, "HYUNAH", { f: F.marker, fill: "#fff", a: "end" })}
      <rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" fill="none" ${st(1.6)}/>`;
    }),
  },
  {
    id: "split-ppp-blueberry-pie-magic", date: "2026-10-19", roaster: "People Possession", vendor: "HYUNAH",
    coffee: "BPM Blueberry Pie Magic", detail: "Blend · split half the can with a friend", size: "½ of 200 g",
    W: 62, H: 154, draw: (W, H) => {
      const x = 7, w = W - 14, y = 20, h = H - 26, cx = x + w / 2;
      return `
      <path d="M${x},${y} L${x},${y + h - 4} q0,4 ${w / 2},4 q${w / 2},0 ${w / 2},-4 L${x + w},${y} Z" fill="#C8CCD0" ${st()}/>
      <path d="M${x + w * 0.78},${y + 4} L${x + w * 0.78},${y + h - 4}" stroke="${INK}" stroke-opacity=".15" stroke-width="7"/>
      <path d="M${x + 7},${y + 6} L${x + 7},${y + h - 8}" stroke="#fff" stroke-opacity=".75" stroke-width="3" stroke-linecap="round"/>
      <rect x="${x}" y="${y + h * 0.3}" width="${w}" height="${h * 0.42}" fill="#F3F1EC" ${st(1.6)}/>
      ${t(cx, y + h * 0.3 + 7, 3.2, "People Possession", { w: 500 })}
      ${t(cx, y + h * 0.3 + 11, 2.6, "Research-Department", {})}
      ${t(cx, y + h * 0.3 + 14.5, 2.6, "Paris City", {})}
      ${t(cx, y + h * 0.3 + 27, 12, "Blueberry", { f: F.script })}
      ${t(cx, y + h * 0.3 + 38, 11, "Pie Magic", { f: F.script })}
      ${t(cx, y + h * 0.3 + 45, 4.4, "B.P.M", { f: F.serif, fill: "#9B1C24", ls: 1.5, w: 700 })}
      ${scrib(x + 6, y + h * 0.3 + 50, w - 12, { op: 0.4, sw: 0.9 })}
      <path d="M${x - 2},${y - 12} L${x + w + 2},${y - 12} L${x + w + 2},${y + 2} L${x - 2},${y + 2} Z" fill="#3A3FC8" ${st()}/>
      ${Array.from({ length: 8 }, (_, i) => `<path d="M${x + 2 + i * (w / 7.6)},${y - 9} l0,8" stroke="#fff" stroke-opacity=".35" stroke-width="1.2"/>`).join("")}
      <ellipse cx="${cx}" cy="${y - 12}" rx="${w / 2 + 2}" ry="3" fill="#5559e0" ${st(2)}/>`;
    },
  },
  {
    id: "hyunah-el-mirador", date: "2026-10-23", roaster: "Big Sur × HYUNAH", vendor: "HYUNAH",
    coffee: "El Mirador VSC002 Geisha", detail: "Washed · Peru", size: "100 g",
    W: 70, H: 132, draw: bigSurBag("#4A4950", "#DCE8E6", "#E9DCDC", "El Mirador", "100g", true),
  },
  {
    id: "hyunah-kamoko", date: "2026-10-23", roaster: "Big Sur", vendor: "HYUNAH",
    coffee: "Kamoko AA", detail: "SL28 & SL34, washed · Kenya", size: "150 g",
    W: 78, H: 144, draw: bigSurBag("#5B4FC9", "#EDE6D8", "#F1EEE6", "Kamoko AA", "150g", false),
  },
  {
    id: "beansbeans-bishan-wate", date: "2026-10-31", roaster: "Bean's Beans", vendor: "Bean's Beans",
    coffee: "Bishan Wate", detail: "Landrace, washed · Hambela, Ethiopia", size: "100 g",
    W: 96, H: 132, draw: beansPouch("#FBF59A", "#FCC8AA", "#fff",
      ["YUZU", "WHITE PEACH", "JASMINE MILK TEA"], ["HAMBELA, ETHIOPIA", "LANDRACE", "WASHED"], ["Bishan Wate"], "peach", null),
  },
  {
    id: "split-beansbeans-andcoffee-bombe", date: "2026-10-31", roaster: "Bean's Beans", vendor: "Bean's Beans",
    coffee: "AndCoffee Bombe", detail: "74158, natural · Ethiopia · split with a friend", size: "½ of 100 g",
    W: 96, H: 132, draw: beansPouch("#8496F7", "#FF96B4", "#FDFBD2",
      ["BLUEBERRY COBBLER", "MANGOSTEEN", "GARDENIA"], ["BOMBE, ETHIOPIA", "74158", "NATURAL"], ["AndCoffee", "Bombe"], "blueberry", "FONK = 1.5/5"),
  },
  {
    id: "split-beansbeans-raul-rodriguez", date: "2026-10-31", roaster: "Bean's Beans", vendor: "Bean's Beans",
    coffee: "Raul Rodriguez", detail: "Gesha, washed · Tres Pinos, Honduras · split with a friend", size: "½ of 100 g",
    W: 96, H: 132, draw: beansPouch("#6EBF96", "#FFA6BE", "#F7F7B5",
      ["WATERMELON GUMMY", "AGUAMIEL", "ELDERFLOWER"], ["TRES PINOS, HONDURAS", "GESHA", "WASHED"], ["Raul Rodriguez"], "watermelon", "FONK = 2.5/5"),
  },
  // ---- November 2026
  {
    id: "ceto-hyperlight", date: "2026-11-04", roaster: "CETO", vendor: "CETO",
    coffee: "Hyperlight", detail: "First monthly subscription bag", size: "115 g",
    W: 104, H: 122, draw: cetoBag("Hyperlight", "Monthly subscription", [], null),
  },
  {
    id: "walnuts-halo-golden-honey", date: "2026-11-04", roaster: "Walnuts Coffee", vendor: "Walnuts Coffee",
    coffee: "Halo Golden Honey", detail: "74112, golden honey · Gedeb, Ethiopia", size: "125 g",
    W: 98, H: 124, draw: (W, H) => pouch(W, H, "#232020", (f) => {
      const lx = f.x + 8, lw = f.w - 16, ly = f.y + 8, lh = f.h - 16, B = "#3E1E12";
      const rows = [["origin", "gedeb, ethiopia"], ["varietal", "74112"], ["process", "golden honey"], ["producer", "zerihun birhanu"], ["farm", "halo shashamane"], ["elevation", "2000-2150masl"], ["notes", "apricot / elderflower"]];
      return `<rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" rx="2" fill="#C99BC6" ${st(1.6)}/>
        ${t(lx + lw / 2, ly + 17, 15, "halo", { f: F.marker, fill: B })}
        ${t(lx + lw / 2, ly + 27, 9, "golden honey", { f: F.marker, fill: B })}
        ${rows.map(([k, v], i) => {
          const yy = ly + 34 + i * 10.5;
          return `<path d="M${lx + 3},${yy} L${lx + lw - 3},${yy}" stroke="#8A6A80" stroke-width=".8" stroke-dasharray="2 1.5"/>
            ${t(lx + 3, yy + 7, 2.4, k, { fill: B, a: "start" })}${t(lx + lw / 2 + 6, yy + 7.2, 4.3, v, { f: F.marker, fill: B })}`;
        }).join("")}`;
    }, { zip: false, notch: false, shade: 0.3 }),
  },
  {
    id: "ceto-ndiaini", date: "2026-11-11", roaster: "CETO", vendor: "CETO",
    coffee: "Kenya Ndiaini Natural", detail: "SL28, Ruiru 11, Batian · Nyeri, Kenya", size: "115 g",
    W: 104, H: 122, draw: cetoBag("Ndiaini Natural", "Nyeri, Kenya · Natural", ["Apple Blossom", "Pumpkin Pie", "Berries"], 1),
  },
  {
    id: "ceto-pink-bourbon", date: "2026-11-11", roaster: "CETO", vendor: "CETO",
    coffee: "El Mirador Pink Bourbon", detail: "Washed · Huila, Colombia", size: "115 g",
    W: 104, H: 122, draw: cetoBag("El Mirador Pink Bourbon", "Huila, Colombia · Washed", ["Blackberries", "Lemongrass", "Lady Grey"], 0),
  },
  {
    id: "ceto-kathakwa", date: "2026-11-18", roaster: "CETO", vendor: "CETO",
    coffee: "Kathakwa AB", detail: "Field blend, washed · Embu, Kenya", size: "115 g",
    W: 104, H: 122, draw: cetoBag("Kathakwa AB", "Embu, Kenya · Washed", ["Meyer Lemon", "Red Grape", "Hibiscus Tea"], 0),
  },
  {
    id: "xbloom-demeka-becha", date: "2026-11-18", roaster: "SEY", vendor: "xBloom",
    coffee: "Demeka Becha", detail: "Ethiopian landrace, dry fermented · Ethiopia", size: "250 g",
    W: 120, H: 120, draw: seyBox("#FFE27A", "#111", "Demeka Becha", "ETHIOPIAN LANDRACE - DRY-FERMENTED", "Ethiopia"),
  },
  {
    id: "xbloom-anasora", date: "2026-11-18", roaster: "Apollon's Gold", vendor: "xBloom",
    coffee: "Anasora", detail: "Anaerobic", size: "100 g",
    W: 90, H: 126, draw: apollonPouch("Anasora"),
  },
  {
    id: "xbloom-kianyangi", date: "2026-11-18", roaster: "Apollon's Gold", vendor: "xBloom",
    coffee: "Kianyangi", detail: "SL28, SL34, washed · Embu, Kenya", size: "100 g",
    W: 90, H: 126, draw: apollonPouch("Kianyangi"),
  },
  {
    id: "ceto-gathaithi", date: "2026-11-19", roaster: "CETO", vendor: "CETO",
    coffee: "Gathaithi AA", detail: "SL28 & SL34, washed · Nyeri, Kenya", size: "115 g",
    W: 104, H: 122, draw: cetoBag("Gathaithi AA", "Nyeri, Kenya · Washed", ["Tree Tomato", "Jasmine Green Tea", "Red Grape"], 0.5),
  },
  {
    id: "flowerchild-danche", date: "2026-11-22", roaster: "Flower Child Coffee", vendor: "Flower Child Coffee",
    coffee: "Danche", detail: "Fully washed · Gedeb, Ethiopia", size: "250 g",
    W: 120, H: 152, draw: flowerChildBag((lx, ly, lw, lh) => `
      ${t(lx + 6, ly + 20, 20, "Danche", { f: F.script, a: "start", w: 700 })}
      <path d="M${lx + 42},${ly + 19} q14,4 20,-6" fill="none" ${st(1.4)}/>
      ${["WOLISHO & DEGA", "GEDEB, ETHIOPIA", "1,950-2,200 METERS", "FULLY WASHED", "HARVEST: DEC. 2025", "FLOWERCHILDCOFFEE.COM"].map((s, i) => t(lx + 6, ly + 31 + i * 6, 3.6, s, { f: F.hand, a: "start" })).join("")}
      ${t(lx + lw / 2, ly + lh - 4, 5, "250g. of coffee", { f: F.script })}
      <g fill="none" stroke="${INK}" stroke-width=".9" stroke-linecap="round">
        ${[0, 5, 10, 15].map((dx) => `<path d="M${lx + lw - 30 + dx},${ly + lh - 10} L${lx + lw - 14 + dx},${ly + 12}"/>`).join("")}
        <path d="M${lx + lw - 10},${ly + 18} l3,-4 m-3,4 l-1,-5" /><path d="M${lx + lw - 20},${ly + 30} l3,-3 m-3,3 l-1,-4"/>
        ${[[lw - 12, 8], [lw - 22, 12], [lw - 6, 30]].map(([dx, dy]) => `<circle cx="${lx + dx}" cy="${ly + dy}" r="2.6" stroke-dasharray="1 1"/><path d="M${lx + dx - 1.5},${ly + dy} l3,0 M${lx + dx},${ly + dy - 1.5} l0,3"/>`).join("")}
      </g>`),
  },
  {
    id: "flowerchild-decaf-divino", date: "2026-11-22", roaster: "Flower Child Coffee", vendor: "Flower Child Coffee",
    coffee: "Decaf Divino", detail: "Washed, E.A. decaf · Huila, Colombia", size: "250 g",
    W: 120, H: 152, draw: flowerChildBag((lx, ly, lw, lh) => `
      ${t(lx + lw / 2, ly + 19, 15, "Decaf Divino", { f: F.brush })}
      ${["Caturra, Castillo & V.Colombia", "Suaza, Huila, Colombia", "1300-1900 Meters Above Sea Level", "Washed E.A. Decaffeination", "Harvested September 2025"].map((s, i) => t(lx + 6, ly + 32 + i * 7, 4, s, { f: F.hand, a: "start" })).join("")}
      ${t(lx + 6, ly + lh - 6, 3.6, "FLOWERCHILDCOFFEE.COM  250G.", { f: F.hand, a: "start" })}`),
  },
];

if (typeof module !== "undefined") module.exports = { BAGS };
