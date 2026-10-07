import React from 'react';
import Modal from './Modal.jsx';
import Portrait, { portraitState } from './Portrait.jsx';
import { CREW_BY_ID } from '../data/crew.js';

export default function StoryletModal({ storylet, game, onChoose }) {
  const who = CREW_BY_ID[storylet.speaker];
  const member = game.crew.find((c) => c.id === storylet.speaker);
  const single = storylet.choices.length === 1;
  return (
    <Modal labelledBy="storylet-title">
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-4 mb-4">
          <Portrait id={who.id} state={portraitState(member)} size={84} className="rounded-full shrink-0" />
          <div>
            <p className="text-sm text-cream-dim">{who.title} {who.short}</p>
            <h2 id="storylet-title" className="font-display text-2xl font-semibold text-cream leading-tight">{storylet.title}</h2>
          </div>
        </div>
        <p className="text-base text-cream leading-relaxed mb-5 max-w-prose">“{storylet.text}”</p>
        <div className={single ? '' : 'grid gap-2.5'}>
          {storylet.choices.map((c) => (
            <button key={c.i} onClick={() => onChoose(c.i)}
              className={`w-full text-left rounded-xl px-4 py-3 border transition ${single ? 'bg-artemis text-navy border-artemis font-display font-bold text-center text-lg' : 'bg-navy-3 border-navy-line hover:border-artemis'}`}>
              <span className={`block font-display ${single ? '' : 'font-semibold text-cream'}`}>{c.label}</span>
              {c.effects.length > 0 && (
                <span className="flex flex-wrap gap-1.5 mt-1.5">
                  {c.effects.map((e) => <span key={e} className="text-[11px] rounded-full bg-navy px-2 py-0.5 text-cream-dim">{e}</span>)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
