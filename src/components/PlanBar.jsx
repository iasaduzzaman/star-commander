import React from 'react';
import { ECLSS_MODES } from '../data/constants.js';
import { powerBudget } from '../engine/simulate.js';

export default function PlanBar({ game, mode, onPlan, onEnd }) {
  const pb = powerBudget(game);
  const after = game.res.battery + pb.net;
  const short = after < 0;
  const full = after > game.res.batteryCap;
  let msg;
  if (short) msg = <>Short by <span className="num">{Math.round(-after)}</span> kWh. The base will cut grow lights, then life support.</>;
  else if (pb.net >= 0) msg = <>Making <span className="num">{Math.round(pb.net)}</span> kWh more than you use{full ? '. Batteries full, extra is wasted.' : '.'}</>;
  else msg = <>Batteries cover <span className="num">{Math.round(-pb.net)}</span> kWh today. <span className="num">{Math.round(after)}</span> left tonight.</>;

  return (
    <div className="border-t border-navy-line bg-navy/95 backdrop-blur px-3 sm:px-5 py-3">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <fieldset className="flex items-center gap-2">
          <legend className="sr-only">Life support mode</legend>
          <span className="text-sm text-cream-dim">Life support</span>
          <div className="inline-flex rounded-lg bg-navy-3 p-0.5" role="radiogroup">
            {Object.entries(ECLSS_MODES).map(([k, v]) => {
              const on = game.plan.eclss === k;
              return (
                <button key={k} role="radio" aria-checked={on} onClick={() => onPlan('eclss', k)}
                  className={`px-3 py-1.5 rounded-md text-sm font-display ${on ? 'bg-cream text-navy font-semibold' : 'text-cream-dim hover:text-cream'}`}>
                  {v.label}{mode !== 'cadet' && <span className="num opacity-70 ml-1 text-xs">{v.power}</span>}
                </button>
              );
            })}
          </div>
        </fieldset>
        {game.greenhouse.present && (
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-cream-dim">Grow lights</span>
            <button role="switch" aria-checked={game.plan.greenhouse} onClick={() => onPlan('greenhouse', !game.plan.greenhouse)}
              className={`relative w-11 h-6 rounded-full transition-colors ${game.plan.greenhouse ? 'bg-life' : 'bg-navy-3'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-cream transition-transform ${game.plan.greenhouse ? 'translate-x-5' : ''}`} />
            </button>
          </label>
        )}
        <p className={`text-sm flex-1 min-w-[200px] ${short ? 'text-danger' : 'text-cream-dim'}`} aria-live="polite">{msg}</p>
        <button onClick={onEnd}
          className="ml-auto rounded-xl bg-artemis text-navy font-display font-bold text-base sm:text-lg px-6 py-3 hover:brightness-110 active:scale-[0.98] transition">
          End Sol {game.sol}
        </button>
      </div>
    </div>
  );
}
