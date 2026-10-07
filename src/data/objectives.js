export const OBJECTIVES = [
  {
    id: 'ice', name: 'Water ice harvest', eva: true, work: 6, powerPerWork: 30,
    blurb: 'Drive into Shackleton’s permanently shadowed floor and bring back ice.',
    reward: '+150 L water. Ice is the most valuable resource on the Moon.',
    points: 40, realWorld: 'NASA’s VIPER rover was designed to map this ice. ISRU (using local resources) is an Artemis priority.',
  },
  {
    id: 'radio', name: 'Far-side radio observatory', eva: true, work: 4, powerPerWork: 15,
    blurb: 'Set up radio antennas where Earth’s radio noise can’t reach.',
    reward: '+4 science every sol after it is built. Build early to earn more. Uses 12 kWh/sol.',
    points: 10, perSol: 4, upkeep: 12, realWorld: 'Based on NASA’s LuSEE-Night and FARSIDE concepts.',
  },
  {
    id: 'harvest', name: 'First lunar harvest', eva: false, work: 0, powerPerWork: 0, needsGreenhouse: true,
    blurb: 'Grow leafy greens in the greenhouse until the first harvest.',
    reward: 'Fresh food, a little extra oxygen, and a big morale boost.',
    points: 35, realWorld: 'NASA’s Veggie system grew lettuce on the ISS; astronauts ate it in 2015.',
  },
  {
    id: 'print', name: '3D-printed regolith shelter', eva: false, work: 6, powerPerWork: 60,
    blurb: 'Melt lunar soil into bricks and print a shelter wall.',
    reward: '+25% shielding for the rest of the mission.',
    points: 50, realWorld: 'NASA’s MMPACT project is developing lunar construction from regolith.',
  },
  {
    id: 'traverse', name: 'Long rover traverse', eva: true, work: 8, powerPerWork: 25,
    blurb: 'Take the pressurized rover to a distant crater rim for samples.',
    reward: 'Rare samples and maps. The most science points, but crew are far from shelter.',
    points: 60, realWorld: 'Artemis plans a pressurized rover for multi-day trips from base.',
  },
];

export const OBJ_BY_ID = Object.fromEntries(OBJECTIVES.map((o) => [o.id, o]));
