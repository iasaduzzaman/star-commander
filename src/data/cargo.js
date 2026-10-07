export const CARGO = [
  { id: 'solar',     name: 'Solar array',       mass: 300,  max: 3, desc: '+180 kWh/sol in full sun. Useless in shadow.' },
  { id: 'battery',   name: 'Battery pack',      mass: 450,  max: 4, desc: '+150 kWh storage to ride through shadow.' },
  { id: 'kilopower', name: 'Kilopower reactor', mass: 1500, max: 1, desc: '240 kWh/sol day and night. Very heavy.' },
  { id: 'rations',   name: 'Ration crate',      mass: 100,  max: 4, desc: '+40 crew-days of packaged food.' },
  { id: 'water',     name: 'Water tank',        mass: 140,  max: 3, desc: '+120 L water. Also a water wall: +4% shielding.' },
  { id: 'o2',        name: 'Oxygen tank',       mass: 70,   max: 3, desc: '+40 kg of emergency oxygen.' },
  { id: 'greenhouse',name: 'Greenhouse kit',    mass: 500,  max: 1, desc: 'Grows food and some oxygen. Needs power, water, and care.' },
  { id: 'excavator', name: 'Regolith excavator',mass: 250,  max: 1, desc: 'Shielding work piles 50% more regolith.' },
];

export const CARGO_BY_ID = Object.fromEntries(CARGO.map((c) => [c.id, c]));
