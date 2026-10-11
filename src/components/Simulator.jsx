import { useState, useEffect, useMemo } from 'react';
import { CatPicker, Delta, Field, LineChart } from './ui';
import { calc, riskInfo, tone } from '../lib/analytics';
import { DAYS, SIM_PRESETS, SIM_TYPES } from '../lib/constants';
import { inr, num } from '../lib/format';
import { applyDecision } from '../lib/model';
export function Sim({ s, m, act, preset }) {
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

