// Flight Director Debrief: two-sentence explanations tied to what actually happened.
// Each entry: when(state) -> boolean, tone: 'good' | 'bad', title, text(state), src.

const avg = (a) => a.reduce((s, x) => s + x, 0) / a.length;

export const DEBRIEF_RULES = [
  {
    id: 'shadow_brownout', tone: 'bad', when: (s) => s.flags.shadowBrownout,
    title: 'The base lost power in the shadow',
    text: () => 'Terrain near Shackleton blocks the Sun for days at a time, so solar arrays produce nothing. Real lunar bases plan for this with large batteries or a Kilopower reactor that runs day and night.',
    src: 'South pole sunlight',
  },
  {
    id: 'kilopower', tone: 'good', when: (s) => s.cargo.kilopower > 0,
    title: 'Nuclear power kept the lights on',
    text: () => 'Kilopower makes the same power whether the Sun is up or not. It is heavy, which is why NASA weighs it against batteries and extra arrays for every mission.',
    src: 'Kilopower reactor',
  },
  {
    id: 'food_out', tone: 'bad', when: (s) => s.flags.foodOut,
    title: 'The crew ran out of food',
    text: (s) => `Four astronauts eat about 4 crew-days of food every sol, so 30 sols needs 120. You launched with ${s.flags.startFood} crew-days of food in total.`,
    src: 'Food mass',
  },
  {
    id: 'o2_out', tone: 'bad', when: (s) => s.flags.o2Out,
    title: 'Oxygen reserves hit zero',
    text: () => 'Each astronaut breathes about 0.84 kg of oxygen a day. When life support was throttled, the tanks had to cover the gap until they ran dry.',
    src: 'Oxygen use',
  },
  {
    id: 'water_out', tone: 'bad', when: (s) => s.flags.waterOut,
    title: 'Water ran out',
    text: () => 'Splitting water is how the base makes oxygen, so water and air are the same budget. Recycling slows the loss, and ice from shadowed craters can refill it.',
    src: 'Making oxygen from water',
  },
  {
    id: 'eclss_throttle', tone: 'bad', when: (s) => s.flags.throttledSols >= 3 && !s.flags.o2Out,
    title: 'Throttling life support wore the crew down',
    text: (s) => `Life support ran below full for ${s.flags.throttledSols} sols. That saves power, but carbon dioxide builds up and people get headaches, tired, and stressed.`,
    src: 'Water recycling',
  },
  {
    id: 'spe_eva', tone: 'bad', when: (s) => s.flags.speEva.length > 0,
    title: 'Crew were outside during the particle storm',
    text: (s) => `${s.flags.speEva.join(' and ')} took the full particle dose during the storm. The flare was forecast two sols ahead, which is exactly how real flight controllers get crews to shelter.`,
    src: '30-day radiation limit',
  },
  {
    id: 'spe_shielded', tone: 'good', when: (s) => s.flags.speShielding >= 50 && s.flags.speEva.length === 0,
    title: 'Your shielding stopped the particle storm',
    text: (s) => `With ${s.flags.speShielding}% shielding, the crew inside took a fraction of the dose.${s.spaceWeather?.hard ? ' Your storm carried protons above 100 MeV, which get through shielding more easily, so every brick counted.' : ''} Piling regolith on the habitat is one of the cheapest ways to protect astronauts.`,
    src: 'Surface radiation',
  },
  {
    id: 'spe_exposed', tone: 'bad', when: (s) => s.flags.speShielding > 0 && s.flags.speShielding < 50 && s.flags.speEva.length === 0,
    title: 'The storm got through thin shielding',
    text: (s) => `Shielding was only ${s.flags.speShielding}% when the storm began. A few more sols of piling regolith before the forecast would have cut the dose sharply.`,
    src: 'Surface radiation',
  },
  {
    id: 'dose_limit', tone: 'bad', when: (s) => s.crew.some((c) => c.dose >= 250),
    title: 'Someone passed the 30-day radiation limit',
    text: () => 'NASA limits short-term radiation to protect blood-forming organs. An astronaut over the limit would be grounded from future flights.',
    src: '30-day radiation limit',
  },
  {
    id: 'dust', tone: 'bad', when: (s) => s.flags.maxDust >= 0.25,
    title: 'Dust choked the solar arrays',
    text: (s) => `Arrays lost up to ${Math.round(s.flags.maxDust * 100)}% of their power to dust. Apollo crews found lunar dust sticks to everything, so cleaning has to be scheduled.`,
    src: 'Lunar dust',
  },
  {
    id: 'crop_lost', tone: 'bad', when: (s) => s.flags.cropLost,
    title: 'The greenhouse went dark',
    text: () => 'Plants need light every day. When the grow lights lost power, the crop failed and the water and power spent on it were gone.',
    src: 'Growing food in space',
  },
  {
    id: 'harvest', tone: 'good', when: (s) => s.flags.harvests > 0,
    title: 'You grew food on the Moon',
    text: (s) => `${s.flags.harvests} harvest${s.flags.harvests > 1 ? 's' : ''} supplemented the rations. Fresh food matters for morale as much as calories, which is why NASA studies it.`,
    src: 'Growing food in space',
  },
  {
    id: 'ice', tone: 'good', when: (s) => s.objectives.ice?.done,
    title: 'You used the Moon’s own water',
    text: () => 'Bringing water from Earth costs a lot per kilogram. Mining ice that has sat in darkness for billions of years is why Artemis is going to the south pole.',
    src: 'Ice in shadowed craters',
  },
  {
    id: 'unfinished', tone: 'bad', when: (s) => s.objectiveIds.some((id) => !s.objectives[id].done),
    title: 'Science left on the table',
    text: (s) => `${s.objectiveIds.filter((id) => !s.objectives[id].done).length === 2 ? 'Neither objective' : 'One objective'} was finished. Real crews plan science around the hazards they know are coming, so the work fits between shadow and flare.`,
    src: 'South pole sunlight',
  },
  {
    id: 'stress', tone: 'bad', when: (s) => avg(s.crew.map((c) => c.stressPeak)) >= 75,
    title: 'The crew burned out',
    text: () => 'Tired, stressed astronauts make mistakes. NASA schedules rest as carefully as work on every long mission.',
    src: 'Oxygen use',
  },
];

export function buildDebrief(state) {
  const items = DEBRIEF_RULES.filter((r) => {
    try { return r.when(state); } catch { return false; }
  }).map((r) => ({ id: r.id, tone: r.tone, title: r.title, text: r.text(state), src: r.src }));
  // Lead with what went wrong (that's the lesson), then wins. Cap at 5 for kids.
  const bad = items.filter((i) => i.tone === 'bad');
  const good = items.filter((i) => i.tone === 'good');
  return [...bad.slice(0, 3), ...good.slice(0, 5 - Math.min(3, bad.length))];
}
