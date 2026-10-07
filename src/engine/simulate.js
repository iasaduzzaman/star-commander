import * as K from '../data/constants.js';
import { illumination } from '../data/timeline.js';
import { CREW, CREW_BY_ID, TASKS } from '../data/crew.js';
import { OBJECTIVES, OBJ_BY_ID } from '../data/objectives.js';
import { DONKI_EVENTS, buildSpaceWeather, stormFractionOn, stormDays, STORM_START_SOL } from '../data/nasa/spaceWeather.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const r1 = (v) => Math.round(v * 10) / 10;

// ---------------------------------------------------------------- setup
export function newMission({ mode, objectiveIds, cargo, spaceWeather }) {
  const sw = spaceWeather || buildSpaceWeather(DONKI_EVENTS[0]);
  const c = { solar: 0, battery: 0, kilopower: 0, rations: 0, water: 0, o2: 0, greenhouse: 0, excavator: 0, ...cargo };
  if (objectiveIds.includes('harvest')) c.greenhouse = 1;
  const startFood = K.START_FOOD + c.rations * 40;
  return {
    mode,
    spaceWeather: sw,
    sol: 1,
    cargo: c,
    objectiveIds,
    objectives: Object.fromEntries(objectiveIds.map((id) => [id, { progress: 0, done: false, doneSol: null }])),
    res: {
      battery: K.BASE_BATTERY + c.battery * K.BATTERY_PACK,
      batteryCap: K.BASE_BATTERY + c.battery * K.BATTERY_PACK,
      o2: K.START_O2 + c.o2 * 40,
      water: K.START_WATER + c.water * 120,
      food: startFood,
      shielding: K.START_SHIELDING + c.water * 4,
      dust: 0,
    },
    plan: { eclss: 'full', greenhouse: true },
    greenhouse: { present: c.greenhouse > 0, growth: 0, alive: true, unlit: 0 },
    crew: CREW.map((m) => ({
      id: m.id, health: 100, stress: 10, dose: 0, stressPeak: 10,
      task: defaultTask(m.id, objectiveIds, c), restrictedUntil: 0, busyUntil: 0, busyTask: null,
    })),
    kilopowerOnlineSol: 5,
    science: 0,
    overrides: {},           // one-sol effects set by storylet choices, keyed by sol
    storyletsFired: {},
    storyletCooldown: {},
    history: [],             // per-sol snapshots for the end chart
    lastEclss: 'full',
    flags: {
      shadowBrownout: false, brownouts: 0, foodOut: false, o2Out: false, waterOut: false,
      throttledSols: 0, speEva: [], speShielding: 0, stormDose: 0, maxDust: 0, cropLost: false,
      harvests: 0, justHarvested: false, wasabi: false, startFood,
    },
    outcome: null,
  };
}

function defaultTask(id, objectiveIds, cargo) {
  if (id === 'chen') return cargo.greenhouse ? 'farm' : 'rest';
  if (id === 'rivera') return 'shield';
  if (id === 'tanaka') { const o = objectiveIds.find((x) => OBJ_BY_ID[x].work > 0); return o ? `obj:${o}` : 'rest'; }
  return 'medical';
}

// ---------------------------------------------------------------- tasks
export function taskInfo(task) {
  if (task?.startsWith('obj:')) {
    const o = OBJ_BY_ID[task.slice(4)];
    return { label: o.name, eva: o.eva, objective: o };
  }
  if (task === 'lab') return { label: 'Sample analysis', eva: false };
  if (task === 'reactor') return { label: 'Reactor startup', eva: false };
  return TASKS[task] ? { ...TASKS[task] } : { label: task, eva: false };
}

export function availableTasks(state, crewId) {
  const m = state.crew.find((c) => c.id === crewId);
  const list = ['rest', 'medical', 'maintain', 'shield'];
  if (state.greenhouse.present) list.splice(2, 0, 'farm');
  state.objectiveIds.forEach((id) => {
    const o = state.objectives[id];
    const def = OBJ_BY_ID[id];
    if (!o.done && def.work > 0) list.push(`obj:${id}`);
  });
  return list.map((t) => {
    const info = taskInfo(t);
    let disabled = null;
    if (info.eva && m.restrictedUntil >= state.sol) disabled = 'Medical hold: no EVA';
    if (state.overrides[state.sol]?.standDown && t !== 'rest') disabled = 'Stand-down day';
    return { id: t, ...info, disabled };
  });
}

export function isLocked(state, member) {
  return member.busyUntil >= state.sol;
}

