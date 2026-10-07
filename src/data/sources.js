// Shown on the in-game "Mission data" screen.

// NASA open datasets loaded by the game (files in src/data/nasa/).
export const NASA_DATASETS = [
  {
    name: 'NASA DONKI space weather database',
    org: 'Community Coordinated Modeling Center, NASA Goddard Space Flight Center',
    use: 'Real solar flares and their linked solar energetic particle (SEP) events. The flare class sets how strong your storm is; a linked >100 MeV proton event makes shielding less effective.',
    file: 'src/data/nasa/donki_events.json, plus live calls to api.nasa.gov/DONKI/FLR and /SEP',
    url: 'https://ccmc.gsfc.nasa.gov/tools/DONKI',
  },
  {
    name: 'NASA LRO CRaTER daily dose rates',
    org: 'Lunar Reconnaissance Orbiter, Cosmic Ray Telescope for the Effects of Radiation',
    use: 'Measured radiation near the Moon during four real 2012 solar storms. Sets how the storm’s dose is spread across the storm sols.',
    file: 'src/data/nasa/crater_storms_2012.json',
    url: 'https://crater-products.sr.unh.edu/data/inst/dose/table_l30drate.php',
  },
];

export const SOURCES = [
  { topic: 'Oxygen use', value: '0.84 kg per astronaut per day',
    cite: 'NASA Life Support Baseline Values and Assumptions Document (BVAD), 2022', url: 'https://ntrs.nasa.gov/citations/20210024855' },
  { topic: 'Food mass', value: '~1.8 kg per astronaut per day incl. packaging (game uses crew-days)',
    cite: 'NASA BVAD, food system section', url: 'https://ntrs.nasa.gov/citations/20210024855' },
  { topic: 'Water recycling', value: '93% recovery (game Full mode); ISS reached 98% in 2023',
    cite: 'NASA ISS Environmental Control and Life Support System (ECLSS) Water Recovery System' },
  { topic: 'Making oxygen from water', value: '1.125 kg water per kg of O₂ by electrolysis',
    cite: 'Chemistry of 2H₂O → 2H₂ + O₂, as used by the ISS Oxygen Generation Assembly' },
  { topic: 'Kilopower reactor', value: '10 kW electric, continuous, day or night',
    cite: 'NASA / DOE KRUSTY ground test, Nevada, 2017–2018', url: 'https://www.nasa.gov/directorates/spacetech/kilopower' },
  { topic: 'Surface radiation', value: '1.37 mSv per day on the lunar surface',
    cite: 'Zhang et al., Science Advances (2020), Chang’e-4 Lunar Lander Neutron & Dosimetry experiment' },
  { topic: '30-day radiation limit', value: '250 mSv per solar particle event; 250 mGy-Eq per 30 days to blood-forming organs',
    cite: 'NASA-STD-3001, Space Flight Human-System Standard Vol. 1', url: 'https://www.nasa.gov/wp-content/uploads/2023/03/radiation-protection-technical-brief-ochmo.pdf' },
  { topic: 'Solar storm strength', value: 'C-class 45%, M1–M4 65%, M5–M9 85%, X-class 100% of a 220 mSv unshielded storm',
    cite: 'Game scaling of NASA DONKI flare classes', url: 'https://ccmc.gsfc.nasa.gov/tools/DONKI' },
  { topic: 'Solar storm shape', value: 'Daily share of storm dose from real LRO measurements',
    cite: 'NASA LRO CRaTER daily dose rates, 2012', url: 'https://crater-products.sr.unh.edu/data/inst/dose/table_l30drate.php' },
  { topic: 'South pole sunlight', value: 'Some Shackleton rim points are lit 80–90% of the year',
    cite: 'Lunar Reconnaissance Orbiter LOLA illumination studies (Mazarico et al., Icarus 2011)', url: 'https://pgda.gsfc.nasa.gov/products/69' },
  { topic: 'Ice in shadowed craters', value: 'Water ice confirmed in permanently shadowed south polar craters',
    cite: 'NASA LCROSS impact, Cabeus crater, 2009; LRO observations' },
  { topic: 'Lunar dust', value: 'Clings to surfaces and reduces solar panel output',
    cite: 'Apollo mission reports; NASA lunar dust mitigation research' },
  { topic: 'Growing food in space', value: 'Astronauts first ate space-grown lettuce in 2015',
    cite: 'NASA Veggie experiment, International Space Station' },
  { topic: 'Building with regolith', value: 'Printing structures from lunar soil',
    cite: 'NASA Moon-to-Mars Planetary Autonomous Construction Technology (MMPACT)' },
];
