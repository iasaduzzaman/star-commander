import React from 'react';
import { buildDebrief } from '../data/debrief.js';
import { CREW_BY_ID } from '../data/crew.js';
import { OBJ_BY_ID } from '../data/objectives.js';
import Portrait, { portraitState } from './Portrait.jsx';
import { EventCard, CraterChart } from './NasaData.jsx';
import { CRATER_STORMS } from '../data/nasa/spaceWeather.js';

const HEAD = {
  success: { title: 'Mission success', line: 'Every objective done, crew healthy and within radiation limits. The next crew inherits a working base.' },
  complete: { title: 'Mission complete', line: 'The crew made it home. Look at what the Flight Director flagged and try a different plan.' },
  lost: { title: 'Mission lost', line: '' },
};

function Chart({ history }) {
  if (history.length < 2) return null;
  const W = 600, H = 140, pad = 24;
  const maxB = Math.max(...history.map((h) => h.battery), 1);
  const maxW = Math.max(...history.map((h) => h.water), 1);
  const x = (i) => pad + (i / 29) * (W - pad * 2);
  const line = (key, max) => history.map((h, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${(H - pad - (h[key] / max) * (H - pad * 2)).toFixed(1)}`).join(' ');
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Battery and water over the mission">
        <rect x={x(10)} y={pad / 2} width={x(13) - x(10) + 8} height={H - pad} fill="#050B14" />
        <rect x={x(24)} y={pad / 2} width={x(25) - x(24) + 8} height={H - pad} fill="#050B14" />
        <line x1={x(19)} x2={x(19)} y1={pad / 2} y2={H - pad / 2} stroke="#F26A1F" strokeDasharray="3 4" />
        <path d={line('battery', maxB)} fill="none" stroke="#F2E6D0" strokeWidth="2.5" />
        <path d={line('water', maxW)} fill="none" stroke="#5FA8E8" strokeWidth="2.5" strokeDasharray="6 4" />
        <text x={x(0)} y={H - 4} fill="#7E7868" fontSize="11" className="num">Sol 1</text>
        <text x={x(29) - 34} y={H - 4} fill="#7E7868" fontSize="11" className="num">Sol 30</text>
      </svg>
      <figcaption className="text-xs text-cream-dim mt-1 flex flex-wrap gap-x-4">
        <span><span className="text-cream">━</span> Battery</span>
        <span><span style={{ color: '#5FA8E8' }}>╍</span> Water</span>
        <span>Dark bands: shadow passages</span>
        <span className="text-artemis">Dashed line: storm begins</span>
      </figcaption>
    </figure>
  );
}

export default function Debrief({ game, onAgain, onMenu, setOverlay }) {
  const o = game.outcome;
  const h = HEAD[o.result];
  const items = buildDebrief(game);
  return (
    <main className="min-h-screen max-w-4xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
      <p className="num text-cream-dim mb-1">Sol {o.sol}, Shackleton rim</p>
      <h1 className="font-display text-4xl sm:text-6xl font-bold leading-none mb-3" style={{ color: o.result === 'lost' ? 'var(--c-bad)' : o.result === 'success' ? 'var(--c-good)' : '#F2E6D0' }}>{h.title}</h1>
      <p className="text-lg text-cream-dim max-w-2xl mb-6">{o.result === 'lost' ? o.reason : h.line}</p>

      {o.score != null && (
        <div className="flex flex-wrap gap-x-10 gap-y-3 mb-8">
          <div><p className="num text-5xl font-bold text-artemis">{o.score}</p><p className="text-sm text-cream-dim">Mission score</p></div>
          <div><p className="num text-5xl font-bold text-cream">{game.science}</p><p className="text-sm text-cream-dim">Science points</p></div>
          <div><p className="num text-5xl font-bold text-cream">{o.avgHealth}</p><p className="text-sm text-cream-dim">Average crew health</p></div>
        </div>
      )}

      <section className="mb-10" aria-labelledby="fd">
        <h2 id="fd" className="font-display text-2xl font-semibold text-cream mb-1">Flight Director debrief</h2>
        <p className="text-sm text-cream-dim mb-4">What happened, and why it works that way on the real Moon.</p>
        <ul className="space-y-3">
          {items.map((it) => (
            <li key={it.id} className="rounded-xl bg-navy-2 border-l-4 px-4 py-3.5" style={{ borderColor: it.tone === 'good' ? 'var(--c-good)' : 'var(--c-bad)' }}>
              <h3 className="font-display font-semibold text-cream">{it.title}</h3>
              <p className="text-cream leading-relaxed mt-1 max-w-prose">{it.text}</p>
              <button onClick={() => setOverlay('sources')} className="text-xs text-cream-faint mt-1.5 underline underline-offset-2 hover:text-cream">Source: {it.src}</button>
            </li>
          ))}
          {items.length === 0 && <li className="text-cream-dim">A clean mission. Nothing to flag.</li>}
        </ul>
      </section>

      {game.spaceWeather && (
        <section className="mb-10" aria-labelledby="realstorm">
          <h2 id="realstorm" className="font-display text-xl font-semibold text-cream mb-1">Your storm was real</h2>
          <p className="text-sm text-cream-dim mb-4 max-w-prose">
            The crew absorbed about <span className="num text-cream">{Math.round(game.flags.stormDose)} mSv</span> each from the storm.
            Its strength came from this NASA DONKI flare record, and its day-by-day shape from what NASA’s LRO spacecraft measured during the {CRATER_STORMS.find((x) => x.id === game.spaceWeather.stormId).label}.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <EventCard sw={game.spaceWeather} />
            <div className="rounded-xl bg-navy-2 border border-navy-line p-4"><CraterChart stormId={game.spaceWeather.stormId} /></div>
          </div>
        </section>
      )}

      <section className="mb-10">
        <h2 className="font-display text-xl font-semibold text-cream mb-3">Your resources over 30 sols</h2>
        <Chart history={game.history} />
      </section>

      <section className="grid sm:grid-cols-2 gap-6 mb-10">
        <div>
          <h2 className="font-display text-xl font-semibold text-cream mb-3">Crew</h2>
          <ul className="space-y-2">
            {game.crew.map((m) => (
              <li key={m.id} className="flex items-center gap-3">
                <Portrait id={m.id} state={portraitState(m)} size={44} className="rounded-full" />
                <span className="flex-1 text-cream">{CREW_BY_ID[m.id].name}</span>
                <span className="num text-sm text-cream-dim">{m.health} hp, {Math.round(m.dose)} mSv</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-cream mb-3">Objectives</h2>
          <ul className="space-y-2">
            {game.objectiveIds.map((id) => (
              <li key={id} className="flex justify-between gap-3">
                <span className="text-cream">{OBJ_BY_ID[id].name}</span>
                <span className="text-sm" style={{ color: game.objectives[id].done ? 'var(--c-good)' : 'var(--c-bad)' }}>{game.objectives[id].done ? `Done, Sol ${game.objectives[id].doneSol}` : 'Not finished'}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button onClick={onAgain} className="rounded-xl bg-artemis text-navy font-display font-bold text-lg px-7 py-3.5 hover:brightness-110">Fly another mission</button>
        <button onClick={onMenu} className="rounded-xl border-2 border-cream/40 text-cream font-display font-semibold px-6 py-3 hover:border-cream">Main menu</button>
      </div>
    </main>
  );
}
