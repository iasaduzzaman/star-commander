import React from 'react';
import Modal from './Modal.jsx';
import { cadetHint } from '../engine/simulate.js';

const TONE = { good: 'var(--c-good)', bad: 'var(--c-bad)', info: '#B9AE9A' };
const MARK = { good: '✓', bad: '✕', info: '•' };

function Delta({ label, v, unit, cadet }) {
  const color = v > 0 ? 'var(--c-good)' : v < 0 ? 'var(--c-bad)' : '#7E7868';
  return (
    <div className="rounded-lg bg-navy-3 px-3 py-2">
      <p className="text-[11px] text-cream-dim">{label}{!cadet && unit ? `, ${unit}` : ''}</p>
      <p className="num text-lg font-semibold" style={{ color }}>
        {cadet ? (v > 0 ? '▲ up' : v < 0 ? '▼ down' : 'steady') : `${v > 0 ? '+' : ''}${v}`}
      </p>
    </div>
  );
}

export default function ReportModal({ report, game, mode, onClose }) {
  const cadet = mode === 'cadet';
  const ended = !!game.outcome;
  return (
    <Modal labelledBy="report-title" onClose={onClose}>
      <div className="p-5 sm:p-6">
        <p className="text-sm text-cream-dim">End of day report</p>
        <h2 id="report-title" className="font-display text-2xl font-semibold text-cream mb-4">Sol {report.sol}</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          <Delta label="Battery" v={report.deltas.battery} unit="kWh" cadet={cadet} />
          <Delta label="Oxygen" v={report.deltas.o2} unit="kg" cadet={cadet} />
          <Delta label="Water" v={report.deltas.water} unit="L" cadet={cadet} />
          <Delta label="Food" v={report.deltas.food} unit="crew-days" cadet={cadet} />
          <Delta label="Shielding" v={report.deltas.shielding} unit="%" cadet={cadet} />
          {!cadet && (
            <div className="rounded-lg bg-navy-3 px-3 py-2">
              <p className="text-[11px] text-cream-dim">Made / used, kWh</p>
              <p className="num text-lg font-semibold text-cream">{report.power.production} / {report.power.consumption}</p>
            </div>
          )}
        </div>

        {report.lines.length > 0 ? (
          <ul className="space-y-2 mb-4">
            {report.lines.map((l, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                <span aria-hidden="true" style={{ color: TONE[l.tone] }} className="mt-0.5 w-3 shrink-0">{MARK[l.tone]}</span>
                <span className="text-cream">{l.text}</span>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-cream-dim mb-4">A quiet sol. Everything ran as planned.</p>}

        {!ended && mode !== 'specialist' && (
          <div className="rounded-lg border border-artemis/40 bg-artemis/10 px-3 py-2.5 mb-5">
            <p className="text-xs text-artemis font-display font-semibold mb-0.5">Flight Director</p>
            <p className="text-sm text-cream leading-relaxed">{cadetHint(game)}</p>
          </div>
        )}

        <button onClick={onClose} className="w-full rounded-xl bg-artemis text-navy font-display font-bold text-lg py-3 hover:brightness-110">
          {ended ? 'See mission debrief' : `Start Sol ${game.sol}`}
        </button>
      </div>
    </Modal>
  );
}
