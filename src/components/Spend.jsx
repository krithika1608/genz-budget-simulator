import { useState, useMemo } from 'react';
import { CatPicker, Field } from './ui';
import { calc } from '../lib/analytics';
import { CATS } from '../lib/constants';
import { inr, num } from '../lib/format';
import { addIncome, spend } from '../lib/model';
export function Spend({ s, m, act }) {
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