// ---------------------------------------------------------------- power
// Shared by the live preview and the real simulation so they always agree.
export function powerBudget(state, plan = state.plan) {
  const sol = state.sol;
  const ov = state.overrides[sol] || {};
  const illum = illumination(sol);
  const arrays = 1 + state.cargo.solar;
  const solar = arrays * K.SOLAR_ARRAY_KWH * illum * (1 - state.res.dust);
  const nuclear = state.cargo.kilopower && sol >= state.kilopowerOnlineSol ? K.KILOPOWER_KWH : 0;

  const loads = [];
  loads.push({ key: 'hab', label: 'Habitat', kwh: K.HAB_LOAD - (ov.habDim ? 12 : 0) });
  loads.push({ key: 'eclss', label: `Life support (${K.ECLSS_MODES[plan.eclss].label})`, kwh: K.ECLSS_MODES[plan.eclss].power });
  if (state.greenhouse.present && plan.greenhouse) loads.push({ key: 'greenhouse', label: 'Grow lights', kwh: K.GREENHOUSE_LOAD });
  const radio = state.objectives.radio;
  if (radio?.done) loads.push({ key: 'radio', label: 'Radio observatory', kwh: OBJ_BY_ID.radio.upkeep });

  let shieldShifts = 0;
  const workKwh = {};
  state.crew.forEach((m) => {
    const t = effectiveTask(state, m);
    if (t === 'shield') shieldShifts++;
    if (t.startsWith('obj:')) {
      const id = t.slice(4);
      if (id === 'print' && ov.printPaused) return;
      workKwh[id] = (workKwh[id] || 0) + OBJ_BY_ID[id].powerPerWork;
    }
  });
  if (shieldShifts) loads.push({ key: 'shield', label: 'Excavation', kwh: shieldShifts * K.SHIELD_TASK_POWER });
  Object.entries(workKwh).forEach(([id, kwh]) => loads.push({ key: `obj:${id}`, label: OBJ_BY_ID[id].name, kwh }));

  const production = solar + nuclear;
  const consumption = loads.reduce((s, l) => s + l.kwh, 0);
  return { illum, solar, nuclear, production, loads, consumption, net: production - consumption };
}

export function effectiveTask(state, m) {
  if (m.busyUntil >= state.sol && m.busyTask) return m.busyTask;
  if (state.overrides[state.sol]?.standDown) return 'rest';
  const info = taskInfo(m.task);
  if (info.eva && m.restrictedUntil >= state.sol) return 'rest';
  if (m.task.startsWith('obj:') && state.objectives[m.task.slice(4)]?.done) return 'rest';
  return m.task;
}

