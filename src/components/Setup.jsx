import React, { useState, useEffect, useMemo } from 'react';
import { DONKI_EVENTS, buildSpaceWeather } from '../data/nasa/spaceWeather.js';
import { fetchLiveDonkiEvents } from '../data/nasa/donkiLive.js';
import { EventCard, CraterChart } from './NasaData.jsx';
import { OBJECTIVES } from '../data/objectives.js';
import { CARGO } from '../data/cargo.js';
import { CREW } from '../data/crew.js';
import { CARGO_BUDGET } from '../data/constants.js';
import Portrait from './Portrait.jsx';

const STEPS = ['Objectives', 'Cargo', 'Space weather', 'Crew'];

export default function Setup({ mode, onLaunch, onBack }) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState([]);
  const [cargo, setCargo] = useState({});
  const [pool, setPool] = useState(DONKI_EVENTS);
  const [source, setSource] = useState('saved');
  const [pick, setPick] = useState(() => Math.floor(Math.random() * DONKI_EVENTS.length));
  const sw = useMemo(() => buildSpaceWeather(pool[pick % pool.length]), [pool, pick]);

  // Try NASA's live DONKI API; keep the saved NASA records if it is unreachable.
  useEffect(() => {
    let alive = true;
    setSource('checking');
    fetchLiveDonkiEvents()
      .then((live) => {
        if (!alive) return;
        if (live.length) { setPool([...live, ...DONKI_EVENTS]); setPick(0); setSource('live'); }
        else setSource('saved');
      })
      .catch(() => alive && setSource('saved'));
    return () => { alive = false; };
  }, []);
  const budget = CARGO_BUDGET[mode];
  const needsGh = picked.includes('harvest');
  const effective = { ...cargo, greenhouse: needsGh ? 1 : cargo.greenhouse || 0 };
  const used = CARGO.reduce((a, c) => a + (effective[c.id] || 0) * c.mass, 0);
  const left = budget - used;

  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < 2 ? [...p, id] : p));
  const bump = (id, d) => {
    const c = CARGO.find((x) => x.id === id);
    const cur = effective[id] || 0;
    const next = Math.max(0, Math.min(c.max, cur + d));
    if (d > 0 && c.mass > left) return;
    if (id === 'greenhouse' && needsGh && next === 0) return;
    setCargo({ ...cargo, [id]: next });
  };

  return (
    <main className="min-h-screen max-w-5xl mx-auto px-5 sm:px-8 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-6">
        <button onClick={step === 0 ? onBack : () => setStep(step - 1)} className="text-cream-dim hover:text-cream text-sm underline underline-offset-4">Back</button>
        <ol className="flex gap-2 sm:gap-4 text-sm" aria-label="Setup steps">
          {STEPS.map((s, i) => (
            <li key={s} aria-current={i === step ? 'step' : undefined} className={`flex items-center gap-1.5 ${i === step ? 'text-cream' : 'text-cream-faint'}`}>
              <span className={`num w-6 h-6 rounded-full grid place-items-center text-xs ${i <= step ? 'bg-artemis text-navy' : 'bg-navy-3'}`}>{i + 1}</span>
              <span className="hidden sm:inline">{s}</span>
            </li>
          ))}
        </ol>
      </div>

      {step === 0 && (
        <section className="rise">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-cream mb-2">Pick two science objectives</h1>
          <p className="text-cream-dim mb-6 max-w-2xl">Science is why the crew is here. Each objective costs crew time and power, so your choice decides which trade-offs you will face.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {OBJECTIVES.map((o) => {
              const on = picked.includes(o.id);
              const full = !on && picked.length >= 2;
              return (
                <button key={o.id} onClick={() => toggle(o.id)} disabled={full} aria-pressed={on}
                  className={`text-left rounded-xl p-4 border-2 transition ${on ? 'border-artemis bg-navy-2' : 'border-navy-line'} ${full ? 'opacity-40' : 'hover:border-cream-faint'}`}>
                  <span className="flex justify-between gap-2 items-baseline">
                    <span className="font-display font-semibold text-lg text-cream">{o.name}</span>
                    <span className="num text-sm text-artemis shrink-0">{o.points} pts</span>
                  </span>
                  <span className="block text-sm text-cream mt-1">{o.blurb}</span>
                  <span className="block text-sm text-cream-dim mt-1">{o.reward}</span>
                  <span className="block text-xs text-cream-faint mt-2">
                    {o.work ? `${o.work} crew-shifts${o.eva ? ', outside' : ', inside'}, ${o.powerPerWork} kWh each` : 'Needs the greenhouse kit (500 kg)'}
                  </span>
                  <span className="block text-xs text-cream-faint mt-1 italic">{o.realWorld}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex justify-end">
            <button disabled={picked.length !== 2} onClick={() => setStep(1)}
              className="rounded-xl bg-artemis text-navy font-display font-bold text-lg px-7 py-3 disabled:opacity-30">
              {picked.length === 2 ? 'Next: load cargo' : `Pick ${2 - picked.length} more`}
            </button>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="rise">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-cream mb-2">Load the cargo lander</h1>
          <p className="text-cream-dim mb-4 max-w-2xl">Every kilogram launched from Earth is expensive. You cannot bring everything.</p>
          <div className="rounded-xl bg-navy-2 border border-navy-line p-4 mb-4">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-cream">Mass used</span>
              <span className="num text-cream"><span className={left < 300 ? 'text-artemis' : ''}>{used}</span> / {budget} kg</span>
            </div>
            <div className="h-3 rounded-full bg-navy-3 overflow-hidden">
              <div className="h-full rounded-full bg-artemis" style={{ width: `${(used / budget) * 100}%`, transition: 'width 300ms ease' }} />
            </div>
            <p className="text-xs text-cream-faint mt-2.5 leading-relaxed">Already in the base: habitat, life support, 1 solar array, 200 kWh of batteries, 80 crew-days of food (20 sols for 4 people), 160 L water, 60 kg oxygen.</p>
          </div>
          <ul className="grid sm:grid-cols-2 gap-2.5">
            {CARGO.map((c) => {
              const n = effective[c.id] || 0;
              const locked = c.id === 'greenhouse' && needsGh;
              return (
                <li key={c.id} className={`rounded-xl border p-3.5 flex gap-3 items-center ${n ? 'border-artemis/60 bg-navy-2' : 'border-navy-line'}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-cream">{c.name} <span className="num text-sm text-cream-faint font-normal">{c.mass} kg</span></p>
                    <p className="text-sm text-cream-dim leading-snug">{c.desc}</p>
                    {locked && <p className="text-xs text-artemis mt-0.5">Required by First lunar harvest</p>}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => bump(c.id, -1)} disabled={n === 0 || locked} aria-label={`Remove ${c.name}`} className="w-9 h-9 rounded-lg bg-navy-3 text-cream text-xl disabled:opacity-30">−</button>
                    <span className="num w-6 text-center text-cream" aria-live="polite">{n}</span>
                    <button onClick={() => bump(c.id, 1)} disabled={n >= c.max || c.mass > left} aria-label={`Add ${c.name}`} className="w-9 h-9 rounded-lg bg-navy-3 text-cream text-xl disabled:opacity-30">+</button>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 flex justify-end">
            <button onClick={() => setStep(2)} className="rounded-xl bg-artemis text-navy font-display font-bold text-lg px-7 py-3">Next: space weather</button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="rise">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-cream mb-2">Space weather for this mission</h1>
          <p className="text-cream-dim mb-5 max-w-2xl">Your Sol 20 solar storm is a real one. Its strength comes from a flare recorded in NASA’s DONKI space weather database. How it builds and fades over the days comes from radiation NASA’s LRO spacecraft measured near the Moon.</p>
          <div className="grid md:grid-cols-2 gap-4">
            <EventCard sw={sw} />
            <div className="rounded-xl bg-navy-2 border border-navy-line p-4">
              <p className="font-display text-cream mb-2">How a real storm unfolds</p>
              <CraterChart stormId={sw.stormId} />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button onClick={() => setPick((p) => p + 1)} className="rounded-xl border-2 border-cream/40 text-cream font-display font-semibold px-5 py-2.5 hover:border-cream">Use a different real event</button>
            <p className="text-xs text-cream-faint" aria-live="polite">
              {source === 'checking' && 'Checking NASA DONKI for recent events…'}
              {source === 'live' && `Loaded ${pool.length - DONKI_EVENTS.length} recent events live from the NASA DONKI API.`}
              {source === 'saved' && `Using ${DONKI_EVENTS.length} saved NASA DONKI records (live API not reachable here).`}
            </p>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={() => setStep(3)} className="rounded-xl bg-artemis text-navy font-display font-bold text-lg px-7 py-3">Next: meet the crew</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="rise">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-cream mb-2">Your crew</h1>
          <p className="text-cream-dim mb-6 max-w-2xl">Each astronaut is better at one job. Put people where they are strongest, and let them rest before they burn out.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {CREW.map((c) => (
              <article key={c.id} className="rounded-xl bg-navy-2 border border-navy-line p-4 flex gap-4">
                <Portrait id={c.id} size={88} className="rounded-full shrink-0" />
                <div>
                  <h2 className="font-display font-semibold text-lg text-cream leading-tight">{c.name}</h2>
                  <p className="text-sm text-cream-dim">{c.role}, {c.from}</p>
                  <p className="text-sm text-cream mt-2 leading-snug">{c.bio}</p>
                  <p className="text-sm text-artemis mt-2 leading-snug">{c.bonus}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={() => onLaunch(picked, effective, sw)} className="rounded-xl bg-artemis text-navy font-display font-bold text-lg px-8 py-3.5 hover:brightness-110">Land at Shackleton</button>
          </div>
        </section>
      )}
    </main>
  );
}
