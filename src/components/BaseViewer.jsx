import React, { useMemo } from 'react';
import { illumination } from '../data/timeline.js';
import { CREW_BY_ID } from '../data/crew.js';
import { effectiveTask, taskInfo } from '../engine/simulate.js';
import { stormFractionOn } from '../data/nasa/spaceWeather.js';

const W = 1000, H = 420, GROUND = 318;

// deterministic star field
const STARS = Array.from({ length: 70 }, (_, i) => {
  const x = (i * 137.5) % W, y = (i * 61.7) % 210;
  return { x, y, r: i % 7 === 0 ? 1.4 : 0.8, o: 0.3 + ((i * 13) % 10) / 20 };
});

const COLORS = { good: 'var(--c-good)', warn: 'var(--c-warn)', bad: 'var(--c-bad)', off: '#3A4F6E' };

function Module({ x, w, h, label, status, children, dim, frame }) {
  const y = GROUND - h;
  const stroke = COLORS[status] || COLORS.off;
  return (
    <g opacity={dim ? 0.55 : 1}>
      {status !== 'off' && <rect x={x - 3} y={y - 3} width={w + 6} height={h + 6} rx="13" fill="none" stroke={stroke} strokeWidth="3" className={status === 'good' ? 'glow' : ''} opacity="0.3" />}
      <rect x={x} y={y} width={w} height={h} rx="10" fill={frame ? "none" : "#1B3150"} strokeDasharray={frame ? "4 6" : undefined} stroke={stroke} strokeWidth="2.5" className={status === 'warn' ? 'flicker' : ''} />
      {children}
      <text x={x + w / 2} y={GROUND + 20} textAnchor="middle" className="svg-label" fill="#B9AE9A" fontSize="13" fontFamily="var(--font-display)">{label}</text>
      {(status === 'warn' || status === 'bad') && (
        <g transform={`translate(${x + w / 2 - 11}, ${y - 34})`}>
          <path d="M11 0 L22 20 L0 20 Z" fill={stroke} />
          <text x="11" y="17" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0B1A2E">!</text>
        </g>
      )}
    </g>
  );
}

function Astronaut({ x, y, id, suit }) {
  const c = CREW_BY_ID[id];
  if (suit) {
    return (
      <g transform={`translate(${x},${y})`}>
        <title>{c.short} (outside)</title>
        <rect x="-7" y="-20" width="14" height="18" rx="5" fill="#E8E2D6" />
        <circle cx="0" cy="-27" r="8" fill="#E8E2D6" />
        <rect x="-5" y="-31" width="10" height="7" rx="3" fill="#C98A2E" />
        <rect x="-6" y="-4" width="5" height="10" rx="2" fill="#D8D2C6" />
        <rect x="1" y="-4" width="5" height="10" rx="2" fill="#D8D2C6" />
        <rect x="5" y="-18" width="4" height="10" rx="2" fill={c.accent} />
      </g>
    );
  }
  return (
    <g transform={`translate(${x},${y})`}>
      <title>{c.short}</title>
      <rect x="-6" y="-17" width="12" height="16" rx="4" fill={c.suit} />
      <circle cx="0" cy="-23" r="6" fill={c.skin} />
      <path d="M-6 -25 q6 -9 12 0" fill={c.hair} />
    </g>
  );
}

