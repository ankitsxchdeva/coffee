(function () {
  const main = document.getElementById("shelves");
  const tag = document.getElementById("tag");
  const GAP = 14;

  const monthKey = (d) => d.slice(0, 7);
  const monthName = (k) => {
    const [y, m] = k.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };
  const niceDate = (d) => {
    const [y, m, day] = d.split("-").map(Number);
    return new Date(y, m - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Render each bag's SVG once
  const svgs = new Map();
  for (const b of BAGS) {
    svgs.set(b.id, `<svg viewBox="0 0 ${b.W} ${b.H}" width="${b.W}" height="${b.H}" aria-hidden="true"><g filter="url(#wobble)">${b.draw(b.W, b.H)}</g></svg>`);
  }

  const byMonth = new Map();
  for (const b of [...BAGS].sort((a, z) => a.date.localeCompare(z.date))) {
    const k = monthKey(b.date);
    if (!byMonth.has(k)) byMonth.set(k, []);
    byMonth.get(k).push(b);
  }
  const months = [...byMonth.keys()].sort().reverse(); // newest shelf on top


  function scale() {
    const w = main.clientWidth;
    return w < 520 ? 0.72 : w < 820 ? 0.9 : 1.12;
  }

  function layout() {
    closeTag();
    const s = scale();
    const avail = main.clientWidth - 48;
    main.textContent = "";
    for (const k of months) {
      const bags = byMonth.get(k);
      const sec = document.createElement("section");
      sec.className = "month";
      sec.setAttribute("aria-label", monthName(k));
      sec.innerHTML = `<div class="sign"><h2>${monthName(k)}</h2></div>`;

      // pack bags into rows that fit the shelf width
      // pack bags into balanced rows that fit the shelf width
      const total = bags.reduce((sum, b) => sum + b.W * s + GAP, 0);
      let n = Math.ceil(total / avail), rows;
      for (;; n++) {
        const target = total / n;
        rows = [[]];
        let used = 0;
        for (const b of bags) {
          const w = b.W * s + GAP;
          const cur = rows[rows.length - 1];
          if (cur.length && (used + w > avail || used + w / 2 > target) && rows.length < n) { rows.push([]); used = 0; }
          used += w;
          rows[rows.length - 1].push(b);
        }
        const widest = Math.max(...rows.map((r) => r.reduce((sum, b) => sum + b.W * s + GAP, 0)));
        if (widest <= avail + GAP || n >= bags.length) break;
      }
      for (const r of rows) {
        const row = document.createElement("div");
        row.className = "row";
        const items = document.createElement("div");
        items.className = "items";
        items.style.setProperty("--gap", GAP + "px");
        for (const b of r) {
          const btn = document.createElement("button");
          btn.className = "bag";
          btn.type = "button";
          btn.dataset.id = b.id;
          btn.setAttribute("aria-expanded", "false");
          btn.setAttribute("aria-label", `${b.coffee} from ${b.roaster}`);
          btn.innerHTML = svgs.get(b.id);
          const svg = btn.firstChild;
          svg.setAttribute("width", Math.round(b.W * s));
          svg.setAttribute("height", Math.round(b.H * s));
          items.appendChild(btn);
        }
        row.appendChild(items);
        const plank = document.createElement("div");
        plank.className = "plank";
        plank.innerHTML = "<i></i><i></i>";
        row.appendChild(plank);
        sec.appendChild(row);
      }
      main.appendChild(sec);
    }
  }

  let open = null, shownAt = 0;
  function showTag(btn, sticky) {
    const b = BAGS.find((x) => x.id === btn.dataset.id);
    if (open && open !== btn) open.setAttribute("aria-expanded", "false");
    if (open !== btn || !tag.dataset.sticky) shownAt = Date.now();
    open = btn;
    btn.setAttribute("aria-expanded", "true");
    tag.dataset.sticky = sticky ? "1" : "";
    tag.innerHTML = "";
    const add = (cls, txt, el = "div") => { const n = document.createElement(el); n.className = cls; n.textContent = txt; tag.appendChild(n); return n; };
    add("r", b.roaster);
    add("c", b.coffee);
    add("d", b.detail, "p");
    const m = add("m", "");
    [`🫘 ${b.size}`, `🗓 ${niceDate(b.date)}`, b.vendor !== b.roaster && !b.roaster.includes(b.vendor) ? `🛍 via ${b.vendor}` : null]
      .filter(Boolean).forEach((x) => { const sp = document.createElement("span"); sp.textContent = x; m.appendChild(sp); });
    tag.hidden = false;

    const r = btn.getBoundingClientRect();
    const tw = tag.offsetWidth, th = tag.offsetHeight;
    const pageX = r.left + window.scrollX, pageY = r.top + window.scrollY;
    let left = pageX + r.width / 2 - tw / 2;
    left = Math.max(window.scrollX + 8, Math.min(left, window.scrollX + document.documentElement.clientWidth - tw - 8));
    let top = pageY - th - 18;
    const below = r.top - th - 18 < 0;
    if (below) top = pageY + r.height + 18;
    tag.classList.toggle("below", below);
    tag.style.left = left + "px";
    tag.style.top = top + "px";
    tag.style.setProperty("--arrow", Math.max(16, Math.min(tw - 16, pageX + r.width / 2 - left)) + "px");
  }
  function closeTag() {
    if (open) open.setAttribute("aria-expanded", "false");
    open = null;
    tag.hidden = true;
  }

  main.addEventListener("click", (e) => {
    const btn = e.target.closest(".bag");
    if (!btn) return closeTag();
    if (open === btn && tag.dataset.sticky && Date.now() - shownAt > 400) return closeTag();
    showTag(btn, true);
  });
  main.addEventListener("mouseover", (e) => {
    const btn = e.target.closest(".bag");
    if (btn && btn !== open && !tag.dataset.sticky) showTag(btn, false);
  });
  main.addEventListener("mouseout", (e) => {
    const btn = e.target.closest(".bag");
    if (btn && !btn.contains(e.relatedTarget) && !tag.dataset.sticky) closeTag();
  });
  main.addEventListener("focusin", (e) => { const btn = e.target.closest(".bag"); if (btn) showTag(btn, true); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeTag(); });
  document.addEventListener("click", (e) => { if (!main.contains(e.target)) closeTag(); });

  let w = 0;
  window.addEventListener("resize", () => { if (main.clientWidth !== w) { w = main.clientWidth; layout(); } });
  document.fonts?.ready.then(() => {});
  w = main.clientWidth;
  layout();
})();
