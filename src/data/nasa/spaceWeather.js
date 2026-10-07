// Turns real NASA records into the game's solar particle storm.
//  - Strength comes from the DONKI flare class (C / M / X) and whether DONKI linked a >100 MeV proton event.
//  - The day-by-day shape comes from LRO CRaTER dose measurements of a real 2012 storm.
import DONKI from './donki_events.json' with { type: 'json' };
import CRATER from './crater_storms_2012.json' with { type: 'json' };
import { SPE_DOSE } from '../constants.js';

export const DONKI_EVENTS = DONKI.events;
export const CRATER_STORMS = CRATER.storms;
export const CRATER_QUIET = CRATER.quietBaseline;
export const STORM_START_SOL = 20;

export function classStrength(classType = 'M1.0') {
  const letter = classType[0].toUpperCase();
  const n = parseFloat(classType.slice(1)) || 1;
  if (letter === 'X') return 1.0;
  if (letter === 'M') return n >= 5 ? 0.85 : 0.65;
  return 0.45; // C class and weaker
}

// Pair each flare strength with the CRaTER storm whose size fits it best.
function pickStorm(classType) {
  const s = classStrength(classType);
  if (s >= 1.0) return 'jul2012';
  if (s >= 0.85) return 'may2012';
  if (s >= 0.65) return 'sep2012a';
  return 'sep2012b';
}

// Fraction of the storm's total dose that falls on each day, from onset, using dose above the quiet baseline.
export function stormProfile(stormId) {
  const storm = CRATER_STORMS.find((x) => x.id === stormId);
  const excess = storm.days.map(([, v]) => Math.max(0, v - CRATER_QUIET));
  const onset = excess.findIndex((e) => e > 1);
  const window = excess.slice(onset, onset + 5);
  const total = window.reduce((a, b) => a + b, 0);
  return window.map((e) => e / total);
}

export function isHardSpectrum(event) {
  return (event.seps || []).some((s) => />\s*100\s*MeV/i.test(s.instrument || ''));
}

export function buildSpaceWeather(event) {
  const stormId = pickStorm(event.classType);
  const fractions = stormProfile(stormId).map((f) => Math.round(f * 1000) / 1000);
  const hard = isHardSpectrum(event);
  return {
    event,
    stormId,
    fractions,
    totalDose: Math.round(SPE_DOSE * classStrength(event.classType)),
    shieldEff: hard ? 0.75 : 0.9,
    hard,
    live: !!event.live,
  };
}

export function stormDays(sw) {
  // Sols where at least 10% of the storm arrives (shown on the timeline)
  return sw.fractions.map((f, i) => ({ sol: STORM_START_SOL + i, f })).filter((d) => d.f >= 0.1).map((d) => d.sol);
}

export function stormFractionOn(sw, sol) {
  const i = sol - STORM_START_SOL;
  return i >= 0 && i < sw.fractions.length ? sw.fractions[i] : 0;
}

export function formatEventDate(iso) {
  const d = new Date(iso.replace('Z', ':00Z'));
  if (isNaN(d)) return iso.slice(0, 10);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
