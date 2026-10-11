import { BASE, BUDGET, CATS, DAYS, PRIOR, SUR } from './constants';
import { clamp, inr, sum } from './format';
export function calc(s) {
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
export const riskInfo = r => r <= 25 ? { t: 'Low', c: 'good' } : r <= 50 ? { t: 'Moderate', c: 'warn' } : r <= 75 ? { t: 'High', c: 'bad' } : { t: 'Critical', c: 'bad' };
export const healthInfo = h => h >= 80 ? { t: 'Thriving', c: 'good' } : h >= 65 ? { t: 'Healthy', c: 'good' } : h >= 45 ? { t: 'Shaky', c: 'warn' } : { t: 'Needs care', c: 'bad' };
export const tone = c => c === 'good' ? 'var(--good)' : c === 'warn' ? 'var(--warn)' : 'var(--bad)';
export function buildInsights(s, m) {
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
export function achievements(s, m) {
  return [
    { i: '🎯', t: 'First deposit', on: m.goalSaved > 0 },
    { i: '🛟', t: 'Safety net full', on: m.emPct >= 1 },
    { i: '✂️', t: 'Subscription slayer', on: s.cancelled > 0 },
    { i: '🔥', t: '3-day no-spend', on: s.bestStreak >= 3 },
    { i: '🧘', t: 'Under allowance', on: s.day >= 4 && m.avg <= Math.max(m.allowance, 0) },
    { i: '🏦', t: 'Zero overdraft (day 10+)', on: s.day >= 10 && s.overdraftDays === 0 && s.balance >= 0 }
  ];
}
