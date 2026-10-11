import { useMemo } from 'react';
import { riskInfo } from '../lib/analytics';
import { DAYS, PALETTES } from '../lib/constants';
import { inr } from '../lib/format';
export function Header({ s, m, onNext, onWeek, theme, setTheme, onReset, resetArmed, palette, setPalette }) {
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

