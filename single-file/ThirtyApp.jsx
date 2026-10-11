/**
 * Thirty: a 30-day, ₹10,000 personal finance simulator (single-file version).
 *
 * Requirements
 *  - React 18+ (this file is a JSX module with a default export)
 *  - Tailwind CSS loaded in the page, e.g. in index.html:
 *      <script src="https://cdn.tailwindcss.com"></script>
 *  - Optional fonts (falls back to system fonts without them):
 *      Bricolage Grotesque + Figtree from Google Fonts
 *
 * Usage:  import ThirtyApp from './ThirtyApp.jsx';  <ThirtyApp />
 *
 * Layout uses Tailwind utility classes. Theme colours (3 palettes x light/dark)
 * are CSS variables injected by the <style> tag rendered by <App />.
 */
import { useState, useEffect, useMemo, useRef } from 'react';

const CSS = `
:root{
  --bg:#eaf7f3;--s1:#ffffff;--s2:#d9efe9;--s3:#bfe2d8;--tx:#0a2a26;--mu:#4c746c;--ln:rgba(10,42,38,.13);
  --ac:#0a7f70;--ac2:#d3f1ea;--on-ac:#ffffff;--pink:#ff7a59;--good:#0f9d58;--good-bg:rgba(15,157,88,.14);
  --warn:#c77700;--warn-bg:rgba(255,176,32,.22);--bad:#e0334b;--bad-bg:rgba(224,51,75,.12);
  --hero:linear-gradient(135deg,#064e46 0%,#0a8272 58%,#ff7a59 118%);
  --shadow:0 18px 50px -18px rgba(6,78,70,.38);
  box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]):not([data-palette]){
    --bg:#06191a;--s1:#0d2a2a;--s2:#143838;--s3:#1f4b49;--tx:#e6fbf6;--mu:#8fbdb4;--ln:rgba(230,251,246,.14);
    --ac:#2fd3b8;--ac2:#123f3b;--on-ac:#04201c;--pink:#ff8a6b;--good:#3be08f;--good-bg:rgba(59,224,143,.15);
    --warn:#ffc04d;--warn-bg:rgba(255,192,77,.16);--bad:#ff6b7d;--bad-bg:rgba(255,107,125,.16);--shadow:0 18px 50px -18px rgba(0,0,0,.7);
  }
}
:root[data-theme="dark"]{
  --bg:#06191a;--s1:#0d2a2a;--s2:#143838;--s3:#1f4b49;--tx:#e6fbf6;--mu:#8fbdb4;--ln:rgba(230,251,246,.14);
  --ac:#2fd3b8;--ac2:#123f3b;--on-ac:#04201c;--pink:#ff8a6b;--good:#3be08f;--good-bg:rgba(59,224,143,.15);
  --warn:#ffc04d;--warn-bg:rgba(255,192,77,.16);--bad:#ff6b7d;--bad-bg:rgba(255,107,125,.16);--shadow:0 18px 50px -18px rgba(0,0,0,.7);
}
:root[data-palette="violet"]{
  --bg:#f1eeff;--s2:#e8e3fb;--s3:#d9d1f6;--tx:#1d1445;--mu:#6a628f;--ln:rgba(29,20,69,.12);
  --ac:#5b3df5;--ac2:#ece8ff;--on-ac:#fff;--pink:#ff6fb5;--hero:linear-gradient(135deg,#4a2bd9 0%,#8f3fd1 60%,#d6428f 100%);--shadow:0 18px 50px -18px rgba(60,35,160,.35);
}
:root[data-palette="violet"][data-theme="dark"]{
  --bg:#120c2b;--s1:#1b1340;--s2:#251b57;--s3:#33276f;--tx:#f2eeff;--mu:#a69fd0;--ln:rgba(242,238,255,.13);
  --ac:#8a72ff;--ac2:#2a2063;--on-ac:#12092e;--pink:#ff7ec0;--shadow:0 18px 50px -18px rgba(0,0,0,.7);
}
:root[data-palette="sunset"]{
  --bg:#fff2ea;--s2:#fde1d0;--s3:#f8c9ac;--tx:#3a1608;--mu:#85583f;--ln:rgba(58,22,8,.13);
  --ac:#cf4312;--ac2:#ffe4d5;--on-ac:#fff;--pink:#c2307f;--hero:linear-gradient(135deg,#a82e08 0%,#e8551f 55%,#d63384 110%);--shadow:0 18px 50px -18px rgba(168,46,8,.35);
}
:root[data-palette="sunset"][data-theme="dark"]{
  --bg:#1c0d07;--s1:#2b150c;--s2:#3a1e12;--s3:#4f2b19;--tx:#fff0e8;--mu:#d1a58d;--ln:rgba(255,240,232,.14);
  --ac:#ff8a57;--ac2:#45220f;--on-ac:#2a0f03;--pink:#ff6fb0;--shadow:0 18px 50px -18px rgba(0,0,0,.7);
}
*{box-sizing:border-box}
html{scroll-padding-top:env(safe-area-inset-top,0px)}
body{margin:0;background:var(--bg);color:var(--tx);font-family:'Figtree',system-ui,-apple-system,'Segoe UI',sans-serif;font-size:15px;line-height:1.45;-webkit-font-smoothing:antialiased}
h1,h2,h3,.disp{font-family:'Bricolage Grotesque','Figtree',system-ui,sans-serif;letter-spacing:-.02em}
.num{font-variant-numeric:tabular-nums}
button{font:inherit;color:inherit;cursor:pointer;border:0;background:none}
button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid var(--ac);outline-offset:2px}
button:disabled{opacity:.45;cursor:not-allowed}
.wrap{max-width:1180px;margin:0 auto;padding:0 14px}
.card{min-width:0;background:var(--s1);border:1px solid var(--ln);border-radius:18px;padding:16px}
.card.hero{border-radius:28px;padding:22px;box-shadow:var(--shadow)}
.inset{background:var(--s2);border-radius:12px;padding:10px 12px}
.h-card{font-size:17px;font-weight:700;margin:0 0 2px}
.sub{color:var(--mu);font-size:13px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border-radius:12px;padding:9px 14px;font-weight:600;transition:transform .12s,background .2s}
.btn:active{transform:scale(.97)}
.btn-p{background:var(--ac);color:var(--on-ac)}
.btn-g{background:var(--s2);color:var(--tx)}
.btn-g:hover{background:var(--s3)}
.btn-out{border:1.5px solid var(--ln);color:var(--tx)}
.btn-bad{background:var(--bad-bg);color:var(--bad)}
.btn-sm{padding:6px 10px;border-radius:10px;font-size:13px}
.chip{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:7px 12px;background:var(--s2);font-weight:500;font-size:14px;transition:background .15s,transform .1s}
.chip:hover{background:var(--s3)}
.chip:active{transform:scale(.96)}
.chip.on{background:var(--ac);color:var(--on-ac)}
.input{width:100%;background:var(--s2);border:1.5px solid transparent;border-radius:12px;padding:10px 12px;color:var(--tx);font:inherit}
.input:focus{border-color:var(--ac);outline:none}
label.f{display:block;font-size:13px;font-weight:600;color:var(--mu);margin-bottom:5px}
.pill{display:inline-block;border-radius:999px;padding:2px 10px;font-size:12px;font-weight:700}
.pill.good{background:var(--good-bg);color:var(--good)}.pill.warn{background:var(--warn-bg);color:var(--warn)}.pill.bad{background:var(--bad-bg);color:var(--bad)}.pill.info{background:var(--ac2);color:var(--ac)}
.good{color:var(--good)}.warn{color:var(--warn)}.bad{color:var(--bad)}.mu{color:var(--mu)}
.bar{height:9px;border-radius:99px;background:var(--s2);overflow:hidden;position:relative}
.bar>i{display:block;height:100%;border-radius:99px;transition:width .6s cubic-bezier(.2,.8,.2,1)}
.top{position:sticky;top:0;z-index:30;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--ln);padding-top:env(safe-area-inset-top,0px)}
.days{display:grid;grid-template-columns:repeat(30,1fr);gap:3px}
.days>div{height:12px;border-radius:4px;background:var(--s3);position:relative}
.days>div.past{background:var(--ac)}
.days>div.now{background:var(--pink);transform:scaleY(1.7);box-shadow:0 0 0 3px color-mix(in srgb,var(--pink) 30%,transparent)}
.days>div.due::after{content:'';position:absolute;left:50%;bottom:-8px;width:5px;height:5px;margin-left:-2.5px;border-radius:50%;background:var(--warn)}
.grid-2{grid-template-columns:1fr}
@media(min-width:760px){.grid-2{grid-template-columns:1fr 1fr!important}}
.hint{display:inline}
@media(max-width:639px){.hint{display:none}.top .wrap{padding-bottom:12px!important}}
.sidenav{display:none;position:sticky;top:130px;align-self:start}
@media(min-width:1024px){.sidenav{display:block}.botnav{display:none!important}}
.navbtn{display:flex;align-items:center;gap:10px;width:100%;padding:11px 14px;border-radius:14px;font-weight:600;color:var(--mu);transition:background .15s}
.navbtn:hover{background:var(--s2)}
.navbtn.on{background:var(--ac);color:var(--on-ac)}
.botnav{position:fixed;left:0;right:0;bottom:0;z-index:40;background:var(--s1);border-top:1px solid var(--ln);display:grid;grid-template-columns:repeat(6,1fr);padding:6px 6px calc(6px + env(safe-area-inset-bottom,0px))}
.botnav button{display:flex;flex-direction:column;align-items:center;gap:1px;padding:5px 0;border-radius:12px;font-size:11px;font-weight:600;color:var(--mu)}
.botnav button.on{background:var(--ac2);color:var(--ac)}
.botnav .ic{font-size:19px}
.toast{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(86px + env(safe-area-inset-bottom,0px));z-index:60;max-width:min(92vw,480px);background:var(--tx);color:var(--bg);border-radius:16px;padding:12px 16px;font-weight:600;box-shadow:var(--shadow);animation:pop .28s cubic-bezier(.2,1.2,.4,1)}
@media (min-width:1024px){.toast{bottom:28px}}
@keyframes pop{from{transform:translateX(-50%) scale(.9);opacity:0}to{transform:translateX(-50%) scale(1);opacity:1}}
.modal-bg{position:fixed;inset:0;z-index:70;background:rgba(10,5,30,.62);backdrop-filter:blur(4px);display:grid;place-items:end center;padding:12px}
@media (min-width:640px){.modal-bg{place-items:center}}
.modal{width:min(560px,100%);max-height:92vh;overflow:auto;background:var(--s1);border:1px solid var(--ln);border-radius:26px;padding:22px;box-shadow:var(--shadow);animation:rise .3s cubic-bezier(.2,.9,.3,1)}
@keyframes rise{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}
.opt{display:block;width:100%;text-align:left;border:1.5px solid var(--ln);border-radius:16px;padding:13px;margin-top:10px;background:var(--s1);transition:border-color .15s,background .15s}
.opt:hover:not(:disabled){border-color:var(--ac);background:var(--ac2)}
.scroll-x{overflow-x:auto}
.tbl{width:100%;border-collapse:collapse}
.tbl td,.tbl th{padding:9px 6px;border-bottom:1px solid var(--ln);text-align:right;font-size:14px}
.tbl td:first-child,.tbl th:first-child{text-align:left}
.tbl th{font-weight:600;color:var(--mu);font-size:13px}
.sw{width:46px;height:27px;border-radius:99px;background:var(--s3);position:relative;transition:background .2s;flex:none}
.sw::after{content:'';position:absolute;top:3px;left:3px;width:21px;height:21px;border-radius:50%;background:#fff;transition:transform .2s}
.sw.on{background:var(--good)}.sw.on::after{transform:translateX(19px)}
.star{font-size:17px;opacity:.28;filter:grayscale(1)}.star.on{opacity:1;filter:none}
input[type=range]{accent-color:var(--ac);width:100%}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
.pulse-bad{animation:pb 1.6s ease-in-out infinite}
@keyframes pb{50%{box-shadow:0 0 0 6px var(--bad-bg)}}
`;

