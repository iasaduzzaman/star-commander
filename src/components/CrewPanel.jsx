import React from 'react';
import { CREW_BY_ID } from '../data/crew.js';
import { availableTasks, taskInfo, isLocked } from '../engine/simulate.js';
import Portrait, { portraitState } from './Portrait.jsx';

function Mini({ label, value, max, status, suffix = '', hideValue }) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="w-12 text-cream-dim">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-navy-3 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: `var(--c-${status})`, transition: 'width 500ms ease' }} />
      </div>
      {!hideValue && <span className="num w-12 text-right text-cream-dim">{Math.round(value)}{suffix}</span>}
    </div>
  );
}

export default function CrewPanel({ game, mode, onTask }) {
  return (
    <section aria-label="Crew" className="px-4 py-2 space-y-2">
      {game.crew.map((m) => {
        const def = CREW_BY_ID[m.id];
        const locked = isLocked(game, m);
        const tasks = availableTasks(game, m.id);
        const current = tasks.find((t) => t.id === m.task) ? m.task : 'rest';
        const hStatus = m.health < 40 ? 'bad' : m.health < 70 ? 'warn' : 'good';
        const sStatus = m.stress >= 70 ? 'bad' : m.stress >= 45 ? 'warn' : 'good';
        const dStatus = m.dose >= 200 ? 'bad' : m.dose >= 100 ? 'warn' : 'good';
        const restricted = m.restrictedUntil >= game.sol;
        return (
          <article key={m.id} className="rounded-xl bg-navy-2 border border-navy-line p-3">
            <div className="flex gap-3">
              <Portrait id={m.id} state={portraitState(m)} size={56} className="shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <h3 className="font-display font-semibold text-cream leading-tight">{def.name}</h3>
                <p className="text-xs text-cream-dim leading-snug">{def.role}</p>
                <p className="text-[11px] text-cream-faint mt-0.5" title={def.bonus}>{def.tag}</p>
              </div>
            </div>
            <div className="mt-2.5 space-y-1">
              <Mini label="Health" value={m.health} max={100} status={hStatus} />
              <Mini label="Stress" value={m.stress} max={100} status={sStatus} />
              {mode !== 'cadet'
                ? <Mini label="Dose" value={m.dose} max={250} status={dStatus} suffix=" mSv" />
                : <Mini label="Radiation" value={m.dose} max={250} status={dStatus} hideValue />}
            </div>
            <div className="mt-2.5">
              {locked ? (
                <p className="text-sm rounded-lg bg-navy-3 px-3 py-2 text-artemis">{taskInfo(m.busyTask).label} <span className="text-cream-faint">until Sol {m.busyUntil}</span></p>
              ) : (
                <label className="block">
                  <span className="sr-only">Task for {def.short}</span>
                  <select value={current} onChange={(e) => onTask(m.id, e.target.value)}
                    className="w-full rounded-lg bg-navy-3 border border-navy-line text-cream text-sm px-3 py-2 font-body">
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id} disabled={!!t.disabled}>
                        {t.label}{t.eva ? ' (outside)' : ''}{t.disabled ? `: ${t.disabled}` : ''}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {restricted && !locked && <p className="text-[11px] text-artemis mt-1">Medical hold: no outside work until Sol {m.restrictedUntil + 1}</p>}
              {mode !== 'cadet' && !locked && <p className="text-[11px] text-cream-faint mt-1">{(taskInfo(current).hint) || (taskInfo(current).objective ? `${taskInfo(current).objective.powerPerWork} kWh per shift` : '')}</p>}
            </div>
          </article>
        );
      })}
    </section>
  );
}
