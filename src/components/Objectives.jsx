import React from 'react';
import { OBJ_BY_ID } from '../data/objectives.js';

export default function Objectives({ game }) {
  return (
    <section aria-label="Mission objectives" className="px-4 py-3 border-t border-navy-line">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="font-display font-medium text-cream">Objectives</h3>
        <span className="text-sm text-cream-dim">Science <span className="num text-cream">{game.science}</span></span>
      </div>
      <ul className="space-y-2.5">
        {game.objectiveIds.map((id) => {
          const def = OBJ_BY_ID[id];
          const o = game.objectives[id];
          const isHarvest = id === 'harvest';
          const frac = o.done ? 1 : isHarvest ? (game.greenhouse.alive ? game.greenhouse.growth / 100 : 0) : o.progress / def.work;
          return (
            <li key={id}>
              <div className="flex justify-between text-sm gap-2">
                <span className={o.done ? 'text-life' : 'text-cream'}>{o.done ? '✓ ' : ''}{def.name}</span>
                <span className="num text-cream-dim text-xs">
                  {o.done ? `Sol ${o.doneSol}` : isHarvest ? `${Math.round(frac * 100)}%` : `${o.progress % 1 ? o.progress.toFixed(1) : o.progress} / ${def.work}`}
                </span>
              </div>
              <div className="h-1.5 mt-1 rounded-full bg-navy-3 overflow-hidden">
                <div className="h-full rounded-full bg-artemis" style={{ width: `${Math.min(100, frac * 100)}%`, background: o.done ? 'var(--c-good)' : undefined, transition: 'width 500ms ease' }} />
              </div>
              {!o.done && <p className="text-[11px] text-cream-faint mt-1">{isHarvest ? 'Assign someone to Tend crops with grow lights on.' : `Assign crew to this task.${def.eva ? ' Work is outside.' : ''}`}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
