import React from 'react';
import { CRATER_STORMS, CRATER_QUIET, formatEventDate } from '../data/nasa/spaceWeather.js';

// Bar chart of real NASA LRO CRaTER daily dose readings for one 2012 storm.
export function CraterChart({ stormId, compact = false }) {
  const storm = CRATER_STORMS.find((s) => s.id === stormId);
  const max = Math.max(...storm.days.map(([, v]) => v));
  const W = 360, H = compact ? 90 : 130, pad = 18;
  const bw = (W - pad * 2) / storm.days.length;
  const y = (v) => H - pad - (v / max) * (H - pad * 2);
  const peak = storm.days.reduce((a, b) => (b[1] > a[1] ? b : a));
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img"
        aria-label={`NASA LRO CRaTER daily dose during the ${storm.label}. Peak ${peak[1].toFixed(1)} milligray per day on ${peak[0]}, about ${Math.round(peak[1] / CRATER_QUIET)} times the quiet level.`}>
        <line x1={pad} x2={W - pad} y1={y(CRATER_QUIET)} y2={y(CRATER_QUIET)} stroke="#7E7868" strokeDasharray="3 3" />
        {storm.days.map(([d, v], i) => (
          <g key={d}>
            <rect x={pad + i * bw + 2} y={y(v)} width={bw - 4} height={Math.max(1.5, H - pad - y(v))} rx="2"
              fill={v > 1 ? '#F26A1F' : '#2A4366'} />
            <text x={pad + i * bw + bw / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="#7E7868" className="num">{d.slice(8)}</text>
          </g>
        ))}
        <text x={W - pad} y={12} textAnchor="end" fontSize="10" fill="#B9AE9A" className="num">peak {peak[1].toFixed(1)} mGy/day</text>
      </svg>
      <figcaption className="text-[11px] text-cream-faint leading-snug mt-1">
        Real readings from NASA’s LRO spacecraft (CRaTER detector D1), {storm.label}. Dashed line: a normal quiet day. Peak was about {Math.round(peak[1] / CRATER_QUIET)}× normal.
      </figcaption>
    </figure>
  );
}

export function EventCard({ sw }) {
  const e = sw.event;
  return (
    <div className="rounded-xl bg-navy-2 border border-navy-line p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-display text-2xl font-bold text-artemis">{e.classType} flare</p>
        <p className="text-sm text-cream-dim">{formatEventDate(e.peak)}{e.activeRegion ? `, sunspot region ${e.activeRegion}` : ''}</p>
      </div>
      <p className="text-xs text-cream-faint num mt-1 break-all">DONKI activity {e.id}</p>
      <ul className="mt-3 space-y-1">
        {(e.seps || []).slice(0, 3).map((s) => (
          <li key={s.id} className="text-sm text-cream leading-snug">
            Particle event <span className="num text-cream-dim">{s.id.slice(0, 16).replace('T', ' ')}</span>
            {s.instrument && <span className="text-cream-dim">, seen by {s.instrument}</span>}
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="rounded-lg bg-navy-3 px-3 py-2"><p className="text-[11px] text-cream-dim">Storm dose outside</p><p className="num font-semibold text-cream">{sw.totalDose} mSv</p></div>
        <div className="rounded-lg bg-navy-3 px-3 py-2"><p className="text-[11px] text-cream-dim">Storm sols</p><p className="num font-semibold text-cream">{sw.fractions.filter((f) => f >= 0.1).length}</p></div>
        <div className="rounded-lg bg-navy-3 px-3 py-2"><p className="text-[11px] text-cream-dim">Over 100 MeV</p><p className="font-semibold" style={{ color: sw.hard ? 'var(--c-bad)' : 'var(--c-good)' }}>{sw.hard ? 'Yes' : 'No'}</p></div>
      </div>
      {e.url && <a href={e.url} target="_blank" rel="noreferrer" className="inline-block mt-3 text-xs text-cream-dim underline underline-offset-2 hover:text-cream">View this record on NASA DONKI</a>}
    </div>
  );
}
