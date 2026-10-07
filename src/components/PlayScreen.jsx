import React from 'react';
import Timeline from './Timeline.jsx';
import BaseViewer from './BaseViewer.jsx';
import ResourcePanel from './ResourcePanel.jsx';
import CrewPanel from './CrewPanel.jsx';
import PlanBar from './PlanBar.jsx';
import Objectives from './Objectives.jsx';
import { forecast } from '../data/timeline.js';
import { cadetHint } from '../engine/simulate.js';

export default function PlayScreen({ game, mode, setTask, setPlan, endSol, setOverlay, onMenu }) {
  const lines = forecast(game.sol, game.spaceWeather);
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-3 sm:px-5 pt-3">
        <button onClick={onMenu} className="font-display font-semibold text-cream hover:text-artemis">Base Commander</button>
        <div className="flex gap-4 text-sm">
          <button onClick={() => setOverlay('help')} className="text-cream-dim hover:text-cream">Help</button>
          <button onClick={() => setOverlay('sources')} className="text-cream-dim hover:text-cream">Data</button>
          <button onClick={() => setOverlay('settings')} className="text-cream-dim hover:text-cream">Settings</button>
        </div>
      </header>
      <Timeline sol={game.sol} sw={game.spaceWeather} />

      <div className="flex-1 grid lg:grid-cols-[280px_minmax(0,1fr)_320px] gap-0 lg:gap-2">
        <aside className="order-2 lg:order-1 lg:max-h-[calc(100vh-190px)] lg:overflow-y-auto scroll-thin">
          <ResourcePanel game={game} mode={mode} />
          <Objectives game={game} />
        </aside>

        <section className="order-1 lg:order-2 px-3 sm:px-5 lg:px-0 flex flex-col gap-3">
          <div className="rounded-2xl overflow-hidden border border-navy-line">
            <BaseViewer game={game} />
          </div>
          <div className="rounded-xl bg-navy-2 border border-navy-line px-4 py-3" aria-live="polite">
            <p className="text-xs text-cream-dim font-display mb-1">Morning briefing</p>
            {lines.map((l) => <p key={l} className="text-sm text-cream leading-relaxed">{l}</p>)}
            {mode === 'cadet' && <p className="text-sm text-artemis leading-relaxed mt-1.5">Tip: {cadetHint(game)}</p>}
          </div>
        </section>

        <aside className="order-3 lg:max-h-[calc(100vh-190px)] lg:overflow-y-auto scroll-thin">
          <CrewPanel game={game} mode={mode} onTask={setTask} />
        </aside>
      </div>

      <div className="sticky bottom-0 z-30 mt-3" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <PlanBar game={game} mode={mode} onPlan={setPlan} onEnd={endSol} />
      </div>
    </div>
  );
}
