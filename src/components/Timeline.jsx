import React from 'react';
import { timelineFor, illumination } from '../data/timeline.js';
import { MISSION_LENGTH } from '../data/constants.js';

const ICON = {
  shadow: (c) => <path d="M3 9a5 5 0 0 1 9-3 4 4 0 0 1 1 8H5a3 3 0 0 1-2-5z" fill={c} />,
  spe: (c) => <g stroke={c} strokeWidth="1.6" strokeLinecap="round"><circle cx="8" cy="8" r="3" fill={c} /><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6L13 13M3 13l1.4-1.4M11.6 4.4L13 3" /></g>,
  forecast: (c) => <g fill="none" stroke={c} strokeWidth="1.6"><path d="M2 12a8 8 0 0 1 12 0" /><path d="M5 12a4.5 4.5 0 0 1 6 0" /><circle cx="8" cy="12" r="1" fill={c} /></g>,
  dust: (c) => <g fill={c}><circle cx="4" cy="10" r="1.6" /><circle cx="8" cy="7" r="1.3" /><circle cx="12" cy="11" r="1.8" /><circle cx="9" cy="12" r="1" /></g>,
  land: (c) => <path d="M8 2l3 7H5zM5 10h6l1 4H4z" fill={c} />,
  end: (c) => <path d="M3 13V3l9 3-9 3" fill="none" stroke={c} strokeWidth="1.6" />,
};

export default function Timeline({ sol, sw }) {
  const TIMELINE_EVENTS = timelineFor(sw);
  const days = Array.from({ length: MISSION_LENGTH }, (_, i) => i + 1);
  const upcoming = TIMELINE_EVENTS.find((e) => e.end >= sol && e.kind !== 'land' && e.kind !== 'end');
  return (
    <nav aria-label="Mission timeline" className="px-3 sm:px-5 pt-3 pb-2">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <h2 className="num text-lg sm:text-xl font-semibold text-cream">Sol {sol} <span className="text-cream-faint font-normal">of {MISSION_LENGTH}</span></h2>
        {upcoming && (
          <p className="text-xs sm:text-sm text-cream-dim text-right">
            {upcoming.sol > sol ? <>Next: <span className="text-artemis">{upcoming.label}</span> on Sol {upcoming.sol}</> : <span className="text-artemis">{upcoming.label} now</span>}
          </p>
        )}
      </div>
      <ol className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${MISSION_LENGTH}, minmax(0, 1fr))` }}>
        {days.map((d) => {
          const ev = TIMELINE_EVENTS.find((e) => d >= e.sol && d <= e.end);
          const ill = illumination(d);
          const past = d < sol, now = d === sol;
          const bg = ill === 0 ? '#050B14' : ill < 0.5 ? '#0E1B2C' : '#1B3150';
          const iconColor = ev?.kind === 'spe' || ev?.kind === 'forecast' ? '#F26A1F' : '#B9AE9A';
          return (
            <li key={d} title={`Sol ${d}${ev ? `: ${ev.label}` : ''}`} aria-current={now ? 'step' : undefined}
              className={`relative h-9 sm:h-10 rounded-[4px] flex flex-col items-center justify-end pb-0.5 ${now ? 'ring-2 ring-artemis' : ''}`}
              style={{ background: bg, opacity: past ? 0.4 : 1 }}>
              {ev && ev.sol === d && ICON[ev.icon] && (
                <svg viewBox="0 0 16 16" className="absolute top-1 w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true">{ICON[ev.icon](iconColor)}</svg>
              )}
              {ev?.kind === 'spe' && <span aria-hidden="true" className="absolute inset-x-1 bottom-0 h-[3px] rounded-full bg-artemis" />}
              <span className={`num text-[9px] sm:text-[10px] leading-none ${now ? 'text-artemis font-bold' : 'text-cream-faint'}`}>{d}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