/* ═══════════ constants.js ═══════════ */
const BUDGET = 10000, DAYS = 30, BASE = 130, PRIOR = 5, SUR = 8, SAVE_KEY = 'thirty-v3';
const CATS = {
  food: { label: 'Food', icon: '🍜', color: '#ff8a3d' },
  transport: { label: 'Transport', icon: '🛺', color: '#2fb8ff' },
  fun: { label: 'Going out', icon: '🎉', color: '#ff5fa8' },
  shopping: { label: 'Shopping', icon: '🛍️', color: '#a06bff' },
  study: { label: 'Study', icon: '📚', color: '#2fd08b' },
  health: { label: 'Health', icon: '💊', color: '#ff5d6c' },
  other: { label: 'Other', icon: '✨', color: '#9aa0b4' }
};
const PALETTES = [{ id: 'lagoon', name: 'Lagoon', sw: 'linear-gradient(135deg,#0a7f70,#ff7a59)' }, { id: 'violet', name: 'Violet', sw: 'linear-gradient(135deg,#5b3df5,#ff6fb5)' }, { id: 'sunset', name: 'Sunset', sw: 'linear-gradient(135deg,#cf4312,#c2307f)' }];
const QUICK = [
  { n: 'Chai', a: 30, c: 'food', i: '☕' }, { n: 'Lunch', a: 120, c: 'food', i: '🍛' }, { n: 'Auto ride', a: 60, c: 'transport', i: '🛺' },
  { n: 'Boba', a: 220, c: 'fun', i: '🧋' }, { n: 'Movie', a: 300, c: 'fun', i: '🎬' }, { n: 'Groceries', a: 250, c: 'food', i: '🛒' }
];
const EVENTS = [
  { id: 'screen', title: 'Your phone screen cracked', icon: '📱', amount: 1200, text: 'It slipped off the bed. A repair shop quotes ₹1,200.' },
  { id: 'bday', title: 'Best friend’s birthday', icon: '🎂', amount: 450, text: 'Everyone is chipping in for a surprise dinner.' },
  { id: 'fever', title: 'Fever and a clinic visit', icon: '🤒', amount: 520, text: 'Doctor, tests and medicines add up fast.' },
  { id: 'charger', title: 'Laptop charger died', icon: '🔌', amount: 650, text: 'You need it for tomorrow’s assignment.' },
  { id: 'cab', title: 'Last metro missed', icon: '🚕', amount: 340, text: 'A late-night cab is the only way home.' },
  { id: 'fine', title: 'Library fine and ID reprint', icon: '🪪', amount: 300, text: 'Lost ID card, overdue books. Ouch.' }
];
const SIM_TYPES = [
  { id: 'purchase', label: 'Buy something', icon: '🛍️' }, { id: 'subscribe', label: 'Start a subscription', icon: '📺' },
  { id: 'cancel', label: 'Cancel a subscription', icon: '✂️' }, { id: 'save', label: 'Save to a goal', icon: '🎯' }, { id: 'income', label: 'Earn money', icon: '💸' }
];
const SIM_PRESETS = {
  purchase: [{ name: 'Late-night Swiggy', amount: 350, cat: 'food' }, { name: 'Concert ticket', amount: 1500, cat: 'fun', day: 14 }, { name: 'Sneakers', amount: 3999, cat: 'shopping', emi: true }, { name: 'Textbook', amount: 450, cat: 'study' }],
  subscribe: [{ name: 'Gym membership', amount: 499 }, { name: 'Hotstar', amount: 149 }, { name: 'AI study tool', amount: 1650 }],
  income: [{ name: 'Freelance gig', amount: 1200 }, { name: 'Sold old phone', amount: 3000 }, { name: 'Pocket money top-up', amount: 500 }]
};

/* ═══════════ format.js ═══════════ */
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const sum = (arr, f) => arr.reduce((a, x) => a + f(x), 0);
const inr = (n, sign = false) => { const v = Math.round(n); const t = Math.abs(v).toLocaleString('en-IN'); return (v < 0 ? '−' : (sign && v > 0 ? '+' : '')) + '₹' + t; };
const num = v => Math.max(0, Math.round(Number(v) || 0));
let _id = Date.now();
const uid = () => 'i' + (_id++);
function rnd(seed) { let t = (seed + 0x6D2B79F5) >>> 0; let r = Math.imul(t ^ (t >>> 15), t | 1); r ^= r + Math.imul(r ^ (r >>> 7), r | 61); return { v: ((r ^ (r >>> 14)) >>> 0) / 4294967296, seed: t }; }

/* ═══════════ model.js ═══════════ */
function initial() {
  const base = {
    day: 1, balance: BUDGET, tx: [], history: {}, seed: 20260, surprises: 0, pending: null, finished: false,
    lateBills: 0, overdraftDays: 0, streak: 0, bestStreak: 0, cancelled: 0,
    commitments: [
      { id: 'c1', name: 'Metro pass', icon: '🚇', amount: 500, due: 2, paid: false },
      { id: 'c2', name: 'Mobile recharge', icon: '📶', amount: 299, due: 3, paid: false },
      { id: 'c3', name: 'Wi-Fi share', icon: '🛜', amount: 250, due: 10, paid: false },
      { id: 'c4', name: 'Study material', icon: '📚', amount: 400, due: 15, paid: false }
    ],
    subs: [
      { id: 's1', name: 'Spotify', icon: '🎧', amount: 119, renew: 4, active: true, usage: 5 },
      { id: 's2', name: 'Netflix', icon: '🍿', amount: 199, renew: 9, active: true, usage: 3 },
      { id: 's3', name: 'Gaming pass', icon: '🎮', amount: 179, renew: 12, active: true, usage: 2 },
      { id: 's4', name: 'YouTube Premium', icon: '▶️', amount: 149, renew: 17, active: true, usage: 4 },
      { id: 's5', name: 'Cloud storage', icon: '☁️', amount: 75, renew: 22, active: true, usage: 2 }
    ],
    goals: [
      { id: 'g1', name: 'Emergency fund', icon: '🛟', target: 1000, saved: 0, emergency: true },
      { id: 'g2', name: 'New earbuds', icon: '🎧', target: 1500, saved: 0 },
      { id: 'g3', name: 'Goa weekend', icon: '🏖️', target: 1500, saved: 0 }
    ]
  };
  return processDay(base);
}
function charge(s, { amount, kind, cat, note, icon }) {
  const n = { ...s, balance: s.balance - amount, tx: [{ id: uid(), day: s.day, amount, kind, cat: cat || kind, note, icon }, ...s.tx] };
  if (n.balance < 0 && s.balance >= 0 && (kind === 'bill' || kind === 'sub'))
    n.lateBills = s.lateBills + 1;
  return n;
}
function addIncome(s, amount, note) { return { ...s, balance: s.balance + amount, tx: [{ id: uid(), day: s.day, amount, kind: 'income', cat: 'income', note: note || 'Income', icon: '💸' }, ...s.tx] }; }
function addCommit(s, { name, icon, amount, due }) {
  if (due <= s.day) {
    let n = charge(s, { amount, kind: 'bill', note: name, icon });
    return { ...n, commitments: [...n.commitments, { id: uid(), name, icon, amount, due, paid: true }] };
  }
  return { ...s, commitments: [...s.commitments, { id: uid(), name, icon, amount, due, paid: false }] };
}
function payCommit(s, id) {
  const c = s.commitments.find(x => x.id === id);
  if (!c || c.paid)
    return s;
  const n = charge(s, { amount: c.amount, kind: 'bill', note: c.name, icon: c.icon });
  return { ...n, commitments: n.commitments.map(x => x.id === id ? { ...x, paid: true } : x) };
}
function processDay(s) {
  let n = s;
  for (const c of s.commitments) {
    if (!c.paid && c.due <= n.day) {
      n = charge(n, { amount: c.amount, kind: 'bill', note: c.name, icon: c.icon });
      n = { ...n, commitments: n.commitments.map(x => x.id === c.id ? { ...x, paid: true } : x) };
    }
  }
  for (const sb of s.subs) {
    if (sb.active && sb.renew <= n.day) {
      n = charge(n, { amount: sb.amount, kind: 'sub', note: sb.name, icon: sb.icon });
      n = { ...n, subs: n.subs.map(x => x.id === sb.id ? { ...x, renew: x.renew + 30 } : x) };
    }
  }
  return n;
}
function spend(s, { amount, cat, note, icon }) {
  if (amount <= 0)
    return s;
  return charge(s, { amount, kind: 'expense', cat, note: note || CATS[cat].label, icon: icon || CATS[cat].icon });
}
function deposit(s, id, amount) {
  const g = s.goals.find(x => x.id === id);
  if (!g)
    return s;
  const amt = Math.min(amount, Math.max(0, g.target - g.saved), Math.max(0, s.balance));
  if (amt <= 0)
    return s;
  return { ...s, balance: s.balance - amt, goals: s.goals.map(x => x.id === id ? { ...x, saved: x.saved + amt } : x),
    tx: [{ id: uid(), day: s.day, amount: amt, kind: 'goal', cat: 'goal', note: 'Saved to ' + g.name, icon: g.icon }, ...s.tx] };
}
function withdraw(s, id, amount) {
  const g = s.goals.find(x => x.id === id);
  if (!g)
    return s;
  const amt = Math.min(amount, g.saved);
  if (amt <= 0)
    return s;
  return { ...s, balance: s.balance + amt, goals: s.goals.map(x => x.id === id ? { ...x, saved: x.saved - amt } : x),
    tx: [{ id: uid(), day: s.day, amount: amt, kind: 'income', cat: 'income', note: 'Took back from ' + g.name, icon: g.icon }, ...s.tx] };
}
function toggleSub(s, id) {
  return { ...s, subs: s.subs.map(x => {
      if (x.id !== id)
        return x;
      return x.active ? { ...x, active: false } : { ...x, active: true, renew: Math.max(x.renew, s.day + 1) };
    }), cancelled: s.subs.find(x => x.id === id && x.active) ? s.cancelled + 1 : s.cancelled };
}
function advance(s) {
  if (s.finished || s.pending)
    return s;
  let n = { ...s, history: { ...s.history, [s.day]: s.balance } };
  const spentToday = s.tx.some(t => t.day === s.day && t.kind === 'expense');
  n.streak = spentToday ? 0 : s.streak + 1;
  n.bestStreak = Math.max(s.bestStreak, n.streak);
  if (s.balance < 0)
    n.overdraftDays = s.overdraftDays + 1;
  if (s.day >= DAYS)
    return { ...n, finished: true };
  n.day = s.day + 1;
  n = processDay(n);
  const r = rnd(n.seed);
  n.seed = r.seed;
  if (r.v < 0.13 && n.surprises < 3 && n.day < DAYS - 1) {
    const r2 = rnd(n.seed);
    n.seed = r2.seed;
    n.pending = { ...EVENTS[Math.floor(r2.v * EVENTS.length)], key: uid() };
    n.surprises++;
  }
  return n;
}
function resolveEvent(s, choice) {
  const ev = s.pending;
  if (!ev)
    return s;
  let n = { ...s, pending: null };
  if (choice === 'pay')
    n = charge(n, { amount: ev.amount, kind: 'surprise', note: ev.title, icon: ev.icon });
  if (choice === 'fund') {
    const g = n.goals.find(x => x.emergency);
    const use = Math.min(g.saved, ev.amount);
    n = { ...n, goals: n.goals.map(x => x.emergency ? { ...x, saved: x.saved - use } : x),
      tx: [{ id: uid(), day: n.day, amount: use, kind: 'surprise', cat: 'surprise', note: ev.title + ' (paid from emergency fund)', icon: '🛟', fromFund: true }, ...n.tx] };
    if (ev.amount - use > 0)
      n = charge(n, { amount: ev.amount - use, kind: 'surprise', note: ev.title + ' (rest)', icon: ev.icon });
  }
  if (choice === 'borrow') {
    n = addCommit(n, { name: 'Repay friend: ' + ev.title, icon: '🤝', amount: Math.round(ev.amount * 1.05), due: Math.min(DAYS, n.day + 7) });
  }
  return n;
}
function applyDecision(s, d) {
  const amt = num(d.amount);
  const day = clamp(Number(d.day) || s.day, s.day, DAYS);
  if (d.type === 'cancel') {
    const sb = s.subs.find(x => x.id === d.subId);
    return sb && sb.active ? toggleSub(s, d.subId) : s;
  }
  if (amt <= 0)
    return s;
  if (d.type === 'purchase') {
    const cat = d.cat || 'shopping';
    if (d.emi) {
      const total = amt + Math.round(amt * 0.05), part = Math.round(total / 3);
      let n = s;
      [0, 7, 14].forEach((o, i) => { n = addCommit(n, { name: (d.name || 'Purchase') + ' · EMI ' + (i + 1) + '/3', icon: '💳', amount: part, due: Math.min(DAYS, day + o) }); });
      return n;
    }
    if (day <= s.day)
      return spend(s, { amount: amt, cat, note: d.name || 'Purchase' });
    return addCommit(s, { name: d.name || 'Planned purchase', icon: CATS[cat].icon, amount: amt, due: day });
  }
  if (d.type === 'subscribe') {
    const sub = { id: uid(), name: d.name || 'New subscription', icon: '📺', amount: amt, renew: day, active: true, usage: 3 };
    return processDay({ ...s, subs: [...s.subs, sub] });
  }
  if (d.type === 'save') {
    return deposit(s, d.goalId, amt);
  }
  if (d.type === 'income')
    return addIncome(s, amt, d.name || 'Side income');
  return s;
}

