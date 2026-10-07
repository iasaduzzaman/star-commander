import React, { useState } from 'react';
import * as K from '../data/constants.js';
import { powerBudget, waterUsePerSol, o2UsePerSol, foodDaysLeft } from '../engine/simulate.js';

const WORD = { good: 'Good', warn: 'Low', bad: 'Critical' };
const MARK = { good: '✓', warn: '▲', bad: '✕' };

function Bar({ frac, status }) {
  return (
    <div className="h-2 rounded-full bg-navy-3 overflow-hidden" aria-hidden="true">
      <div className="h-full rounded-full" style={{ width: `${Math.max(2, Math.min(100, frac * 100))}%`, background: `var(--c-${status})`, transition: 'width 500ms cubic-bezier(0.2,0.8,0.2,1)' }} />
    </div>
  );
}

function Gauge({ icon, name, status, frac, value, sub, formula, mode, children }) {
  const [open, setOpen] = useState(false);
  const canOpen = mode === 'specialist' && formula;
  const Tag = canOpen ? 'button' : 'div';
  return (
    <div className="py-3 border-b border-navy-line last:border-b-0">
      <Tag className="w-full text-left" onClick={canOpen ? () => setOpen((o) => !o) : undefined} aria-expanded={canOpen ? open : undefined}>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="flex items-center gap-2 font-display font-medium text-cream">
            <span aria-hidden="true" className="w-5 text-center">{icon}</span>{name}
          </span>
          <span className="flex items-center gap-1.5 text-sm" style={{ color: `var(--c-${status})` }}>
            <span aria-hidden="true" className="text-[10px]">{MARK[status]}</span>
            {mode === 'cadet' ? WORD[status] : <span className="num">{value}</span>}
          </span>
        </div>
        <Bar frac={frac} status={status} />
        {sub && <p className="text-xs text-cream-dim mt-1.5">{sub}</p>}
      </Tag>
      {children}
      {canOpen && open && (
        <div className="mt-2 rounded-md bg-navy-3 px-3 py-2 text-xs text-cream-dim num leading-relaxed fade">{formula}</div>
      )}
    </div>
  );
}

export default function ResourcePanel({ game, mode }) {
  const r = game.res;
  const solsLeft = K.MISSION_LENGTH - game.sol + 1;
  const pb = powerBudget(game);

  const batFrac = r.battery / r.batteryCap;
  const pStatus = batFrac < 0.1 ? 'bad' : batFrac < 0.3 ? 'warn' : 'good';

  const o2Use = o2UsePerSol(game);
  const o2Days = o2Use > 0 ? Math.floor(r.o2 / o2Use) : Infinity;
  const wUse = waterUsePerSol(game);
  const wDays = Math.floor(r.water / wUse);
  const lsDays = Math.min(o2Days, wDays);
  const lsStatus = lsDays >= solsLeft ? 'good' : lsDays >= solsLeft * 0.5 && lsDays >= 4 ? 'warn' : 'bad';

  const fDays = foodDaysLeft(game);
  const fStatus = fDays >= solsLeft ? 'good' : fDays >= solsLeft * 0.6 ? 'warn' : 'bad';

  const maxDose = Math.max(...game.crew.map((c) => c.dose));
  const rStatus = maxDose >= 200 ? 'bad' : r.shielding >= 50 ? 'good' : game.sol >= 16 && game.sol <= 20 && r.shielding < 35 ? 'bad' : 'warn';

  const eclss = K.ECLSS_MODES[game.plan.eclss];
  const fmt = (n) => (n > 0 ? `+${Math.round(n)}` : `${Math.round(n)}`);

  return (
    <section aria-label="Base resources" className="px-4">
      <Gauge mode={mode} icon="⚡" name="Power" status={pStatus} frac={batFrac}
        value={`${r.battery} / ${r.batteryCap} kWh`}
        sub={mode === 'cadet'
          ? (pb.net >= 0 ? 'Charging today' : 'Draining today')
          : `${fmt(pb.net)} kWh today. Made ${Math.round(pb.production)}, using ${Math.round(pb.consumption)}.`}
        formula={<>
          made = {1 + game.cargo.solar} array × 180 × {pb.illum} sun × {(1 - r.dust).toFixed(2)} clean{pb.nuclear ? ` + ${pb.nuclear} reactor` : ''} = {Math.round(pb.production)} kWh<br />
          used = {pb.loads.map((l) => `${l.label} ${l.kwh}`).join(' + ')} = {pb.consumption} kWh
        </>}>
        {mode !== 'cadet' && r.dust > 0.01 && <p className="text-xs text-cream-faint mt-1">Dust on arrays: <span className="num">{Math.round(r.dust * 100)}%</span></p>}
      </Gauge>

      <Gauge mode={mode} icon="◍" name="Life support" status={lsStatus} frac={Math.min(1, lsDays / Math.max(1, solsLeft))}
        value={`${Math.round(r.o2)} kg, ${Math.round(r.water)} L`}
        sub={mode === 'cadet'
          ? (lsDays === Infinity ? 'Air and water are steady' : `Air and water last about ${lsDays} sols`)
          : `O₂ ${o2Use > 0 ? `−${o2Use.toFixed(1)} kg/sol` : 'steady'}. Water −${wUse.toFixed(1)} L/sol. Mode: ${eclss.label}.`}
        formula={<>
          O₂ made = 4 crew × 0.84 kg × {eclss.o2Cover} = {(3.36 * eclss.o2Cover).toFixed(2)} kg<br />
          water lost = 4 × 3.5 L × (1 − {eclss.waterRecovery}) + 1.125 × O₂ made{game.greenhouse.present && game.plan.greenhouse ? ' + 2 L plants' : ''} = {wUse.toFixed(1)} L
        </>} />

      <Gauge mode={mode} icon="◒" name="Food" status={fStatus} frac={Math.min(1, fDays / Math.max(1, solsLeft))}
        value={`${r.food} crew-days`}
        sub={`Lasts ${fDays} sols. Mission has ${solsLeft} left.`}
        formula={<>eaten = 4 crew × 1 crew-day per sol<br />harvest = +{K.HARVEST_FOOD} crew-days when crops reach 100%</>}>
        {game.greenhouse.present && (
          <p className="text-xs text-cream-faint mt-1">Greenhouse: {game.greenhouse.alive ? <span className="num">{Math.round(game.greenhouse.growth)}% grown</span> : 'crop died, tend to replant'}</p>
        )}
      </Gauge>

      <Gauge mode={mode} icon="☢" name="Radiation" status={rStatus} frac={r.shielding / 100}
        value={`${Math.round(r.shielding)}% shielding`}
        sub={mode === 'cadet' ? (game.sol <= 20 ? 'Particle storm from Sol 20. Pile regolith to protect the crew.' : 'Storm is here or has passed.') : `Highest crew dose ${Math.round(maxDose)} mSv. Limit 250.`}
        formula={<>dose inside = 1.37 mSv × (1 − 0.6 × {(r.shielding / 100).toFixed(2)}) = {(1.37 * (1 - 0.6 * r.shielding / 100)).toFixed(2)} mSv/sol<br />storm total = {game.spaceWeather.totalDose} mSv (NASA DONKI {game.spaceWeather.event.classType} flare)<br />storm inside = total × day share × (1 − {game.spaceWeather.shieldEff} × shielding)<br />day shares from NASA LRO CRaTER: {game.spaceWeather.fractions.map((f) => Math.round(f * 100) + '%').join(', ')}</>} />
      {mode === 'specialist' && <p className="text-[11px] text-cream-faint pb-3">Tap a gauge to see the maths.</p>}
    </section>
  );
}
