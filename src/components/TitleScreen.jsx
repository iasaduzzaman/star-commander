import React from 'react';
import BaseViewer from './BaseViewer.jsx';

const MODES = [
  { id: 'cadet', name: 'Cadet', age: 'Ages 8–10', desc: 'Simple gauges, Flight Director tips every sol, extra cargo room.' },
  { id: 'astronaut', name: 'Astronaut', age: 'Ages 10–13', desc: 'Real numbers and units. Tips after each sol.' },
  { id: 'specialist', name: 'Flight Specialist', age: 'Ages 13+', desc: 'Tight cargo, no tips. Tap any gauge to see the equations.' },
];

export default function TitleScreen({ mode, setMode, hasGame, onNew, onContinue, setOverlay }) {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="relative">
        <BaseViewer game={null} compact />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy to-transparent" />
      </div>
      <div className="flex-1 w-full max-w-5xl mx-auto px-5 sm:px-8 -mt-6 sm:-mt-16 relative pb-10">
        <p className="num text-cream-dim text-sm sm:text-base mb-2">Artemis Base, lunar south pole, Sol 1</p>
        <h1 className="font-display font-bold text-cream leading-[0.95] tracking-tight text-5xl sm:text-7xl mb-4">Star Commander</h1>
        <p className="text-lg text-cream-dim max-w-xl leading-relaxed mb-8">
          Four astronauts. Thirty sols on the rim of Shackleton crater. Every kilowatt, litre and brick of shielding is your call.
        </p>

        <fieldset className="mb-8">
          <legend className="font-display text-cream mb-3">Choose your level</legend>
          <div className="grid sm:grid-cols-3 gap-3">
            {MODES.map((m) => {
              const on = mode === m.id;
              return (
                <button key={m.id} onClick={() => setMode(m.id)} aria-pressed={on}
                  className={`text-left rounded-xl p-4 border-2 transition ${on ? 'border-artemis bg-navy-2' : 'border-navy-line hover:border-cream-faint'}`}>
                  <span className="flex items-baseline justify-between">
                    <span className="font-display font-semibold text-lg text-cream">{m.name}</span>
                    <span className="text-xs text-cream-dim">{m.age}</span>
                  </span>
                  <span className="block text-sm text-cream-dim mt-1 leading-snug">{m.desc}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-3 items-center">
          <button onClick={onNew} className="rounded-xl bg-artemis text-navy font-display font-bold text-lg px-7 py-3.5 hover:brightness-110">Plan a new mission</button>
          {hasGame && <button onClick={onContinue} className="rounded-xl border-2 border-cream/40 text-cream font-display font-semibold px-6 py-3 hover:border-cream">Continue mission</button>}
          <span className="flex gap-4 ml-1 text-sm">
            <button onClick={() => setOverlay('help')} className="text-cream-dim underline underline-offset-4 hover:text-cream">How to play</button>
            <button onClick={() => setOverlay('sources')} className="text-cream-dim underline underline-offset-4 hover:text-cream">Mission data</button>
            <button onClick={() => setOverlay('settings')} className="text-cream-dim underline underline-offset-4 hover:text-cream">Settings</button>
          </span>
        </div>
      </div>
    </main>
  );
}
