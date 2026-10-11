import { useState } from 'react';
import { inr, num } from '../lib/format';
import { deposit, withdraw } from '../lib/model';
export function Goals({ s, m, act }) {
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

