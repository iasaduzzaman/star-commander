import React from 'react';
import { CREW_BY_ID } from '../data/crew.js';

// Flat-vector, shoulders-up, 3/4 facing right. Three states: default, stressed, hurt.
export function portraitState(m) {
  if (!m) return 'default';
  if (m.health < 50) return 'hurt';
  if (m.stress >= 60) return 'stressed';
  return 'default';
}

export default function Portrait({ id, state = 'default', size = 64, className = '' }) {
  const c = CREW_BY_ID[id];
  const skin = state === 'hurt' ? mix(c.skin, '#9AA3A8', 0.25) : c.skin;
  const shade = mix(skin, '#000000', 0.18);
  const brow = state === 'default' ? 'M50 47 q6 -3 12 0 M70 47 q6 -3 12 0' : state === 'stressed' ? 'M50 45 q6 2 12 3 M70 48 q6 -2 12 -3' : 'M50 44 q6 3 12 4 M70 48 q6 -3 12 -4';
  const mouth = state === 'default' ? 'M60 73 q8 6 16 0' : state === 'stressed' ? 'M60 75 q8 -1 16 0' : 'M60 76 q8 -5 16 0';
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} role="img" aria-label={`${c.name}, ${state === 'default' ? 'steady' : state}`}>
      <defs>
        <clipPath id={`clip-${id}-${size}`}><circle cx="60" cy="60" r="60" /></clipPath>
      </defs>
      <g clipPath={`url(#clip-${id}-${size})`}>
        <rect width="120" height="120" fill="#1B3150" />
        <circle cx="60" cy="60" r="44" fill="#22406A" />
        {/* hair behind */}
        {c.hairStyle === 'braid' && <path d="M38 40 q-10 30 4 52 l10 -4 q-8 -20 -2 -44z" fill={c.hair} />}
        {c.hairStyle === 'bob' && <path d="M34 54 q-2 -30 28 -32 q28 0 30 30 l2 22 l-10 0 l-2 -20 l-38 0 l-2 22 l-10 0z" fill={c.hair} />}
        {/* suit */}
        <path d="M14 120 q4 -30 34 -34 l24 0 q30 4 34 34z" fill={c.suit} />
        <path d="M48 86 l12 14 l12 -14" fill="none" stroke="#F2E6D0" strokeOpacity="0.5" strokeWidth="2" />
        <rect x="80" y="96" width="12" height="8" rx="1.5" fill={c.accent} opacity="0.9" />
        {/* neck + head */}
        <rect x="52" y="70" width="18" height="18" rx="4" fill={shade} />
        <ellipse cx="64" cy="56" rx="22" ry="26" fill={skin} />
        <ellipse cx="44" cy="58" rx="4" ry="6" fill={shade} />
        {/* hair front */}
        {c.hairStyle === 'short' && <path d="M42 46 q2 -22 24 -22 q20 0 22 20 q-6 -8 -22 -8 q-16 0 -24 10z" fill={c.hair} />}
        {c.hairStyle === 'short' && <path d="M42 46 q0 -8 4 -12" stroke="#B9AE9A" strokeWidth="2" fill="none" />}
        {c.hairStyle === 'undercut' && <path d="M42 48 q-2 -26 26 -26 q22 2 20 22 q-10 -10 -30 -6 q-10 2 -16 10z" fill={c.hair} />}
        {c.hairStyle === 'braid' && <path d="M42 48 q0 -24 24 -24 q22 0 22 22 q-12 -12 -28 -10 q-12 2 -18 12z" fill={c.hair} />}
        {c.hairStyle === 'bob' && <path d="M42 50 q0 -24 24 -24 q22 0 22 22 l-6 -6 q-10 -6 -40 8z" fill={c.hair} />}
        {/* face */}
        <path d={brow} stroke={c.hair} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="57" cy="54" r="2.6" fill="#1A1410" />
        <circle cx="76" cy="54" r="2.6" fill="#1A1410" />
        {c.glasses && <g fill="none" stroke="#C9B48A" strokeWidth="1.8"><circle cx="57" cy="54" r="7" /><circle cx="76" cy="54" r="7" /><path d="M64 54 h5" /></g>}
        <path d="M67 58 q2 6 -2 8" stroke={shade} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d={mouth} stroke="#5A2A22" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        {state === 'stressed' && <path d="M86 40 q3 5 0 8 q-3 -3 0 -8z" fill="#9FD3FF" />}
        {state === 'hurt' && <rect x="70" y="34" width="16" height="6" rx="2" fill="#F2E6D0" transform="rotate(-12 78 37)" />}
      </g>
    </svg>
  );
}

function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (s) => [(s >> 16) & 255, (s >> 8) & 255, s & 255];
  const [r1, g1, b1] = ch(pa), [r2, g2, b2] = ch(pb);
  const m = (x, y) => Math.round(x + (y - x) * t);
  return `#${((1 << 24) | (m(r1, r2) << 16) | (m(g1, g2) << 8) | m(b1, b2)).toString(16).slice(1)}`;
}
