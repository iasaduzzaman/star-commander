import React from 'react';
import Modal from './Modal.jsx';
import { SOURCES, NASA_DATASETS } from '../data/sources.js';
import { DONKI_EVENTS, formatEventDate } from '../data/nasa/spaceWeather.js';

function Shell({ id, title, onClose, children, wide }) {
  return (
    <Modal labelledBy={id} onClose={onClose} wide={wide}>
      <div className="p-5 sm:p-6">
        <div className="flex justify-between items-start mb-4 gap-4">
          <h2 id={id} className="font-display text-2xl font-semibold text-cream">{title}</h2>
          <button onClick={onClose} className="text-cream-dim hover:text-cream text-sm underline underline-offset-4 shrink-0">Close</button>
        </div>
        {children}
      </div>
    </Modal>
  );
}

export function SourcesOverlay({ onClose }) {
  return (
    <Shell id="src" title="Mission data" onClose={onClose} wide>
      <h3 className="font-display text-lg font-semibold text-cream mb-2">NASA open data in this game</h3>
      <ul className="space-y-3 mb-4">
        {NASA_DATASETS.map((d) => (
          <li key={d.name} className="rounded-xl bg-navy-3 px-4 py-3">
            <p className="font-display font-semibold text-cream">{d.name}</p>
            <p className="text-xs text-cream-faint">{d.org}</p>
            <p className="text-sm text-cream mt-1.5 leading-snug">{d.use}</p>
            <p className="text-xs text-cream-dim mt-1 num break-all">{d.file}</p>
            <a href={d.url} target="_blank" rel="noreferrer" className="text-xs text-artemis underline underline-offset-2 break-all">{d.url}</a>
          </li>
        ))}
      </ul>
      <details className="mb-6">
        <summary className="cursor-pointer text-sm text-cream-dim hover:text-cream">Saved DONKI records ({DONKI_EVENTS.length})</summary>
        <div className="overflow-x-auto mt-2">
          <table className="text-xs w-full num">
            <thead><tr className="text-cream-dim text-left"><th className="py-1 pr-3">Flare</th><th className="pr-3">Date</th><th className="pr-3">Region</th><th>Linked particle events</th></tr></thead>
            <tbody>
              {DONKI_EVENTS.map((e) => (
                <tr key={e.id} className="border-t border-navy-line text-cream">
                  <td className="py-1.5 pr-3"><a href={e.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">{e.classType}</a></td>
                  <td className="pr-3 whitespace-nowrap">{formatEventDate(e.peak)}</td>
                  <td className="pr-3">{e.activeRegion}</td>
                  <td>{e.seps.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <h3 className="font-display text-lg font-semibold text-cream mb-1">Other values and where they come from</h3>
      <p className="text-sm text-cream-dim mb-2 max-w-prose">Rounded where needed to keep the game playable.</p>
      <dl className="divide-y divide-navy-line">
        {SOURCES.map((s) => (
          <div key={s.topic} className="py-3 grid sm:grid-cols-[180px_1fr] gap-1 sm:gap-4">
            <dt className="font-display font-medium text-cream">{s.topic}</dt>
            <dd>
              <p className="text-cream num">{s.value}</p>
              <p className="text-xs text-cream-faint mt-0.5">{s.cite}</p>
              {s.url && <a href={s.url} target="_blank" rel="noreferrer" className="text-xs text-cream-dim underline underline-offset-2 break-all">{s.url}</a>}
            </dd>
          </div>
        ))}
      </dl>
    </Shell>
  );
}

export function SettingsOverlay({ settings, toggle, onClose }) {
  const rows = [
    { k: 'readable', label: 'Easy-read font', desc: 'Switches to Atkinson Hyperlegible, designed for readers with low vision and dyslexia.' },
    { k: 'colorblind', label: 'Colour-blind palette', desc: 'Blue, yellow and red. Every status also has a ✓ ▲ ✕ symbol.' },
    { k: 'reduceMotion', label: 'Reduce motion', desc: 'Turns off glows, flicker and flare effects.' },
  ];
  return (
    <Shell id="set" title="Settings" onClose={onClose}>
      <ul className="space-y-4">
        {rows.map((r) => (
          <li key={r.k} className="flex gap-4 items-start justify-between">
            <div>
              <p className="font-display text-cream">{r.label}</p>
              <p className="text-sm text-cream-dim leading-snug">{r.desc}</p>
            </div>
            <button role="switch" aria-checked={settings[r.k]} aria-label={r.label} onClick={() => toggle(r.k)}
              className={`relative w-12 h-7 rounded-full shrink-0 transition-colors ${settings[r.k] ? 'bg-artemis' : 'bg-navy-3'}`}>
              <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-cream transition-transform ${settings[r.k] ? 'translate-x-5' : ''}`} />
            </button>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

export function HelpOverlay({ onClose }) {
  const steps = [
    ['Read the timeline', 'The strip at the top shows all 30 sols. Dark sols are shadow passages when solar arrays make nothing. The orange sun on Sol 20 is a solar flare.'],
    ['Give every astronaut a job', 'Use the menu under each crew member. Outside jobs build shielding, clean arrays and do field science, but outside means more radiation.'],
    ['Set life support and grow lights', 'Full life support keeps air and water steady but costs 72 kWh a sol. Eco saves power and lets CO₂ build up.'],
    ['Watch the power line', 'The bar at the bottom says whether you will make or lose power today. If you run short, the base cuts grow lights first, then life support.'],
    ['End the sol', 'Read the report, answer your crew when they need a decision, and plan the next day.'],
  ];
  return (
    <Shell id="help" title="How to play" onClose={onClose}>
      <ol className="space-y-4">
        {steps.map(([t, d], i) => (
          <li key={t} className="flex gap-3">
            <span className="num w-7 h-7 shrink-0 rounded-full bg-artemis text-navy grid place-items-center font-bold text-sm">{i + 1}</span>
            <div><p className="font-display font-semibold text-cream">{t}</p><p className="text-sm text-cream-dim leading-relaxed">{d}</p></div>
          </li>
        ))}
      </ol>
      <p className="text-sm text-cream mt-5 rounded-lg bg-navy-3 px-3 py-2.5">Goal: keep all four astronauts healthy for 30 sols, finish both objectives, and keep everyone under the 250 mSv radiation limit.</p>
    </Shell>
  );
}
