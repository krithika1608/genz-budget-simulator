import { useState, useEffect, useMemo } from 'react';
import { Goals } from './components/Goals';
import { Header } from './components/Header';
import { Health } from './components/Health';
import { Home } from './components/Home';
import { EventModal, WrapModal } from './components/Modals';
import { Plan } from './components/Plan';
import { Sim } from './components/Simulator';
import { Spend } from './components/Spend';
import { calc, tone } from './lib/analytics';
import { EVENTS, SAVE_KEY } from './lib/constants';
import { inr, uid } from './lib/format';
import { advance, initial, resolveEvent } from './lib/model';
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && p.commitments && p.goals && p.day)
        return p;
    }
  }
  catch (e) { }
  return initial();
}
const TABS = [['home', 'Home', '🏠'], ['spend', 'Spend', '💸'], ['sim', 'What-if', '🔮'], ['plan', 'Plan', '🗓️'], ['goals', 'Goals', '🎯'], ['health', 'Health', '💚']];
export default function App() {
  const [s, setS] = useState(load);
  const [tab, setTab] = useState('home');
  const [toast, setToast] = useState(null);
  const [preset, setPreset] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [resetArmed, setResetArmed] = useState(false);
  const [theme, setTheme] = useState(() => { try {
    return localStorage.getItem('thirty-theme') || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  catch (e) {
    return 'light';
  } });
  const [palette, setPalette] = useState(() => { try {
    return localStorage.getItem('thirty-palette') || 'lagoon';
  }
  catch (e) {
    return 'lagoon';
  } });
  const m = useMemo(() => calc(s), [s]);
  useEffect(() => { document.documentElement.setAttribute('data-palette', palette); try {
    localStorage.setItem('thirty-palette', palette);
  }
  catch (e) { } }, [palette]);
  useEffect(() => { try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  }
  catch (e) { } }, [s]);
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); try {
    localStorage.setItem('thirty-theme', theme);
  }
  catch (e) { } }, [theme]);
  useEffect(() => { if (!toast)
    return; const t = setTimeout(() => setToast(null), 3600); return () => clearTimeout(t); }, [toast]);
  useEffect(() => { if (!resetArmed)
    return; const t = setTimeout(() => setResetArmed(false), 3000); return () => clearTimeout(t); }, [resetArmed]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [tab]);
  const act = (fn, msg) => {
    const n = fn(s);
    if (n === s)
      return;
    setS(n);
    if (msg) {
      const t = msg(m, calc(n), n);
      if (t)
        setToast({ k: Date.now(), ...t });
    }
  };
  const goSim = d => { setPreset({ key: uid(), d }); setTab('sim'); };
  const nextDay = () => {
    const n = advance(s);
    if (n === s)
      return;
    setS(n);
    setReviewing(false);
    if (n.finished)
      return;
    const a = calc(n);
    setToast({ k: Date.now(), text: n.pending ? 'Day ' + n.day + ': something unexpected happened.' : 'Day ' + n.day + '. Allowance ' + inr(a.allowance) + ', balance ' + inr(n.balance), tone: n.balance < 0 ? 'bad' : 'good' });
  };
  const skipWeek = () => {
    let n = s;
    for (let i = 0; i < 7; i++) {
      const x = advance(n);
      if (x === n || x.finished) {
        n = x;
        break;
      }
      n = x;
      if (n.pending)
        break;
    }
    if (n !== s) {
      setS(n);
      setReviewing(false);
      setToast({ k: Date.now(), text: 'Jumped to day ' + n.day + (n.pending ? '. A surprise needs your attention.' : '. Balance ' + inr(n.balance)), tone: n.balance < 0 ? 'bad' : 'good' });
    }
  };
  const stress = () => setS(n => n.pending ? n : { ...n, pending: { ...EVENTS[Math.floor(Math.random() * EVENTS.length)], key: uid() } });
  const resolve = choice => {
    const n = resolveEvent(s, choice);
    const a = calc(n);
    setS(n);
    setToast({ k: Date.now(), text: 'Handled. Allowance ' + inr(m.allowance) + ' → ' + inr(a.allowance) + ' · risk ' + m.risk + ' → ' + a.risk, tone: a.risk > m.risk + 5 ? 'warn' : 'good' });
  };
  const restart = () => {
    if (!resetArmed) {
      setResetArmed(true);
      return;
    }
    setS(initial());
    setTab('home');
    setResetArmed(false);
    setReviewing(false);
    setToast({ k: Date.now(), text: 'Fresh month. ₹10,000, 30 days. Go.', tone: 'good' });
  };
  const body = tab === 'home' ? <Home s={s} m={m} act={act} go={setTab} goSim={goSim} onStress={stress}/>
    : tab === 'spend' ? <Spend s={s} m={m} act={act}/>
      : tab === 'sim' ? <Sim s={s} m={m} act={act} preset={preset}/>
        : tab === 'plan' ? <Plan s={s} m={m} act={act} goSim={goSim}/>
          : tab === 'goals' ? <Goals s={s} m={m} act={act}/>
            : <Health s={s} m={m} goSim={goSim}/>;
  return (
    <div>
      <Header
        s={s}
        m={m}
        onNext={nextDay}
        onWeek={skipWeek}
        theme={theme}
        setTheme={setTheme}
        onReset={restart}
        resetArmed={resetArmed}
        palette={palette}
        setPalette={setPalette}
      />
      <div className="wrap flex gap-[22px]" style={{ paddingTop: 16, paddingBottom: 110 }}>
        <nav className="sidenav w-[200px] flex-none" aria-label="Sections">
          {TABS.map(([k, l, i]) => (
            <button
              key={k}
              className={'navbtn' + (tab === k ? ' on' : '')}
              onClick={() => setTab(k)}
            >
              <span className="text-[18px]">{i}</span>
              {l}
            </button>
          ))}
        </nav>
        <main className="flex-1 min-w-0">{body}</main>
      </div>
      <nav className="botnav" aria-label="Sections">
        {TABS.map(([k, l, i]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
            <span className="ic">{i}</span>
            {l}
          </button>
        ))}
      </nav>
      {toast && (
        <div
          className="toast"
          key={toast.k}
          role="status"
          style={{ borderLeft: '6px solid ' + tone(toast.tone === 'bad' ? 'bad' : toast.tone === 'warn' ? 'warn' : 'good') }}
        >
          {toast.text}
        </div>
      )}
      {s.pending && <EventModal s={s} m={m} onResolve={resolve}/>}
      {s.finished && !reviewing && !s.pending && (
        <WrapModal
          s={s}
          m={m}
          onRestart={() => { setS(initial()); setTab('home'); }}
          onClose={() => setReviewing(true)}
        />
      )}
    </div>
  );
}