/* ═══════════ analytics.js ═══════════ */
function calc(s) {
  const day = s.day, left = DAYS - day, rem = DAYS - day + 1;
  const upBills = sum(s.commitments.filter(c => !c.paid), c => c.amount);
  const act = s.subs.filter(x => x.active);
  const upSubs = sum(act.filter(x => x.renew <= DAYS), x => x.amount);
  const subsMonthly = sum(act, x => x.amount);
  const upcoming = upBills + upSubs, free = s.balance - upcoming;
  const goalTarget = sum(s.goals, g => g.target), goalSaved = sum(s.goals, g => g.saved);
  const goalRemaining = sum(s.goals, g => Math.max(0, g.target - g.saved));
  const disc = sum(s.tx.filter(t => t.kind === 'expense'), t => t.amount);
  const avg = (disc + BASE * PRIOR) / (day + PRIOR);
  const allowance = (free - goalRemaining) / rem;
  const dues = {};
  s.commitments.filter(c => !c.paid).forEach(c => { dues[c.due] = (dues[c.due] || 0) + c.amount; });
  act.filter(x => x.renew <= DAYS).forEach(x => { dues[x.renew] = (dues[x.renew] || 0) + x.amount; });
  let b = s.balance;
  const traj = [{ d: day, b }];
  let runout = s.balance < 0 ? day : null;
  for (let d = day + 1; d <= DAYS; d++) {
    b -= avg + SUR + (dues[d] || 0);
    traj.push({ d, b });
    if (runout === null && b < 0)
      runout = d;
  }
  const forecastEnd = b;
  let pool = Math.max(0, forecastEnd);
  const goalsProj = s.goals.map(g => { const need = Math.max(0, g.target - g.saved); const give = Math.min(need, pool); pool -= give; return { id: g.id, pct: (g.saved + give) / g.target, projected: g.saved + give }; });
  const projGoalPct = goalTarget ? sum(goalsProj, g => g.projected) / goalTarget : 0;
  const em = s.goals.find(g => g.emergency);
  const emPct = em ? em.saved / em.target : 0;
  const burn = avg + SUR;
  const coverage = left > 0 ? free / (burn * left) : (free >= 0 ? 2 : 0);
  const rf = {
    runway: clamp((1.5 - coverage) / 1),
    buffer: clamp(1 - free / 1500),
    burn: allowance <= 0 ? 1 : clamp((avg / Math.max(allowance, 20) - 0.8) / 0.8),
    subs: clamp((subsMonthly / BUDGET - 0.03) / 0.07),
    safety: clamp(1 - emPct)
  };
  let risk = 100 * (0.40 * rf.runway + 0.20 * rf.buffer + 0.25 * rf.burn + 0.075 * rf.subs + 0.075 * rf.safety);
  if (s.balance < 0)
    risk = 100;
  risk = Math.round(clamp(risk, 0, 100));
  const expSaved = goalTarget * day / DAYS;
  const parts = {
    savings: { label: 'Savings habit', max: 25, v: 25 * (0.6 * clamp(expSaved ? goalSaved / expSaved : 1) + 0.4 * clamp(projGoalPct)) },
    discipline: { label: 'Spending discipline', max: 25, v: 25 * (allowance <= 0 ? 0 : clamp((1.8 - avg / Math.max(allowance, 40)) / 0.8)) },
    bills: { label: 'Bills on time', max: 15, v: 15 * clamp(1 - 0.34 * s.lateBills - 0.1 * s.overdraftDays) },
    subs: { label: 'Subscription value', max: 10, v: 10 * (0.7 * clamp(1 - (subsMonthly / BUDGET - 0.03) / 0.07) + 0.3 * (act.length ? sum(act, x => x.usage) / act.length / 5 : 1)) },
    buffer: { label: 'Safety buffer', max: 15, v: 15 * (0.6 * clamp(emPct) + 0.4 * clamp(free / 1500)) },
    resilience: { label: 'Shock resilience', max: 10, v: 10 * (1 - risk / 100) }
  };
  let health = Math.round(sum(Object.values(parts), p => p.v));
  if (s.balance < 0)
    health = Math.min(health, 30);
  const byCat = {};
  s.tx.filter(t => t.kind === 'expense').forEach(t => { byCat[t.cat] = (byCat[t.cat] || 0) + t.amount; });
  const todaySpent = sum(s.tx.filter(t => t.kind === 'expense' && t.day === day), t => t.amount);
  return { day, left, rem, upBills, upSubs, upcoming, free, subsMonthly, goalTarget, goalSaved, goalRemaining, disc, avg, allowance, traj, runout, forecastEnd, goalsProj, projGoalPct, emPct, coverage, rf, risk, parts, health, byCat, todaySpent, balance: s.balance };
}
const riskInfo = r => r <= 25 ? { t: 'Low', c: 'good' } : r <= 50 ? { t: 'Moderate', c: 'warn' } : r <= 75 ? { t: 'High', c: 'bad' } : { t: 'Critical', c: 'bad' };
const healthInfo = h => h >= 80 ? { t: 'Thriving', c: 'good' } : h >= 65 ? { t: 'Healthy', c: 'good' } : h >= 45 ? { t: 'Shaky', c: 'warn' } : { t: 'Needs care', c: 'bad' };
const tone = c => c === 'good' ? 'var(--good)' : c === 'warn' ? 'var(--warn)' : 'var(--bad)';
function buildInsights(s, m) {
  const out = [];
  if (s.balance < 0)
    out.push({ tone: 'bad', icon: '🚨', title: 'You are in overdraft', text: 'Your balance is below zero. Pause spending and take back money from a goal or earn some income.', act: { label: 'Try earning', d: { type: 'income', amount: 1000, name: 'Freelance gig' } } });
  else if (m.runout)
    out.push({ tone: 'bad', icon: '⏳', title: 'Money runs out on day ' + m.runout, text: 'At your current pace you will not reach day 30. Cut daily spend to about ' + inr(Math.max(0, m.allowance)) + ' or trim subscriptions.' });
  if (m.allowance <= 0 && s.balance >= 0)
    out.push({ tone: 'warn', icon: '🧊', title: 'Spending freeze', text: 'Bills and goals already claim all your cash. Daily allowance is ' + inr(m.allowance) + '. Pause goal saving or earn extra.' });
  if (m.avg > m.allowance * 1.1 && m.allowance > 0)
    out.push({ tone: 'warn', icon: '🔥', title: 'Spending faster than allowance', text: 'You average ' + inr(m.avg) + '/day against an allowance of ' + inr(m.allowance) + '. That gap costs about ' + inr((m.avg - m.allowance) * m.left) + ' by day 30.' });
  const low = s.subs.filter(x => x.active && x.usage <= 2).sort((a, b) => b.amount - a.amount)[0];
  if (low)
    out.push({ tone: 'info', icon: '✂️', title: 'Is ' + low.name + ' worth it?', text: 'You rated it ' + low.usage + '/5 for use. Cancelling frees ' + inr(low.amount) + ' a month (' + inr(low.amount * 12) + ' a year).', act: { label: 'Simulate cancelling', d: { type: 'cancel', subId: low.id } } });
  const em = s.goals.find(g => g.emergency);
  if (em && em.saved < em.target && s.balance > 400)
    out.push({ tone: 'info', icon: '🛟', title: 'Start your emergency fund', text: 'A surprise bill hits harder with no buffer. Even ' + inr(250) + ' today lowers your risk.', act: { label: 'Simulate saving ₹250', d: { type: 'save', goalId: em.id, amount: 250 } } });
  const top = Object.entries(m.byCat).sort((a, b) => b[1] - a[1])[0];
  if (top && m.disc > 0 && top[1] / m.disc > 0.45 && m.disc > 400)
    out.push({ tone: 'info', icon: CATS[top[0]].icon, title: CATS[top[0]].label + ' is ' + Math.round(top[1] / m.disc * 100) + '% of your spending', text: 'That is your biggest lever. A 20% trim there saves roughly ' + inr(top[1] * 0.2 / Math.max(1, s.day) * m.left) + ' this month.' });
  if (s.streak >= 2)
    out.push({ tone: 'good', icon: '🔥', title: s.streak + '-day no-spend streak', text: 'Nice. Every skipped day pushes your forecast up by about ' + inr(m.avg) + '.' });
  if (m.projGoalPct < 0.7 && s.balance >= 0)
    out.push({ tone: 'warn', icon: '🎯', title: 'Goals are underfunded', text: 'At this pace you will fund only ' + Math.round(m.projGoalPct * 100) + '% of your goals. Lower daily spend or earn extra.' });
  if (!out.length)
    out.push({ tone: 'good', icon: '✅', title: 'You are on a steady path', text: 'Spending, goals and bills are balanced. Use What-if to test a purchase before you make it.' });
  return out.slice(0, 5);
}
function achievements(s, m) {
  return [
    { i: '🎯', t: 'First deposit', on: m.goalSaved > 0 },
    { i: '🛟', t: 'Safety net full', on: m.emPct >= 1 },
    { i: '✂️', t: 'Subscription slayer', on: s.cancelled > 0 },
    { i: '🔥', t: '3-day no-spend', on: s.bestStreak >= 3 },
    { i: '🧘', t: 'Under allowance', on: s.day >= 4 && m.avg <= Math.max(m.allowance, 0) },
    { i: '🏦', t: 'Zero overdraft (day 10+)', on: s.day >= 10 && s.overdraftDays === 0 && s.balance >= 0 }
  ];
}

