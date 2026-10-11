import { useState, useEffect, useRef } from 'react';
import { CATS, DAYS } from '../lib/constants';
import { clamp, inr, sum } from '../lib/format';
export function Num({ v }) {
  const [d, setD] = useState(v);
  const ref = useRef(v);
  useEffect(() => {
    const from = ref.current, to = v, t0 = performance.now();
    let raf;
    const tick = t => { const p = Math.min(1, (t - t0) / 650), e = 1 - Math.pow(1 - p, 3), cur = from + (to - from) * e; ref.current = cur; setD(cur); if (p < 1)
      raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [v]);
  return <span className="num">{inr(d)}</span>;
}
export function Ring({ value, size = 104, stroke = 11, color, children }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className="relative flex-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--s2)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamp(value / 100))}
          style={{ transition: 'stroke-dashoffset .8s ease,stroke .4s' }}
        />
      </svg>
      <div className="absolute grid place-items-center text-center" style={{ inset: 0 }}>
        {children}
      </div>
    </div>
  );
}
export function Delta({ a, b, fmt = inr, goodUp = true, inv = false }) {
  const d = b - a;
  if (Math.abs(d) < 0.5)
    return <span className="mu">no change</span>;
  const good = (d > 0) === goodUp;
  return (
    <span className={'font-bold ' + (good ? 'good' : 'bad')}>
      {d > 0 ? '▲' : '▼'} {fmt(Math.abs(d))}
    </span>
  );
}
export function LineChart({ lines, day, height = 230 }) {
  const W = 640, H = height, pl = 46, pr = 12, pt = 14, pb = 26;
  const all = lines.flatMap(l => l.pts.map(p => p.b));
  let min = Math.min(0, ...all), max = Math.max(...all);
  if (max - min < 200)
    max = min + 200;
  const pad = (max - min) * 0.06;
  max += pad;
  if (min < 0)
    min -= pad;
  const x = d => pl + (d - 1) / (DAYS - 1) * (W - pl - pr), y = v => pt + (1 - (v - min) / (max - min)) * (H - pt - pb);
  const path = pts => pts.map((p, i) => (i ? 'L' : 'M') + x(p.d).toFixed(1) + ' ' + y(p.b).toFixed(1)).join(' ');
  const ticks = [0, 1, 2, 3].map(i => min + (max - min) * i / 3);
  const first = lines.find(l => l.area);
  const id = 'g' + Math.abs(Math.round(max)) % 997;
  return (
    <svg
      viewBox={'0 0 ' + W + ' ' + H}
      className="block"
      style={{ width: '100%', height: 'auto' }}
      role="img"
      aria-label="Balance forecast over 30 days"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--ac)" stopOpacity=".32"/>
          <stop offset="100%" stopColor="var(--ac)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {ticks.map(t => (
        <g key={t}>
          <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} stroke="var(--ln)"/>
          <text x={pl - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--mu)">
            {(Math.round(t / 100) / 10) + 'k'}
          </text>
        </g>
      ))}
      {min < 0 && (
        <line
          x1={pl}
          x2={W - pr}
          y1={y(0)}
          y2={y(0)}
          stroke="var(--bad)"
          strokeDasharray="5 4"
          strokeWidth="1.5"
        />
      )}
      {[1, 5, 10, 15, 20, 25, 30].map(d => (
        <text key={d} x={x(d)} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--mu)">
          {d}
        </text>
      ))}
      {first && (
        <path
          d={path(first.pts) + ' L' + x(first.pts[first.pts.length - 1].d) + ' ' + y(Math.max(min, 0)) + ' L' + x(first.pts[0].d) + ' ' + y(Math.max(min, 0)) + ' Z'}
          fill={'url(#' + id + ')'}
        />
      )}
      <line
        x1={x(day)}
        x2={x(day)}
        y1={pt}
        y2={H - pb}
        stroke="var(--pink)"
        strokeWidth="2"
        strokeDasharray="2 4"
      />
      {lines.map((l, i) => (
        <path
          key={i}
          d={path(l.pts)}
          fill="none"
          stroke={l.color}
          strokeWidth={l.w || 3}
          strokeDasharray={l.dash || ''}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {lines.filter(l => l.end).map((l, i) => { const p = l.pts[l.pts.length - 1]; return (
        <circle
          key={i}
          cx={x(p.d)}
          cy={y(p.b)}
          r="5"
          fill={l.color}
          stroke="var(--s1)"
          strokeWidth="2"
        />
      ); })}
    </svg>
  );
}
export function Donut({ data, size = 130 }) {
  const total = sum(data, d => d.v), r = 48, c = 2 * Math.PI * r;
  let off = 0;
  return (
    <svg width={size} height={size} viewBox="0 0 130 130" className="flex-none">
      <circle cx="65" cy="65" r={r} fill="none" stroke="var(--s2)" strokeWidth="18"/>
      {data.map(d => { const len = total ? d.v / total * c : 0; const el = (
        <circle
          key={d.k}
          cx="65"
          cy="65"
          r={r}
          fill="none"
          stroke={d.color}
          strokeWidth="18"
          strokeDasharray={len + ' ' + (c - len)}
          strokeDashoffset={-off}
          transform="rotate(-90 65 65)"
        />
      ); off += len; return el; })}
      <text x="65" y="62" textAnchor="middle" fontSize="11" fill="var(--mu)">spent</text>
      <text
        x="65"
        y="80"
        textAnchor="middle"
        fontSize="16"
        fontWeight="700"
        fill="var(--tx)"
        className="num"
      >
        {inr(total)}
      </text>
    </svg>
  );
}
export function Stat({ label, value, sub, color }) {
  return (
    <div className="inset flex-1 min-w-0">
      <div className="sub">{label}</div>
      <div
        className="disp num text-[22px] font-extrabold leading-[1.15]"
        style={{ color: color || 'var(--tx)' }}
      >
        {value}
      </div>
      {sub && <div className="sub" style={{ fontSize: 12 }}>{sub}</div>}
    </div>
  );
}
export function Field({ label, children }) { return <div><label className="f">{label}</label>{children}</div>; }
export function CatPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Object.entries(CATS).map(([k, c]) => (
        <button
          key={k}
          type="button"
          className={'chip' + (value === k ? ' on' : '')}
          onClick={() => onChange(k)}
        >
          {c.icon} {c.label}
        </button>
      ))}
    </div>
  );
}
export function InsightRow({ x, goSim }) {
  const bg = x.tone === 'bad' ? 'var(--bad-bg)' : x.tone === 'warn' ? 'var(--warn-bg)' : x.tone === 'good' ? 'var(--good-bg)' : 'var(--ac2)';
  return (
    <div
      className="flex gap-3 rounded-[14px] items-start"
      style={{ background: bg, padding: '12px 14px' }}
    >
      <span className="text-[22px]">{x.icon}</span>
      <div className="flex-1">
        <div className="font-bold">{x.title}</div>
        <div className="text-[14px]">{x.text}</div>
        {x.act && (
          <button className="btn btn-p btn-sm mt-2" onClick={() => goSim(x.act.d)}>
            {x.act.label}
          </button>
        )}
      </div>
    </div>
  );
}

