// Storylets fire at the start of a sol from crew/base STATE, never from a random deck.
// Each choice mutates a cloned state. At most one storylet per sol (first match wins).

import { CREW_BY_ID } from '../data/crew.js';

const crew = (s, id) => s.crew.find((c) => c.id === id);
const ov = (s) => (s.overrides[s.sol] ||= {});
const cooled = (s, id, n) => !s.storyletCooldown[id] || s.sol - s.storyletCooldown[id] >= n;
const once = (s, id) => !s.storyletsFired[id];

export const STORYLETS = [
  {
    id: 'reactor', speaker: 'rivera',
    when: (s) => s.sol === 2 && s.cargo.kilopower && once(s, 'reactor'),
    title: 'Reactor startup',
    text: () => 'Commander, I want to start the Kilopower reactor today. It takes my whole shift, but once it is running the shadow passage stops being scary. Or we wait until Sol 5 and I help outside first.',
    choices: [
      { label: 'Start it today', effects: ['Rivera busy today', 'Reactor online now'],
        apply: (s) => { s.kilopowerOnlineSol = 2; const r = crew(s, 'rivera'); r.busyUntil = 2; r.busyTask = 'reactor'; } },
      { label: 'Wait until Sol 5', effects: ['Rivera free today', 'No reactor power for 3 sols'],
        apply: (s) => { s.kilopowerOnlineSol = 5; } },
    ],
  },
  {
    id: 'wasabi', speaker: 'chen',
    when: (s) => s.sol >= 5 && s.sol <= 7 && s.greenhouse.present && once(s, 'wasabi'),
    title: 'An experiment',
    text: () => 'We brought wasabi seeds as a crew treat. If I sprout them now they need 20 extra litres of water. If they survive until Sol 18 it will cheer everyone up. If the greenhouse goes dark, the water is wasted.',
    choices: [
      { label: 'Plant the wasabi', effects: ['Water −20 L', 'Morale boost on Sol 18 if the greenhouse stays lit'],
        apply: (s) => { s.res.water -= 20; s.flags.wasabi = true; } },
      { label: 'Save the water', effects: ['Chen stress +10'],
        apply: (s) => { crew(s, 'chen').stress += 10; } },
    ],
  },
  {
    id: 'shadowEve', speaker: 'rivera',
    when: (s) => s.sol === 10 && once(s, 'shadowEve'),
    title: 'Last sunlight',
    text: (s) => `The Sun drops behind the ridge tomorrow for four sols. We have ${s.res.battery} of ${s.res.batteryCap} kWh stored${s.cargo.kilopower ? ', plus the reactor' : ''}. Whatever we do tonight decides how cold it gets.`,
    choices: [{ label: 'Understood', effects: [], apply: () => {} }],
  },
  {
    id: 'doseThreshold', speaker: 'okafor',
    when: (s) => s.sol < 29 && s.crew.some((c) => c.dose >= 100 && !s.storyletsFired[`dose_${c.id}`]),
    title: 'Radiation check',
    text: (s) => {
      const c = s.crew.find((x) => x.dose >= 100 && !s.storyletsFired[`dose_${x.id}`]);
      return `${CREW_BY_ID[c.id].short} has absorbed ${Math.round(c.dose)} mSv. The 30-day limit is 250. As medical officer I want them kept off EVA for 3 sols.`;
    },
    mark: (s) => { const c = s.crew.find((x) => x.dose >= 100 && !s.storyletsFired[`dose_${x.id}`]); s.storyletsFired[`dose_${c.id}`] = true; s.storyletTarget = c.id; },
    choices: [
      { label: 'Agree, keep them inside', effects: ['No EVA for them for 3 sols'],
        apply: (s) => { crew(s, s.storyletTarget).restrictedUntil = s.sol + 2; } },
      { label: 'Overrule the doctor', effects: ['Okafor stress +20'],
        apply: (s) => { crew(s, 'okafor').stress += 20; } },
    ],
  },
  {
    id: 'morale', speaker: 'okafor',
    when: (s) => s.crew.filter((c) => c.stress >= 70).length >= 2 && cooled(s, 'morale', 4),
    title: 'Crew fatigue',
    text: () => 'I am seeing exhaustion across the crew. I recommend a stand-down: everyone rests today. We lose a sol of work, but burnout costs more.',
    repeat: true,
    choices: [
      { label: 'Stand down today', effects: ['Everyone rests', 'No work today'],
        apply: (s) => { ov(s).standDown = true; } },
      { label: 'Push through', effects: ['Most stressed crew health −10'],
        apply: (s) => { const c = [...s.crew].sort((a, b) => b.stress - a.stress)[0]; c.health -= 10; crew(s, 'okafor').stress += 5; } },
    ],
  },
  {
    id: 'scrubber', speaker: 'chen',
    when: (s) => s.lastEclss !== 'full' && s.sol > 1 && cooled(s, 'scrubber', 3),
    title: 'CO₂ alarm',
    text: () => 'Carbon dioxide is climbing because life support is throttled. I can run the scrubbers at full, but the power has to come from somewhere. Above 1% CO₂ people get headaches.',
    repeat: true,
    choices: [
      { label: 'Grow lights off today', effects: ['Life support Full', 'Plants miss a day of light'],
        show: (s) => s.greenhouse.present,
        apply: (s) => { s.plan.greenhouse = false; s.plan.eclss = 'full'; } },
      { label: 'Dim the habitat', effects: ['Life support Full', 'Habitat uses 12 kWh less', 'Crew stress +8'],
        apply: (s) => { s.plan.eclss = 'full'; ov(s).habDim = true; s.crew.forEach((c) => (c.stress += 8)); } },
      { label: 'Accept the CO₂', effects: ['Everyone health −5'],
        apply: (s) => { s.crew.forEach((c) => (c.health -= 5)); } },
    ],
  },
  {
    id: 'grandmother', speaker: 'okafor',
    when: (s) => s.sol === 15 && once(s, 'grandmother'),
    title: 'Sunrise',
    text: () => 'My grandmother listened to Apollo on a radio in Lagos in 1969. She said every mission is a conversation with the people who came before. We are the next sentence.',
    choices: [{ label: 'Continue', effects: [], apply: () => {} }],
  },
  {
    id: 'sample', speaker: 'tanaka',
    when: (s) => s.sol >= 8 && s.sol <= 14 && once(s, 'sample') && (() => { const t = crew(s, 'tanaka'); return t.task.startsWith('obj:') && ['ice', 'traverse', 'radio'].includes(t.task.slice(4)); })(),
    title: 'An unusual rock',
    text: () => 'I found regolith with volatile signatures I did not expect this far from the crater floor. Two sols in the lab could turn it into a real discovery. It means two sols away from our objective.',
    choices: [
      { label: 'Analyse it', effects: ['Tanaka in the lab for 2 sols', '+25 science'],
        apply: (s) => { const t = crew(s, 'tanaka'); t.busyUntil = s.sol + 1; t.busyTask = 'lab'; s.science += 25; } },
      { label: 'Stay on the objective', effects: ['Tanaka stress +10'],
        apply: (s) => { crew(s, 'tanaka').stress += 10; } },
    ],
  },
  {
    id: 'printPower', speaker: 'tanaka',
    when: (s) => s.objectives.print && !s.objectives.print.done && s.objectives.print.progress >= 1 && s.res.battery < s.res.batteryCap * 0.35 && cooled(s, 'printPower', 5),
    title: 'Printer needs steady power',
    text: () => 'Sintering melts the soil into brick. If the power dips mid-print, the block cracks. I need you to guarantee the power today, or pause the printer.',
    repeat: true,
    choices: [
      { label: 'Life support to Eco today', effects: ['Printing is safe', 'CO₂ rises'],
        apply: (s) => { s.plan.eclss = 'eco'; ov(s).printGuaranteed = true; } },
      { label: 'Pause the printer', effects: ['No printing today', 'Saves 60 kWh per printer'],
        apply: (s) => { ov(s).printPaused = true; } },
    ],
  },
  {
    id: 'shortcut', speaker: 'rivera',
    when: (s) => s.objectives.traverse && !s.objectives.traverse.done && s.objectives.traverse.progress >= 2 && once(s, 'shortcut'),
    title: 'The shortcut',
    text: () => 'There is a route through a shadowed valley. It saves us two sols of driving, but with no sunlight the rover drains 80 kWh from base batteries to keep warm.',
    choices: [
      { label: 'Take the shortcut', effects: ['Traverse +2 progress', 'Battery −80 kWh'],
        apply: (s) => { s.objectives.traverse.progress += 2; s.res.battery = Math.max(0, s.res.battery - 80); } },
      { label: 'Take the long way', effects: ['No change'], apply: () => {} },
    ],
  },
  {
    id: 'flareForecast', speaker: 'okafor',
    when: (s) => s.sol === 18 && once(s, 'flareForecast'),
    title: 'Space weather warning',
    text: (s) => {
      const sw = s.spaceWeather;
      return `Mission Control reports a ${sw.event.classType} flare from sunspot region ${sw.event.activeRegion}. Protons arrive on Sol 20${sw.hard ? ', including very fast ones above 100 MeV that punch through shielding' : ''}. Shielding is at ${Math.round(s.res.shielding)}%. Anyone outside during the storm takes the full dose.`;
    },
    choices: [{ label: 'Prepare the base', effects: [], apply: () => {} }],
  },
  {
    id: 'wasabiBloom', speaker: 'chen',
    when: (s) => s.sol === 18 && s.flags.wasabi && !s.flags.cropLost && once(s, 'wasabiBloom'),
    title: 'Wasabi!',
    text: () => 'The wasabi made it through the shadow. It is tiny and it is spicy and everyone is laughing.',
    choices: [{ label: 'Share it', effects: ['Everyone stress −15'], apply: (s) => s.crew.forEach((c) => (c.stress -= 15)) }],
  },
  {
    id: 'harvestDay', speaker: 'chen',
    when: (s) => s.flags.justHarvested && once(s, 'harvestDay'),
    title: 'First harvest',
    text: () => 'Four hundred grams of lettuce. Not much. But it is the first food this crew has grown on another world.',
    choices: [{ label: 'Continue', effects: [], apply: () => {} }],
  },
  {
    id: 'daughter', speaker: 'rivera',
    when: (s) => s.sol === 21 && once(s, 'daughter'),
    title: 'A drawing',
    text: () => 'My daughter drew the Moon with a crayon rover on it. She thinks I just drive around up here having fun. I want to send her a photo of the real one.',
    choices: [{ label: 'Continue', effects: [], apply: () => {} }],
  },
  {
    id: 'shackleton', speaker: 'tanaka',
    when: (s) => s.sol === 25 && once(s, 'shackleton'),
    title: 'Shackleton',
    text: () => 'From the rim I can see into the crater. Some of that ice has not seen sunlight in billions of years. We are the first people close enough to touch it.',
    choices: [{ label: 'Continue', effects: [], apply: () => {} }],
  },
];

export function findStorylet(state) {
  if (state.outcome) return null;
  const st = STORYLETS.find((x) => { try { return x.when(state); } catch { return false; } });
  if (!st) return null;
  return {
    id: st.id, speaker: st.speaker, title: st.title, text: st.text(state),
    choices: st.choices.map((c, i) => ({ i, label: c.label, effects: c.effects, hidden: c.show ? !c.show(state) : false })).filter((c) => !c.hidden),
  };
}

export function applyStoryletChoice(prev, id, choiceIndex) {
  const s = structuredClone(prev);
  const st = STORYLETS.find((x) => x.id === id);
  if (st.mark) st.mark(s);
  s.storyletsFired[id] = true;
  s.storyletCooldown[id] = s.sol;
  st.choices[choiceIndex].apply(s);
  s.crew.forEach((c) => {
    c.health = Math.max(0, Math.min(100, c.health));
    c.stress = Math.max(0, Math.min(100, c.stress));
  });
  return s;
}
