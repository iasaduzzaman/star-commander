// All tunable numbers live here. Each has a `src` key pointing at sources.js
// so the in-game "Mission data" screen can show where it came from.

export const MISSION_LENGTH = 30;
export const CREW_COUNT = 4;

// ---- Life support (per crew member, per sol) ----
export const O2_PER_CREW = 0.84;          // kg/day  (BVAD)
export const WATER_PER_CREW = 3.5;        // L/day drinking + food prep + hygiene, simplified (BVAD)
export const ELECTROLYSIS_WATER_PER_KG_O2 = 1.125; // stoichiometry: 2H2O -> 2H2 + O2

export const ECLSS_MODES = {
  full: { label: 'Full', power: 72, o2Cover: 1.0, waterRecovery: 0.93, stress: 0 },
  eco:  { label: 'Eco',  power: 36, o2Cover: 0.5, waterRecovery: 0.7,  stress: 6 },
  off:  { label: 'Off',  power: 0,  o2Cover: 0,   waterRecovery: 0,    stress: 12 },
};

// ---- Power (kWh per sol) ----
export const HAB_LOAD = 48;               // lights, comms, thermal, computers (~2 kW)
export const GREENHOUSE_LOAD = 48;        // LED grow lights (~2 kW)
export const SOLAR_ARRAY_KWH = 180;       // per vertical array at 100% illumination
export const KILOPOWER_KWH = 240;         // 10 kWe continuous (KRUSTY / Kilopower)
export const BASE_BATTERY = 200;          // kWh included with the lander
export const BATTERY_PACK = 150;          // kWh per extra pack
export const DUST_PER_SOL = 0.012;        // efficiency lost per sol from settling dust
export const DUST_PER_EVA = 0.01;         // extra per crew-EVA (kicked-up regolith)

// ---- Food ----
export const START_FOOD = 80;             // crew-days of packaged food in base lander
export const HARVEST_FOOD = 8;            // crew-days per greenhouse harvest (supplement, not replacement)
export const GROWTH_PER_SOL = 9;          // % per tended, lit sol

// ---- Radiation (mSv) ----
export const SURFACE_DOSE = 1.37;         // mSv/day on the surface, Chang'e-4 LND measurement
export const SPE_DOSE = 220;              // unshielded (EVA suit) dose from the Sol 20 particle event
export const DOSE_30_DAY_LIMIT = 250;     // NASA 30-day limit (blood-forming organs)
export const START_SHIELDING = 20;        // % from habitat walls alone
export const SHIELD_PER_TASK = 7;         // % added per crew-sol of regolith piling
export const SHIELD_TASK_POWER = 20;      // kWh of excavator/rover energy per shielding shift

export const START_O2 = 60;   // kg in tanks
export const START_WATER = 160; // L

export const CARGO_BUDGET = { cadet: 3000, astronaut: 2500, specialist: 2200 };
