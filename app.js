
      const D = {
        suppliers: ["Shree Ganesh Waste Paper", "Om Sai Recyclers", "Patil Kraft", "Maruti Paper Mart", "Sahyadri Agro Fibres"],
        materials: ["Domestic OCC", "Imported OCC", "Mixed Waste Paper", "Starch & chemicals"],
        trucks: [
          { id: "IN-1041", veh: "MH15 GT 4521", sup: "Shree Ganesh Waste Paper", mat: "Domestic OCC", mt: 17.6, inv: "SGWP/0915", stage: "At gate", t: ["10:05"] },
          { id: "IN-1046", veh: "MH20 DX 6150", sup: "Patil Kraft", mat: "Domestic OCC", mt: 15.2, inv: "PKS/1201", stage: "At weighbridge", t: ["10:12"] },
          { id: "IN-1042", veh: "MH20 EL 7788", sup: "Om Sai Recyclers", mat: "Mixed Waste Paper", mt: 12.4, inv: "OSR/0340", stage: "QC hold – moisture 14%", t: ["08:40", "08:58"] },
          { id: "IN-1043", veh: "MH16 CD 2210", sup: "Patil Kraft", mat: "Domestic OCC", mt: 16.8, inv: "PKS/1196", stage: "QC in progress", t: ["09:15", "09:31"] },
          { id: "IN-1044", veh: "MH12 KP 9034", sup: "Maruti Paper Mart", mat: "Imported OCC", mt: 24.5, inv: "MPM/0457", stage: "Accepted – GRN pending", t: ["07:50", "08:06", "08:45"] },
          { id: "IN-1045", veh: "MH15 HY 3307", sup: "Sahyadri Agro Fibres", mat: "Starch & chemicals", mt: 9.0, inv: "SAF/0218", stage: "Packet sent to corporate", t: ["07:10", "07:26", "07:58", "08:30", "09:05"] },
        ],
        bills: [
          { no: "SGWP/0871", sup: "Shree Ganesh Waste Paper", amt: 250240, status: "Exception – qty mismatch (invoice 18.40 MT vs accepted 17.95 MT)" },
          { no: "OSR/0332", sup: "Om Sai Recyclers", amt: 110000, status: "Cleared for posting" },
          { no: "PKS/1190", sup: "Patil Kraft", amt: 340000, status: "Posted – voucher PV-08812" },
          { no: "OSR/0329", sup: "Om Sai Recyclers", amt: 192000, status: "Exception – moisture deduction not agreed" },
          { no: "MPM/0451", sup: "Maruti Paper Mart", amt: 157760, status: "Exception – receipt (GRN) missing" },
          { no: "GST/520/26-27", sup: "Akash Deep Traders", d: "Dt 28-Aug-26 · 7 lines · 7 GRNs · P.O. 21", amt: 719697.3, status: "Awaiting bill pass" },
          { no: "ST/26-27/606", sup: "Shree Transmission", d: "4 Fenner V-belts · PO 978 · 30 days", amt: 13797, status: "Auto-matched · due 8-Oct" },
          { no: "MFI/0066/26-27", sup: "Micro Fab Industries, Vapi", d: "Head box parts · PO 1947 · IGST 18%", amt: 7316000, status: "Above ₹10 lakh — sent to MD Decision Inbox" },
        ],
        steps: ["Gate", "Weighment", "QC", "GRN", "Packet to corporate", "Bill matched", "Posted in DataMan", "Paid"],
        view: "dash", tab: "ov", mis: false, period: "today", kpi: null, next: 1047, zone: "pm1", route: null, photos: 0, voucher: 8813, imported: false, importMsg: "",
        qcSel: null, grnSel: null, jSel: "IN-1041", billOpen: null, grnNo: 24117,
      };

      const $ = (s) => document.querySelector(s);
      const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
      const now = () => new Date().toTimeString().slice(0, 5);
      const truck = (id) => D.trucks.find((t) => t.id === id);
      const isHold = (t) => t.stage.startsWith("QC hold");
      const isRej = (t) => t.stage.startsWith("Rejected");
      const isAcc = (t) => t.stage.startsWith("Accepted");
      const isPkt = (t) => t.stage === "Packet sent to corporate";
      const isExc = (b) => b.status.startsWith("Exception");
      const isPosted = (b) => b.status.startsWith("Posted");
      const chip = (s, urgent) => `<span class="chip${urgent ? " chip--solid" : ""}">${s}</span>`;
      const stageChip = (t) => chip(t.stage, isHold(t) || isRej(t) || isAcc(t));
      const billChip = (b) => chip(b.status, isExc(b));

      function table(cols, rows) {
        return `<div class="table-wrap"><table><thead><tr>${cols.map((c) => `<th scope="col">${c}</th>`).join("")}</tr></thead><tbody>${rows
          .map((r) => `<tr${r.hl ? ' class="is-highlight"' : ""}><th scope="row">${r.c[0]}</th>${r.c.slice(1).map((v, i) => `<td data-label="${cols[i + 1]}"${r.num && r.num.includes(i + 1) ? ' class="num"' : ""}>${v}</td>`).join("")}</tr>`)
          .join("")}</tbody></table></div>`;
      }
      const truckTable = (list) =>
        list.length
          ? table(["Truck", "Vehicle", "Supplier", "Material", "Stage"], list.map((t) => ({ c: [`<button class="link x-linkbtn" data-truck="${t.id}">${t.id}</button>`, t.veh, t.sup, t.mat, stageChip(t)] })))
          : `<p class="fineprint">No trucks here right now.</p>`;
      const billTable = (list) =>
        list.length
          ? table(["Bill", "Supplier", "Amount", "Status"], list.map((b) => ({ hl: D.billOpen === b.no, num: [2], c: [b.no === "SGWP/0871" ? `<button class="link x-linkbtn" data-bill="${b.no}">${b.no}</button>` : b.no, b.sup + (b.d ? `<span class="x-sub">${b.d}</span>` : ""), inr(b.amt), billChip(b)] })))
          : `<p class="fineprint">No bills here right now.</p>`;

      function kpis() {
        const T = D.trucks, B = D.bills, exc = B.filter(isExc);
        return [
          { k: "site", label: "Trucks on site", val: T.filter((t) => !isPkt(t)).length, src: "App live", list: () => truckTable(T.filter((t) => !isPkt(t))) },
          { k: "hold", label: "Loads held or sent back", val: T.filter((t) => isHold(t) || isRej(t)).length, src: "App live", list: () => truckTable(T.filter((t) => isHold(t) || isRej(t))) },
          { k: "grn", label: "Accepted, receipt not made", val: T.filter(isAcc).length, src: "App live", list: () => truckTable(T.filter(isAcc)) },
          { k: "pkt", label: "Papers sent to head office", val: T.filter(isPkt).length, src: "App live", list: () => truckTable(T.filter(isPkt)) },
          { k: "exc", label: `Money stuck in blocked bills · ${exc.length}`, val: inr(exc.reduce((s, b) => s + b.amt, 0)), src: "App live", list: () => billTable(exc) },
          { k: "post", label: "Bills entered in DataMan", val: B.filter(isPosted).length, src: "DataMan export · 10:30", list: () => billTable(B.filter(isPosted)) },
        ];
      }

      /* Dashboard building blocks: cards, pills, meters, bars and tiny SVG charts. */
      const tag = (s, t = "ok") => `<span class="x-tag x-${t}">${s}</span>`;
      const src = (s) => `<p class="x-src">${s}</p>`;
      const card = (title, body, s) => `<article class="x-card"><h3 class="x-ct">${title}</h3>${body}${src(s)}</article>`;
      const big = (v, unit) => `<p class="x-big">${v}${unit ? `<small>${unit}</small>` : ""}</p>`;
      const sub = (s) => `<p class="x-sub">${s}</p>`;
      const arrow = (d, s, good) => `<span class="x-tr x-${good ? "ok" : "crit"}">${d > 0 ? "▲" : "▼"} ${s}</span>`;
      const vsb = (a, b, lowGood) => { const p = ((a - b) / b) * 100, good = lowGood ? p <= 0 : p >= 0; return `<span class="x-vb x-${good ? "ok" : "crit"}"><b>${p > 0 ? "+" : ""}${p.toFixed(1)}%</b> vs Budget</span>`; };
      const meter = (v, max, t = "data") => `<div class="x-meter x-${t}"><i style="width:${Math.min(100, (v / max) * 100).toFixed(1)}%"></i></div>`;
      const hbars = (rows, max) => `<div class="x-bars">${rows.map((r) => `<div class="x-bar"><span>${r.l}${r.d ? `<small>${r.d}</small>` : ""}</span><b>${r.txt}</b>${meter(r.v, r.max || max || Math.max(...rows.map((x) => x.v)), r.t)}</div>`).join("")}</div>`;
      function spark(a, t = "data", cls = "x-spark") {
        const mn = Math.min(...a), r = Math.max(...a) - mn || 1, x = (i) => (((i + 0.5) / a.length) * 100).toFixed(1);
        const p = a.map((v, i) => `${x(i)},${(37 - ((v - mn) / r) * 32).toFixed(1)}`).join(" ");
        return `<svg class="${cls} x-${t}" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><polygon points="${x(0)},40 ${p} ${x(a.length - 1)},40"/><polyline points="${p}"/></svg>`;
      }
      /* Charts: ui.js line chart (axis values, gridlines), drawn from data-points after each render. */
      const lineChart = (lab, a, cap, aria) => `<div class="chart is-in" data-points="${lab.map((l, i) => `${l}:${a[i]}`).join(",")}" data-caption="${cap}" aria-label="${aria}"></div>`;
      const trendChart = (a, lab) => lineChart(lab, a, "₹ per MT · monthly", `₹ per MT moved from ${inr(a[0])} in ${lab[0]} to ${inr(a[a.length - 1])} in ${lab[lab.length - 1]}`);
      /* Own SVG chart (x-ch): drawn after each render at the box's real width, so text stays 12px. */
      const XC = {};
      const xc = (id, spec, cap, leg) => { XC[id] = spec; return `<figure class="x-ch">${cap ? `<figcaption class="chart__cap">${cap}</figcaption>` : ""}<div data-xc="${id}" role="img" aria-label="${spec.aria}"></div>${leg ? `<p class="x-leg">${leg.map(([l, k, c = ""]) => `<span><i class="${c}" style="--k:${k}"></i>${l}</span>`).join("")}</p>` : ""}</figure>`; };
      const niceStep = (r) => { const p = 10 ** Math.floor(Math.log10(r)), n = r / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p; };
      function xchart(o, W) {
        W = Math.max(280, Math.round(W)); const H = 230, L = 46, R = W - 6, T = 14, B = H - 28, n = o.lab.length;
        const vals = [...(o.lines || []).flatMap((s) => s.v), ...(o.band ? [...o.band.lo, ...o.band.hi] : []), ...(o.bars || []).flatMap((s) => s.v), ...(o.refs || []).map((r) => r.v)].filter((v) => v != null);
        let mn = o.zero ? 0 : Math.min(...vals), mx = Math.max(...vals);
        const st = niceStep((mx - mn) / 4 || 1); mn = Math.floor(mn / st) * st; mx = Math.ceil(mx / st) * st;
        const bw = (R - L) / n, x = (i) => +(L + bw * (i + 0.5)).toFixed(1), y = (v) => +(B - ((B - T) * (v - mn)) / (mx - mn || 1)).toFixed(1);
        const f = o.fmt || ((v) => v.toLocaleString("en-IN"));
        let s = "";
        if (!isFinite(mn) || !isFinite(mx) || !(st > 0)) return "";
        for (let v = mn, g = 0; v <= mx + st / 2 && g < 12; v += st, g++) s += `<line class="x-gl" x1="${L}" x2="${R}" y1="${y(v)}" y2="${y(v)}"/><text class="x-ax" x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${f(+v.toFixed(2))}</text>`;
        if (o.hl != null) s += `<rect class="x-hlc" x="${x(o.hl) - bw / 2}" y="${T}" width="${bw}" height="${B - T}"/>`;
        (o.bars || []).forEach((b, k, A) => { const w = Math.min(14, (bw * 0.8) / A.length); b.v.forEach((v, i) => { s += `<rect class="${b.c}" x="${(x(i) - (w * A.length) / 2 + k * w).toFixed(1)}" y="${y(v)}" width="${Math.max(1, w - 1).toFixed(1)}" height="${(y(mn) - y(v)).toFixed(1)}" rx="1.5"/>`; }); });
        if (o.band) { const idx = o.band.lo.map((v, i) => (v == null ? null : i)).filter((i) => i != null); s += `<path class="x-band" d="M${idx.map((i) => `${x(i)},${y(o.band.hi[i])}`).join("L")}L${[...idx].reverse().map((i) => `${x(i)},${y(o.band.lo[i])}`).join("L")}Z"/>`; }
        (o.refs || []).forEach((r) => (s += `<line class="x-ref" x1="${L}" x2="${R}" y1="${y(r.v)}" y2="${y(r.v)}"/><text class="x-ax" x="${R}" y="${y(r.v) - 6}" text-anchor="end">${r.l}</text>`));
        (o.lines || []).forEach((l) => {
          s += `<polyline class="x-ln ${l.c || ""}" points="${l.v.map((v, i) => (v == null ? "" : `${x(i)},${y(v)}`)).filter(Boolean).join(" ")}"/>`;
          if (l.dots) l.v.forEach((v, i) => { if (v != null) s += `<circle class="x-dt${i === o.hl ? " x-dt--hl" : ""}" cx="${x(i)}" cy="${y(v)}" r="${i === o.hl ? 5 : 2.5}"/>`; });
        });
        if (o.note) { const [i, v, t] = o.note; s += `<text class="x-ax x-note" x="${x(i)}" y="${y(v) + 20}" text-anchor="middle">${t}</text>`; }
        const every = Math.max(1, Math.ceil(n / Math.max(1, Math.floor((R - L) / 36))));
        o.lab.forEach((l, i) => { if (i % every === 0) s += `<text class="x-ax" x="${x(i)}" y="${H - 8}" text-anchor="middle">${l}</text>`; });
        return `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">${s}</svg>`;
      }
      const drawX = () => document.querySelectorAll("[data-xc]").forEach((el) => {
        const w = Math.round(el.clientWidth), spec = XC[el.dataset.xc];
        if (!spec || (el.firstChild && +el.dataset.w === w)) return;
        el.dataset.w = w;
        try { el.innerHTML = xchart(spec, w); } catch (err) { el.textContent = ""; }
      });
      /* Waiting timers: each truck keeps the epoch time it entered its current lane (demo clock 10:30). */
      const T0 = Date.now(), mins = (s) => { const [h, m] = s.split(":"); return h * 60 + +m; };
      D.trucks.forEach((t) => (t.since = T0 - (630 - mins(t.t[t.t.length - 1])) * 60000));
      const cols = (v, lab, tgt) => xc("p7", { lab, lines: [{ v, c: "is-cash", dots: true }], refs: [{ v: tgt, l: `Target ${tgt} MT` }], aria: `Daily production in MT, ${Math.min(...v)} to ${Math.max(...v)}, below the ${tgt} MT target every day` }, `MT per day · dashed line is the ${tgt} MT target`);

      /* Forecast & Planning: sample model estimates. */
      const FC = "Forecast · model estimate";
      const PA = [94, 90, 96, 86, 92, 99, 101, 88, 97, 93, 98];
      const PF = [92, 90, 91, 92, 90, 92, 91, 92, 90, 91, 92, 91, 90, 92, 91, 92, 91, 91, 92, 93];
      const OUT = [
        { l: "Production", v: "2,860", u: "MT", a: 2860, b: 3000, bt: "3,000 MT", r: "2,780–2,930 MT" },
        { l: "Revenue", v: "₹8.4 Cr", a: 8.4, b: 8.9, bt: "₹8.9 Cr", r: "₹8.1–8.6 Cr" },
        { l: "EBITDA", v: "₹1.05 Cr", a: 1.05, b: 1.2, bt: "₹1.20 Cr", r: "₹0.95–1.15 Cr" },
      ];
      const CASH = { inf: [1.76, 1.83, 1.72, 1.87, 1.81, 1.78, 2.02, 1.97, 1.91, 1.93, 1.95, 1.99, 2.04], out: [1.82, 1.89, 1.76, 1.92, 1.87, 1.82, 1.96, 1.92, 1.88, 1.89, 1.92, 1.96, 1.99], close: [0.56, 0.5, 0.46, 0.41, 0.35, 0.31, 0.37, 0.42, 0.45, 0.49, 0.52, 0.55, 0.6] };
      const WI0 = { o: 0, s: 0, e: 87, c: 0 };
      D.wi = { ...WI0 };
      const FIXED = 2860 * 4100 - 10500000; /* fixed costs implied by base EBITDA ₹1.05 Cr at ₹4,100/MT margin */
      function wiCalc(w = D.wi) {
        const m = 4100 - (15600 * w.o) / 100 + (29500 * w.s) / 100 - (3300 * w.c) / 100, mt = (2860 * w.e) / 87;
        return { m, mt, eb: mt * m - FIXED };
      }
      const cr = (v) => (v < 0 ? "−" : "") + "₹" + (Math.abs(v) / 1e7).toFixed(2) + " Cr";
      const pct = (v) => (v > 0 ? "+" : "") + v + "%";
      function wiOut() {
        const r = wiCalc(), d = r.eb - 10500000, dm = r.m - 4100, t = (v) => (Math.abs(v) < 1 ? "data" : v > 0 ? "ok" : "crit");
        return {
          eb: cr(r.eb), ebd: `<span class="x-tr x-${t(d / 1e5)}">${d >= 0 ? "+" : "−"}${cr(Math.abs(d))}</span> vs base ₹1.05 Cr`,
          m: (r.m < 0 ? "−" : "") + inr(Math.abs(r.m)), md: `<span class="x-tr x-${t(dm)}">${dm >= 0 ? "+" : "−"}${inr(Math.abs(dm))}</span> vs base ₹4,100 · production ${Math.round(r.mt).toLocaleString("en-IN")} MT`,
        };
      }
      function whatIf() {
        const o = wiOut();
        ["eb", "ebd", "m", "md"].forEach((k) => ($("#wi-" + k).innerHTML = o[k]));
        Object.keys(D.wi).forEach((k) => ($("#wo-" + k).textContent = k === "e" ? D.wi.e + "%" : pct(D.wi[k])));
      }
      const outlookStrip = () => `<div class="x-kpis">${OUT.map((t) => `<button class="x-card x-kpi" data-tab="fc"><b>${t.v}${t.u ? " " + t.u : ""}</b><span>${t.l} · Oct month-end</span><span class="x-src">vs budget ${t.bt} · range ${t.r}</span></button>`).join("")}</div>`;
      const gauge = ([l, v, lim, t]) => `<div class="x-gauge x-${t}"><svg viewBox="0 0 120 66" aria-hidden="true"><path class="x-g0" d="M10 60A50 50 0 0 1 110 60" pathLength="100"/><path d="M10 60A50 50 0 0 1 110 60" pathLength="100" stroke-dasharray="${Math.min(100, (v / lim) * 100).toFixed(1)} 100"/></svg><b>${v}</b><span>${l} · limit ${lim}</span>${tag(`${Math.round((v / lim) * 100)}% of limit`, t)}</div>`;
      const kmo = (v) => "₹" + (v / 1000).toFixed(1) + "k";
      const MONTHS = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
      const lakh = (v) => "₹" + (v / 1e5).toFixed(1) + " L";
      const TROPHY = `<svg class="x-ic x-trophy" viewBox="0 0 24 24" role="img" aria-label="Trophy"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6"/></svg>`;
      /* Shifts ranked; 7-day output adds up to PM-1's daily totals (92 … 98 MT). */
      const SHIFTS = [
        { n: "Shift A", mt: 36, br: 3.4, dt: 10, st: 2.5, tr: [33, 35, 35, 31, 34, 33, 36] },
        { n: "Shift C", mt: 32, br: 4.0, dt: 25, st: 2.6, tr: [31, 33, 34, 30, 32, 31, 32] },
        { n: "Shift B", mt: 30, br: 5.1, dt: 52, st: 2.8, tr: [28, 31, 32, 27, 31, 29, 30] },
      ];
      /* Grades: MT month to date, realisation ₹/MT, margin ₹/MT (cost = r − m). */
      const GRADES = [
        { bf: 16, mt: 300, r: 26800, m: 2100 }, { bf: 18, mt: 380, r: 28200, m: 3500 }, { bf: 20, mt: 160, r: 29600, m: 4300 },
        { bf: 22, mt: 110, r: 31000, m: 5200 }, { bf: 24, mt: 70, r: 32400, m: 5600 }, { bf: 28, mt: 50, r: 33900, m: 4900 },
      ];
      const CUST = [
        ["Shah Packaging <small>Chh. Sambhaji Nagar · ₹7.6 L overdue</small>", 330, "16–18 BF", 2900],
        ["Deccan Corrugators <small>Pune</small>", 290, "22–24 BF", 4900],
        ["Western Cartons <small>Nashik</small>", 220, "20–22 BF", 4600],
        ["Godavari Boxes <small>Chh. Sambhaji Nagar</small>", 150, "18–20 BF", 3800],
        ["Ajanta Packwell <small>Jalna</small>", 60, "24–28 BF", 5300],
      ];
      /* Headline numbers shared by the phone view and the TV wall. */
      const TOP = [
        ["98", "/ 110 MT", "Production today · 89%", 1], ["₹25,400", "/MT", "Cost per tonne"], ["₹29,500", "/MT", "Price per tonne"],
        ["₹4,100", "/MT", "Margin", 1], ["₹62.4 L", "", "Cash in bank", 1], [() => String(excRows().filter((r) => r.s !== "done").length), "", "Exceptions open", 1],
      ];
      const tiles = (A) => A.map(([v, u, l]) => `<div class="x-card x-static"><b>${typeof v === "function" ? v() : v}${u ? `<small>${u}</small>` : ""}</b><span>${l}</span></div>`).join("");
      const P7 = [92, 99, 101, 88, 97, 93, 98], DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

      function excRows() {
        const b = D.bills.find((x) => x.no === "SGWP/0871"), t = truck("IN-1042"), rate = Math.round(250240 / 18.4);
        return [
          { s: "crit", area: "Production", issue: "PM-1 Kraft web breaks — 1h 27m downtime", d: "18 BF 120 GSM · 98 of 110 MT · Machine log 10:15", impact: "12 MT short of target", owner: "GM Works", age: "1h 20m", at: 'data-tab="pq"', btn: "See machine" },
          { s: "warn", area: "Raw material", issue: "Imported OCC container arrival due 16 Oct — cover 5 days", d: "Store ledger 08:00", impact: "Bridge order needed", owner: "Purchase Head", age: "Today", at: 'data-tab="rm"', btn: "See stock" },
          { s: isHold(t) ? "warn" : "done", area: "Raw material QC", issue: "QC hold · MH20 EL 7788 — moisture 14%", d: "Om Sai Recyclers · IN-1042 · App live", impact: "1 load held at gate", owner: "QC Manager", age: "1h 32m", at: 'data-truck="IN-1042"', btn: "Open journey" },
          { s: "crit", area: "Receivables", issue: "Shah Packaging overdue", d: "64 days past due · DataMan ageing 10:30", impact: "₹7,60,000 overdue", owner: "Sales Head", age: "64 days", at: 'data-tab="money"', btn: "See ageing" },
          { s: isExc(b) ? "warn" : "done", area: "Payables", issue: "Bill SGWP/0871 — quantity mismatch", d: "Invoice 18.40 MT vs accepted 17.95 MT · App live", impact: `${inr(b.amt - Math.round(17.95 * rate))} over GRN`, owner: "Accounts Head", age: "1 day", at: 'data-bill="SGWP/0871"', btn: "Review match" },
          { s: "warn", area: "Compliance", issue: "ETP COD 238 vs limit 250 — near limit", d: "Lab entry 09:00", impact: "95% of consent limit", owner: "EHS Officer", age: "1h 30m", at: 'data-tab="comp"', btn: "See ETP" },
        ];
      }
      const SEV = { crit: ["crit", "Critical"], warn: ["warn", "Warning"], done: ["ok", "Resolved"] };
      function exceptions() {
        const R = excRows(), cols = ["Area", "Issue", "Impact", "Owner", "Age", "Action"];
        return `<div class="table-wrap x-exc"><table><thead><tr>${cols.map((c) => `<th scope="col">${c}</th>`).join("")}</tr></thead><tbody>${R.map((r) => `<tr${r.s === "done" ? ' class="is-done"' : ""}>
          <th scope="row">${r.area}<small class="x-sev x-${SEV[r.s][0]}">${SEV[r.s][1]}</small></th>
          <td data-label="Issue">${r.issue}<small>${r.d}</small></td><td data-label="Impact">${r.impact}</td><td data-label="Owner">${r.owner}</td>
          <td data-label="Age" class="num">${r.age}</td><td data-label="Action"><button class="btn x-act" ${r.at}>${r.btn}</button></td></tr>`).join("")}</tbody></table></div>`;
      }

      function mis() {
        const X = excRows().filter((r) => r.s !== "done");
        return `<article class="x-mail" aria-label="Daily MIS email preview">
          <dl class="x-mail__hd"><dt>From</dt><dd>MIS · Kaygaon Paper Mills</dd><dt>To</dt><dd>Managing Director</dd><dt>Sent</dt><dd>Sun 11 Oct 2026 · 9:00 AM IST</dd>
            <dt>Subject</dt><dd class="x-mail__sub">Daily MIS — 11 Oct 2026 · PM-1 Kraft 89% of target · ${X.length} exceptions</dd></dl>
          <div class="x-mail__bd"><p>Dear Akshay ji,</p><p>Headline figures for Sunday 11 October 2026 (sample data):</p>
            ${table(["Measure", "Value"], [
              { num: [1], c: ["Production", "98 / 110 MT <small>89% of target</small>"] },
              { num: [1], c: ["Cost per tonne", "₹25,400 / MT <small>▼ 0.8% vs last month</small>"] },
              { num: [1], c: ["Realisation", "₹29,500 / MT"] },
              { num: [1], c: ["Margin", "₹4,100 / MT"] },
              { num: [1], c: ["Cash in bank", "₹62,40,000"] },
              { num: [1], c: ["Collections due · this week", "₹26,20,000"] },
              { num: [1], c: ["Payments due · this week", "₹20,50,000"] },
            ])}
            <p><strong>Exceptions requiring attention</strong></p>
            <ol>${X.map((r) => `<li>${r.issue} — ${r.impact}. Owner: ${r.owner}.</li>`).join("")}</ol>
            <p class="fineprint">Generated automatically from the dashboard at 9:00 AM.</p></div></article>`;
      }

      const PER = { today: { l: "Today", p: 1, f: 1, fl: "this week" }, mtd: { l: "MTD", p: 11, f: 1.6, fl: "MTD" }, ytd: { l: "YTD", p: 194, f: 28, fl: "YTD" } };
      const TABS = {
        ov: ["Overview", "Are we making money today?"],
        pq: ["Production & Quality", "Are the machines making good paper?"],
        cost: ["Cost", "Where each tonne's cost goes."],
        grade: ["Profit by grade", "Which grades make us the most money?"],
        rm: ["Raw material", "Enough fibre, at the right price?"],
        sd: ["Sales & Dispatch", "Is paper leaving the gate?"],
        money: ["Money", "Who owes us, and whom we owe."],
        comp: ["Compliance & People", "Safe, within limits, fully staffed?"],
        fc: ["Forecast & Planning", "Where will October land?"],
      };

      const panels = {
        ov() {
          const K = kpis(), sel = K.find((k) => k.k === D.kpi);
          const P = PER[D.period], mt = (v) => Math.round(v * P.p).toLocaleString("en-IN"), fl = (v) => inr(v * P.f), today = D.period === "today";
          const H = [
            [`Production · PM-1 Kraft · ${P.l}`, big(mt(98), `/ ${mt(110)} MT target`), sub(vsb(98, 110)) + sub(`${today ? arrow(1, "5.4% vs yesterday", true) + " · " : ""}89% of target`) + meter(98, 110, "warn"), "DataMan export · 10:30"],
            ["Cost per tonne", big("₹25,400", "/MT"), sub(vsb(25400, 25800, true)) + sub(`${arrow(-1, "0.8%", true)} vs last month`) + spark([26300, 26050, 25900, 25800, 25600, 25400]), "Cost sheet · 10:30"],
            ["Price we got per tonne", big("₹29,500", "/MT"), sub(vsb(29500, 29300)) + sub(`${arrow(1, "0.8%", true)} vs last month`) + spark([29000, 29100, 29050, 29300, 29260, 29500]), "Sales invoices · 10:30"],
            ["Profit per tonne", big("₹4,100", "/MT"), sub(vsb(4100, 3700)) + sub(`${arrow(1, "12.0%", true)} vs last month · price − cost`) + spark([2700, 3050, 3150, 3500, 3660, 4100]), "Computed in app"],
            ["Cash in bank", big("₹62,40,000"), sub(vsb(6240000, 6000000)) + sub(`${arrow(1, "3.4%", true)} vs yesterday`) + spark([57900, 59800, 58900, 60800, 60350, 62400]), "Bank statement · 09:00"],
            [`Money coming in vs going out · ${P.fl}`, big("+" + fl(570000), "more coming in"), sub(vsb(570000, 500000)) + hbars([{ l: "Customers due to pay us", v: 2620000, txt: fl(2620000) }, { l: "We are due to pay", v: 2050000, txt: fl(2050000), t: "warn" }]), "DataMan ageing · 10:30"],
          ];
          const FR = [["Gate & QC", "live", "ok"], ["DataMan vouchers", "10:30", "ok"], ["Payables", "yesterday 18:00", "warn"], ["Production register", "10:00", "ok"], ["Lab / ETP", "09:00", "ok"]];
          const AB = [["Company", "Kaygaon Paper Mills Pvt Ltd"], ["Incorporated", "10 Apr 1989 · commercial production since 1992"], ["Products", "Kraft paper 14 BF to 28 BF (mostly lower BF) for corrugated boxes"], ["Capacity", "36,000 MT per annum · grew from 4,500 MTPA"], ["Plant", "Gut No. 184, Kaygaon, Tal. Gangapur, Chh. Sambhaji Nagar (NH 753F)"], ["Corporate office", "Adalat Road, Aurangabad"], ["Size", "Medium enterprise"], ["Managing Director", "Akshay Rathi"]];
          return `<p class="x-hello">Good morning, Akshay ji — here's Kaygaon today</p>
            <div class="links"><button class="btn x-act" data-act="mis" aria-expanded="${D.mis}">${D.mis ? "Hide" : "Preview"} Daily MIS — 9:00 AM</button></div>
            ${D.mis ? mis() : ""}
            <div class="x-grid">${H.map(([l, ...rest]) => card(l, rest.slice(0, -1).join(""), rest[rest.length - 1])).join("")}</div>
            <p class="fineprint">${today ? "Showing today." : `${P.l} scales today's production ×${P.p} and this week's flows ×${P.f}.`} Per-tonne figures and cash do not change with the period. Budgets are sample figures.</p>
            <div class="x-sec"><h3 class="x-h3">Month-end outlook · October ${tag(FC, "data")}</h3>${outlookStrip()}<p class="fineprint">Tap a tile for Forecast &amp; Planning.</p></div>
            <div class="x-sec"><h3 class="x-h3">Things that need your attention</h3>${exceptions()}</div>
            <div class="x-sec"><h3 class="x-h3">Trucks coming in &amp; bills</h3>
              <div class="x-strip">Papers reach head office the same day, not 2–3 days later <small>Receipt packet sent from the app</small></div>
              <p class="x-sub">Bills passed same day: 3 of 3 (sample)</p>
              <div class="x-kpis">${K.map((k) => `<button class="x-card x-kpi" data-kpi="${k.k}" aria-pressed="${D.kpi === k.k}"><b>${k.val}</b><span>${k.label}</span><span class="x-src">${k.src}</span></button>`).join("")}</div>
              <p class="fineprint">Tap a card to see its records.</p>
              ${sel ? `<div><h3 class="x-h3">${sel.label.split(" · ")[0]}</h3>${sel.list()}</div>` : ""}
            </div>
            ${card(`About Kaygaon ${tag("Public records", "data")}`, `<dl class="x-facts">${AB.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>`, "Public records · operating figures on this page are sample data")}
            <div class="x-panel"><h3 class="x-ct">How fresh is this data?</h3><ul class="x-fresh">${FR.map(([l, t, s]) => `<li class="x-${s}"><i></i>${l}<span>${t}${s === "warn" ? " · late" : ""}</span></li>`).join("")}</ul></div>`;
        },
        pq() {
          return `<div class="x-grid x-grid--2">
              ${card(`PM-1 Kraft · 18 BF 120 GSM ${tag("Running · 420 m/min")}`, big("98", "/ 110 MT") + meter(98, 110, "warn") + sub(`89% of target · ${tag("Downtime 1h 27m", "crit")}`), "DataMan export · 10:30")}
              ${card("Grades made today · MT", hbars([{ l: "18 BF · 120 GSM", v: 62, txt: "62 MT" }, { l: "16 BF · 100 GSM", v: 36, txt: "36 MT" }]) + sub("Next on PM-1: 22 BF · 150 GSM from 14:00"), "Production register · 10:00")}
            </div>
            <div class="x-grid">
              ${card("Machine efficiency", big("87%") + sub(`${arrow(-1, "2 pts", false)} vs 7-day average`) + spark([90, 89, 91, 86, 89, 89, 87], "warn"), "DataMan export · 10:30")}
              ${card("Broke", big("4.2%") + sub("of today's production") + spark([3.8, 4.0, 3.6, 4.5, 3.9, 4.1, 4.2], "warn"), "DataMan export · 10:30")}
              ${card("Quality pass", big("96.5%") + sub("GSM, BF and moisture tests") + spark([95.8, 96.2, 97.1, 95.4, 96.8, 96.9, 96.5]), "Lab entry · 09:00")}
            </div>
            <div class="x-grid x-grid--2">
              ${card("PM-1 production · last 7 days, MT", cols([92, 99, 101, 88, 97, 93, 98], ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], 110), "DataMan export · 10:30")}
              ${card("Top downtime causes · today", hbars([{ l: "Web breaks", v: 52, txt: "0h 52m", t: "crit" }, { l: "Felt change", v: 25, txt: "0h 25m", t: "warn" }, { l: "Power cut", v: 10, txt: "0h 10m", t: "warn" }]), "Machine log · 10:15")}
              ${card("Loss tonnes today", big("12.0", "MT lost") + hbars([{ l: "Downtime", v: 6.2, txt: "6.2 MT", t: "crit" }, { l: "Broke", d: "Paper made but scrapped", v: 4.1, txt: "4.1 MT", t: "warn" }, { l: "QC rejects", v: 1.7, txt: "1.7 MT", t: "warn" }]), "Production register · 10:00")}
            </div>
            <div class="x-sec"><h3 class="x-h3">Shift leaderboard · today</h3>
              <div class="x-grid">${SHIFTS.map((s, i) => card(`#${i + 1} · ${s.n}${i ? "" : ` <span class="x-tag x-warn">${TROPHY} Leader</span>`}`, big(s.mt, "MT") + `<dl class="x-facts"><dt>Broke</dt><dd>${s.br}%</dd><dt>Downtime</dt><dd>${s.dt} min</dd><dt>Steam per tonne</dt><dd>${s.st} T</dd></dl>` + spark(s.tr, i ? (i === 2 ? "warn" : "data") : "ok") + sub(`Output, last 7 days · ${Math.min(...s.tr)}–${Math.max(...s.tr)} MT`), "Production register + boiler log · 10:00")).join("")}</div>
              <p class="fineprint">Ranked on output, then broke and downtime. The three shifts add up to today's 98 MT.</p></div>`;
        },
        grade() {
          const ms = GRADES.map((g) => g.m), best = Math.max(...ms), worst = Math.min(...ms);
          const CU = CUST.map(([n, mt, gr, m]) => ({ n, mt, gr, m, p: mt * m })).sort((a, b) => b.p - a.p);
          return `<div class="x-grid x-grid--2">
              ${card("Margin per tonne by grade · October", hbars(GRADES.map((g) => ({ l: `${g.bf} BF`, d: `${inr(g.r)} realised − ${inr(g.r - g.m)} cost`, v: g.m, max: 6000, t: g.m === best ? "ok" : g.m === worst ? "crit" : "data", txt: `${inr(g.m)}/MT${g.m === best ? " " + tag("Best") : g.m === worst ? " " + tag("Weakest", "crit") : ""}` }))), "Sales register + cost sheet · 10:30")}
              <div class="x-sec">
                <div class="x-strip">Shift mix to 22–24 BF to add ≈ ₹9 L/month (sample estimate) <small>Moving ≈ 350 MT/month from 16–18 BF (avg margin ≈ ₹2,800/MT) to 22–24 BF (≈ ₹5,400/MT)</small></div>
                ${card("Realisation rises with BF", big("₹26,800 → ₹33,900", "/MT") + sub("16 BF to 28 BF · cost rises more slowly until 24 BF, so margin peaks there") + spark(GRADES.map((g) => g.r)), "Sales invoices · October")}
              </div>
            </div>
            ${card("Profit by grade · month to date", table(["Grade", "MT this month", "Realisation ₹/MT", "Cost ₹/MT", "Margin ₹/MT", "Margin earned"], GRADES.map((g) => ({ hl: g.m === best, num: [1, 2, 3, 4, 5], c: [`${g.bf} BF`, g.mt + " MT", inr(g.r), inr(g.r - g.m), inr(g.m), lakh(g.mt * g.m)] }))), "Sales register + cost sheet · 10:30")}
            ${card("Top 5 customers by profit · October", table(["Customer", "MT", "Main grades", "Margin ₹/MT", "Profit"], CU.map((c, i) => ({ hl: !i, num: [1, 3, 4], c: [`${i + 1}. ${c.n}`, c.mt + " MT", c.gr, inr(c.m), lakh(c.p)] }))), "DataMan sales register + cost sheet · 10:30")}`;
        },
        cost() {
          const C = [["Fibre", 15600, "Domestic + imported OCC"], ["Steam / coal", 3300], ["Power", 3500, "520 kWh/MT"], ["Starch & chemicals", 2100], ["Water & others", 900, "Water 12 m³/MT"]];
          return `<div class="x-grid x-grid--2">
              ${card(`Cost per tonne ${arrow(-1, "0.8% vs Sep", true)}`, big("₹25,400", "/MT") + hbars(C.map(([l, v, d]) => ({ l, d, v, txt: `${inr(v)} · ${Math.round((v / 25400) * 100)}%` }))), "Cost sheet · 10:30")}
              ${card("Cost per tonne · last 6 months", trendChart([26300, 26050, 25900, 25800, 25600, 25400], MONTHS, kmo, "ok") + sub("₹26,300 in May → ₹25,400 in Oct"), "Cost sheet · monthly")}
            </div>`;
        },
        rm() {
          const S = [["Domestic OCC", 9, "ok"], ["Imported OCC", 5, "warn"], ["Mixed waste paper", 6, "warn"], ["Starch & chemicals", 12, "ok"]];
          const sc = [["Shree Ganesh Waste Paper", "1.8%", "2.4%", "92%"], ["Om Sai Recyclers", "4.6%", "3.9%", "78%"], ["Patil Kraft", "1.2%", "1.9%", "95%"], ["Maruti Paper Mart", "2.1%", "2.2%", "88%"], ["Sahyadri Agro Fibres", "3.0%", "3.1%", "84%"]];
          return `<div class="x-grid x-grid--2">
              ${card("Stock · days of cover", hbars(S.map(([l, v, t]) => ({ l, v, t, max: 15, txt: `${v} days${t === "ok" ? "" : " " + tag(t === "crit" ? "Critical" : "Low", t)}` }))), "Store ledger · 08:00")}
              ${card(`Domestic OCC purchase price ${arrow(1, "4.2% in 6 months", false)}`, big("₹13,600", "/MT") + trendChart([13050, 13150, 13200, 13350, 13480, 13600], MONTHS, kmo, "warn"), "Purchase orders · monthly")}
            </div>
            <div class="x-strip x-warn">Imported OCC container arrival due 16 Oct — cover 5 days <small>Store ledger · 08:00</small></div>
            ${card("Supplier scorecard · last 30 days", table(["Supplier", "Rejection", "Avg moisture deduction", "On time"], sc.map((c) => ({ c, hl: c[0] === "Om Sai Recyclers", num: [1, 2, 3] }))), "App QC + GRN · 30 days")}`;
        },
        sd() {
          const cu = [["Shah Packaging <small>Chh. Sambhaji Nagar</small>", "330 MT", `${inr(760000)} ${tag("64 days", "crit")}`], ["Deccan Corrugators <small>Pune</small>", "290 MT", inr(200000)], ["Western Cartons <small>Nashik</small>", "220 MT", "—"], ["Godavari Boxes <small>Chh. Sambhaji Nagar</small>", "150 MT", inr(90000)]];
          const FG = [["16 BF", "100–120 GSM", 85], ["18 BF", "120–140 GSM", 140], ["20 BF", "120–150 GSM", 80], ["22 BF", "140–160 GSM", 55], ["24 BF", "150–180 GSM", 40], ["28 BF", "160–180 GSM", 20]];
          return `<div class="x-grid">
              ${card("Order book", big("1,450", "MT") + sub("≈ 14 days of production") + spark([1310, 1350, 1380, 1410, 1430, 1450]), "DataMan sales orders · 10:30")}
              ${card("Dispatch today", big("92", "/ 105 MT plan") + meter(92, 105, "warn") + sub(`${arrow(-1, "13 MT short", false)} 88% of plan`), "Weighbridge · 11:00")}
              ${card("Finished goods stock · kraft", hbars(FG.map(([l, d, v]) => ({ l, d, v, txt: v + " MT" }))) + sub("420 MT in total · mostly lower BF"), "FG store · 08:00")}
            </div>
            ${card("Top customers · corrugated box makers · October", table(["Customer", "This month", "Overdue"], cu.map((c) => ({ c, hl: c[0].startsWith("Shah"), num: [1] }))), "DataMan sales register · 10:30")}`;
        },
        money() {
          const ag = (a) => hbars([["0–30 days", a[0], "ok"], ["30–60 days", a[1], "warn"], ["60+ days", a[2], "crit"]].map(([l, v, t]) => ({ l, v, t, txt: inr(v) })), 20500000);
          const EX = D.bills.filter(isExc), WC = [[lakh(EX.reduce((s, b) => s + b.amt, 0)), `Money stuck in blocked bills · ${EX.length} bill${EX.length === 1 ? "" : "s"}`, "App live", 'data-go="grn"'], ["₹1.9 Cr", "Stock value", "Store ledger · 08:00"], ["₹1.05 Cr", "Customers overdue (past 30 days)", "DataMan ageing · 10:30"]];
          return `<div class="x-sec"><h3 class="x-h3">Working capital</h3><div class="x-kpis">${WC.map(([v, l, s, a]) => a ? `<button class="x-card x-kpi" ${a}><b>${v}</b><span>${l}</span><span class="x-src">${s} · tap to open bills</span></button>` : `<div class="x-card x-kpi x-static"><b>${v}</b><span>${l}</span><span class="x-src">${s}</span></div>`).join("")}</div></div>
            <div class="x-grid">
              ${card("Sales · this month so far", big("₹2,98,00,000"), "DataMan sales register · 10:30")}
              ${card("Left after material & running costs · this month", big("₹55,10,000") + sub("18.5% of sales"), "Computed in app")}
              ${card(`Operating profit (EBITDA) · this month ${tag("Estimate – accounts not closed", "warn")}`, big("₹37,30,000") + sub("12.5% of sales"), "Computed in app")}
            </div>
            <div class="x-grid x-grid--2">
              ${card("Money customers owe us · by age", big("₹3,10,00,000", "total") + ag([20500000, 7300000, 3200000]), "DataMan ageing · 10:30")}
              ${card("Money we owe suppliers · by age", big("₹2,20,00,000", "total") + ag([16200000, 4700000, 1100000]), "DataMan ageing · 10:30")}
            </div>`;
        },
        comp() {
          const sh = [["Shift A", 112, 118], ["Shift B", 106, 118], ["Shift C", 98, 110]];
          return `${card("ETP outlet vs consent limits · mg/L", `<div class="x-gauges">${[["COD", 238, 250, "warn"], ["BOD", 28, 30, "warn"], ["TSS", 62, 100, "ok"]].map(gauge).join("")}</div>`, "Lab entry · 09:00")}
            <div class="x-grid">
              ${card("Days since last lost-time incident", big("47", "days") + sub(tag("No LTI this month")), "Safety register · 08:00")}
              ${card("Near-misses this month", big("3") + sub("Reported in October"), "Safety register · 08:00")}
              ${card("Manpower present vs required", hbars(sh.map(([l, v, max]) => ({ l, v, max, t: v / max < 0.92 ? "warn" : "ok", txt: `${v} / ${max} · ${Math.round((v / max) * 100)}%` }))), "Biometric attendance · 11:00")}
            </div>`;
        },
        fc() {
          const N = (k) => Array(k).fill(null), lab = Array.from({ length: 31 }, (_, i) => String(i + 1)), fv = [...N(10), 98, ...PF];
          const lo = fv.map((v, i) => (v == null ? null : +(v - (i - 10) * 0.35).toFixed(1))), hi = fv.map((v, i) => (v == null ? null : +(v + (i - 10) * 0.35).toFixed(1)));
          const prod = xc("fcp", { lab, lines: [{ v: [...PA, ...N(20)] }, { v: fv, c: "is-fc" }], band: { lo, hi }, refs: [{ v: 97, l: "Budget 97 MT/day" }], aria: "PM-1 actual production 86 to 101 MT a day from 1 to 11 October, forecast about 91 MT a day to 31 October, below the 97 MT budget" },
            "Daily MT, October · actual 1–11 Oct, forecast 12–31 Oct", [["Actual", "var(--x-data)", "is-line"], ["Forecast", "var(--x-data)", "is-line is-dash"], ["Likely range", "color-mix(in srgb, var(--x-data) 12%, transparent)"], ["Budget", "var(--chart-reference)", "is-line is-dash"]]);
          const cash = xc("fcc", { lab: CASH.close.map((_, i) => "W" + (i + 1)), zero: true, hl: 5, note: [5, 0.31, "Low ₹0.31 Cr"], fmt: (v) => "₹" + v, bars: [{ v: CASH.inf, c: "x-bi" }, { v: CASH.out, c: "x-bo" }], lines: [{ v: CASH.close, c: "is-cash", dots: true }], aria: "Weekly inflows of ₹1.72 to 2.04 Cr against outflows of ₹1.76 to 1.99 Cr; closing cash falls from ₹0.56 Cr to a low of ₹0.31 Cr in week 6, then recovers to ₹0.60 Cr by week 13" },
            "₹ Cr per week · 13 weeks from 12 Oct", [["Inflow", "var(--x-data)"], ["Outflow", "#b8c1cc"], ["Closing cash", "var(--x-navy)", "is-line"], ["Lowest week", "color-mix(in srgb, var(--x-warn) 30%, #fff)"]]);
          const rm = [
            ["Domestic OCC", "9 days", "20 Oct", `₹13,600 → ₹14,100 /MT ${tag("▲ 3.7%", "warn")}<small>Nov ₹13,800 · Dec ₹13,950 · Jan ₹14,100</small>`],
            ["Imported OCC", `5 days ${tag("Low", "warn")}`, "16 Oct", "Container due 16 Oct"],
            ["Mixed waste paper", `6 days ${tag("Low", "warn")}`, "17 Oct", "Not forecast"],
            ["Starch & chemicals", "12 days", "23 Oct", "Not forecast"],
          ];
          const o = wiOut(), sl = (k, l, min, max, hint) => `<label>${l}<output id="wo-${k}">${k === "e" ? D.wi.e + "%" : pct(D.wi[k])}</output><input type="range" min="${min}" max="${max}" step="1" value="${D.wi[k]}" data-wi="${k}" /><small>${hint}</small></label>`;
          return `<p>${tag(FC, "data")}</p>
            <div class="x-grid">${OUT.map((t) => card(`${t.l} · Oct month-end`, big(t.v.replace(/ Cr$/, ""), t.u || "Cr") + sub(vsb(t.a, t.b)) + meter(t.a, t.b, "warn") + sub(`Budget ${t.bt} · range ${t.r}`), FC)).join("")}</div>
            ${card(`Year-end projection · FY 2026-27 ${tag(FC, "data")}`, `<div class="x-grid">
                <div class="x-fc">${big("33,600", "/ 36,000 MT capacity")}${meter(33600, 36000)}${sub("93% of capacity · range 32,800–34,300 MT")}</div>
                <div class="x-fc">${big("₹99", "Cr revenue")}${sub("Range ₹95–103 Cr")}</div>
                <div class="x-fc">${big("₹12.4", "Cr EBITDA")}${sub("Range ₹11.2–13.6 Cr · 12.5% of revenue")}</div></div>`, "App + DataMan history · model estimate")}
            ${card(`Production forecast · October ${tag(FC, "data")}`, prod + sub("PM-1 lands at 2,860 MT (range 2,780–2,930) at about 91 MT/day for the rest of October, against the 3,000 MT budget (97 MT/day)."), "App + DataMan production history")}
            ${card(`13-week cash forecast ${tag(FC, "data")}`, cash + sub(`Cash dips to ${tag("₹0.31 Cr in week 6 · w/c 16 Nov", "warn")} before collections lift it to ₹0.60 Cr by week 13.`), "DataMan ageing + bank · model estimate")}
            ${card(`Raw material outlook ${tag(FC, "data")}`, table(["Material", "Days of cover", "Runs out at current use", "Price · next 3 months"], rm.map((c) => ({ c, hl: c[0] === "Imported OCC" }))) + `<div class="x-strip x-warn">Imported OCC container arrival due 16 Oct — cover 5 days</div>`, "Store ledger + purchase orders · model estimate")}
            <div class="x-panel"><h3 class="x-ct">What-if · October month-end ${tag(FC, "data")}</h3>
              <div class="x-grid x-grid--2">
                <div class="x-wi">
                  ${sl("o", "OCC price", -15, 15, "Fibre ₹15,600/MT of paper · ±15%")}
                  ${sl("s", "Selling price", -10, 10, "Base ₹29,500/MT · ±10%")}
                  ${sl("e", "PM-1 efficiency", 80, 95, "80–95% · base 87%")}
                  ${sl("c", "Coal price", -20, 20, "Steam / coal ₹3,300/MT of paper · ±20%")}
                  <div class="links"><button class="btn x-act" data-act="wireset">Reset to base</button></div>
                </div>
                <div class="x-fc" aria-live="polite">
                  <article class="x-card"><h3 class="x-ct">Month-end EBITDA</h3><p class="x-big" id="wi-eb">${o.eb}</p><p class="x-sub" id="wi-ebd">${o.ebd}</p></article>
                  <article class="x-card"><h3 class="x-ct">Margin per tonne</h3><p class="x-big"><span id="wi-m">${o.m}</span><small>/MT</small></p><p class="x-sub" id="wi-md">${o.md}</p></article>
                </div>
              </div>
              <p class="fineprint">Simple linear model. Margin/MT = ₹4,100 − ₹15,600 fibre × OCC change + ₹29,500 × selling-price change − ₹3,300 × coal change. Production scales with efficiency (2,860 MT at 87%). EBITDA = production × margin − ₹0.12 Cr fixed costs.</p>
            </div>
            <p class="fineprint">Forecasts are statistical estimates from historical app and DataMan data; accuracy improves after 6–12 months of clean data.</p>`;
        },
      };

      const head = (eyebrow, h, sub) => `<div class="head"><p class="head__eyebrow">${eyebrow}</p><h2>${h}</h2>${sub ? `<p class="head__sub">${sub}</p>` : ""}</div>`;

      const screens = {
        dash() {
          if (!TABS[D.tab]) D.tab = "ov";
          return `${head(`MD Dashboard · ${TABS[D.tab][0]}`, TABS[D.tab][1], "All figures are sample data.")}
            <div class="x-tabs" role="tablist" aria-label="Dashboard views">${Object.keys(TABS).map((k) => `<button role="tab" aria-selected="${D.tab === k}" data-tab="${k}">${TABS[k][0].replace("&", "&amp;")}</button>`).join("")}</div>
            ${panels[D.tab]()}`;
        },
        gate() {
          const opt = (a) => a.map((s) => `<option>${s}</option>`).join("");
          return `${head("Gate Entry", "Log a truck as it arrives.", `Next ID: IN-${D.next}`)}
            <form class="x-form" id="gate-form">
              <label class="x-field">Vehicle no.<input name="veh" required placeholder="MH15 AB 1234" /></label>
              <label class="x-field">Supplier<select name="sup">${opt(D.suppliers)}</select></label>
              <label class="x-field">Material<select name="mat">${opt(D.materials)}</select></label>
              <label class="x-field">Invoice no.<input name="inv" placeholder="SGWP/0920" /></label>
              <label class="x-field">Invoice weight (MT)<input name="mt" type="number" step="0.1" min="0" placeholder="16.5" /></label>
              <div class="x-full"><div class="x-thumbs" id="thumbs">${thumbs()}</div></div>
              <div class="links x-full"><button type="button" class="btn x-act" data-act="photo">Add document photo</button><button type="submit" class="btn x-act x-primary">Submit</button></div>
            </form>
            ${wbTicket()}`;
        },
        qc() {
          const list = D.trucks.filter((t) => t.stage === "At gate" || t.stage === "At weighbridge" || t.stage === "QC in progress" || isHold(t));
          if (!list.find((t) => t.id === D.qcSel)) D.qcSel = list[0] ? list[0].id : null;
          const t = truck(D.qcSel);
          return `${head("QC", "Test the load, then accept, hold or reject.", "Sample limit 10% / 2% — set by plant")}
            ${RULE}
            ${t ? `<div class="x-form">
              <label class="x-field x-full">Truck<select data-sel="qcSel">${list.map((x) => `<option value="${x.id}"${x.id === t.id ? " selected" : ""}>${x.id} · ${x.veh} · ${x.sup}</option>`).join("")}</select></label>
              <p class="x-full">${t.mat} · ${stageChip(t)}</p>
              <label class="x-field">Moisture %<input id="moist" type="number" step="0.1" min="0" value="${isHold(t) ? 14 : 9.5}" /></label>
              <label class="x-field">Contamination %<input id="cont" type="number" step="0.1" min="0" value="1.5" /></label>
              <p class="fineprint x-full">Sample limit 10% moisture / 2% contamination — set by plant.</p>
              <div class="links x-full"><button class="btn x-act x-primary" data-qc="accept">Accept</button><button class="btn x-act" data-qc="hold">Hold</button><button class="btn x-act" data-qc="reject">Reject</button></div>
            </div>` : `<p class="fineprint">No trucks waiting for QC.</p>`}`;
        },
        grn() {
          const acc = D.trucks.filter(isAcc);
          if (!acc.find((t) => t.id === D.grnSel)) D.grnSel = acc[0] ? acc[0].id : null;
          const t = truck(D.grnSel), docs = ["GRN", "Invoice", "Weighbridge slip", "QC report"];
          return `${head("GRN &amp; Bills", "Build the packet, then match the bill.", "Corporate gets the packet the same day.")}
            <div><h3 class="x-h3">Accepted trucks</h3>${t ? `<form class="x-form" id="grn-form">
              <label class="x-field">Truck<select data-sel="grnSel">${acc.map((x) => `<option value="${x.id}"${x.id === t.id ? " selected" : ""}>${x.id} · ${x.sup}</option>`).join("")}</select></label>
              <label class="x-field">GRN no.<input name="grn" value="GRN-${D.grnNo}" /></label>
              <div class="x-checks x-full">${docs.map((d) => `<label><input type="checkbox" name="doc" /> ${d}</label>`).join("")}</div>
              <div class="links x-full"><button type="submit" class="btn x-act x-primary" id="publish" disabled>Publish to corporate</button></div>
            </form>` : `<p class="fineprint">No accepted trucks waiting for a GRN.</p>`}</div>
            ${grnDoc()}
            ${billPass()}
            <div><h3 class="x-h3">Bills queue</h3>${billTable(D.bills)}</div>
            ${D.billOpen ? match(D.bills.find((b) => b.no === D.billOpen)) : ""}
            <div class="x-panel"><div class="links"><button class="btn x-act" data-act="import">Import DataMan voucher export (sample)</button></div>${D.importMsg ? `<p>${D.importMsg}</p>` : ""}</div>`;
        },
        journey() {
          const t = truck(D.jSel) || D.trucks[0], done = t.t.length;
          return `${head("Truck Journey", `${t.id} · ${t.veh}`, `${t.sup} · ${t.mat}`)}
            <label class="x-field" style="max-width:360px">Truck<select data-sel="jSel">${D.trucks.map((x) => `<option value="${x.id}"${x.id === t.id ? " selected" : ""}>${x.id} · ${x.veh}</option>`).join("")}</select></label>
            <ol class="timeline">${D.steps.map((s, i) =>
              i < done ? `<li class="x-done"><p class="timeline__when">${s}</p><div class="timeline__what">${t.t[i]}</div><p>${chip("Done")}</p></li>`
              : i === done ? `<li class="is-current"><p class="timeline__when">${s}</p><div class="timeline__what">${t.stage}</div><p>${chip("Now", true)}</p></li>`
              : `<li class="x-future"><p class="timeline__when">${s}</p><div class="timeline__what">Not yet</div></li>`).join("")}</ol>`;
        },
        map() {
          const zr = ZR.find((x) => x.id === D.zone) || ZR[0], z = ZONES[zr.id], L = [...new Set(Object.values(ZONES))], n = L.length, warn = L.filter((x) => x.s !== "ok").length, exc = excRows().filter((r) => r.s !== "done").length;
          return `${head("Mill Map", `PM-1 Kraft is running; ${warn} areas need a look.`, `Plant · Gut No. 184, Kaygaon · layout from the evacuation plan board · ${n - warn} of ${n} live areas green · ${exc} exceptions open on the dashboard ${SAMPLE}`)}
            <div class="links" role="group" aria-label="Truck routes">${Object.entries(ROUTES).map(([k, r]) => `<button class="btn x-act x-rt" data-route="${k}" aria-pressed="${D.route === k}">${r.l}</button>`).join("")}</div>
            ${D.route ? `<p class="x-src">${ROUTES[D.route].s}</p>` : ""}
            <aside class="callout" aria-label="Bottleneck"><p class="callout__head">Where trucks queue</p><p class="callout__lead"><strong>One gate, one weighbridge for inward AND despatch — this is where trucks queue.</strong> The app's Truck Yard timers show it live.</p><button class="btn x-act" data-go="yard">Open Truck Yard</button></aside>
            <div class="x-mapwrap">
              <div class="x-map">${millSvg()}</div>
              ${z ? `<aside class="x-panel x-${z.s}" aria-live="polite"><h3 class="x-ct">${zr.n} ${tag(z.st(), z.s)}</h3>
                <dl class="x-facts">${z.k.map(([k, v]) => `<dt>${k}</dt><dd><b>${typeof v === "function" ? v() : v}</b></dd>`).join("")}</dl>
                ${z.go ? `<div class="links"><button class="btn x-act" ${z.go}>${z.gl}</button></div>` : ""}${src(z.src + " · sample")}</aside>`
              : `<aside class="x-panel x-g-${zr.group}" aria-live="polite"><h3 class="x-ct">${zr.n}</h3><dl class="x-facts"><dt>Area type</dt><dd><b>${GROUPS[zr.group][0]}</b></dd></dl><p class="fineprint">No live feed for this area in the demo.</p></aside>`}
            </div>
            <p class="x-leg">${Object.values(GROUPS).map(([l, k]) => `<span><i style="--k:${k}"></i>${l}</span>`).join("")}</p>
            <p class="fineprint">Traced from the plant's emergency evacuation plan board; schematic, not to scale. Dot on an area: green running normally, amber needs a look. Hover or tap an area for its full name.</p>`;
        },
        yard() {
          const late = D.trucks.filter((t) => lane(t) < 4 && waitMin(t) > 90).length;
          return `${head("Truck Yard", `${D.trucks.filter((t) => lane(t) < 4).length} trucks inside the gate${late ? ` · ${late} waiting over 90 min` : ""}.`, `Same trucks as Gate Entry and QC · timers run live · tap a truck for its journey ${SAMPLE}`)}
            <div class="x-lanes">${LANES.map((l, i) => { const L = D.trucks.filter((t) => lane(t) === i); return `<section class="x-lane" aria-label="${l}"><h3>${l}<span>${L.length}</span></h3>${L.map((t) =>
              `<button class="x-card x-tk${waitMin(t) > 90 ? " is-late" : ""}" data-truck="${t.id}" data-since="${t.since}"><b>${t.veh}</b><span>${t.sup}</span><span class="x-sub">${t.mat}${t.mt ? ` · ${t.mt} MT` : ""} · ${t.id}</span><span class="x-sub">${i === 4 ? "In yard" : "Waiting"} <span class="x-wait">${waitTxt(t)}</span></span></button>`).join("") || `<p class="fineprint">Empty</p>`}</section>`; }).join("")}</div>
            <p class="fineprint">Red border: waiting more than 90 minutes in the current lane. Exit holds trucks whose packet is sent or load was rejected.</p>`;
        },
      };
      const LANES = ["Gate", "Weighbridge", "Unloading / QC", "GRN", "Exit"];
      const lane = (t) => (t.stage === "At gate" ? 0 : t.stage === "At weighbridge" ? 1 : isAcc(t) ? 3 : isPkt(t) || isRej(t) ? 4 : 2);
      const waitMin = (t) => (Date.now() - t.since) / 60000;
      const waitTxt = (t) => { const s = Math.max(0, Math.floor((Date.now() - t.since) / 1000)); return `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")}s`; };
      let tick = 0;
      const yardTick = () => {
        clearInterval(tick); tick = 0;
        if (!(D.view === "yard" && !D.ovl) && !(D.ovl === "tv" && D.tvi === 2)) return;
        tick = setInterval(() => document.querySelectorAll("[data-since]").forEach((el) => {
          const t = truck(el.dataset.truck); if (!t) return;
          el.querySelector(".x-wait").textContent = waitTxt(t); el.classList.toggle("is-late", waitMin(t) > 90);
        }), 1000);
      };

      /* Mill Map: Kaygaon plant layout traced from the evacuation plan board, 1000×1000 plan, north up.
         Zones: [id, label ("|" = line break), x, y, w, h, group, full name, circle?, rotation]. */
      const GROUPS = { gate: ["Gate & weighbridge", "#6a6259"], rm: ["Raw material", "#8a6d3b"], pm: ["Paper machines", "#2a63a6"], fg: ["Finished goods & despatch", "#6b4fa0"], pw: ["Power & utilities", "#b4532a"], eff: ["Effluent & water", "#1f7a8c"], sup: ["Support (store, lab, workshop)", "#5f7d3a"] };
      const STRIP = [["bp", "Broke pulp.", "pm", "Broke pulper"], ["ws1", "Workshop", "sup"], ["ws2", "Workshop", "sup"], ["ac", "Panel A/C", "pw", "Electrical panel A/C room"], ["ct", "Cond. tank", "pw", "Cond. tank & pump"], ["tw", "TW screen", "pm", "T.W. pressure screen"], ["vp", "Vac. pump", "pm", "Vacuum pump"], ["sr", "Stock room", "sup"], ["al", "Alum tank", "pm"], ["po", "Poire", "pm"]];
      const ZR = [
        ["gate", "Main gate", 480, 78, 76, 46, "gate", "Main gate & security cabin"], ["wb", "Weigh-|bridge", 560, 84, 80, 136, "gate", "Road weighbridge & ramp"],
        ["canteen", "Canteen", 390, 84, 84, 66, "sup", "Canteen & cycle stand"], ["park", "Parking", 880, 26, 88, 44, "gate", "Parking area (outside)"],
        ["fore", "Despatch|foreyard", 648, 84, 212, 116, "fg", "Despatch foreyard"], ["ss", "Elect.|S/S", 866, 84, 100, 116, "pw", "Elect. room & sub-station"],
        ["bsr2", "BSR Godown No.2", 700, 206, 266, 48, "fg", "BSR Godown No.2 · finished reels"], ["bsr1", "BSR Godown No.1", 700, 260, 266, 48, "fg", "BSR Godown No.1 · finished reels"],
        ...STRIP.map(([id, l, g, n], i) => [id, l, 556, Math.round(318 + i * 32.2), 84, 30, g, n]),
        ["rw2", "Rewinder|PM-2", 646, 318, 80, 40, "pm"], ["rw1", "Rewinder|PM-1", 732, 318, 80, 40, "pm"],
        ["pm2", "Machine|No.2", 646, 362, 80, 238, "pm", "Machine No.2 (PM-2)"], ["pm1", "Machine|No.1", 732, 362, 80, 238, "pm", "Machine No.1 (PM-1 Kraft)"],
        ["cy", "Coal|yard", 818, 318, 62, 82, "pw", "Boiler coal yard"], ["b1", "Boiler|No.1", 818, 406, 62, 64, "pw", "Boiler No.1"], ["ch1", "Chim.", 818, 476, 62, 54, "pw", "Chimney", 1],
        ["vac", "Vacuum", 818, 536, 62, 30, "pm"], ["fp", "Fan pump", 818, 570, 62, 30, "pm"], ["ep", "Elect.|panels", 886, 318, 80, 282, "pw", "Electric panel rooms"],
        ["pmill", "Pulp mills", 646, 606, 166, 34, "pm", "Pulp mills PM-2 & PM-1"], ["pu2", "Pulper|PM-2", 646, 646, 80, 54, "pm", "Pulper PM-2 & conveyor"], ["pu1", "Pulper|PM-1", 732, 646, 80, 54, "pm", "Pulper PM-1 & conveyor"],
        ["rej", "Rejects", 818, 606, 62, 94, "rm", "Pulper rejection yards"], ["wt", "Water|tower", 556, 646, 84, 54, "eff", "Water storage tower", 1], ["lt", "S/S +|LT", 886, 606, 80, 94, "pw", "Electric substation & LT panel rooms"],
        ["rmg", "Raw Material Godown", 556, 708, 410, 142, "rm"], ["otla", "Otla 8×7", 556, 858, 140, 52, "rm"], ["g35", "Godown|35×35", 830, 858, 136, 128, "rm", "Godown 35×35 · imported OCC"],
        ["bag", "Bagasse|shed", 210, 196, 84, 94, "pw", "Bagasse shed"], ["cyb", "Coal yard|+ belt", 300, 196, 120, 54, "pw", "Coal yard & belt conveyor"], ["cc", "Crusher", 426, 196, 68, 54, "pw", "Coal crusher"],
        ["cy2", "Coal yard", 300, 256, 80, 74, "pw"], ["b2", "Boiler|No.2", 386, 256, 108, 74, "pw", "Boiler No.2"], ["esp", "ESP", 210, 296, 84, 44, "pw", "ESP 11×4"], ["scr", "Scrubber", 210, 346, 84, 44, "pw"],
        ["nb", "New boiler|+ turbine", 300, 336, 140, 64, "pw", "Boiler with shed & turbine (new)"], ["nch", "New|chim.", 446, 350, 48, 48, "pw", "New chimney", 1],
        ["ashc", "Ash coll.", 300, 406, 80, 60, "pw", "Ash collection"], ["ro", "RO plant", 386, 406, 108, 60, "eff"], ["ahp", "Ash handling", 110, 396, 184, 70, "pw", "Ash handling plant 12×4"],
        ["kro", "Krofta|plant", 40, 498, 90, 82, "eff", "Krofta plant"], ...[1, 2, 3, 4].map((i) => [`etp${i}`, `ETP-${i}`, i % 2 ? 140 : 204, i < 3 ? 500 : 562, 56, 56, "eff", `ETP-${i}`, 1]),
        ["sl", "Sludge bed", 268, 498, 126, 44, "eff"], ["bwt", "Back|water", 330, 548, 64, 64, "eff", "Back water tank", 1], ["tmp", "Temple", 268, 562, 56, 40, "sup"],
        ["store", "Store", 400, 498, 94, 62, "sup"], ["mnt", "Maint.|shed", 400, 566, 94, 58, "sup", "Maintenance shed"], ["g15", "Godown 35×15", 268, 630, 226, 52, "sup"],
        ["nbld", "New building 120×22", 70, 722, 380, 56, "sup", 0, 0, 12], ["lab", "Paper lab", 300, 830, 100, 56, "sup"], ["conf", "Conf.|hall", 300, 892, 100, 58, "sup", "Conference hall"],
        ["comp", "Compr.|room", 406, 886, 88, 58, "pw", "Compressor room"], ["qtr", "Company|quarters", 40, 830, 130, 100, "sup", "Company quarters"], ["lsh", "Labour|shed", 176, 830, 118, 56, "sup", "Shed for labours"],
        ["stp", "STP", 176, 892, 118, 58, "eff", "Sewage treatment plant"], ["sec2", "West gate", 40, 940, 130, 44, "gate", "Security cabin · west gate"],
      ].map(([id, label, x, y, w, h, group, n, c, rot]) => ({ id, label, x, y, w, h, group, n: n || label.replace("|", " "), c, rot }));
      const cnt = (f) => D.trucks.filter(f).length;
      /* Click details for the live areas (sample data); other areas show their name and type. */
      const ZONES = {
        gate: { s: "ok", st: () => `${cnt((t) => lane(t) === 0)} waiting at gate`, k: [["Trucks in today", 9], ["Waiting now", () => cnt((t) => lane(t) === 0)], ["Avg gate time", "6 min"], ["Docs photographed", "100%"]], go: 'data-go="gate"', gl: "Open Gate Entry", src: "App live" },
        wb: { s: "ok", st: () => `${cnt((t) => lane(t) === 1)} weighing`, k: [["Weighments today", 18], ["Avg per weighment", "4 min"], ["Avg wait", "9 min"], ["Shared by", "Inward + despatch"], ["Inbound today", "142 MT"], ["Calibration", "Valid to 30 Nov"]], go: 'data-go="yard"', gl: "Open Truck Yard", src: "Weighbridge · 10:20" },
        rmg: { s: "ok", st: () => "549 MT OCC & waste paper", k: [["OCC stock here", "549 MT"], ["Bales", "≈ 1,830"], ["Domestic OCC", "9 days"], ["Mixed waste paper", "6 days"], ["Stock on hand · all", "795 MT"]], go: 'data-tab="rm"', gl: "Open Raw material", src: "Store ledger · 08:00" },
        g35: { s: "warn", st: () => "Imported OCC 5 days", k: [["Imported OCC", "CellMark lot 245.740 MT"], ["Containers", 10], ["Cover", "5 days"], ["Next container", "16 Oct"]], go: 'data-go="imp"', gl: "Open Import Shipment", src: "Form 9 + store ledger · 08:00" },
        lab: { s: "ok", st: () => `${cnt(isHold)} moisture hold`, k: [["QC tests today", 14], ["Moisture holds", () => cnt(isHold)], ["ETP COD", "238 / 250 mg/L"]], go: 'data-go="qc"', gl: "Open QC", src: "Lab entry · 09:00" },
        pm1: { s: "warn", st: () => "Running · 87 min down", k: [["Running", "18 BF 120 GSM"], ["Speed", "420 m/min"], ["Made today", "98 / 110 MT"], ["Downtime", "87 min · web breaks 52 min"], ["Efficiency", "87%"], ["Broke", "4.2%"]], go: 'data-tab="pq"', gl: "Open Production", src: "Machine log · 10:15" },
        pm2: { s: "ok", st: () => "Running · 22 BF 150 GSM", k: [["Running", "22 BF 150 GSM"], ["Speed", "340 m/min"], ["Made today", "61 MT"], ["Downtime", "0 min"]], src: "Machine log · 10:15 · dashboard totals cover PM-1 only" },
        rw1: { s: "ok", st: () => "14 reels today", k: [["Jumbo reels", 14], ["Rewinder speed", "380 m/min"], ["Trim loss", "2.1%"], ["Rolls packed", 96]], go: 'data-tab="pq"', gl: "Open Production", src: "Production register · 10:00" },
        pu1: { s: "ok", st: () => "Running · 4.2%", k: [["Fibre in today", "112 MT"], ["Consistency", "4.2%"], ["Pulper rejects", "3.1%"], ["Freeness", "380 CSF"]], go: 'data-tab="pq"', gl: "Open Production", src: "DCS · 10:25" },
        bsr1: { s: "ok", st: () => "260 MT reels", k: [["Finished reels", "260 MT"], ["Biggest grade", "18 BF · 140 MT"], ["Oldest roll", "9 days"]], go: 'data-tab="sd"', gl: "Open Sales & Dispatch", src: "FG store · 08:00" },
        bsr2: { s: "ok", st: () => "160 MT reels", k: [["Finished reels", "160 MT"], ["Both godowns", "420 MT · ≈ 4 days of despatch"]], go: 'data-tab="sd"', gl: "Open Sales & Dispatch", src: "FG store · 08:00" },
        fore: { s: "warn", st: () => "92 / 105 MT · 13 MT short", k: [["Loading now", 2], ["Trucks loaded today", 9], ["Despatched today", "92 / 105 MT"], ["Next load", "Shah Packaging · 18 BF"]], go: 'data-tab="sd"', gl: "Open Sales & Dispatch", src: "Weighbridge · 11:00" },
        b1: { s: "ok", st: () => "Steam OK · coal", k: [["Steam", "10.5 bar · 13 T/h"], ["Coal used today", "36 MT"], ["Steam per MT paper", "2.6 T"], ["Coal stock", "6 days"]], go: 'data-tab="cost"', gl: "Open Cost", src: "Boiler log · 10:00" },
        b2: { s: "ok", st: () => "Steam OK · bagasse", k: [["Steam", "10.2 bar · 9 T/h"], ["Bagasse used today", "28 MT"], ["Coal used today", "8 MT"], ["Steam cost", "₹3,300 / MT paper"]], go: 'data-tab="cost"', gl: "Open Cost", src: "Boiler log · 10:00" },
        etp1: { s: "warn", st: () => "Running · COD near limit", k: [["Status", "Running OK"], ["COD", "238 / 250 mg/L"], ["BOD", "28 / 30 mg/L"], ["TSS", "62 / 100 mg/L"], ["Water use", "12 m³/MT"]], go: 'data-tab="comp"', gl: "Open Compliance", src: "Lab entry · 09:00" },
        store: { s: "ok", st: () => "6 items received", k: [["Items received today", 6], ["Latest", "Fenner V-belts × 4"], ["Supplier", "Shree Transmission · PO 978"]], go: 'data-go="grn"', gl: "Open GRN", src: "Store GRN · 10:40" },
      };
      ZONES.etp2 = ZONES.etp3 = ZONES.etp4 = ZONES.etp1;
      const ROUTES = {
        in: { l: "Inward raw-material truck", s: "Main gate → Weighbridge (gross) → main road → Raw Material Godown (unload; QC sample to Paper lab) → Weighbridge (tare) → out", d: "M525 30V100L600 128V172L525 200V790H600M600 806H537V214L612 180V122L537 104V30", qc: "M525 806V862H400" },
        out: { l: "Despatch truck", s: "Main gate → Weighbridge (tare) → Despatch foreyard / BSR godowns (load reels) → Weighbridge (gross) → out", d: "M525 30V100L600 128L720 128V282H735V156L612 170L537 104V30" },
        store: { l: "Store delivery", s: "Main gate → Weighbridge → Store", d: "M525 30V100L600 128V172L525 200V482H447V502" },
      };
      function millSvg() {
        const zone = (z) => {
          const I = ZONES[z.id], L = z.label.split("|"), m = Math.max(...L.map((l) => l.length)), fs = Math.max(11, Math.min(20, (z.w - 10) / (m * 0.6), (z.h - 8) / (L.length * 1.2))), cx = z.x + z.w / 2, cy = z.y + z.h / 2;
          return `<g class="x-z x-g-${z.group}${D.zone === z.id ? " is-sel" : ""}" data-zone="${z.id}" role="button" tabindex="0" aria-label="${z.n}${I ? ": " + I.st() : ""}"${z.rot ? ` transform="rotate(${z.rot} ${cx} ${cy})"` : ""}><title>${z.n}</title>${z.c ? `<ellipse cx="${cx}" cy="${cy}" rx="${z.w / 2}" ry="${z.h / 2}"/>` : `<rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="6"/>`}${L.map((l, i) => `<text x="${cx}" y="${(cy + (i - (L.length - 1) / 2) * fs * 1.15).toFixed(1)}" style="font-size:${fs.toFixed(1)}px">${l}</text>`).join("")}${I ? `<circle class="x-zd x-${I.s}" cx="${z.x + z.w - 8}" cy="${z.y + 8}" r="6"/>` : ""}</g>`;
        };
        const R = D.route && ROUTES[D.route];
        return `<svg viewBox="0 0 1000 1000" role="group" aria-label="Kaygaon plant layout, north up">
          <g class="x-road"><path d="M0 290L290 0H350L0 350Z"/><text transform="translate(160 160) rotate(-45)">30 m Aurangabad–Ahmednagar road</text>
            <rect x="280" y="26" width="600" height="44"/><rect x="500" y="118" width="50" height="762"/><rect x="40" y="472" width="460" height="20"/><rect x="400" y="852" width="100" height="20"/><rect x="550" y="200" width="150" height="108"/>
            <text transform="translate(525 420) rotate(-90)">Main road</text><text x="160" y="482" style="font-size:13px">5 m service road</text></g>
          <path class="x-site" d="M30 330L284 76H970V990H30Z"/>
          <g class="x-ico" aria-hidden="true" transform="translate(60 110)"><path d="M0 -26L10 8L0 2L-10 8Z"/><text y="-36">N</text></g>
          ${ZR.map(zone).join("")}
          <g class="x-ico" aria-hidden="true" transform="translate(796 158)"><rect width="34" height="20" rx="2"/><path d="M36 6h9l6 7v7H36z"/><circle cx="9" cy="23" r="4"/><circle cx="42" cy="23" r="4"/></g>
          ${R ? `<path class="x-route" d="${R.d}"/>${R.qc ? `<path class="x-route x-route--qc" d="${R.qc}"/>` : ""}` : ""}</svg>`;
      }

      /* MD Desk (v2 roadmap) · sample data */
      const SAMPLE = tag("Sample data", "data");
      const openBtn = (a) => `<button class="btn x-act" ${a}>Open records</button>`;
      const BRIEF = {
        "What changed since yesterday": [
          ["PM-1 Kraft made 98 MT, 11% below target — web breaks", "GM Works", 'data-tab="pq"'],
          ["₹7.6 L overdue from Shah Packaging crossed 60 days", "Sales Head", 'data-tab="money"'],
          ["Imported OCC container arrival due 16 Oct — cover 5 days", "Purchase Head", 'data-tab="rm"'],
          ["Truck MH20 EL 7788 held at QC — moisture 14%", "QC Manager", 'data-truck="IN-1042"'],
          ["Bill SGWP/0871 blocked — 0.45 MT more billed than received", "Accounts Head", 'data-bill="SGWP/0871"'],
        ],
        "Risks to watch": [
          ["ETP COD at 238 against the 250 limit", "EHS Officer", 'data-tab="comp"'],
          ["Cash dips to ₹0.31 Cr in week 6 (w/c 16 Nov)", "Accounts Head", 'data-tab="fc"'],
          ["Shift C at 89% of required manpower", "HR Manager", 'data-tab="comp"'],
        ],
        "Decisions needed today": [
          ["Approve 150 MT domestic OCC bridge order — ₹20.4 L", "Purchase Head", 'data-go="inbox"'],
          ["Release payment batch — ₹20.5 L", "Accounts Head", 'data-go="inbox"'],
          ["Approve PM-1 felt replacement — ₹3.8 L", "GM Works", 'data-go="inbox"'],
          ["Pass Micro Fab Industries bill — ₹73.16 L", "Accounts Head", 'data-go="inbox"'],
        ],
      };
      const DEC = [
        { t: "Approve 150 MT domestic OCC bridge order", amt: "₹20.4 L", by: "Purchase Head", due: "Today", ev: "Imported OCC cover is 5 days; container due 16 Oct. Bridge quote ₹13,600/MT from Patil Kraft.", go: 'data-tab="rm"' },
        { t: "Approve moisture deduction on MH20 EL 7788", amt: "₹16,200", by: "QC Manager", due: "Today 4 PM", ev: "Moisture 14% vs 10% limit · Om Sai Recyclers · truck IN-1042.", go: 'data-truck="IN-1042"' },
        { t: "Release payment batch", amt: "₹20.5 L", by: "Accounts Head", due: "Tomorrow", ev: "Supplier bills due this week; ₹26.2 L collections due against it.", go: 'data-tab="money"' },
        { t: "Approve PM-1 felt replacement", amt: "₹3.8 L", by: "GM Works", due: "14 Oct", ev: "Worn felt behind today's web breaks — 1h 27m downtime, 6.2 MT lost.", go: 'data-tab="pq"' },
        { t: "Pass Micro Fab Industries bill — head box parts", amt: "₹73.16 L", by: "Accounts Head", due: "before payment", ev: "Micro Fab Industries, Vapi · MFI/0066/26-27 · PO 1947 · IGST 18% · ₹73,16,000. Above ₹10 lakh, so it needs your approval.", go: 'data-go="grn"', bill: "MFI/0066/26-27" },
      ];
      const COM = [
        { a: "Fix PM-1 web breaks", o: "GM Works", d: "14 Oct", s: "On track", x: 0 },
        { a: "Collect Shah Packaging dues", o: "Sales Head", d: "10 Oct", s: "Overdue", x: 1 },
        { a: "Place 150 MT bridge OCC order", o: "Purchase Head", d: "12 Oct", s: "On track", x: 0 },
        { a: "Settle SGWP/0871 with a debit note", o: "Accounts Head", d: "9 Oct", s: "Overdue", x: 2 },
        { a: "Bring ETP COD below 230", o: "EHS Officer", d: "20 Oct", s: "On track", x: 0 },
        { a: "Fill Shift C vacancies", o: "HR Manager", d: "5 Oct", s: "Done", x: 1 },
      ];
      const ASK = [
        ["Why is production below target today?", "PM-1 Kraft made <b>98 MT against a 110 MT target</b> (11% short) on 18 BF 120 GSM. It lost <b>1h 27m</b>: web breaks 52m, felt change 25m, power cut 10m. Tonnes lost today: downtime 6.2 MT, broke 4.1 MT, QC rejects 1.7 MT.", ["Production register · 10:00", "Machine log · 10:15"]],
        ["Which bills are blocked and why?", "<b>3 bills, ₹6.0 L</b> in all: SGWP/0871 ₹2,50,240 — billed 18.40 MT but 17.95 MT accepted; OSR/0329 ₹1,92,000 — moisture deduction not agreed; MPM/0451 ₹1,57,760 — receipt (GRN) missing.", ["App GRN · live", "DataMan export · 10:30"]],
        ["Which supplier has the most rejections this month?", "<b>Om Sai Recyclers</b> — 4.6% of loads rejected, 3.9% average moisture deduction, 78% on time. Next worst is Sahyadri Agro Fibres at 3.0%.", ["App QC · live", "GRN register · 10:30"]],
        ["How much cash will we have in week 6?", "About <b>₹0.31 Cr</b> in week 6 (w/c 16 Nov) — the lowest of the 13 weeks. ₹1.78 Cr comes in and ₹1.82 Cr goes out that week; cash recovers to ₹0.60 Cr by week 13.", ["DataMan ageing · 10:30", "Bank statement · 09:00"]],
      ];
      const MIC = `<svg class="x-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/></svg>`;
      const VOICE = [
        ["Aaj kitna production hua?", "Aaj PM-1 ne <b>98 MT</b> banaya, target 110 MT — <b>89%</b>. Main reason: 52 min web breaks on Shift B.", "Today PM-1 made 98 MT against the 110 MT target — 89%. Main reason: 52 minutes of web breaks on Shift B.", ["Production register · 10:00", "Machine log · 10:15"]],
        ["Kaunsa supplier sabse zyada reject hua?", "Is mahine <b>Om Sai Recyclers</b> sabse zyada reject hua — 4.6% loads, average moisture deduction 3.9%.", "This month Om Sai Recyclers had the most rejections — 4.6% of loads, with a 3.9% average moisture deduction.", ["App QC · live", "GRN register · 10:30"]],
        ["Is hafte kitna paisa aana hai?", "Is hafte customers se <b>₹26.2 L</b> aana hai aur ₹20.5 L dena hai — net <b>+₹5.7 L</b>. Shah Packaging ka ₹7.6 L 64 din se overdue hai.", "This week ₹26.2 L is due in from customers and ₹20.5 L goes out — net +₹5.7 L. Shah Packaging's ₹7.6 L is 64 days overdue.", ["DataMan ageing · 10:30", "Bank statement · 09:00"]],
      ];
      let micT = 0;
      function listen(i) {
        clearTimeout(micT); D.listen = i; render();
        micT = setTimeout(() => {
          const v = VOICE[i]; micT = 0; D.listen = null;
          D.chat.push([`${MIC} ${v[0]}`, reply(`${v[1]}</p><p class="x-sub">${v[2]}`, v[3])]); render();
          const f = $("#ask-form"); if (f) f.q.value = v[0];
        }, 1500);
      }
      D.chat = []; D.listen = null; D.vn = 0; D.ovl = null; D.tvi = 0;
      const reply = (a, s) => `<div class="x-msg"><p>${a}</p>${s ? `<p>Sources: ${s.map((x) => `<span class="pill">${x}</span>`).join(" ")}</p>` : ""}<p class="fineprint">Read-only — cannot approve, post or change anything.</p></div>`;
      Object.assign(screens, {
        brief() {
          return `${head("MD Desk · Morning Briefing", "Good morning, Akshay ji — here's what moved overnight.", `11 Oct 2026 · 7:30 AM ${SAMPLE}`)}
            ${Object.entries(BRIEF).map(([h, rows]) => `<div class="x-sec"><h3 class="x-h3">${h}</h3>${table(["Item", "Owner", "Records"], rows.map(([i, o, a]) => ({ c: [i, o, openBtn(a)] })))}</div>`).join("")}`;
        },
        inbox() {
          const P = DEC.filter((d) => !d.st), X = DEC.filter((d) => d.st);
          return `${head("MD Desk · Decision Inbox", P.length ? `${P.length} approval${P.length > 1 ? "s" : ""} waiting for you.` : "All caught up.", `Each has the evidence and a deadline. ${SAMPLE}`)}
            <div class="x-grid x-grid--2">${P.map((d) => `<article class="x-card"><h3 class="x-ct">${d.t} ${d.due.startsWith("Today") ? chip("Due " + d.due.toLowerCase(), true) : chip("Due " + d.due)}</h3>${big(d.amt)}${sub(`Asked by ${d.by}`)}<p>${d.ev}</p>
              <div class="x-dec"><button class="btn x-act x-primary" data-dec="${DEC.indexOf(d)}:Approved">Approve</button><button class="btn x-act" data-dec="${DEC.indexOf(d)}:Rejected">Reject</button><button class="btn x-act" data-dec="${DEC.indexOf(d)}:Info requested">Ask for info</button><button class="link x-linkbtn" ${d.go}>See evidence</button></div></article>`).join("")}</div>
            ${X.length ? `<div class="x-sec"><h3 class="x-h3">Decided</h3>${table(["Request", "Amount", "Owner", "Decision"], X.map((d) => ({ num: [1], c: [d.t, d.amt, d.by, `${chip(d.st)} <small>at ${d.at}</small>`] })))}</div>` : ""}`;
        },
        commit() {
          return `${head("MD Desk · Commitments", "What people promised in meetings.", `${COM.filter((c) => c.s === "Overdue").length} overdue · ${COM.filter((c) => c.s === "Done").length} done ${SAMPLE}`)}
            ${table(["Promise", "Owner", "Due", "Status", "Extensions", ""], COM.map((c, i) => ({ hl: c.s === "Overdue", num: [4], c: [c.a, c.o, c.d, chip(c.s, c.s === "Overdue"), c.x, c.s === "Done" ? "" : `<button class="btn x-act" data-done="${i}">Mark done</button>`] })))}`;
        },
        ask() {
          return `${head("MD Desk · Ask Kaygaon", "Ask about the mill in plain words.", `Answers come from the same records as the dashboard. ${SAMPLE}`)}
            <div class="links">${ASK.map((q, i) => `<button class="btn x-act" data-ask="${i}">${q[0]}</button>`).join("")}</div>
            <div class="links"><span class="x-sub">Try by voice · Hindi:</span>${VOICE.map((v, i) => `<button class="btn x-act" data-mic="${i}">${MIC} ${v[0]}</button>`).join("")}</div>
            <div class="x-chat" aria-live="polite">${D.chat.map(([q, a]) => `<div class="x-msg x-msg--me">${q}</div>${a}`).join("")}${D.listen != null ? `<div class="x-msg x-msg--me x-listen" role="status"><span class="x-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>Listening…</div>` : D.chat.length ? "" : `<p class="fineprint">Pick a question above, tap the mic, or type your own.</p>`}</div>
            <form class="x-ask" id="ask-form"><label class="x-field" style="flex:1">Your question<input name="q" placeholder="e.g. How much OCC stock do we have?" /></label><button type="button" class="btn x-act" data-mic="next" aria-label="Ask by voice" style="align-self:end">${MIC}</button><button type="submit" class="btn x-act x-primary" style="align-self:end">Ask</button></form>
            <p class="fineprint">Read-only — cannot approve, post or change anything.</p>`;
        },
      });

      /* Weighbridge ticket, GRN with lab report, bill pass, import shipment · sample data */
      const kg = (n) => n.toLocaleString("en-IN");
      const rs2 = (n) => "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const RULE = `<div class="x-strip x-warn">Moisture allowed: 10% — one rule for weighbridge, QC and GRN <small>Paper slip said 7.5%, GRN said 10%</small></div>`;
      const facts = (A) => `<dl class="x-facts">${A.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>`;
      const ckl = (A) => `<ul class="checklist">${A.map(([i, s, n, solid]) => `<li><span class="checklist__item">${i}</span>${chip(s, solid)}${n ? `<span class="checklist__note">${n}</span>` : ""}</li>`).join("")}</ul>`;
      Object.assign(D, { gm: 12.5, sg: [null, null, null], bp: { mm: false, pass: null }, f9: null, impSent: null });
      const wbTicket = () => `<div class="x-panel"><div class="x-dochd"><span>Digital weighbridge ticket · RST No. 10685</span><small>Kaygaon Paper Mills · sample</small></div>
        <div class="x-grid x-grid--2">${facts([["Vehicle", "MH12 UM 0965"], ["Material", "Waste paper (OCC)"], ["Supplier", "Akash Deep Traders"], ["Operator", "S. Pawar"]])}
        ${facts([["Gross", "<b>15,960 kg</b> · 28-Aug-26 10:42"], ["Tare", "<b>5,880 kg</b> · 28-Aug-26 11:31"], ["Net", "<b>10,080 kg</b>"], ["Moisture rule", "10% · same as QC and GRN"]])}</div>
        <p class="fineprint">Weights come straight from the weighbridge — no handwritten slip.</p></div>`;
      const lab = (m) => { const d = Math.max(0, m - 10), dmt = Math.round((7450 * d) / 100) / 1000; return { d: d.toFixed(2), dmt: dmt.toFixed(3), acc: (7.45 - dmt).toFixed(3) }; };
      const SIGN = [["Prepared", "Stores · GRN clerk"], ["Checked", "QC Manager"], ["Approved", "Plant Head"]];
      function grnDoc() {
        const L = lab(D.gm);
        return `<div class="x-panel"><div class="x-dochd"><span>KAYGAON PAPER MILLS PVT LTD · Goods Receipt Note</span><small>GRN 28080021 · 28-Aug-26 · Akash Deep Traders · P.O. 21</small></div>
          ${table(["Weight (MT)", "Chl", "Gross", "Tare", "Rcvd", "Short"], [{ num: [1, 2, 3, 4, 5], c: ["Waste paper (OCC)", "7.460", "16.760", "9.310", "7.450", "0.010"] }])}
          <h3 class="x-h3" style="margin:0">Lab Test Report</h3>
          ${table(["Test", "Found", "Accept", "Deduction", "Deduction MT", "Accepted MT"], [{ hl: true, num: [2, 3, 4, 5], c: ["Moisture %", `<label class="x-lab"><span class="x-sub">From QC</span><input id="grn-moist" type="number" step="0.01" min="0" value="${D.gm}" aria-label="Moisture found %" /></label>`, "10.00", `<span id="lab-d">${L.d}</span>%`, `<span id="lab-dmt">${L.dmt}</span>`, `<b id="lab-acc">${L.acc}</b>`] }])}
          <p class="fineprint">Deduction = moisture found − 10.00% allowed, applied to received weight 7.450 MT.</p>
          <div class="x-sign">${SIGN.map(([r, w], i) => `<div><b>${r} by</b><small>${w}</small>${D.sg[i] ? `<span>${chip("Signed " + D.sg[i])}</span>` : `<span><button class="btn x-act" data-sign="${i}"${i && !D.sg[i - 1] ? " disabled" : ""}>Sign</button></span>`}</div>`).join("")}</div></div>`;
      }
      const AK = [["28080002", 3170, 18], ["28080003", 11420, 17.7], ["28080006", 1060, 18], ["28080007", 1710, 18], ["28080016", 2490, 18], ["28080019", 10080, 19.2], ["28080021", 7264, 19]];
      function billPass() {
        const P = D.bp, L = AK.map(([g, q, r]) => { const iq = P.mm && g === "28080021" ? 7450 : q; return { g, q, iq, r, a: Math.round(iq * r * 100) / 100 }; });
        const tx = L.reduce((s, l) => s + l.a, 0), gst = Math.round(tx * 2.5) / 100, tot = tx + 2 * gst;
        const btn = P.pass ? `<p>${chip("Accounts · passed " + P.pass)} ${chip("Authorised by · " + P.pass)}</p><p class="x-sub"><b>Sent to corporate — same day</b></p>`
          : P.mm ? `<button class="btn x-act" data-act="hold">Hold — qty differs by 186 kg (moisture deduction)</button>` : `<button class="btn x-act x-primary" data-act="passbill">Pass bill</button>`;
        return `<div class="x-sec"><h3 class="x-h3">Bill pass · Akash Deep Traders</h3><div class="x-grid x-grid--2">
          <div class="x-stamp"><h3 class="x-ct">Paper today</h3><div class="x-ink"><span>P.O. 21</span><span>GRN 28080002+3+6+7+16+19+21</span><span>Bill 7,19,697/-</span></div><p class="fineprint">Stamped, signed and couriered — reaches corporate 2–3 days later.</p></div>
          <article class="x-card"><h3 class="x-ct">Invoice GST/520/26-27 · dt 28-Aug-26 ${tag(P.mm ? "1 line differs" : "7 of 7 matched", P.mm ? "crit" : "ok")}</h3>
            ${table(["GRN", "Qty kg", "Rate", "Amount", "Match"], L.map((l) => ({ hl: l.iq !== l.q, num: [1, 2, 3], c: [l.g, kg(l.iq), l.r.toFixed(2), rs2(l.a), l.iq !== l.q ? tag(`Accepted ${kg(l.q)} kg`, "crit") : tag("Matched")] })))}
            ${facts([["Taxable", rs2(tx)], ["CGST 2.5%", rs2(gst)], ["SGST 2.5%", rs2(gst)], ["Total", `<b>${rs2(tot)}</b>`]])}
            <div class="links">${btn}${P.pass ? "" : `<button class="btn x-act" data-act="mm" aria-pressed="${P.mm}">${P.mm ? "Show matched invoice" : "Try a mismatch (invoice 7,450 vs accepted 7,264 kg)"}</button>`}</div>
            ${src("Invoice + GRNs + weighbridge · auto-matched")}</article></div>
          <h3 class="x-h3" style="margin:0">Packet to corporate</h3>
          ${ckl([["Tax invoice / e-invoice <small>GST/520/26-27</small>", "Attached"], ["E-way bill <small>From Lucky Trading Co., Hingoli · 313 km</small>", "Attached"], ["Weighbridge tickets <small>RST 10685 and others</small>", "Attached"], ["GRNs with lab report <small>7 GRNs</small>", "Attached"], ["Unregistered dealer bill", "Attached"]])}</div>`;
      }
      const CN = [["TRHU6185636", 23.34, 23.65, 24.33, "19090002"], ["TIIU7046800", 23.62, 23.39, 23.73, "18090003"], ["CMAU6621822", 25.64, 24.91, 25.45, "18090005"], ["TGBU4327445", 25.02, 24.18, 24.78, "18090004"], ["BEAU4539174", 24.22, 24.4, 24.12, "19090004"], ["TLLU4151892", 24.72, 24.55, 24.6, "19090003"], ["UETU5589723", 24.32, 23.67, 24.34, "19090001"], ["TEMU7383479", 25.25, 24.84, 25.26, "18090001"], ["FCIU9236506", 24.87, 24.64, 25.04, "18090002"], ["CMAU5903837", 24.22, 23.92, 24.09, "21090001"]];
      const sgn = (v) => (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(3);
      screens.imp = function () {
        const S = [1, 2, 3].map((k) => CN.reduce((s, c) => s + c[k], 0)), short = S[0] - S[1];
        const LC = [["Invoice value <small>245.220 MT × USD 177 × ₹95.25</small>", "₹41,34,225"], ["Basic customs duty (BCD)", "₹1,03,356"], ["Social welfare surcharge (SWS)", "₹10,336"], ["Stamp duty", "₹4,248"], ["Terminal charges", "₹16,000"], ["Shipping line charges <small>CMA CGM</small>", "₹6,34,800"]];
        return `${head("Operations · Import Shipment", "Libya OCC from CellMark — 10 containers in, landed at ≈ ₹19,994/MT.", `BL BGG0108465 · BOE 3574135 dt 04/09/2026 ${SAMPLE}`)}
          <section class="stats"><div class="stat"><span class="stat__fig">245.220 MT</span><span class="stat__label">Invoice · 300 bales</span></div><div class="stat"><span class="stat__fig">10 × 40' HC</span><span class="stat__label">Containers</span></div><div class="stat"><span class="stat__fig">USD 177</span><span class="stat__label">Per MT · at ₹95.25</span></div></section>
          ${card("Shipment", facts([["Supplier", "CellMark Netherlands BV"], ["Material", "Libya OCC"], ["Bill of lading", "BGG0108465 · CMA CGM"], ["Bill of entry", "3574135 dt 04/09/2026"], ["P.O.", "21"], ["CHA", "Ajay Logistics"]]), "Shipping documents · BOE")}
          <div class="x-sec"><h3 class="x-h3">Container weights · MT</h3>
            <div class="x-strip x-crit">ICD short ${short.toFixed(3)} MT against invoice <small>Factory weight is ${sgn(S[2] - S[0])} MT over invoice in total</small></div>
            ${table(["Container", "Invoice", "ICD", "Factory", "Diff", "GRN"], [...CN.map(([c, i, d, f, g]) => ({ num: [1, 2, 3, 4], c: [c, i.toFixed(3), d.toFixed(3), f.toFixed(3), sgn(f - i), g] })), { hl: true, num: [1, 2, 3, 4], c: ["Total", S[0].toFixed(3), `${S[1].toFixed(3)} ${tag("Short " + short.toFixed(3), "crit")}`, S[2].toFixed(3), sgn(S[2] - S[0]), "10 GRNs"] }])}
            <p class="fineprint">Diff = factory weight − invoice weight.</p></div>
          <div class="x-sec"><h3 class="x-h3">Landed cost</h3><div class="pair">
            <div class="breakdown"><dl>${LC.map(([l, v]) => `<div class="row"><dt>${l}</dt><dd>${v}</dd></div>`).join("")}<div class="row row--total"><dt>Landed cost <small>≈ ₹19,994/MT</small></dt><dd>₹49,02,964</dd></div></dl>
              <p class="fineprint">IGST ₹2,12,396 is taken as input credit, so it is not part of the cost.</p></div>
            <aside class="callout" aria-label="Compared with local OCC"><p class="callout__head">vs local OCC</p><p class="callout__lead"><strong>Imported lands at ≈ ₹19,994/MT.</strong> Local OCC costs ₹18,000–19,200/MT.</p></aside>
          </div></div>
          <div class="x-sec"><h3 class="x-h3">Documents</h3>
            ${ckl([["Commercial invoice <small>CellMark Netherlands BV</small>", "Received"], ["Bill of lading <small>BGG0108465</small>", "Received"], ["Bill of entry <small>3574135 dt 04/09/2026</small>", "Received"], ["Duty payment <small>BCD, SWS, IGST</small>", "Received"], ["CHA bill <small>Ajay Logistics</small>", "Received"], ["GRNs <small>10 containers</small>", "Received"],
              ["Form 9 <small>Quantity received</small>", D.f9 ? "Filled" : "To be filled", D.f9 ? `${D.f9} MT · factory weight` : `<button class="btn x-act" data-act="form9">Fill 245.740 MT</button>`, !D.f9]])}
            <div class="links">${D.impSent ? chip(`Import packet sent to corporate · ${D.impSent}`) : `<button class="btn x-act x-primary" data-act="sendimp">Send import packet to corporate</button>`}</div></div>`;
      };

      function thumbs() {
        return Array.from({ length: D.photos }, (_, i) => `<div class="x-thumb">Doc ${i + 1}</div>`).join("") || `<p class="fineprint">No document photos yet.</p>`;
      }

      function match(b) {
        const rate = Math.round(250240 / 18.4), grnAmt = Math.round(17.95 * rate);
        const open = isExc(b);
        return `<div class="x-panel"><h3 class="x-h3" style="margin:0">Three-way match · ${b.no}</h3>
          ${table(["", "PO", "GRN accepted", "Invoice"], [
            { hl: true, num: [3], c: ["Quantity", "20.00 MT", "17.95 MT", "18.40 MT <small>+0.45 MT over GRN</small>"] },
            { num: [], c: ["Rate", inr(rate) + " / MT", inr(rate) + " / MT", inr(rate) + " / MT"] },
            { hl: true, num: [3], c: ["Amount", inr(20 * rate), inr(grnAmt), `${inr(b.amt)} <small>${inr(b.amt - grnAmt)} over GRN</small>`] },
          ])}
          <p class="fineprint">Pay on accepted quantity; raise a debit note for the difference.</p>
          <div class="links">${open ? `<button class="btn x-act x-primary" data-clear="${b.no}">Clear for posting</button>` : billChip(b)}</div></div>`;
      }

      /* Overlays: phone mock (shares Decision Inbox state) and TV wall (rotates every 10s while open and the tab is visible). */
      const cbars = (a, mx) => `<svg class="x-cb" viewBox="0 0 ${a.length * 10} 40" preserveAspectRatio="none" aria-hidden="true">${a.map((v, i) => `<rect x="${i * 10 + 2}" y="${(40 - (v / mx) * 40).toFixed(1)}" width="6" height="${((v / mx) * 40).toFixed(1)}" rx="1"/>`).join("")}</svg>`;
      const TVS = [
        ["Overview", () => `<div class="x-tv-k">${tiles(TOP)}</div>`],
        ["Mill Map", () => `<div class="x-map">${millSvg()}</div>`],
        ["Truck Yard", () => `<div class="x-tv-z x-screen">${screens.yard()}</div>`],
        ["Production", () => `<div class="x-tv-z">${card("PM-1 production · last 7 days, MT", big("98", "/ 110 MT today · 89%") + cols(P7, DAYS, 110), "DataMan export · 10:30")}</div>`],
      ];
      function phone() {
        const P = DEC.filter((d) => !d.st).length;
        return `<div class="links"><button class="btn x-act" data-act="close">Close phone view</button></div>
          <div class="x-phone" role="dialog" aria-modal="true" aria-label="MD mobile view">
            <div class="x-ph-bar"><span>10:30</span><i></i><span>Kaygaon</span></div>
            <div><p class="x-hello">Namaste, Akshay ji</p><p class="x-sub">Sun 11 Oct · PM-1 Kraft · sample data</p></div>
            <div class="x-ph-k">${tiles(TOP.filter((t) => t[3]))}</div>
            <div class="x-card"><h3 class="x-ct">PM-1 today <span>98 / 110 MT</span></h3>${meter(98, 110, "warn")}${cbars(P7, 110)}${sub("Last 7 days · 88–101 MT · target 110")}</div>
            <div class="x-sec"><h3 class="x-h3">Decisions today${P ? ` · ${P} waiting` : ""}</h3><ul class="x-ph-dec">${DEC.map((d, i) => `<li><span><b>${d.t}</b><small>${d.amt} · ${d.by} · due ${d.due}</small></span>${d.st ? chip(d.st) : `<button class="btn x-act x-primary" data-dec="${i}:Approved">Approve</button>`}</li>`).join("")}</ul></div>
          </div>`;
      }
      function ovl() {
        const o = $("#ovl"), m = D.ovl;
        $(".page").inert = !!m; document.body.style.overflow = m ? "hidden" : "";
        o.hidden = !m; o.className = m ? "x-ovl x-ovl--" + m : "x-ovl";
        if (!m) { o.innerHTML = ""; return; }
        if (m === "phone") { o.innerHTML = phone(); return; }
        const [n, f] = TVS[D.tvi];
        o.innerHTML = `<div class="x-tv-bar" role="dialog" aria-modal="true" aria-label="TV wall">KAYGAON PAPER MILLS · ${n}<span>${D.tvi + 1} / ${TVS.length} · next in 10s · Esc or click to exit</span></div><div>${f()}</div><div class="x-tv-prog"><i></i></div>`;
      }
      let tvT = 0;
      const tvTick = () => { clearInterval(tvT); tvT = 0; if (D.ovl === "tv" && !document.hidden) tvT = setInterval(() => { D.tvi = (D.tvi + 1) % TVS.length; ovl(); drawX(); yardTick(); }, 10000); };
      function openOvl(m) {
        D.ovl = m; D.tvi = 0; render(); tvTick();
        if (m === "tv") { $("#ovl").focus(); const r = document.documentElement.requestFullscreen; if (r && !navigator.webdriver) r.call(document.documentElement).catch(() => {}); }
        else $('#ovl [data-act="close"]').focus();
      }
      function closeOvl() {
        const m = D.ovl; D.ovl = null; render(); tvTick();
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        const b = $(`.x-ctl [data-act="${m}"]`); if (b) b.focus();
      }
      document.addEventListener("visibilitychange", tvTick);
      document.addEventListener("fullscreenchange", () => { if (!document.fullscreenElement && D.ovl === "tv") closeOvl(); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape" && D.ovl) closeOvl(); });

      function render() {
        if (micT && (D.view !== "ask" || D.ovl)) { clearTimeout(micT); micT = 0; D.listen = null; }
        $("#view").innerHTML = `<div class="x-screen">${screens[D.view]()}</div>`;
        if (document.querySelector("#view .chart[data-points]")) window.dispatchEvent(new Event("resize"));
        ovl(); drawX(); yardTick();
        document.querySelectorAll("[data-go]").forEach((b) => b.dataset.go === D.view ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current"));
      }
      function go(v) { D.view = v; render(); window.scrollTo(0, 0); }
      function toast(msg) {
        const el = $("#toast"); el.textContent = msg; el.classList.add("is-on");
        clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("is-on"), 2600);
      }

      document.addEventListener("click", (e) => {
        if (D.ovl === "tv") { closeOvl(); return; }
        const el = e.target.closest("button,[data-zone]"); if (!el) return;
        const d = el.dataset;
        if (d.act === "phone" || d.act === "tv") openOvl(d.act);
        else if (d.act === "close") closeOvl();
        else if (d.mic) listen(d.mic === "next" ? D.vn++ % VOICE.length : +d.mic);
        else if (d.zone) pickZone(d.zone);
        else if (d.route) { D.route = D.route === d.route ? null : d.route; render(); }
        else if (d.go) go(d.go);
        else if (d.tab) { D.tab = d.tab; go("dash"); }
        else if (d.act === "mis") { D.mis = !D.mis; render(); }
        else if (d.act === "print") { if (navigator.webdriver) toast("Printing is off in automated browsers"); else window.print(); }
        else if (d.kpi) { D.kpi = D.kpi === d.kpi ? null : d.kpi; render(); }
        else if (d.truck) { D.jSel = d.truck; go("journey"); }
        else if (d.bill) { D.billOpen = d.bill; go("grn"); }
        else if (d.act === "photo") { D.photos++; $("#thumbs").innerHTML = thumbs(); }
        else if (d.qc) qc(d.qc);
        else if (d.clear) { D.bills.find((b) => b.no === d.clear).status = "Cleared for posting"; render(); toast(`${d.clear} cleared for posting`); }
        else if (d.act === "import") importDataMan();
        else if (d.sign) { D.sg[+d.sign] = "28-Aug-26 " + now(); render(); toast(`GRN 28080021 ${SIGN[+d.sign][0].toLowerCase()} by ${SIGN[+d.sign][1]}`); }
        else if (d.act === "mm") { D.bp.mm = !D.bp.mm; render(); }
        else if (d.act === "hold") toast("Bill held — qty differs by 186 kg (moisture deduction)");
        else if (d.act === "passbill") { D.bp.pass = now(); D.bills.find((b) => b.no === "GST/520/26-27").status = `Passed ${D.bp.pass} · sent to corporate same day`; render(); toast("GST/520/26-27 passed · sent to corporate — same day"); }
        else if (d.act === "form9") { D.f9 = CN.reduce((s, c) => s + c[3], 0).toFixed(3); render(); toast(`Form 9 filled · ${D.f9} MT received`); }
        else if (d.act === "sendimp") { D.impSent = now(); render(); toast("Import packet sent to corporate"); }
        else if (d.dec) { const [i, st] = d.dec.split(":"), x = DEC[+i]; x.st = st; x.at = now(); const xb = x.bill && D.bills.find((b) => b.no === x.bill); if (xb) xb.status = `MD ${st.toLowerCase()} · ${x.at}`; render(); toast(`${x.t}: ${st.toLowerCase()} at ${x.at}`); }
        else if (d.done) { const c = COM[+d.done]; c.s = "Done"; render(); toast(`${c.a} marked done`); }
        else if (d.ask) { const q = ASK[+d.ask]; D.chat.push([q[0], reply(q[1], q[2])]); render(); }
        else if (d.act === "wireset") { D.wi = { ...WI0 }; document.querySelectorAll("[data-wi]").forEach((s) => (s.value = D.wi[s.dataset.wi])); whatIf(); }
      });
      function pickZone(z) { D.zone = z; render(); const g = document.querySelector(`[data-zone="${z}"]`); if (g) g.focus(); }
      document.addEventListener("keydown", (e) => { const g = e.target.closest && e.target.closest("[data-zone]"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pickZone(g.dataset.zone); } });
      document.addEventListener("input", (e) => { if (e.target.id === "grn-moist") { D.gm = parseFloat(e.target.value) || 0; const L = lab(D.gm); ["d", "dmt", "acc"].forEach((k) => ($("#lab-" + k).textContent = L[k])); return; } const k = e.target.dataset.wi; if (k) { D.wi[k] = +e.target.value; whatIf(); } });
      let rz; window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(drawX, 120); });

      document.addEventListener("change", (e) => {
        const k = e.target.dataset.sel;
        if (k) { D[k] = e.target.value; render(); }
        if (e.target.name === "doc") $("#publish").disabled = [...document.querySelectorAll('[name="doc"]')].some((c) => !c.checked);
      });

      document.addEventListener("submit", (e) => {
        e.preventDefault();
        const f = e.target;
        if (f.id === "gate-form") {
          const veh = f.veh.value.trim().toUpperCase();
          if (!veh) { f.veh.focus(); return; }
          const id = "IN-" + D.next++;
          D.trucks.push({ id, veh, sup: f.sup.value, mat: f.mat.value, mt: parseFloat(f.mt.value) || null, inv: f.inv.value.trim(), docs: D.photos, stage: "At gate", t: [now()], since: Date.now() });
          D.photos = 0; D.jSel = id; render(); toast(`${id} · ${veh} added at gate`);
        }
        if (f.id === "ask-form") {
          const q = f.q.value.trim(); if (!q) { f.q.focus(); return; }
          D.chat.push([q.replace(/[<>&]/g, ""), reply("Thanks for asking. This demo only answers the four suggested questions with sample data; once live, Kaygaon will answer from the mill's own records.")]);
          render(); $("#ask-form").q.focus();
        }
        if (f.id === "grn-form") {
          const t = truck(D.grnSel);
          t.grn = f.grn.value; t.stage = "Packet sent to corporate"; t.t.push(now(), now()); t.since = Date.now(); D.grnNo++;
          render(); toast(`${t.id} packet sent to corporate · ${t.grn}`);
        }
      });

      function qc(action) {
        const t = truck(D.qcSel), m = parseFloat($("#moist").value) || 0, c = parseFloat($("#cont").value) || 0;
        const why = m > 10 ? `moisture ${m}%` : c > 2 ? `contamination ${c}%` : `moisture ${m}%`;
        while (t.t.length < 2) t.t.push(now());
        if (action === "accept") { t.stage = "Accepted – GRN pending"; t.t.push(now()); }
        else t.stage = (action === "hold" ? "QC hold – " : "Rejected – ") + why;
        t.since = Date.now(); render(); toast(`${t.id}: ${t.stage}`);
      }

      function importDataMan() {
        if (D.imported) { D.importMsg = "Already imported — no duplicates"; render(); toast(D.importMsg); return; }
        D.imported = true;
        const posted = [];
        D.bills.filter((b) => b.status === "Cleared for posting").forEach((b) => { b.status = "Posted – voucher PV-0" + D.voucher++; posted.push(b.no); });
        D.importMsg = `214 rows · 211 accepted · 2 duplicates skipped · 1 rejected${posted.length ? ` · posted ${posted.join(", ")}` : ""}`;
        render(); toast("DataMan export imported");
      }

      try { render(); } catch (err) { $("#view").textContent = "Could not load this screen."; }
    