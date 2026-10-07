export const CREW = [
  {
    id: 'okafor', name: 'Amara Okafor', short: 'Okafor', title: 'Commander',
    role: 'Commander and medical officer', from: 'Nigeria / USA', tag: 'Calm under pressure',
    specialty: 'medical', bonus: 'Medical watch cuts everyone’s radiation dose by 15% that sol.',
    bio: 'Former NASA flight surgeon. Her grandmother tracked the Apollo missions from a radio station in Lagos.',
    skin: '#6B4430', hair: '#1E1612', suit: '#2C5A8C', accent: '#4ED17A', hairStyle: 'short',
  },
  {
    id: 'chen', name: 'Kenji Chen', short: 'Chen', title: 'Specialist',
    role: 'Life support and botany', from: 'Taiwan / Canada', tag: 'Plant obsessed',
    specialty: 'farm', bonus: 'Crops grow 20% faster when Chen tends them. Life-support maintenance is more effective.',
    bio: 'Plant biologist who worked on Veggie, the ISS lettuce experiment. Names his plants.',
    skin: '#D9B38C', hair: '#1A1A1A', suit: '#2C5A8C', accent: '#4ED17A', hairStyle: 'undercut', glasses: true,
  },
  {
    id: 'rivera', name: 'Sofia Rivera', short: 'Rivera', title: 'Pilot',
    role: 'Pilot, EVA lead, power systems', from: 'Mexico', tag: 'Loves speed',
    specialty: 'maintain', bonus: 'Cleans arrays fully and piles 50% more shielding per shift.',
    bio: 'Air Force test pilot. Trained on Kilopower reactors. Carries her daughter’s crayon drawing of the Moon.',
    skin: '#A8714F', hair: '#2A1A12', suit: '#2C5A8C', accent: '#F26A1F', hairStyle: 'braid',
  },
  {
    id: 'tanaka', name: 'Yuki Tanaka', short: 'Tanaka', title: 'Specialist',
    role: 'Geologist and science lead', from: 'Japan', tag: 'Notices everything',
    specialty: 'science', bonus: 'Objectives progress 50% faster with Tanaka. 3D printing never fails on her shift.',
    bio: 'JAXA planetary geologist who analysed Hayabusa2 asteroid samples.',
    skin: '#EBCBAE', hair: '#141414', suit: '#2C5A8C', accent: '#F2E6D0', hairStyle: 'bob',
  },
];

export const CREW_BY_ID = Object.fromEntries(CREW.map((c) => [c.id, c]));

export const TASKS = {
  rest:     { label: 'Rest',        hint: 'Health +10, stress −25', eva: false },
  maintain: { label: 'Maintain',    hint: 'Clean arrays, service life support', eva: true },
  shield:   { label: 'Pile regolith', hint: '+shielding, uses 20 kWh', eva: true },
  farm:     { label: 'Tend crops',  hint: 'Greenhouse grows only when tended', eva: false },
  medical:  { label: 'Medical watch', hint: 'Health +4 for all crew', eva: false },
  // objective tasks are generated as `obj:<id>`
};
