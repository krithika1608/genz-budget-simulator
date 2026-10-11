import { BUDGET, CATS, DAYS, EVENTS } from './constants';
import { clamp, num, rnd, uid } from './format';
export function initial() {
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
export function charge(s, { amount, kind, cat, note, icon }) {
  const n = { ...s, balance: s.balance - amount, tx: [{ id: uid(), day: s.day, amount, kind, cat: cat || kind, note, icon }, ...s.tx] };
  if (n.balance < 0 && s.balance >= 0 && (kind === 'bill' || kind === 'sub'))
    n.lateBills = s.lateBills + 1;
  return n;
}
export function addIncome(s, amount, note) { return { ...s, balance: s.balance + amount, tx: [{ id: uid(), day: s.day, amount, kind: 'income', cat: 'income', note: note || 'Income', icon: '💸' }, ...s.tx] }; }
export function addCommit(s, { name, icon, amount, due }) {
  if (due <= s.day) {
    let n = charge(s, { amount, kind: 'bill', note: name, icon });
    return { ...n, commitments: [...n.commitments, { id: uid(), name, icon, amount, due, paid: true }] };
  }
  return { ...s, commitments: [...s.commitments, { id: uid(), name, icon, amount, due, paid: false }] };
}
export function payCommit(s, id) {
  const c = s.commitments.find(x => x.id === id);
  if (!c || c.paid)
    return s;
  const n = charge(s, { amount: c.amount, kind: 'bill', note: c.name, icon: c.icon });
  return { ...n, commitments: n.commitments.map(x => x.id === id ? { ...x, paid: true } : x) };
}
export function processDay(s) {
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
export function spend(s, { amount, cat, note, icon }) {
  if (amount <= 0)
    return s;
  return charge(s, { amount, kind: 'expense', cat, note: note || CATS[cat].label, icon: icon || CATS[cat].icon });
}
export function deposit(s, id, amount) {
  const g = s.goals.find(x => x.id === id);
  if (!g)
    return s;
  const amt = Math.min(amount, Math.max(0, g.target - g.saved), Math.max(0, s.balance));
  if (amt <= 0)
    return s;
  return { ...s, balance: s.balance - amt, goals: s.goals.map(x => x.id === id ? { ...x, saved: x.saved + amt } : x),
    tx: [{ id: uid(), day: s.day, amount: amt, kind: 'goal', cat: 'goal', note: 'Saved to ' + g.name, icon: g.icon }, ...s.tx] };
}
export function withdraw(s, id, amount) {
  const g = s.goals.find(x => x.id === id);
  if (!g)
    return s;
  const amt = Math.min(amount, g.saved);
  if (amt <= 0)
    return s;
  return { ...s, balance: s.balance + amt, goals: s.goals.map(x => x.id === id ? { ...x, saved: x.saved - amt } : x),
    tx: [{ id: uid(), day: s.day, amount: amt, kind: 'income', cat: 'income', note: 'Took back from ' + g.name, icon: g.icon }, ...s.tx] };
}
export function toggleSub(s, id) {
  return { ...s, subs: s.subs.map(x => {
      if (x.id !== id)
        return x;
      return x.active ? { ...x, active: false } : { ...x, active: true, renew: Math.max(x.renew, s.day + 1) };
    }), cancelled: s.subs.find(x => x.id === id && x.active) ? s.cancelled + 1 : s.cancelled };
}
export function advance(s) {
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
export function resolveEvent(s, choice) {
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
export function applyDecision(s, d) {
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
