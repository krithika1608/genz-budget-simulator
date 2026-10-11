import { Donut, InsightRow, LineChart, Num, Ring, Stat } from './ui';
import { achievements, buildInsights, healthInfo, riskInfo } from '../lib/analytics';
import { BUDGET, CATS, DAYS, QUICK } from '../lib/constants';
import { clamp, inr } from '../lib/format';
import { spend } from '../lib/model';
export function Home({ s, m, act, go, goSim, onStress }) {
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

