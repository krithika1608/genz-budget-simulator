import { useState } from 'react';
import { Field } from './ui';
import { BUDGET, DAYS } from '../lib/constants';
import { clamp, inr, num } from '../lib/format';
import { addCommit, payCommit, toggleSub } from '../lib/model';
export function Plan({ s, m, act, goSim }) {
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

