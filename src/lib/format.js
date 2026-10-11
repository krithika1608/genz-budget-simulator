export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const sum = (arr, f) => arr.reduce((a, x) => a + f(x), 0);
export const inr = (n, sign = false) => { const v = Math.round(n); const t = Math.abs(v).toLocaleString('en-IN'); return (v < 0 ? '−' : (sign && v > 0 ? '+' : '')) + '₹' + t; };
export const num = v => Math.max(0, Math.round(Number(v) || 0));
let _id = Date.now();
export const uid = () => 'i' + (_id++);
export function rnd(seed) { let t = (seed + 0x6D2B79F5) >>> 0; let r = Math.imul(t ^ (t >>> 15), t | 1); r ^= r + Math.imul(r ^ (r >>> 7), r | 61); return { v: ((r ^ (r >>> 14)) >>> 0) / 4294967296, seed: t }; }
