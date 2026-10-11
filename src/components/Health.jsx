import { InsightRow, Ring } from './ui';
import { buildInsights, healthInfo, riskInfo, tone } from '../lib/analytics';
import { inr } from '../lib/format';
export function Health({ s, m, goSim }) {
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