// ---------------------------------------------------------------- the sol
export function advanceSol(prev) {
  const s = structuredClone(prev);
  const sol = s.sol;
  const ov = s.overrides[sol] || {};
  const lines = [];
  const say = (tone, text) => lines.push({ tone, text });
  const before = { ...s.res };
  s.flags.justHarvested = false;

  // ---- 1. power, with automatic load shedding
  const plan = { ...s.plan };
  let budget = powerBudget(s, plan);
  let available = s.res.battery + budget.production;
  const shed = [];
  const tryShed = (fn, label) => {
    if (budget.consumption <= available) return;
    if (fn()) { shed.push(label); budget = powerBudget(s, plan); }
  };
  tryShed(() => (plan.greenhouse && s.greenhouse.present ? ((plan.greenhouse = false), true) : false), 'grow lights');
  tryShed(() => (plan.eclss === 'full' ? ((plan.eclss = 'eco'), true) : false), 'life support to Eco');
  tryShed(() => (plan.eclss === 'eco' ? ((plan.eclss = 'off'), true) : false), 'life support off');
  let workCut = false;
  if (budget.consumption > available) workCut = true; // objective work and excavation stall
  const workLoad = budget.loads.filter((l) => l.key.startsWith('obj:') || l.key === 'shield').reduce((a, l) => a + l.kwh, 0);
  const consumption = workCut ? budget.consumption - workLoad : budget.consumption;
  s.res.battery = clamp(available - consumption, 0, s.res.batteryCap);
  if (shed.length || workCut) {
    s.flags.brownouts++;
    if (budget.illum === 0) s.flags.shadowBrownout = true;
    say('bad', `Power ran short. The base automatically cut: ${[...shed, ...(workCut ? ['outside work'] : [])].join(', ')}.`);
  }
  if (budget.illum === 0) say('info', 'In shadow: solar arrays produced nothing today.');
  if (budget.nuclear && sol === s.kilopowerOnlineSol) say('good', 'Kilopower reactor is online. 10 kW, day and night.');

  // ---- 2. life support
  const mode = K.ECLSS_MODES[plan.eclss];
  if (plan.eclss !== 'full') s.flags.throttledSols++;
  s.lastEclss = plan.eclss;
  const crewN = K.CREW_COUNT;
  const o2Need = crewN * K.O2_PER_CREW;
  const lit = s.greenhouse.present && plan.greenhouse && s.greenhouse.alive;
  const o2Made = o2Need * mode.o2Cover;
  const plantO2 = lit ? 0.3 : 0;
  s.res.o2 += o2Made + plantO2 - o2Need;
  const waterLoss = crewN * K.WATER_PER_CREW * (1 - mode.waterRecovery) + o2Made * K.ELECTROLYSIS_WATER_PER_KG_O2 + (lit ? 2 : 0);
  s.res.water -= waterLoss;

  // ---- 3. food
  s.res.food -= crewN;

  // ---- 4. greenhouse
  const gh = s.greenhouse;
  const farmers = s.crew.filter((m) => effectiveTask(s, m) === 'farm');
  if (gh.present) {
    if (!plan.greenhouse) {
      gh.unlit++;
      if (gh.unlit >= 2 && gh.alive && gh.growth > 0) {
        gh.alive = false; gh.growth = 0; s.flags.cropLost = true;
        say('bad', 'The greenhouse was dark for 2 sols. The crop died.');
      }
    } else {
      gh.unlit = 0;
      if (!gh.alive && farmers.length) { gh.alive = true; gh.growth = 0; say('info', 'Chen replanted the greenhouse.'); }
      if (gh.alive && farmers.length) {
        const rate = farmers.reduce((a, m) => a + K.GROWTH_PER_SOL * (m.id === 'chen' ? 1.2 : 1), 0);
        gh.growth += Math.min(rate, 2.2 * K.GROWTH_PER_SOL);
      } else if (gh.alive && gh.growth > 0) {
        say('info', 'Nobody tended the greenhouse. The plants did not grow today.');
      }
      if (gh.growth >= 100) {
        gh.growth = 0;
        s.res.food += K.HARVEST_FOOD;
        s.flags.harvests++;
        s.flags.justHarvested = true;
        s.crew.forEach((m) => (m.stress = clamp(m.stress - 10, 0, 100)));
        say('good', `Harvest! +${K.HARVEST_FOOD} crew-days of fresh food. Crew morale is up.`);
        if (s.objectives.harvest && !s.objectives.harvest.done) completeObjective(s, 'harvest', say);
      }
    }
  }

  // ---- 5. crew tasks
  let doseFactor = 1;
  const evaCrew = [];
  s.crew.forEach((m) => {
    const t = effectiveTask(s, m);
    const info = taskInfo(t);
    const def = CREW_BY_ID[m.id];
    if (info.eva) evaCrew.push(m);
    if (t === 'rest') { m.health += 10; m.stress -= 25; return; }
    m.stress += info.eva ? 12 : 8;
    if (t === 'medical') {
      s.crew.forEach((x) => (x.health += 4));
      if (m.id === 'okafor') doseFactor = 0.85;
      m.stress -= 4;
    }
    if (t === 'maintain' && !workCut) {
      s.res.dust = m.id === 'rivera' ? 0 : s.res.dust * 0.4;
    }
    if (t === 'shield' && !workCut) {
      const add = K.SHIELD_PER_TASK * (m.id === 'rivera' ? 1.5 : 1) * (s.cargo.excavator ? 1.5 : 1);
      s.res.shielding = clamp(s.res.shielding + add, 0, 85);
    }
    if (t === 'lab') { /* analysing samples */ }
    if (t.startsWith('obj:') && !workCut) {
      const id = t.slice(4);
      if (id === 'print' && ov.printPaused) return;
      const o = s.objectives[id];
      let gain = def.specialty === 'science' ? 1.5 : 1;
      if (id === 'print' && m.id !== 'tanaka' && !ov.printGuaranteed && s.res.battery < s.res.batteryCap * 0.2) {
        gain = -1;
        say('bad', `Power dipped during printing. ${def.short}'s brick cracked and had to be scrapped.`);
      }
      o.progress = Math.max(0, o.progress + gain);
      if (id === 'traverse') s.res.dust += 0.005;
    }
  });
  s.objectiveIds.forEach((id) => {
    const o = s.objectives[id];
    if (!o.done && OBJ_BY_ID[id].work > 0 && o.progress >= OBJ_BY_ID[id].work) completeObjective(s, id, say);
  });

  // ---- 6. radiation (storm strength from NASA DONKI, day-by-day shape from NASA LRO CRaTER)
  const sw = s.spaceWeather;
  const stormF = stormFractionOn(sw, sol);
  const stormToday = sw.totalDose * stormF;
  s.crew.forEach((m) => {
    const outside = evaCrew.includes(m);
    let d = K.SURFACE_DOSE * (outside ? 1 : 1 - (s.res.shielding / 100) * 0.6);
    if (stormToday > 0) d += stormToday * (outside ? 1 : 1 - (s.res.shielding / 100) * sw.shieldEff);
    d *= doseFactor;
    m.dose += d;
    if (stormToday > 0) s.flags.stormDose += d / s.crew.length;
    if (d > 20) m.health -= Math.floor(d / 8);
  });
  if (sol === STORM_START_SOL) s.flags.speShielding = Math.round(s.res.shielding);
  if (stormF >= 0.1) {
    const out = evaCrew.map((m) => CREW_BY_ID[m.id].short);
    out.forEach((n) => { if (!s.flags.speEva.includes(n)) s.flags.speEva.push(n); });
    const pct = Math.round(stormF * 100);
    if (out.length) say('bad', `Particle storm (${pct}% of it arrived today). ${out.join(', ')} ${out.length > 1 ? 'were' : 'was'} outside and took the full dose.`);
    else say(s.res.shielding >= 50 ? 'good' : 'bad', `Particle storm (${pct}% of it arrived today). The crew sheltered behind ${Math.round(s.res.shielding)}% shielding.`);
  }

  // ---- 7. dust
  if (sol >= 6) s.res.dust += K.DUST_PER_SOL;
  s.res.dust = clamp(s.res.dust + evaCrew.length * K.DUST_PER_EVA, 0, 0.6);
  s.flags.maxDust = Math.max(s.flags.maxDust, s.res.dust);

  // ---- 8. shortages
  s.crew.forEach((m) => (m.stress += mode.stress));
  if (mode.stress) say('info', `Life support on ${mode.label}: CO₂ is building up. Crew stress rising.`);
  if (s.res.o2 <= 0) { s.res.o2 = 0; s.flags.o2Out = true; s.crew.forEach((m) => (m.health -= 20)); say('bad', 'Oxygen tanks are empty. Crew are on emergency masks.'); }
  if (s.res.water <= 0) { s.res.water = 0; s.flags.waterOut = true; s.crew.forEach((m) => (m.health -= 15)); say('bad', 'Water is gone. The crew is dehydrated.'); }
  if (s.res.food < 0) { s.res.food = 0; s.flags.foodOut = true; s.crew.forEach((m) => { m.health -= 10; m.stress += 10; }); say('bad', 'Food has run out.'); }

  // ---- 9. radio science
  if (s.objectives.radio?.done) s.science += OBJ_BY_ID.radio.perSol;

  // ---- 10. clamp + bookkeeping
  s.crew.forEach((m) => {
    if (m.stress > 80) m.health -= 3;
    m.health = clamp(Math.round(m.health), 0, 100);
    m.stress = clamp(Math.round(m.stress), 0, 100);
    m.dose = r1(m.dose);
    m.stressPeak = Math.max(m.stressPeak, m.stress);
  });
  s.res.o2 = r1(s.res.o2); s.res.water = r1(s.res.water); s.res.battery = Math.round(s.res.battery);

  const report = {
    sol,
    lines,
    power: { production: Math.round(budget.production), consumption: Math.round(consumption), solar: Math.round(budget.solar), nuclear: budget.nuclear },
    deltas: {
      battery: s.res.battery - before.battery,
      o2: r1(s.res.o2 - before.o2),
      water: r1(s.res.water - before.water),
      food: s.res.food - before.food,
      shielding: Math.round(s.res.shielding - before.shielding),
    },
  };
  s.history.push({ sol, battery: s.res.battery, o2: s.res.o2, water: s.res.water, food: s.res.food, shielding: s.res.shielding });

  // ---- 11. outcome
  const down = s.crew.find((m) => m.health <= 0);
  if (down) {
    s.outcome = { result: 'lost', reason: `${CREW_BY_ID[down.id].name} needed emergency evacuation on Sol ${sol}.`, sol };
  } else if (sol >= K.MISSION_LENGTH) {
    s.outcome = finalOutcome(s);
  } else {
    s.sol = sol + 1;
  }
  return { state: s, report };
}