export default function BaseViewer({ game, compact = false }) {
  const sol = game?.sol ?? 1;
  const illum = game ? illumination(sol) : 0.9;
  const dark = illum === 0 ? 0.62 : illum < 0.5 ? 0.45 : 0;
  const spe = game?.spaceWeather ? stormFractionOn(game.spaceWeather, sol) >= 0.1 : false;

  const layout = useMemo(() => buildLayout(game), [game]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label={describe(game, illum)}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#03080F" />
          <stop offset="1" stopColor="#0B1A2E" />
        </linearGradient>
        <radialGradient id="sun" cx="0" cy="0.78" r="0.7">
          <stop offset="0" stopColor="#FFE7B8" stopOpacity="0.9" />
          <stop offset="0.25" stopColor="#F2B36B" stopOpacity="0.25" />
          <stop offset="1" stopColor="#F2B36B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7E7868" />
          <stop offset="1" stopColor="#3E3B33" />
        </linearGradient>
        <linearGradient id="mound" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8C8371" />
          <stop offset="1" stopColor="#5E584B" />
        </linearGradient>
      </defs>

      <rect width={W} height={H} fill="url(#sky)" />
      {STARS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#F2E6D0" opacity={s.o} />)}

      {/* Earth hangs low over the south pole horizon */}
      <g transform="translate(840, 150)">
        <circle r="17" fill="#2E6FB7" />
        <path d="M-10 -8 q8 -4 12 2 q4 6 -4 8 q-6 2 -8 -4z M4 6 q6 -2 8 4" fill="#E9F1F8" opacity="0.9" />
        <circle r="17" fill="none" stroke="#9FC8F0" strokeOpacity="0.4" strokeWidth="3" />
      </g>

      {/* Sun grazing the horizon from the left */}
      <rect width={W} height={H} fill="url(#sun)" opacity={illum} className="scene-dim" />

      {/* Shackleton rim, far distance */}
      <path d={`M0 ${GROUND - 40} L120 ${GROUND - 62} L260 ${GROUND - 48} L420 ${GROUND - 90} L520 ${GROUND - 84} L610 ${GROUND - 58} L760 ${GROUND - 70} L880 ${GROUND - 44} L1000 ${GROUND - 56} L1000 ${GROUND} L0 ${GROUND}Z`} fill="#22324A" />
      <path d={`M420 ${GROUND - 90} L520 ${GROUND - 84}`} stroke="#F2E6D0" strokeOpacity={0.25 * illum} strokeWidth="2" />

      {/* Ground */}
      <rect x="0" y={GROUND} width={W} height={H - GROUND} fill="url(#ground)" />
      <path d={`M0 ${GROUND} H${W}`} stroke="#B9AE9A" strokeOpacity="0.5" />

      {/* Power cables */}
      <path d={`M${layout.cableStart} ${GROUND + 6} H${layout.cableEnd}`} stroke="#F26A1F" strokeOpacity="0.4" strokeWidth="2" strokeDasharray="6 6" />

      <g transform={`translate(${layout.offset}, 0)`}>
        {layout.modules.map((m) => (
          <Module key={m.key} {...m}>{m.draw}</Module>
        ))}
        {layout.crew.map((c) => <Astronaut key={c.id} {...c} />)}
      </g>

      {/* Night falls */}
      <rect width={W} height={H} fill="#000" opacity={dark} className="scene-dim" pointerEvents="none" />
      {/* ...but the habitat windows stay lit */}
      {dark > 0 && (
        <g transform={`translate(${layout.offset}, 0)`} pointerEvents="none">
          {[0, 1, 2].map((i) => <rect key={i} x={layout.habX + 22 + i * 58} y={GROUND - 80} width="38" height="22" rx="6" fill="#FFD9A0" opacity="0.55" />)}
        </g>
      )}
      {/* Earth stays lit in the dark */}
      {dark > 0 && <circle cx="840" cy="150" r="17" fill="#2E6FB7" opacity="0.85" />}

      {spe && (
        <g pointerEvents="none">
          {Array.from({ length: 14 }, (_, i) => (
            <line key={i} x1={300 + i * 55} y1={-20 - (i % 3) * 30} x2={290 + i * 55} y2={-8 - (i % 3) * 30} stroke="#FFD9A0" strokeWidth="2" strokeLinecap="round" className="streak" style={{ animationDelay: `${(i * 0.17) % 1.4}s` }} />
          ))}
        </g>
      )}

      {!compact && game && (
        <g>
          <rect x="16" y="16" rx="8" width="190" height="36" fill="#0B1A2E" opacity="0.75" />
          <text x="30" y="40" fill="#F2E6D0" fontSize="18" fontFamily="var(--font-display)" fontWeight="600">
            {illum === 0 ? 'In shadow' : illum < 0.5 ? 'Low sun' : 'Sunlit'} {Math.round(illum * 100)}%
          </text>
        </g>
      )}
    </svg>
  );
}

function describe(game, illum) {
  if (!game) return 'Silhouette of a lunar base at the south pole with Earth on the horizon.';
  return `Base on Sol ${game.sol}. Sunlight ${Math.round(illum * 100)} percent. Shielding ${Math.round(game.res.shielding)} percent. Battery ${game.res.battery} kilowatt hours.`;
}

function buildLayout(game) {
  // Title-screen silhouette when there is no game
  const cargo = game?.cargo ?? { solar: 1, kilopower: 0, greenhouse: 1, battery: 1 };
  const res = game?.res ?? { battery: 200, batteryCap: 200, dust: 0, shielding: 45 };
  const plan = game?.plan ?? { eclss: 'full', greenhouse: true };
  const gh = game?.greenhouse ?? { present: true, growth: 40, alive: true };
  const sol = game?.sol ?? 1;
  const illum = game ? illumination(sol) : 0.9;

  const modules = [];
  let x = 30;
  const arrays = 1 + (cargo.solar || 0);

  // Solar masts (vertical arrays track the low south-pole Sun)
  const solarStatus = !game ? 'good' : illum === 0 ? 'off' : res.dust >= 0.25 ? 'bad' : res.dust >= 0.12 ? 'warn' : 'good';
  const solarW = 34 + arrays * 30;
  modules.push({
    key: 'solar', x, w: solarW, h: 150, label: arrays > 1 ? `Solar ×${arrays}` : 'Solar', status: solarStatus, dim: illum === 0, frame: true,
    draw: (
      <g>
        {Array.from({ length: arrays }, (_, i) => {
          const px = x + 16 + i * 30;
          return (
            <g key={i}>
              <rect x={px + 10} y={GROUND - 150} width="4" height="150" fill="#B9AE9A" />
              <rect x={px} y={GROUND - 140} width="24" height="96" rx="2" fill="#24538C" stroke="#9FC8F0" strokeOpacity="0.5" />
              {[0, 1, 2, 3, 4, 5].map((r) => <line key={r} x1={px} x2={px + 24} y1={GROUND - 124 + r * 16} y2={GROUND - 124 + r * 16} stroke="#9FC8F0" strokeOpacity="0.3" />)}
              <rect x={px} y={GROUND - 140} width="24" height="96" fill="#8C6A3E" opacity={Math.min(0.75, res.dust * 2.2)} />
            </g>
          );
        })}
      </g>
    ),
  });
  // Masts aren't boxes: hide the module rect behind them by making them transparent via draw order
  x += solarW + 18;

  if (cargo.kilopower) {
    const online = game ? sol >= game.kilopowerOnlineSol : true;
    modules.push({
      key: 'kilo', x, w: 64, h: 120, label: 'Kilopower', status: online ? 'good' : 'off', frame: true,
      draw: (
        <g>
          <path d={`M${x + 32} ${GROUND - 112} l-20 40 h40z`} fill="#3A4F6E" stroke="#B9AE9A" strokeOpacity="0.6" />
          {[0, 1, 2].map((i) => <rect key={i} x={x + 14 + i * 13} y={GROUND - 66} width="8" height="56" rx="2" fill={online ? '#F26A1F' : '#55657E'} opacity="0.75" />)}
        </g>
      ),
    });
    x += 64 + 18;
  }

  const batFrac = res.battery / res.batteryCap;
  const batStatus = !game ? 'good' : batFrac < 0.1 ? 'bad' : batFrac < 0.3 ? 'warn' : 'good';
  modules.push({
    key: 'battery', x, w: 70, h: 80, label: 'Batteries', status: batStatus,
    draw: (
      <g>
        <rect x={x + 16} y={GROUND - 66} width="38" height="54" rx="4" fill="#0B1A2E" stroke="#B9AE9A" strokeOpacity="0.5" />
        <rect x={x + 28} y={GROUND - 72} width="14" height="6" rx="2" fill="#B9AE9A" opacity="0.5" />
        <rect x={x + 19} y={GROUND - 15 - 48 * batFrac} width="32" height={48 * batFrac} rx="2" fill={COLORS[batStatus]} opacity="0.85" style={{ transition: 'all 500ms ease' }} />
      </g>
    ),
  });
  x += 70 + 18;

  // Habitat with regolith mound (height = shielding)
  const habX = x, habW = 200;
  const moundH = 10 + (res.shielding / 100) * 90;
  const habStatus = !game ? 'good' : game.crew.some((m) => m.health < 40) ? 'bad' : game.crew.some((m) => m.health < 65 || m.stress >= 70) ? 'warn' : 'good';
  modules.push({
    key: 'hab', x, w: habW, h: 110, label: 'Habitat', status: habStatus,
    draw: (
      <g>
        <path d={`M${x - 14} ${GROUND - 110 + 4} Q${x + habW / 2} ${GROUND - 110 - moundH * 1.6} ${x + habW + 14} ${GROUND - 110 + 4} Z`} fill="url(#mound)" style={{ transition: 'd 600ms ease' }} />
        {[0, 1, 2].map((i) => <rect key={i} x={x + 22 + i * 58} y={GROUND - 80} width="38" height="22" rx="6" fill="#F2E6D0" opacity="0.25" />)}
        <text x={x + habW / 2} y={GROUND - 118} textAnchor="middle" fontSize="14" fontWeight="600" fill="#2A2620" fontFamily="var(--font-display)">{Math.round(res.shielding)}% shielded</text>
      </g>
    ),
  });
  x += habW + 18;

  const eclssStatus = plan.eclss === 'full' ? 'good' : plan.eclss === 'eco' ? 'warn' : 'bad';
  modules.push({
    key: 'eclss', x, w: 90, h: 90, label: 'Life support', status: eclssStatus,
    draw: (
      <g>
        <circle cx={x + 45} cy={GROUND - 50} r="22" fill="none" stroke="#9FC8F0" strokeOpacity="0.6" strokeWidth="3" />
        <path d={`M${x + 45} ${GROUND - 66} v32 M${x + 29} ${GROUND - 50} h32`} stroke="#9FC8F0" strokeOpacity="0.6" strokeWidth="3" />
        <text x={x + 45} y={GROUND - 12} textAnchor="middle" fontSize="12" fill="#B9AE9A" fontFamily="var(--font-display)">O₂ H₂O</text>
      </g>
    ),
  });
  x += 90 + 18;

  if (cargo.greenhouse || gh.present) {
    const ghStatus = !gh.alive ? 'bad' : !plan.greenhouse ? 'warn' : 'good';
    const growth = gh.alive ? gh.growth : 0;
    modules.push({
      key: 'gh', x, w: 120, h: 96, label: 'Greenhouse', status: ghStatus,
      draw: (
        <g>
          {plan.greenhouse && gh.alive && <rect x={x + 8} y={GROUND - 88} width="104" height="6" rx="3" fill="#E6A7FF" opacity="0.6" />}
          {[0, 1, 2, 3, 4].map((i) => {
            const hgt = 6 + (growth / 100) * 34;
            return (
              <g key={i}>
                <rect x={x + 12 + i * 20} y={GROUND - 18} width="16" height="8" rx="2" fill="#5E584B" />
                <path d={`M${x + 20 + i * 20} ${GROUND - 18} q-8 ${-hgt / 2} 0 ${-hgt} q8 ${hgt / 2} 0 ${hgt}`} fill={gh.alive ? 'var(--c-good)' : '#6B5E4A'} opacity="0.9" />
              </g>
            );
          })}
        </g>
      ),
    });
    x += 120 + 18;
  }

  modules.push({
    key: 'lab', x, w: 90, h: 80, label: 'Lab', status: 'good',
    draw: (
      <g>
        <rect x={x + 18} y={GROUND - 56} width="54" height="34" rx="4" fill="#0B1A2E" stroke="#B9AE9A" strokeOpacity="0.5" />
        <rect x={x + 30} y={GROUND - 36} width="30" height="10" rx="2" fill="#8C8371" opacity={Math.min(1, (game?.objectives?.print?.progress ?? 0) / 6 + 0.2)} />
      </g>
    ),
  });
  const labX = x;
  x += 90 + 30;

  // rover (not a module box)
  const roverX = Math.min(x, 900);

  // Crew placement
  const crew = [];
  if (game) {
    const pos = { hab: 0, lab: 0, gh: 0, outside: 0, solar: 0, kilo: 0, far: 0 };
    const habSlot = (n) => habX + 30 + n * 42;
    game.crew.forEach((m) => {
      const t = effectiveTask(game, m);
      const info = taskInfo(t);
      let cx, cy = GROUND - 14, suit = false;
      if (t === 'farm' && gh.present) { cx = modules.find((q) => q.key === 'gh').x + 30 + pos.gh++ * 40; }
      else if (t === 'lab' || t === 'obj:print') { cx = labX + 25 + pos.lab++ * 30; }
      else if (t === 'reactor') { const k = modules.find((q) => q.key === 'kilo'); cx = (k ? k.x + 32 : habX) + pos.kilo++ * 16; suit = true; cy = GROUND + 72; }
      else if (t === 'maintain') { cx = 45 + pos.solar++ * 30; cy = GROUND + 72; suit = true; }
      else if (t === 'shield') { cx = habX + 10 + pos.outside++ * 28; cy = GROUND + 72; suit = true; }
      else if (info.eva) { cx = roverX + 20 + pos.far++ * 28; cy = GROUND + 72; suit = true; }
      else { cx = habSlot(pos.hab++); }
      crew.push({ id: m.id, x: cx, y: cy, suit });
    });
  }

  modules.push({
    key: 'rover', x: roverX, w: 0, h: 0, label: '', status: 'off',
    draw: (
      <g transform={`translate(${roverX}, ${GROUND - 44})`}>
        <rect x="0" y="0" width="74" height="30" rx="10" fill="#E8E2D6" />
        <rect x="46" y="6" width="20" height="12" rx="3" fill="#24538C" />
        <circle cx="16" cy="34" r="9" fill="#3E3B33" stroke="#B9AE9A" />
        <circle cx="58" cy="34" r="9" fill="#3E3B33" stroke="#B9AE9A" />
      </g>
    ),
  });

  const end = roverX + 74;
  const offset = Math.max(0, (W - end - 30) / 2);
  return { modules, crew, cableStart: 40 + offset, cableEnd: labX + 90 + offset, offset, habX };
}
