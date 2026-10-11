import { Stat } from './ui';
import { calc, healthInfo, tone } from '../lib/analytics';
import { inr } from '../lib/format';
import { resolveEvent } from '../lib/model';
export function EventModal({ s, m, onResolve }) {
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
export function WrapModal({ s, m, onRestart, onClose }) {
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