function completeObjective(s, id, say) {
  const o = s.objectives[id];
  const def = OBJ_BY_ID[id];
  o.done = true; o.doneSol = s.sol;
  s.science += def.points;
  if (id === 'ice') s.res.water += 150;
  if (id === 'print') s.res.shielding = clamp(s.res.shielding + 25, 0, 95);
  say('good', `Objective complete: ${def.name}. +${def.points} science.`);
}

export function finalOutcome(s) {
  const avgHealth = s.crew.reduce((a, m) => a + m.health, 0) / s.crew.length;
  const done = s.objectiveIds.filter((id) => s.objectives[id].done).length;
  const totalDose = s.crew.reduce((a, m) => a + m.dose, 0);
  const overLimit = s.crew.some((m) => m.dose >= K.DOSE_30_DAY_LIMIT);
  const score = Math.max(0, Math.round(s.science + avgHealth * 0.6 + done * 20 - totalDose / 10));
  const result = done === s.objectiveIds.length && avgHealth >= 60 && !overLimit ? 'success' : 'complete';
  return { result, score, avgHealth: Math.round(avgHealth), done, sol: s.sol, overLimit };
}

// ---------------------------------------------------------------- helpers for the UI
export function shadowNeed(state) {
  // energy the base needs to ride through the 4-sol shadow at current settings
  const b = powerBudget({ ...state, sol: 12, res: { ...state.res } });
  return Math.max(0, Math.round((b.consumption - b.nuclear) * 4));
}

