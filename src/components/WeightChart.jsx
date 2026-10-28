import { useLayoutEffect, useRef, useState } from 'react';
import { formatShort } from '../lib/dates';

const AVG = '#EF4444';
const RAW = '#94A3B8';
const H = 200;
const PAD = { top: 16, right: 12, bottom: 26, left: 36 };

/** Courbe de poids : pesées brutes (points) + moyenne glissante 7 j (ligne), tooltip au survol / toucher. */
export default function WeightChart({ series }) {
  const wrap = useRef(null);
  const [width, setWidth] = useState(320);
  const [hover, setHover] = useState(null);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(240, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (series.length < 2) {
    return (
      <div ref={wrap} className="grid h-[200px] place-items-center rounded-2xl border border-dashed border-white/10 text-center text-sm text-slate-500">
        Pèse-toi au moins 2 matins pour voir ta courbe.<br />Idéal : chaque matin, à jeun, après les toilettes.
      </div>
    );
  }

  const t0 = series[0].date.getTime();
  const t1 = series[series.length - 1].date.getTime();
  const all = series.flatMap((p) => [p.kg, p.avg]);
  let lo = Math.floor(Math.min(...all) - 0.5);
  let hi = Math.ceil(Math.max(...all) + 0.5);
  if (hi - lo < 2) hi = lo + 2;
  const iw = width - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;
  const x = (d) => PAD.left + (t1 === t0 ? iw / 2 : ((d.getTime() - t0) / (t1 - t0)) * iw);
  const y = (v) => PAD.top + (1 - (v - lo) / (hi - lo)) * ih;
  const step = Math.max(1, Math.round((hi - lo) / 3));
  const ticks = [];
  for (let v = lo; v <= hi; v += step) ticks.push(v);

  const path = series.map((p, i) => `${i ? 'L' : 'M'}${x(p.date).toFixed(1)},${y(p.avg).toFixed(1)}`).join(' ');

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    let best = 0;
    series.forEach((p, i) => {
      if (Math.abs(x(p.date) - px) < Math.abs(x(series[best].date) - px)) best = i;
    });
    setHover(best);
  };

  const h = hover != null ? series[hover] : null;

  return (
    <div ref={wrap} className="relative">
      <div className="mb-2 flex gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded-full" style={{ background: AVG }} />Moyenne 7 jours</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: RAW }} />Pesée</span>
      </div>
      <svg
        width={width}
        height={H}
        className="touch-none select-none"
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label="Courbe de poids"
      >
        {ticks.map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(v)} y2={y(v)} stroke="rgba(255,255,255,0.06)" />
            <text x={PAD.left - 8} y={y(v) + 4} textAnchor="end" className="fill-slate-500 text-[11px] tabular-nums">{v}</text>
          </g>
        ))}
        <text x={PAD.left} y={H - 6} className="fill-slate-500 text-[11px]">{formatShort(series[0].date)}</text>
        <text x={width - PAD.right} y={H - 6} textAnchor="end" className="fill-slate-500 text-[11px]">{formatShort(series[series.length - 1].date)}</text>

        {series.map((p) => <circle key={p.key} cx={x(p.date)} cy={y(p.kg)} r={4} fill={RAW} stroke="#111827" strokeWidth={2} opacity={0.75} />)}
        <path d={path} fill="none" stroke={AVG} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {h && (
          <g>
            <line x1={x(h.date)} x2={x(h.date)} y1={PAD.top} y2={H - PAD.bottom} stroke="rgba(255,255,255,0.25)" strokeDasharray="3 3" />
            <circle cx={x(h.date)} cy={y(h.avg)} r={5} fill={AVG} stroke="#111827" strokeWidth={2} />
          </g>
        )}
      </svg>
      {h && (
        <div
          className="pointer-events-none absolute top-6 rounded-xl bg-ink-600 px-3 py-2 text-xs shadow-xl ring-1 ring-white/10"
          style={{ left: Math.min(Math.max(x(h.date) - 60, 0), width - 130), width: 130 }}
        >
          <div className="font-semibold text-slate-200">{formatShort(h.date)}</div>
          <div className="mt-1 flex justify-between text-slate-300"><span>Pesée</span><span className="font-bold tabular-nums">{h.kg.toFixed(1)} kg</span></div>
          <div className="flex justify-between text-slate-300"><span>Moy. 7 j</span><span className="font-bold tabular-nums">{h.avg.toFixed(1)} kg</span></div>
        </div>
      )}
    </div>
  );
}
