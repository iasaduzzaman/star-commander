// Deterministic environment for the Shackleton rim site.
// The rim gets near-continuous low-angle sunlight; nearby terrain causes short shadow passages.

export function illumination(sol) {
  if (sol >= 11 && sol <= 14) return 0;     // shadow passage
  if (sol >= 25 && sol <= 26) return 0.1;   // second, shorter shadow
  if (sol >= 15 && sol <= 24) return 0.95;
  return 0.9;
}

export const TIMELINE_EVENTS = [
  { sol: 1,  end: 1,  kind: 'land',   label: 'Landing', icon: 'land' },
  { sol: 9,  end: 9,  kind: 'dust',   label: 'Dust builds on arrays', icon: 'dust' },
  { sol: 11, end: 14, kind: 'shadow', label: 'Shadow passage', icon: 'shadow' },
  { sol: 18, end: 18, kind: 'forecast', label: 'Flare forecast', icon: 'forecast' },
  { sol: 25, end: 26, kind: 'shadow', label: 'Second shadow', icon: 'shadow' },
  { sol: 30, end: 30, kind: 'end',    label: 'Crew rotation', icon: 'end' },
];

// The particle storm's length depends on the real NASA event chosen for this mission.
export function timelineFor(sw) {
  const days = sw ? stormDaysOf(sw) : [20];
  const storm = { sol: days[0], end: days[days.length - 1], kind: 'spe', label: 'Solar particle storm', icon: 'spe' };
  return [...TIMELINE_EVENTS, storm].sort((a, b) => a.sol - b.sol);
}

function stormDaysOf(sw) {
  return sw.fractions.map((f, i) => ({ sol: 20 + i, f })).filter((d) => d.f >= 0.1).map((d) => d.sol);
}

// One-line forecast for the morning briefing.
export function forecast(sol, sw) {
  const lines = [];
  const sd = sw ? stormDaysOf(sw) : [20];
  const last = sd[sd.length - 1];
  if (sol < 11) lines.push(`Shadow passage begins in ${11 - sol} sol${11 - sol === 1 ? '' : 's'}. Solar arrays will produce nothing for 4 sols.`);
  if (sol >= 11 && sol <= 14) lines.push(`In shadow. Solar output is zero until Sol 15. Running on batteries${''}.`);
  if (sol >= 18 && sol < 20) lines.push(`Solar flare forecast: particle storm on Sol${sd.length > 1 ? `s 20–${last}` : ' 20'}. Crew outside will take the full dose.`);
  if (sol >= 20 && sol <= last) lines.push(`Particle storm in progress. Anyone outside is unprotected. Shielding protects crew inside.`);
  if (sol > last && sol < 25) lines.push(`Second shadow passage on Sols 25–26. Top up the batteries.`);
  if (sol >= 25 && sol <= 26) lines.push(`Second shadow. Arrays at 10%.`);
  if (sol > 26) lines.push(`Final stretch. Finish your objectives before crew rotation on Sol 30.`);
  return lines;
}