export function waterUsePerSol(state) {
  const mode = K.ECLSS_MODES[state.plan.eclss];
  const lit = state.greenhouse.present && state.plan.greenhouse && state.greenhouse.alive;
  return K.CREW_COUNT * K.WATER_PER_CREW * (1 - mode.waterRecovery) + K.CREW_COUNT * K.O2_PER_CREW * mode.o2Cover * K.ELECTROLYSIS_WATER_PER_KG_O2 + (lit ? 2 : 0);
}

export function o2UsePerSol(state) {
  const mode = K.ECLSS_MODES[state.plan.eclss];
  const lit = state.greenhouse.present && state.plan.greenhouse && state.greenhouse.alive;
  return K.CREW_COUNT * K.O2_PER_CREW * (1 - mode.o2Cover) - (lit ? 0.3 : 0);
}

export function foodDaysLeft(state) {
  return Math.floor(state.res.food / K.CREW_COUNT);
}

export function cadetHint(state) {
  const sol = state.sol;
  const b = powerBudget(state);
  if (sol <= 10) {
    const need = shadowNeed(state);
    if (need > state.res.batteryCap) return `The shadow on Sols 11–14 needs about ${need} kWh, but your batteries only hold ${state.res.batteryCap}. Plan to switch life support to Eco or turn off grow lights when it gets dark.`;
    if (sol >= 8 && state.res.battery < need) return `Charge up! You need about ${need} kWh for the shadow and have ${state.res.battery}. Keep power use low until Sol 11.`;
  }
  const sd = stormDays(state.spaceWeather);
  if (sol >= 18 && sol <= sd[sd.length - 1]) return `The particle storm hits Sols ${sd[0]}–${sd[sd.length - 1]}. Pile regolith now, and keep everyone inside (no outside tasks) on storm sols.`;
  if (state.res.dust >= 0.15 && b.illum > 0.5) return `Dust is blocking ${Math.round(state.res.dust * 100)}% of your solar power. Send someone to Maintain the arrays. Rivera cleans them completely.`;
  const wl = waterUsePerSol(state);
  if (wl > 0 && state.res.water / wl < 31 - sol) return `Water lasts about ${Math.floor(state.res.water / wl)} more sols at this rate. Making oxygen splits water, and grow lights use it too. Ice from the crater would refill it.`;
  if (foodDaysLeft(state) < 31 - sol) return `Food lasts ${foodDaysLeft(state)} more sols, but the mission has ${31 - sol} left. A greenhouse harvest would help.`;
  if (state.crew.some((m) => m.stress >= 70)) return 'Someone is very stressed. Give them a Rest day before they get sick.';
  if (b.net < 0 && b.illum > 0) return 'You are using more power than you make, even in sunlight. Turn something off or clean the arrays.';
  const open = state.objectiveIds.filter((id) => !state.objectives[id].done);
  if (open.length) return `Keep working on your objectives. Tanaka makes science go 50% faster.`;
  return 'Everything looks steady. Keep the crew rested for the final sols.';
}

export { OBJECTIVES, CREW };