/* ═══════════ ui.jsx ═══════════ */
function Num({ v }) {
  const [d, setD] = useState(v);
  const ref = useRef(v);
  useEffect(() => {
    const from = ref.current, to = v, t0 = performance.now();
    let raf;
    const tick = t => { const p = Math.min(1, (t - t0) / 650), e = 1 - Math.pow(1 - p, 3), cur = from + (to - from) * e; ref.current = cur; setD(cur); if (p < 1)
      raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [v]);
  return <span className="num">{inr(d)}</span>;
}
function Ring({ value, size = 104, stroke = 11, color, children }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className="relative flex-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--s2)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamp(value / 100))}
          style={{ transition: 'stroke-dashoffset .8s ease,stroke .4s' }}
        />
      </svg>
      <div className="absolute grid place-items-center text-center" style={{ inset: 0 }}>
        {children}
      </div>
    </div>
  );
}
function Delta({ a, b, fmt = inr, goodUp = true, inv = false }) {
  const d = b - a;
  if (Math.abs(d) < 0.5)
    return <span className="mu">no change</span>;
  const good = (d > 0) === goodUp;
  return (
    <span className={'font-bold ' + (good ? 'good' : 'bad')}>
      {d > 0 ? '▲' : '▼'} {fmt(Math.abs(d))}
    </span>
  );
}
function LineChart({ lines, day, height = 230 }) {
  const W = 640, H = height, pl = 46, pr = 12, pt = 14, pb = 26;
  const all = lines.flatMap(l => l.pts.map(p => p.b));
  let min = Math.min(0, ...all), max = Math.max(...all);
  if (max - min < 200)
    max = min + 200;
  const pad = (max - min) * 0.06;
  max += pad;
  if (min < 0)
    min -= pad;
  const x = d => pl + (d - 1) / (DAYS - 1) * (W - pl - pr), y = v => pt + (1 - (v - min) / (max - min)) * (H - pt - pb);
  const path = pts => pts.map((p, i) => (i ? 'L' : 'M') + x(p.d).toFixed(1) + ' ' + y(p.b).toFixed(1)).join(' ');
  const ticks = [0, 1, 2, 3].map(i => min + (max - min) * i / 3);
  const first = lines.find(l => l.area);
  const id = 'g' + Math.abs(Math.round(max)) % 997;
  return (
    <svg
      viewBox={'0 0 ' + W + ' ' + H}
      className="block"
      style={{ width: '100%', height: 'auto' }}
      role="img"
      aria-label="Balance forecast over 30 days"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--ac)" stopOpacity=".32"/>
          <stop offset="100%" stopColor="var(--ac)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {ticks.map(t => (
        <g key={t}>
          <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} stroke="var(--ln)"/>
          <text x={pl - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--mu)">
            {(Math.round(t / 100) / 10) + 'k'}
          </text>
        </g>
      ))}
      {min < 0 && (
        <line
          x1={pl}
          x2={W - pr}
          y1={y(0)}
          y2={y(0)}
          stroke="var(--bad)"
          strokeDasharray="5 4"
          strokeWidth="1.5"
        />
      )}
      {[1, 5, 10, 15, 20, 25, 30].map(d => (
        <text key={d} x={x(d)} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--mu)">
          {d}
        </text>
      ))}
      {first && (
        <path
          d={path(first.pts) + ' L' + x(first.pts[first.pts.length - 1].d) + ' ' + y(Math.max(min, 0)) + ' L' + x(first.pts[0].d) + ' ' + y(Math.max(min, 0)) + ' Z'}
          fill={'url(#' + id + ')'}
        />
      )}
      <line
        x1={x(day)}
        x2={x(day)}
        y1={pt}
        y2={H - pb}
        stroke="var(--pink)"
        strokeWidth="2"
        strokeDasharray="2 4"
      />
      {lines.map((l, i) => (
        <path
          key={i}
          d={path(l.pts)}
          fill="none"
          stroke={l.color}
          strokeWidth={l.w || 3}
          strokeDasharray={l.dash || ''}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {lines.filter(l => l.end).map((l, i) => { const p = l.pts[l.pts.length - 1]; return (
        <circle
          key={i}
          cx={x(p.d)}
          cy={y(p.b)}
          r="5"
          fill={l.color}
          stroke="var(--s1)"
          strokeWidth="2"
        />
      ); })}
    </svg>
  );
}
function Donut({ data, size = 130 }) {
  const total = sum(data, d => d.v), r = 48, c = 2 * Math.PI * r;
  let off = 0;
  return (
    <svg width={size} height={size} viewBox="0 0 130 130" className="flex-none">
      <circle cx="65" cy="65" r={r} fill="none" stroke="var(--s2)" strokeWidth="18"/>
      {data.map(d => { const len = total ? d.v / total * c : 0; const el = (
        <circle
          key={d.k}
          cx="65"
          cy="65"
          r={r}
          fill="none"
          stroke={d.color}
          strokeWidth="18"
          strokeDasharray={len + ' ' + (c - len)}
          strokeDashoffset={-off}
          transform="rotate(-90 65 65)"
        />
      ); off += len; return el; })}
      <text x="65" y="62" textAnchor="middle" fontSize="11" fill="var(--mu)">spent</text>
      <text
        x="65"
        y="80"
        textAnchor="middle"
        fontSize="16"
        fontWeight="700"
        fill="var(--tx)"
        className="num"
      >
        {inr(total)}
      </text>
    </svg>
  );
}
function Stat({ label, value, sub, color }) {
  return (
    <div className="inset flex-1 min-w-0">
      <div className="sub">{label}</div>
      <div
        className="disp num text-[22px] font-extrabold leading-[1.15]"
        style={{ color: color || 'var(--tx)' }}
      >
        {value}
      </div>
      {sub && <div className="sub" style={{ fontSize: 12 }}>{sub}</div>}
    </div>
  );
}
function Field({ label, children }) { return <div><label className="f">{label}</label>{children}</div>; }
function CatPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Object.entries(CATS).map(([k, c]) => (
        <button
          key={k}
          type="button"
          className={'chip' + (value === k ? ' on' : '')}
          onClick={() => onChange(k)}
        >
          {c.icon} {c.label}
        </button>
      ))}
    </div>
  );
}
function InsightRow({ x, goSim }) {
  const bg = x.tone === 'bad' ? 'var(--bad-bg)' : x.tone === 'warn' ? 'var(--warn-bg)' : x.tone === 'good' ? 'var(--good-bg)' : 'var(--ac2)';
  return (
    <div
      className="flex gap-3 rounded-[14px] items-start"
      style={{ background: bg, padding: '12px 14px' }}
    >
      <span className="text-[22px]">{x.icon}</span>
      <div className="flex-1">
        <div className="font-bold">{x.title}</div>
        <div className="text-[14px]">{x.text}</div>
        {x.act && (
          <button className="btn btn-p btn-sm mt-2" onClick={() => goSim(x.act.d)}>
            {x.act.label}
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════ Header.jsx ═══════════ */
function Header({ s, m, onNext, onWeek, theme, setTheme, onReset, resetArmed, palette, setPalette }) {
  const dueMap = useMemo(() => {
    const o = {};
    s.commitments.filter(c => !c.paid).forEach(c => { (o[c.due] = o[c.due] || []).push(c.name + ' ' + inr(c.amount)); });
    s.subs.filter(x => x.active && x.renew <= DAYS).forEach(x => { (o[x.renew] = o[x.renew] || []).push(x.name + ' ' + inr(x.amount)); });
    return o;
  }, [s]);
  const ri = riskInfo(m.risk);
  return (
    <header className="top">
      <div className="wrap" style={{ paddingTop: 10, paddingBottom: 16 }}>
        <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
          <div className="disp font-extrabold text-[24px] flex items-center gap-2">
            <span
              className="rounded-[10px] text-[20px]"
              style={{ background: 'var(--ac)', color: 'var(--on-ac)', padding: '0 9px' }}
            >
              30
            </span>
            <span>Thirty</span>
          </div>
          <div className="flex-1 min-w-[10px]"></div>
          <div className="num font-bold text-[14px] whitespace-nowrap">
            Day {s.day}/{DAYS} · {inr(s.balance)}
          </div>
          <button
            className="btn btn-g btn-sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            className={'btn btn-sm ' + (resetArmed ? 'btn-bad' : 'btn-g')}
            onClick={onReset}
          >
            {resetArmed ? 'Tap again to reset' : 'Restart'}
          </button>
        </div>
        <div className="days" aria-label="30 day timeline">
          {Array.from({ length: DAYS }, (_, i) => { const d = i + 1; const cls = d < s.day ? 'past' : d === s.day ? 'now' : (dueMap[d] ? 'due' : ''); return (
            <div
              key={d}
              className={cls + (dueMap[d] && d > s.day ? ' due' : '')}
              title={'Day ' + d + (dueMap[d] ? ': ' + dueMap[d].join(', ') : '')}
            ></div>
          ); })}
        </div>
        <div className="flex items-center gap-2 mt-3.5 flex-wrap">
          <div role="group" aria-label="Colour theme" className="flex gap-[7px] items-center">
            {PALETTES.map(p => (
              <button
                key={p.id}
                title={p.name}
                aria-label={p.name + ' colour theme'}
                aria-pressed={palette === p.id}
                onClick={() => setPalette(p.id)}
                className="w-6 h-6"
                style={{ borderRadius: '50%', background: p.sw, boxShadow: palette === p.id ? '0 0 0 2px var(--bg),0 0 0 4px var(--tx)' : '0 0 0 1px var(--ln)' }}
              ></button>
            ))}
          </div>
          <span className="sub hint">Amber dots mark bills and renewals ahead.</span>
          <div className="flex-1"></div>
          {s.day < DAYS && (
            <button className="btn btn-g btn-sm" disabled={!!s.pending} onClick={onWeek}>
              Skip 7 days
            </button>
          )}
          <button
            className="btn btn-p btn-sm"
            disabled={!!s.pending || s.finished}
            onClick={onNext}
          >
            {s.day >= DAYS ? 'Finish month' : 'Next day'}
          </button>
        </div>
      </div>
    </header>
  );
}

/* ═══════════ Home.jsx ═══════════ */
function Home({ s, m, act, go, goSim, onStress }) {
  const ri = riskInfo(m.risk), hi = healthInfo(m.health);
  const insights = buildInsights(s, m);
  const hist = [];
  for (let d = 1; d < s.day; d++)
    if (s.history[d] !== undefined)
      hist.push({ d, b: s.history[d] });
  hist.push({ d: s.day, b: s.balance });
  const catData = Object.entries(m.byCat).map(([k, v]) => ({ k, v, color: CATS[k].color, label: CATS[k].label, icon: CATS[k].icon })).sort((a, b) => b.v - a.v);
  const upcoming = [
    ...s.commitments.filter(c => !c.paid).map(c => ({ k: c.id, day: c.due, name: c.name, icon: c.icon, amount: c.amount, type: 'Bill' })),
    ...s.subs.filter(x => x.active && x.renew <= DAYS).map(x => ({ k: x.id, day: x.renew, name: x.name, icon: x.icon, amount: x.amount, type: 'Renewal' }))
  ].sort((a, b) => a.day - b.day).slice(0, 6);
  const quick = q => act(n => spend(n, { amount: q.a, cat: q.c, note: q.n, icon: q.i }), (b, a) => ({ text: inr(-q.a) + ' on ' + q.n + '. Allowance ' + inr(b.allowance) + ' → ' + inr(a.allowance), tone: a.allowance < b.allowance ? 'warn' : 'good' }));
  const ach = achievements(s, m);
  return (
    <div className="grid gap-3.5">
      <div
        className="card hero"
        style={{ background: 'var(--hero)', color: '#fff', border: 0 }}
      >
        <div className="flex flex-wrap gap-5 items-center">
          <div className="flex-[1_1_280px]">
            <div className="opacity-[0.85] font-semibold">You have left</div>
            <div
              className="disp font-extrabold leading-none"
              style={{ fontSize: 'clamp(44px,9vw,72px)' }}
            >
              <Num v={s.balance}/>
            </div>
            <div className="opacity-[0.9] mt-1.5">
              {m.allowance > 0 ? (
                <span>
                  You can spend{' '}
                  <b className="num">{inr(m.allowance)}</b>
                  {' '}a day and still hit your goals.
                </span>
              ) : (
                <span>
                  <b>No safe spending room.</b>
                  {' '}Bills and goals already claim your cash.
                </span>
              )}
            </div>
            {m.todaySpent > 0 && (
              <div className="opacity-[0.85] text-[13px] mt-1">
                Spent today: {inr(m.todaySpent)}
              </div>
            )}
            <div className="mt-3 max-w-[360px]">
              <div className="flex justify-between text-[13px] opacity-[0.92] mb-[5px]">
                <span>Budget used</span>
                <span className="num">
                  {inr(Math.max(0, BUDGET - s.balance))} of {inr(BUDGET)}
                </span>
              </div>
              <div
                className="h-2 rounded-[99px] overflow-hidden"
                style={{ background: 'rgba(255,255,255,.28)' }}
              >
                <div
                  className="rounded-[99px]"
                  style={{ height: '100%', width: (clamp((BUDGET - s.balance) / BUDGET) * 100) + '%', background: '#fff', transition: 'width .6s' }}
                ></div>
              </div>
            </div>
          </div>
          <div className="flex gap-3.5">
            <div className="text-center">
              <Ring value={m.health} color="#fff" size={100}>
                <div>
                  <div className="disp num text-[28px] font-extrabold leading-none">
                    {m.health}
                  </div>
                  <div className="text-[11px] opacity-[0.85]">health</div>
                </div>
              </Ring>
              <div className="text-[13px] font-bold mt-1">{hi.t}</div>
            </div>
            <div className="text-center">
              <Ring value={m.risk} color="#ffd36b" size={100}>
                <div>
                  <div className="disp num text-[28px] font-extrabold leading-none">
                    {m.risk}
                  </div>
                  <div className="text-[11px] opacity-[0.85]">risk</div>
                </div>
              </Ring>
              <div className="text-[13px] font-bold mt-1">{ri.t}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5">
        <Stat
          label="Month-end forecast"
          value={inr(m.forecastEnd)}
          color={m.forecastEnd < 0 ? 'var(--bad)' : 'var(--tx)'}
          sub={m.runout ? 'Runs out on day ' + m.runout : 'Lasts to day 30'}
        />
        <Stat
          label="Committed ahead"
          value={inr(m.upcoming)}
          sub={'Bills ' + inr(m.upBills) + ' · subs ' + inr(m.upSubs)}
        />
        <Stat
          label="Goals to fund"
          value={inr(m.goalRemaining)}
          sub={Math.round(m.projGoalPct * 100) + '% funded at this pace'}
        />
        <Stat
          label="Average spend"
          value={inr(m.avg) + '/day'}
          color={m.avg > m.allowance && m.allowance > 0 ? 'var(--warn)' : 'var(--tx)'}
          sub={'vs allowance ' + inr(m.allowance)}
        />
      </div>
      <div className="card">
        <div className="flex justify-between gap-2 flex-wrap">
          <div>
            <h2 className="h-card">Your 30-day runway</h2>
            <div className="sub">
              Solid line is your past. Dashed line is where you are heading.
            </div>
          </div>
          <button className="btn btn-g btn-sm" onClick={() => go('sim')}>
            Test a decision
          </button>
        </div>
        <LineChart
          day={s.day}
          lines={[
      { pts: m.traj, color: m.forecastEnd < 0 ? 'var(--bad)' : 'var(--ac)', dash: '7 6', w: 3, area: true, end: true },
      { pts: hist.length > 1 ? hist : [{ d: s.day, b: s.balance }], color: 'var(--tx)', w: 3 }
    ]}
        />
      </div>
      <div className="grid-2 grid gap-3.5">
        <div className="card">
          <h2 className="h-card">Quick log</h2>
          <div className="sub mb-2.5">One tap. Watch your allowance react.</div>
          <div className="flex flex-wrap gap-2">
            {QUICK.map(q => (
              <button key={q.n} className="chip" onClick={() => quick(q)}>
                {q.i} {q.n}{' '}
                <b className="num">{inr(q.a)}</b>
              </button>
            ))}
          </div>
          <div className="mt-3.5 flex gap-2 flex-wrap">
            <button className="btn btn-g btn-sm" onClick={() => go('spend')}>
              Log something else
            </button>
            <button className="btn btn-out btn-sm" onClick={onStress} disabled={!!s.pending}>
              🎲 Trigger a surprise
            </button>
          </div>
        </div>
        <div className="card">
          <h2 className="h-card">Coming up</h2>
          <div className="sub mb-1.5">Money that leaves your account soon.</div>
          {upcoming.length === 0 ? <div className="sub">Nothing scheduled. Enjoy it.</div> : upcoming.map(u => (
            <div
              key={u.k}
              className="flex items-center gap-2.5"
              style={{ padding: '7px 0', borderBottom: '1px solid var(--ln)' }}
            >
              <span className="text-[20px]">{u.icon}</span>
              <div className="flex-1">
                <div className="font-semibold">{u.name}</div>
                <div className="sub">
                  {u.type} on day{' '}
                  {u.day}{u.day - s.day <= 3 ? ' · in ' + (u.day - s.day) + 'd' : ''}
                </div>
              </div>
              <b className="num">{inr(u.amount)}</b>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h2 className="h-card">What your numbers are telling you</h2>
        <div className="grid gap-2.5 mt-2.5">
          {insights.map((x, i) => <InsightRow key={i} x={x} goSim={goSim}/>)}
        </div>
      </div>
      <div className="grid-2 grid gap-3.5">
        <div className="card">
          <h2 className="h-card">Where it goes</h2>
          {catData.length === 0 ? (
            <div className="sub" style={{ padding: '18px 0' }}>
              Log your first expense to see the split.
            </div>
          ) : (
            <div className="flex gap-3.5 items-center flex-wrap mt-2">
              <Donut data={catData}/>
              <div className="flex-1 min-w-[140px] grid gap-[5px]">
                {catData.map(c => (
                  <div key={c.k} className="flex items-center gap-2 text-[14px]">
                    <i className="w-2.5 h-2.5 rounded-[3px]" style={{ background: c.color }}></i>
                    <span className="flex-1">{c.label}</span>
                    <b className="num">{inr(c.v)}</b>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="card">
          <h2 className="h-card">Goals</h2>
          <div className="grid gap-3 mt-2">
            {s.goals.map(g => { const p = m.goalsProj.find(x => x.id === g.id); return (
              <div key={g.id}>
                <div className="flex justify-between font-semibold">
                  <span>{g.icon} {g.name}</span>
                  <span className="num sub">{inr(g.saved)} / {inr(g.target)}</span>
                </div>
                <div className="bar mt-[5px]">
                  <i
                    className="absolute z-[2]"
                    style={{ width: (g.saved / g.target * 100) + '%', background: 'var(--good)' }}
                  ></i>
                  <i
                    className="absolute"
                    style={{ width: (p.pct * 100) + '%', background: 'var(--s3)' }}
                  ></i>
                </div>
              </div>
            ); })}
          </div>
          <div className="sub mt-2">
            Green is saved. Grey is where you will land at current pace.
          </div>
        </div>
      </div>
      <div className="card">
        <h2 className="h-card">Badges</h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {ach.map(a => (
            <span
              key={a.t}
              className="chip"
              style={{ opacity: a.on ? 1 : .4, background: a.on ? 'var(--good-bg)' : 'var(--s2)' }}
            >
              {a.i} {a.t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════ Spend.jsx ═══════════ */
function Spend({ s, m, act }) {
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState('food');
  const [note, setNote] = useState('');
  const [iAmt, setIAmt] = useState('');
  const [iNote, setINote] = useState('');
  const [filter, setFilter] = useState('all');
  const amt = num(amount);
  const preview = useMemo(() => amt > 0 ? calc(spend(s, { amount: amt, cat, note })) : null, [s, amt, cat, note]);
  const log = () => { if (amt <= 0)
    return; act(n => spend(n, { amount: amt, cat, note }), (b, a) => ({ text: inr(-amt) + ' logged. Allowance ' + inr(b.allowance) + ' → ' + inr(a.allowance) + ' · risk ' + b.risk + ' → ' + a.risk, tone: a.risk > b.risk + 3 ? 'warn' : 'good' })); setAmount(''); setNote(''); };
  const addInc = () => { const v = num(iAmt); if (v <= 0)
    return; act(n => addIncome(n, v, iNote || 'Income'), (b, a) => ({ text: inr(v) + ' added. Allowance ' + inr(b.allowance) + ' → ' + inr(a.allowance), tone: 'good' })); setIAmt(''); setINote(''); };
  const list = s.tx.filter(t => filter === 'all' || (filter === 'spend' && ['expense', 'surprise'].includes(t.kind)) || (filter === 'bills' && ['bill', 'sub'].includes(t.kind)) || (filter === 'income' && t.kind === 'income') || (filter === 'goal' && t.kind === 'goal'));
  const days = [...new Set(list.map(t => t.day))].sort((a, b) => b - a);
  const sign = t => t.kind === 'income' ? '+' : t.fromFund ? '' : '−';
  return (
    <div className="grid gap-3.5">
      <div className="card">
        <h2 className="h-card">Log an expense</h2>
        <div className="grid gap-3 mt-2.5">
          <Field label="Amount (₹)">
            <input
              className="input num"
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="e.g. 180"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </Field>
          <Field label="Category"><CatPicker value={cat} onChange={setCat}/></Field>
          <Field label="Note (optional)">
            <input
              className="input"
              placeholder="What was it?"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </Field>
          {preview && (
            <div className="inset flex flex-wrap gap-3 text-[14px]">
              <span>
                Balance{' '}
                <b className="num">{inr(m.balance)} → {inr(preview.balance)}</b>
              </span>
              <span>
                Allowance{' '}
                <b className="num">{inr(m.allowance)} → {inr(preview.allowance)}</b>
              </span>
              <span>
                Risk{' '}
                <b className={preview.risk > m.risk ? 'bad' : 'good'}>
                  {m.risk} → {preview.risk}
                </b>
              </span>
            </div>
          )}
          <button className="btn btn-p" onClick={log} disabled={amt <= 0}>Log expense</button>
        </div>
      </div>
      <div className="card">
        <h2 className="h-card">Add income</h2>
        <div className="sub">
          Pocket money, a gig, a refund. It lifts your balance and allowance right away.
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-2 mt-2.5 items-end">
          <Field label="Amount (₹)">
            <input
              className="input num"
              type="number"
              inputMode="numeric"
              min="0"
              value={iAmt}
              onChange={e => setIAmt(e.target.value)}
            />
          </Field>
          <Field label="From">
            <input
              className="input"
              placeholder="Freelance"
              value={iNote}
              onChange={e => setINote(e.target.value)}
            />
          </Field>
          <button className="btn btn-g" onClick={addInc} disabled={num(iAmt) <= 0}>Add</button>
        </div>
      </div>
      <div className="card">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h2 className="h-card">Activity</h2>
          <div className="flex gap-1.5 flex-wrap">
            {[['all', 'All'], ['spend', 'Spending'], ['bills', 'Bills'], ['goal', 'Goals'], ['income', 'Income']].map(([k, l]) => (
              <button
                key={k}
                className={'chip' + (filter === k ? ' on' : '')}
                onClick={() => setFilter(k)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        {days.length === 0 ? (
          <div className="sub" style={{ padding: '20px 0' }}>
            Nothing here yet. Log a chai to get started.
          </div>
        ) : days.map(d => (
          <div key={d} className="mt-3">
            <div className="sub font-bold mb-1">Day {d}{d === s.day ? ' (today)' : ''}</div>
            {list.filter(t => t.day === d).map(t => (
              <div
                key={t.id}
                className="flex items-center gap-2.5"
                style={{ padding: '8px 0', borderBottom: '1px solid var(--ln)' }}
              >
                <span className="text-[20px] w-7 text-center">{t.icon}</span>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-semibold overflow-hidden"
                    style={{ textOverflow: 'ellipsis' }}
                  >
                    {t.note}
                  </div>
                  <div className="sub">
                    {t.kind === 'expense' ? CATS[t.cat]?.label : t.kind === 'sub' ? 'Subscription' : t.kind === 'bill' ? 'Bill' : t.kind === 'goal' ? 'Goal' : t.kind === 'surprise' ? 'Surprise' : 'Income'}
                  </div>
                </div>
                <b className={'num ' + (t.kind === 'income' ? 'good' : '')}>
                  {sign(t)}{inr(t.amount).replace('−', '')}
                </b>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════ Simulator.jsx ═══════════ */
function Sim({ s, m, act, preset }) {
  const blank = () => ({ type: 'purchase', name: '', amount: '', day: s.day, cat: 'shopping', emi: false, subId: (s.subs.find(x => x.active) || {}).id || '', goalId: s.goals[0].id });
  const [d, setD] = useState(blank);
  useEffect(() => { if (preset)
    setD({ ...blank(), ...preset.d }); }, [preset && preset.key]);
  const set = (k, v) => setD(o => ({ ...o, [k]: v }));
  const after = useMemo(() => applyDecision(s, d), [s, d]);
  const a = useMemo(() => calc(after), [after]);
  const valid = after !== s;
  const amt = num(d.amount);
  const immediate = (d.type === 'purchase' && !d.emi && (Number(d.day) || s.day) <= s.day) || d.type === 'save';
  const afford = !(immediate && amt > s.balance && d.type !== 'income');
  const cancelSub = d.type === 'cancel' ? s.subs.find(x => x.id === d.subId) : null;
  const notes = [];
  if (valid) {
    const dA = a.allowance - m.allowance;
    if (Math.abs(dA) >= 1)
      notes.push({ c: dA < 0 ? 'bad' : 'good', t: 'Daily allowance ' + (dA < 0 ? 'drops' : 'rises') + ' by ' + inr(Math.abs(dA)) + ' (' + Math.abs(Math.round(dA / Math.max(Math.abs(m.allowance), 1) * 100)) + '%).' });
    if (a.runout && !m.runout)
      notes.push({ c: 'bad', t: 'You would run out of money on day ' + a.runout + '.' });
    if (!a.runout && m.runout)
      notes.push({ c: 'good', t: 'This fixes your cash shortfall. You would reach day 30.' });
    s.goals.forEach(g => { const p0 = m.goalsProj.find(x => x.id === g.id).pct, p1 = a.goalsProj.find(x => x.id === g.id).pct; if (Math.abs(p1 - p0) >= 0.03)
      notes.push({ c: p1 < p0 ? 'bad' : 'good', t: g.name + ' funding ' + (p1 < p0 ? 'falls' : 'rises') + ' from ' + Math.round(p0 * 100) + '% to ' + Math.round(p1 * 100) + '%.' }); });
    if (a.risk >= m.risk + 8)
      notes.push({ c: 'bad', t: 'Financial risk jumps from ' + m.risk + ' to ' + a.risk + ' (' + riskInfo(a.risk).t.toLowerCase() + ').' });
    if (a.risk <= m.risk - 8)
      notes.push({ c: 'good', t: 'Financial risk eases from ' + m.risk + ' to ' + a.risk + '.' });
    if (d.emi)
      notes.push({ c: 'warn', t: 'EMI adds a 5% fee (' + inr(Math.round(amt * 0.05)) + ') and three payments over about two weeks. It hides the hit today and makes it bigger later.' });
    if (d.type === 'cancel' && cancelSub && cancelSub.renew > DAYS)
      notes.push({ c: 'info', t: cancelSub.name + ' is already billed this cycle. You save ' + inr(cancelSub.amount) + ' next month (' + inr(cancelSub.amount * 12) + ' a year).' });
    if (d.type === 'cancel' && cancelSub && cancelSub.renew <= DAYS)
      notes.push({ c: 'good', t: 'You also save ' + inr(cancelSub.amount * 12) + ' over a year.' });
  }
  let verdict = null;
  if (valid) {
    if (!afford)
      verdict = { c: 'bad', i: '🚫', t: 'Not enough balance', x: 'You only have ' + inr(s.balance) + ' right now.' };
    else if (a.balance < 0 || a.forecastEnd < 0 && m.forecastEnd >= 0 || a.risk >= 76)
      verdict = { c: 'bad', i: '🛑', t: 'Red light', x: 'This pushes you into the danger zone.' };
    else if (a.risk > m.risk + 12 || a.allowance < m.allowance * 0.7)
      verdict = { c: 'warn', i: '🤔', t: 'Think twice', x: 'You can afford it, but it squeezes the rest of your month.' };
    else if (a.risk < m.risk || a.health > m.health + 1)
      verdict = { c: 'good', i: '🌱', t: 'Smart move', x: 'This improves your position.' };
    else
      verdict = { c: 'good', i: '✅', t: 'Green light', x: 'Your month stays healthy.' };
  }
  const lock = () => {
    act(n => applyDecision(n, d), (b, x) => ({ text: 'Done. Allowance ' + inr(b.allowance) + ' → ' + inr(x.allowance) + ' · health ' + b.health + ' → ' + x.health, tone: x.risk > b.risk + 3 ? 'warn' : 'good' }));
    setD(blank());
  };
  const rows = [
    ['Balance today', m.balance, a.balance, inr, true],
    ['Daily allowance', m.allowance, a.allowance, inr, true],
    ['Month-end forecast', m.forecastEnd, a.forecastEnd, inr, true],
    ['Committed ahead', m.upcoming, a.upcoming, inr, false],
    ['Financial risk', m.risk, a.risk, x => String(Math.round(x)), false],
    ['Financial health', m.health, a.health, x => String(Math.round(x)), true]
  ];
  return (
    <div className="grid gap-3.5">
      <div className="card">
        <h2 className="h-card">What if I…</h2>
        <div className="sub">
          Try a decision here first. Nothing changes until you lock it in.
        </div>
        <div className="flex flex-wrap gap-2" style={{ margin: '12px 0' }}>
          {SIM_TYPES.map(t => (
            <button
              key={t.id}
              className={'chip' + (d.type === t.id ? ' on' : '')}
              onClick={() => setD({ ...blank(), type: t.id })}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        {SIM_PRESETS[d.type] && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {SIM_PRESETS[d.type].map(p => (
              <button
                key={p.name}
                className="chip"
                style={{ background: 'var(--ac2)', color: 'var(--ac)' }}
                onClick={() => setD(o => ({ ...o, ...p, day: p.day || o.day, emi: !!p.emi }))}
              >
                {p.name} · {inr(p.amount)}
              </button>
            ))}
          </div>
        )}
        <div className="grid gap-3">
          {d.type === 'cancel' ? (
            <Field label="Which subscription?">
              <select
                className="input"
                value={d.subId}
                onChange={e => set('subId', e.target.value)}
              >
                {s.subs.filter(x => x.active).map(x => <option key={x.id} value={x.id}>{x.icon} {x.name} · {inr(x.amount)}/mo</option>)}
              </select>
            </Field>
          ) : (
            <>
              {d.type !== 'save' && (
                <Field label={d.type === 'income' ? 'Where from?' : 'Name'}>
                  <input
                    className="input"
                    placeholder={d.type === 'subscribe' ? 'e.g. Gym membership' : d.type === 'income' ? 'e.g. Freelance gig' : 'e.g. Sneakers'}
                    value={d.name}
                    onChange={e => set('name', e.target.value)}
                  />
                </Field>
              )}
              {d.type === 'save' && (
                <Field label="Which goal?">
                  <select
                    className="input"
                    value={d.goalId}
                    onChange={e => set('goalId', e.target.value)}
                  >
                    {s.goals.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.icon} {g.name} · {inr(g.saved)} of {inr(g.target)}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              <Field label={d.type === 'subscribe' ? 'Price per month (₹)' : 'Amount (₹)'}>
                <input
                  className="input num"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={d.amount}
                  onChange={e => set('amount', e.target.value)}
                />
              </Field>
              {d.type === 'purchase' && (
                <Field label="Category">
                  <CatPicker value={d.cat} onChange={v => set('cat', v)}/>
                </Field>
              )}
              {(d.type === 'purchase' || d.type === 'subscribe') && s.day < DAYS && (
                <Field label={(d.type === 'subscribe' ? 'Starts on' : 'Happens on') + ' day ' + (d.day > s.day ? d.day : s.day + ' (today)')}>
                  <input
                    type="range"
                    min={s.day}
                    max={DAYS}
                    value={Math.max(s.day, Number(d.day) || s.day)}
                    onChange={e => set('day', Number(e.target.value))}
                  />
                </Field>
              )}
              {d.type === 'purchase' && (
                <button
                  type="button"
                  className="inset flex gap-2.5 items-center text-left"
                  onClick={() => set('emi', !d.emi)}
                >
                  <span className={'sw' + (d.emi ? ' on' : '')}></span>
                  <span>
                    <b>Pay in 3 instalments (BNPL)</b>
                    <br/>
                    <span className="sub">Splits the cost over two weeks with a 5% fee.</span>
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {!valid ? (
        <div className="card text-center" style={{ padding: '30px 16px' }}>
          <div className="text-[34px]">🔮</div>
          <div className="font-bold">Enter an amount to see the ripple effects</div>
          <div className="sub">
            Balance, allowance, forecast, goals, risk and health all update live.
          </div>
        </div>
      ) : (
        <>
          <div className="card" style={{ borderColor: tone(verdict.c), borderWidth: 2 }}>
            <div className="flex gap-3 items-center">
              <span className="text-[34px]">{verdict.i}</span>
              <div className="flex-1">
                <div
                  className="disp text-[22px] font-extrabold"
                  style={{ color: tone(verdict.c) }}
                >
                  {verdict.t}
                </div>
                <div>{verdict.x}</div>
              </div>
            </div>
            {notes.length > 0 && (
              <ul
                className="p-0 grid gap-1.5"
                style={{ margin: '12px 0 0', listStyle: 'none' }}
              >
                {notes.map((n, i) => (
                  <li
                    key={i}
                    className={'flex gap-2 text-[14px] ' + (n.c === 'info' ? '' : n.c)}
                    style={{ color: n.c === 'info' ? 'var(--tx)' : undefined }}
                  >
                    <span>
                      {n.c === 'good' ? '✔' : n.c === 'bad' ? '✖' : n.c === 'warn' ? '⚠' : 'ℹ'}
                    </span>
                    <span style={{ color: 'var(--tx)' }}>{n.t}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2 mt-3.5 flex-wrap">
              <button className="btn btn-p" disabled={!afford} onClick={lock}>
                Lock in this decision
              </button>
              <button className="btn btn-g" onClick={() => setD(blank())}>Clear</button>
            </div>
          </div>
          <div className="card">
            <h2 className="h-card">Before and after</h2>
            <div className="scroll-x">
              <table className="tbl num">
                <thead><tr><th></th><th>Now</th><th>After</th><th>Change</th></tr></thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r[0]}>
                      <td>{r[0]}</td>
                      <td>{r[3](r[1])}</td>
                      <td><b>{r[3](r[2])}</b></td>
                      <td><Delta a={r[1]} b={r[2]} fmt={r[3]} goodUp={r[4]}/></td>
                    </tr>
                  ))}
                  <tr>
                    <td>Money lasts</td>
                    <td>{m.runout ? 'to day ' + (m.runout - 1) : 'all month'}</td>
                    <td><b>{a.runout ? 'to day ' + (a.runout - 1) : 'all month'}</b></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <h2 className="h-card">Runway: now vs after</h2>
            <div className="sub">
              Grey is your current path. Violet is the path with this decision.
            </div>
            <LineChart
              day={s.day}
              lines={[{ pts: m.traj, color: 'var(--mu)', dash: '4 5', w: 2.5 }, { pts: a.traj, color: a.forecastEnd < 0 ? 'var(--bad)' : 'var(--ac)', w: 3.5, area: true, end: true }]}
            />
          </div>
          <div className="card">
            <h2 className="h-card">Goal impact</h2>
            <div className="grid gap-3 mt-2">
              {s.goals.map(g => { const p0 = m.goalsProj.find(x => x.id === g.id).pct, p1 = a.goalsProj.find(x => x.id === g.id).pct; return (
                <div key={g.id}>
                  <div className="flex justify-between font-semibold">
                    <span>{g.icon} {g.name}</span>
                    <span className="num sub">
                      {Math.round(p0 * 100)}% →{' '}
                      <b className={p1 < p0 ? 'bad' : p1 > p0 ? 'good' : ''}>
                        {Math.round(p1 * 100)}%
                      </b>
                    </span>
                  </div>
                  <div className="bar mt-[5px]">
                    <i
                      className="absolute"
                      style={{ width: (p0 * 100) + '%', background: 'var(--s3)' }}
                    ></i>
                    <i
                      className="absolute opacity-[0.85]"
                      style={{ width: (p1 * 100) + '%', background: p1 < p0 ? 'var(--bad)' : 'var(--good)', height: '55%', top: '22%' }}
                    ></i>
                  </div>
                </div>
              ); })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════ Plan.jsx ═══════════ */
function Plan({ s, m, act, goSim }) {
  const [nm, setNm] = useState('');
  const [amt, setAmt] = useState('');
  const [due, setDue] = useState('');
  const bills = [...s.commitments].sort((a, b) => a.paid - b.paid || a.due - b.due);
  const addBill = () => { const a = num(amt), dd = clamp(num(due) || s.day, 1, DAYS); if (!nm || a <= 0)
    return; act(n => addCommit(n, { name: nm, icon: '🧾', amount: a, due: dd }), (b, x) => ({ text: 'Bill added. Allowance ' + inr(b.allowance) + ' → ' + inr(x.allowance), tone: x.allowance < b.allowance ? 'warn' : 'good' })); setNm(''); setAmt(''); setDue(''); };
  const load = m.subsMonthly / BUDGET;
  return (
    <div className="grid gap-3.5">
      <div className="card">
        <div className="flex justify-between flex-wrap gap-2">
          <div>
            <h2 className="h-card">Subscriptions</h2>
            <div className="sub">
              {inr(m.subsMonthly)} a month · {(load * 100).toFixed(1)}% of your budget ·{' '}
              {inr(m.subsMonthly * 12)} a year
            </div>
          </div>
          <span className={'pill ' + (load > 0.07 ? 'bad' : load > 0.04 ? 'warn' : 'good')}>
            {load > 0.07 ? 'Heavy' : load > 0.04 ? 'Watch it' : 'Light'}
          </span>
        </div>
        <div className="grid gap-2.5 mt-3">
          {s.subs.map(x => (
            <div
              key={x.id}
              className="inset flex items-center gap-3"
              style={{ opacity: x.active ? 1 : .6 }}
            >
              <span className="text-[24px]">{x.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-bold">
                  {x.name}{' '}
                  <span className="num mu font-medium">{inr(x.amount)}/mo</span>
                </div>
                <div className="sub">
                  {x.active ? (x.renew <= DAYS ? 'Renews on day ' + x.renew : 'Billed. Next renewal after day 30') : 'Cancelled'}{x.active && x.usage <= 2 ? ' · low use' : ''}
                </div>
                <div
                  role="group"
                  aria-label="How much do you use it"
                  className="flex flex-wrap items-center gap-0.5 mt-0.5"
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      className={'star' + (n <= x.usage ? ' on' : '')}
                      aria-label={'Usage ' + n + ' of 5'}
                      onClick={() => act(st => ({ ...st, subs: st.subs.map(y => y.id === x.id ? { ...y, usage: n } : y) }))}
                    >
                      ⭐
                    </button>
                  ))}
                  <span className="sub ml-1.5">your usage</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 items-end">
                <button
                  className={'sw' + (x.active ? ' on' : '')}
                  role="switch"
                  aria-checked={x.active}
                  aria-label={'Toggle ' + x.name}
                  onClick={() => act(st => toggleSub(st, x.id), (b, a) => ({ text: (x.active ? 'Cancelled ' : 'Resumed ') + x.name + '. Allowance ' + inr(b.allowance) + ' → ' + inr(a.allowance), tone: a.allowance >= b.allowance ? 'good' : 'warn' }))}
                ></button>
                {x.active && (
                  <button
                    className="sub underline"
                    onClick={() => goSim({ type: 'cancel', subId: x.id })}
                  >
                    Simulate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h2 className="h-card">Fixed commitments</h2>
        <div className="sub">Bills leave your account automatically on their due day.</div>
        <div className="mt-2">
          {bills.map(c => (
            <div
              key={c.id}
              className="flex items-center gap-2.5"
              style={{ padding: '9px 0', borderBottom: '1px solid var(--ln)' }}
            >
              <span className="text-[22px]">{c.icon}</span>
              <div className="flex-1">
                <div className="font-semibold">{c.name}</div>
                <div className="sub">{c.paid ? 'Paid' : 'Due on day ' + c.due}</div>
              </div>
              <b className="num">{inr(c.amount)}</b>
              {c.paid ? <span className="pill good">Paid</span> : (
                <button
                  className="btn btn-g btn-sm"
                  disabled={c.amount > s.balance}
                  onClick={() => act(st => payCommit(st, c.id), (b, a) => ({ text: c.name + ' paid early.', tone: 'good' }))}
                >
                  Pay now
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2 mt-3.5 items-end">
          <Field label="New bill">
            <input
              className="input"
              placeholder="e.g. Tuition fee"
              value={nm}
              onChange={e => setNm(e.target.value)}
            />
          </Field>
          <Field label="Amount">
            <input
              className="input num"
              type="number"
              inputMode="numeric"
              value={amt}
              onChange={e => setAmt(e.target.value)}
            />
          </Field>
          <Field label="Due day">
            <input
              className="input num"
              type="number"
              inputMode="numeric"
              min="1"
              max="30"
              value={due}
              onChange={e => setDue(e.target.value)}
            />
          </Field>
          <button className="btn btn-p" onClick={addBill} disabled={!nm || num(amt) <= 0}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════ Goals.jsx ═══════════ */
function Goals({ s, m, act }) {
  const [custom, setCustom] = useState({});
  return (
    <div className="grid gap-3.5">
      <div className="card">
        <h2 className="h-card">Saving at your current pace</h2>
        <div className="sub">
          At today's habits you would fund{' '}
          <b>{Math.round(m.projGoalPct * 100)}%</b>
          {' '}of {inr(m.goalTarget)} in goals by day 30. Goals fill in order, so the emergency{' '}
          fund comes first.
        </div>
      </div>
      {s.goals.map(g => {
      const p = m.goalsProj.find(x => x.id === g.id);
      const need = Math.max(0, g.target - g.saved);
      const perDay = need / m.rem;
      const status = need === 0 ? { t: 'Funded', c: 'good' } : p.pct >= 0.98 ? { t: 'On track', c: 'good' } : p.pct >= 0.6 ? { t: 'Behind', c: 'warn' } : { t: 'At risk', c: 'bad' };
      const dep = a => act(n => deposit(n, g.id, a), (b, x) => ({ text: inr(a) + ' saved to ' + g.name + '. Allowance ' + inr(b.allowance) + ' → ' + inr(x.allowance) + ' · risk ' + b.risk + ' → ' + x.risk, tone: 'good' }));
      return (
        <div key={g.id} className="card">
          <div className="flex gap-3 items-center">
            <span className="text-[34px]">{g.icon}</span>
            <div className="flex-1">
              <div className="disp text-[20px] font-bold">{g.name}</div>
              <div className="sub num">
                {inr(g.saved)} of {inr(g.target)}{g.emergency ? ' · covers surprise bills' : ''}
              </div>
            </div>
            <span className={'pill ' + status.c}>{status.t}</span>
          </div>
          <div className="bar" style={{ margin: '12px 0 6px', height: 12 }}>
            <i
              className="absolute z-[2]"
              style={{ width: (g.saved / g.target * 100) + '%', background: 'var(--good)' }}
            ></i>
            <i
              className="absolute"
              style={{ width: (p.pct * 100) + '%', background: 'var(--s3)' }}
            ></i>
          </div>
          <div className="sub">
            {need === 0 ? 'Goal reached. Nice work.' : 'Needs ' + inr(need) + ', about ' + inr(perDay) + ' a day. Projected finish: ' + Math.round(p.pct * 100) + '%.'}
          </div>
          {need > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 items-center">
              {[100, 250, 500].map(a => (
                <button
                  key={a}
                  className="chip"
                  disabled={a > s.balance}
                  onClick={() => dep(a)}
                >
                  +{inr(a)}
                </button>
              ))}
              <input
                className="input num"
                style={{ width: 100 }}
                type="number"
                inputMode="numeric"
                placeholder="Other"
                value={custom[g.id] || ''}
                onChange={e => setCustom({ ...custom, [g.id]: e.target.value })}
              />
              <button
                className="btn btn-g btn-sm"
                disabled={num(custom[g.id]) <= 0}
                onClick={() => { dep(num(custom[g.id])); setCustom({ ...custom, [g.id]: '' }); }}
              >
                Save
              </button>
            </div>
          )}
          {g.saved > 0 && (
            <button
              className="sub mt-2.5 underline"
              onClick={() => act(n => withdraw(n, g.id, g.saved), (b, x) => ({ text: 'Took ' + inr(g.saved) + ' back. Goal progress reset.', tone: 'warn' }))}
            >
              Take all {inr(g.saved)} back
            </button>
          )}
        </div>
      );
    })}
    </div>
  );
}

/* ═══════════ Health.jsx ═══════════ */
function Health({ s, m, goSim }) {
  const hi = healthInfo(m.health), ri = riskInfo(m.risk);
  const rfs = [
    ['Runway', m.rf.runway, 'Will your cash outlast the month at your pace?'],
    ['Cash buffer', m.rf.buffer, 'Free money after upcoming bills'],
    ['Burn rate', m.rf.burn, 'Average spend vs your daily allowance'],
    ['Subscription load', m.rf.subs, 'Recurring fees as a share of budget'],
    ['Safety net', m.rf.safety, 'Emergency fund progress']
  ];
  const insights = buildInsights(s, m);
  return (
    <div className="grid gap-3.5">
      <div className="grid-2 grid gap-3.5">
        <div className="card flex gap-4 items-center">
          <Ring value={m.health} size={120} color={tone(hi.c)}>
            <div>
              <div className="disp num text-[34px] font-extrabold leading-none">{m.health}</div>
              <div className="sub">of 100</div>
            </div>
          </Ring>
          <div>
            <h2 className="h-card">Financial health</h2>
            <span className={'pill ' + hi.c}>{hi.t}</span>
            <div className="sub mt-1.5">
              How well your habits set you up. It rewards saving, steady spending, paid{' '}
              bills and a buffer.
            </div>
          </div>
        </div>
        <div className="card flex gap-4 items-center">
          <Ring value={m.risk} size={120} color={tone(ri.c)}>
            <div>
              <div className="disp num text-[34px] font-extrabold leading-none">{m.risk}</div>
              <div className="sub">of 100</div>
            </div>
          </Ring>
          <div>
            <h2 className="h-card">Financial risk</h2>
            <span className={'pill ' + ri.c}>{ri.t}</span>
            <div className="sub mt-1.5">
              How likely a surprise breaks your month. Lower is better.
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <h2 className="h-card">What makes up your health score</h2>
        <div className="grid gap-3 mt-2.5">
          {Object.values(m.parts).map(p => (
            <div key={p.label}>
              <div className="flex justify-between font-semibold">
                <span>{p.label}</span>
                <span className="num sub">{p.v.toFixed(1)} / {p.max}</span>
              </div>
              <div className="bar mt-[5px]">
                <i style={{ width: (p.v / p.max * 100) + '%', background: p.v / p.max > 0.7 ? 'var(--good)' : p.v / p.max > 0.4 ? 'var(--warn)' : 'var(--bad)' }}></i>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h2 className="h-card">What drives your risk</h2>
        <div className="grid gap-3 mt-2.5">
          {rfs.map(([l, v, t]) => (
            <div key={l}>
              <div className="flex justify-between font-semibold">
                <span>{l}</span>
                <span className={'pill ' + (v < 0.33 ? 'good' : v < 0.66 ? 'warn' : 'bad')}>
                  {v < 0.33 ? 'Fine' : v < 0.66 ? 'Watch' : 'Danger'}
                </span>
              </div>
              <div className="sub">{t}</div>
              <div className="bar mt-[5px]">
                <i style={{ width: (v * 100) + '%', background: v < 0.33 ? 'var(--good)' : v < 0.66 ? 'var(--warn)' : 'var(--bad)' }}></i>
              </div>
            </div>
          ))}
        </div>
        <div className="inset mt-3.5 text-[14px]">
          Surprise shield: your emergency fund holds{' '}
          <b className="num">{inr(s.goals.find(g => g.emergency).saved)}</b>
          .{' '}
          {s.surprises > 0 ? s.surprises + ' surprise' + (s.surprises > 1 ? 's' : '') + ' hit you so far.' : 'No surprise bills yet. They do come.'}
        </div>
      </div>
      <div className="card">
        <h2 className="h-card">Suggested next moves</h2>
        <div className="grid gap-2.5 mt-2.5">
          {insights.map((x, i) => <InsightRow key={i} x={x} goSim={goSim}/>)}
        </div>
      </div>
    </div>
  );
}

/* ═══════════ Modals.jsx ═══════════ */
function EventModal({ s, m, onResolve }) {
  const ev = s.pending;
  const opts = [
    { k: 'pay', icon: '💳', t: 'Pay from my balance', x: 'Take the hit now.' },
    { k: 'fund', icon: '🛟', t: 'Use my emergency fund', x: (() => { const g = s.goals.find(x => x.emergency); return g.saved >= ev.amount ? 'Fully covered by your fund.' : g.saved > 0 ? 'Covers ' + inr(g.saved) + '. You pay the other ' + inr(ev.amount - g.saved) + '.' : 'Your fund is empty, so this changes nothing.'; })(), dis: s.goals.find(x => x.emergency).saved <= 0 },
    { k: 'borrow', icon: '🤝', t: 'Borrow from a friend', x: 'Costs nothing today. You repay ' + inr(Math.round(ev.amount * 1.05)) + ' (incl. 5% awkward tax) in about a week.' }
  ];
  return (
    <div className="modal-bg" role="dialog" aria-modal="true" aria-label="Surprise expense">
      <div className="modal">
        <div className="text-center">
          <div className="text-[46px]">{ev.icon}</div>
          <h2 className="disp text-[24px] font-extrabold" style={{ margin: '4px 0' }}>
            {ev.title}
          </h2>
          <div className="sub">{ev.text}</div>
          <div className="disp bad num text-[34px] font-extrabold" style={{ margin: '8px 0' }}>
            {inr(ev.amount)}
          </div>
        </div>
        <div className="sub text-center">
          Pick how to handle it. Each option has a different ripple.
        </div>
        {opts.map(o => { const a = calc(resolveEvent(s, o.k)); return (
          <button key={o.k} className="opt" disabled={o.dis} onClick={() => onResolve(o.k)}>
            <div className="flex gap-2.5 items-center">
              <span className="text-[24px]">{o.icon}</span>
              <div className="flex-1"><b>{o.t}</b><div className="sub">{o.x}</div></div>
            </div>
            <div className="num flex gap-3.5 flex-wrap mt-2 text-[13px]">
              <span>Balance <b>{inr(a.balance)}</b></span>
              <span>
                Allowance{' '}
                <b className={a.allowance < m.allowance ? 'bad' : ''}>{inr(a.allowance)}</b>
              </span>
              <span>Risk <b className={a.risk > m.risk ? 'bad' : 'good'}>{a.risk}</b></span>
              <span>Health <b>{a.health}</b></span>
            </div>
          </button>
        ); })}
      </div>
    </div>
  );
}
function WrapModal({ s, m, onRestart, onClose }) {
  const hi = healthInfo(m.health);
  const grade = m.health >= 85 ? 'A+' : m.health >= 75 ? 'A' : m.health >= 60 ? 'B' : m.health >= 45 ? 'C' : 'D';
  const msg = s.balance < 0 ? 'You ended in overdraft. Next time, test big decisions in What-if first.' : m.goalSaved >= m.goalTarget ? 'Every goal funded. That is a proper money month.' : m.goalSaved > 0 ? 'You made it through and saved along the way.' : 'You made it through. Try saving earlier next time.';
  return (
    <div className="modal-bg" role="dialog" aria-modal="true" aria-label="Month summary">
      <div className="modal">
        <div className="text-center">
          <div className="sub">Day 30 complete</div>
          <div
            className="disp text-[80px] font-extrabold leading-none"
            style={{ color: tone(hi.c) }}
          >
            {grade}
          </div>
          <h2 className="disp text-[22px] font-extrabold" style={{ margin: '6px 0' }}>{msg}</h2>
        </div>
        <div className="grid grid-cols-[1fr_1fr] gap-2.5" style={{ margin: '16px 0' }}>
          <Stat
            label="Ended with"
            value={inr(s.balance)}
            color={s.balance < 0 ? 'var(--bad)' : 'var(--good)'}
          />
          <Stat
            label="Saved in goals"
            value={inr(m.goalSaved)}
            sub={'of ' + inr(m.goalTarget)}
          />
          <Stat label="Health score" value={String(m.health)} sub={hi.t}/>
          <Stat
            label="Overdraft days"
            value={String(s.overdraftDays)}
            sub={s.surprises + ' surprises faced'}
          />
        </div>
        <div className="flex gap-2">
          <button className="btn btn-p flex-1" onClick={onRestart}>Start a new month</button>
          <button className="btn btn-g" onClick={onClose}>Review</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════ App.jsx ═══════════ */
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && p.commitments && p.goals && p.day)
        return p;
    }
  }
  catch (e) { }
  return initial();
}
const TABS = [['home', 'Home', '🏠'], ['spend', 'Spend', '💸'], ['sim', 'What-if', '🔮'], ['plan', 'Plan', '🗓️'], ['goals', 'Goals', '🎯'], ['health', 'Health', '💚']];
export default function App() {
  const [s, setS] = useState(load);
  const [tab, setTab] = useState('home');
  const [toast, setToast] = useState(null);
  const [preset, setPreset] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [resetArmed, setResetArmed] = useState(false);
  const [theme, setTheme] = useState(() => { try {
    return localStorage.getItem('thirty-theme') || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  catch (e) {
    return 'light';
  } });
  const [palette, setPalette] = useState(() => { try {
    return localStorage.getItem('thirty-palette') || 'lagoon';
  }
  catch (e) {
    return 'lagoon';
  } });
  const m = useMemo(() => calc(s), [s]);
  useEffect(() => { document.documentElement.setAttribute('data-palette', palette); try {
    localStorage.setItem('thirty-palette', palette);
  }
  catch (e) { } }, [palette]);
  useEffect(() => { try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  }
  catch (e) { } }, [s]);
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); try {
    localStorage.setItem('thirty-theme', theme);
  }
  catch (e) { } }, [theme]);
  useEffect(() => { if (!toast)
    return; const t = setTimeout(() => setToast(null), 3600); return () => clearTimeout(t); }, [toast]);
  useEffect(() => { if (!resetArmed)
    return; const t = setTimeout(() => setResetArmed(false), 3000); return () => clearTimeout(t); }, [resetArmed]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [tab]);
  const act = (fn, msg) => {
    const n = fn(s);
    if (n === s)
      return;
    setS(n);
    if (msg) {
      const t = msg(m, calc(n), n);
      if (t)
        setToast({ k: Date.now(), ...t });
    }
  };
  const goSim = d => { setPreset({ key: uid(), d }); setTab('sim'); };
  const nextDay = () => {
    const n = advance(s);
    if (n === s)
      return;
    setS(n);
    setReviewing(false);
    if (n.finished)
      return;
    const a = calc(n);
    setToast({ k: Date.now(), text: n.pending ? 'Day ' + n.day + ': something unexpected happened.' : 'Day ' + n.day + '. Allowance ' + inr(a.allowance) + ', balance ' + inr(n.balance), tone: n.balance < 0 ? 'bad' : 'good' });
  };
  const skipWeek = () => {
    let n = s;
    for (let i = 0; i < 7; i++) {
      const x = advance(n);
      if (x === n || x.finished) {
        n = x;
        break;
      }
      n = x;
      if (n.pending)
        break;
    }
    if (n !== s) {
      setS(n);
      setReviewing(false);
      setToast({ k: Date.now(), text: 'Jumped to day ' + n.day + (n.pending ? '. A surprise needs your attention.' : '. Balance ' + inr(n.balance)), tone: n.balance < 0 ? 'bad' : 'good' });
    }
  };
  const stress = () => setS(n => n.pending ? n : { ...n, pending: { ...EVENTS[Math.floor(Math.random() * EVENTS.length)], key: uid() } });
  const resolve = choice => {
    const n = resolveEvent(s, choice);
    const a = calc(n);
    setS(n);
    setToast({ k: Date.now(), text: 'Handled. Allowance ' + inr(m.allowance) + ' → ' + inr(a.allowance) + ' · risk ' + m.risk + ' → ' + a.risk, tone: a.risk > m.risk + 5 ? 'warn' : 'good' });
  };
  const restart = () => {
    if (!resetArmed) {
      setResetArmed(true);
      return;
    }
    setS(initial());
    setTab('home');
    setResetArmed(false);
    setReviewing(false);
    setToast({ k: Date.now(), text: 'Fresh month. ₹10,000, 30 days. Go.', tone: 'good' });
  };
  const body = tab === 'home' ? <Home s={s} m={m} act={act} go={setTab} goSim={goSim} onStress={stress}/>
    : tab === 'spend' ? <Spend s={s} m={m} act={act}/>
      : tab === 'sim' ? <Sim s={s} m={m} act={act} preset={preset}/>
        : tab === 'plan' ? <Plan s={s} m={m} act={act} goSim={goSim}/>
          : tab === 'goals' ? <Goals s={s} m={m} act={act}/>
            : <Health s={s} m={m} goSim={goSim}/>;
  return (
    <div>
      <style>{CSS}</style>
      <Header
        s={s}
        m={m}
        onNext={nextDay}
        onWeek={skipWeek}
        theme={theme}
        setTheme={setTheme}
        onReset={restart}
        resetArmed={resetArmed}
        palette={palette}
        setPalette={setPalette}
      />
      <div className="wrap flex gap-[22px]" style={{ paddingTop: 16, paddingBottom: 110 }}>
        <nav className="sidenav w-[200px] flex-none" aria-label="Sections">
          {TABS.map(([k, l, i]) => (
            <button
              key={k}
              className={'navbtn' + (tab === k ? ' on' : '')}
              onClick={() => setTab(k)}
            >
              <span className="text-[18px]">{i}</span>
              {l}
            </button>
          ))}
        </nav>
        <main className="flex-1 min-w-0">{body}</main>
      </div>
      <nav className="botnav" aria-label="Sections">
        {TABS.map(([k, l, i]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
            <span className="ic">{i}</span>
            {l}
          </button>
        ))}
      </nav>
      {toast && (
        <div
          className="toast"
          key={toast.k}
          role="status"
          style={{ borderLeft: '6px solid ' + tone(toast.tone === 'bad' ? 'bad' : toast.tone === 'warn' ? 'warn' : 'good') }}
        >
          {toast.text}
        </div>
      )}
      {s.pending && <EventModal s={s} m={m} onResolve={resolve}/>}
      {s.finished && !reviewing && !s.pending && (
        <WrapModal
          s={s}
          m={m}
          onRestart={() => { setS(initial()); setTab('home'); }}
          onClose={() => setReviewing(true)}
        />
      )}
    </div>
  );
}
