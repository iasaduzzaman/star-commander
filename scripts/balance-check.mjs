// Plays the mission with simple strategies to sanity-check balance. `npm run sim`
import { newMission, advanceSol, powerBudget } from '../src/engine/simulate.js';
import { findStorylet, applyStoryletChoice } from '../src/engine/storylets.js';

function play(name, setup, policy, pick = () => 0) {
  let s = newMission(setup);
  let guard = 0;
  while (!s.outcome && guard++ < 40) {
    const st = findStorylet(s);
    if (st) s = applyStoryletChoice(s, st.id, st.choices[pick(st, s)].i);
    policy(s);
    s = advanceSol(s).state;
  }
  const o = s.outcome;
  const objs = s.objectiveIds.map((id) => `${id}:${s.objectives[id].done ? 'done' : s.objectives[id].progress.toFixed(1)}`).join(' ');
  console.log(`${name.padEnd(28)} ${o.result.padEnd(8)} sol ${String(o.sol).padStart(2)} score ${String(o.score ?? '-').padStart(4)} | ` +
    `bat ${s.res.battery} o2 ${s.res.o2} h2o ${s.res.water} food ${s.res.food} sh ${Math.round(s.res.shielding)}% | ` +
    `hp ${s.crew.map((c) => c.health).join('/')} dose ${s.crew.map((c) => Math.round(c.dose)).join('/')} | ${objs} | brownouts ${s.flags.brownouts}` +
    (o.reason ? ` | ${o.reason}` : ''));
}

const setTasks = (s, t) => s.crew.forEach((c, i) => (c.task = t[i]));

// 1. Do nothing smart: default tasks, no extra cargo
play('naive, no cargo', { mode: 'astronaut', objectiveIds: ['ice', 'radio'], cargo: {} }, () => {});

// 2. Balanced player
play('balanced batteries', { mode: 'astronaut', objectiveIds: ['ice', 'radio'], cargo: { battery: 2, rations: 1, water: 1, solar: 1 } }, (s) => {
  const shadow = s.sol >= 11 && s.sol <= 14;
  s.plan.eclss = shadow ? 'eco' : 'full';
  if (s.sol >= 19 && s.sol <= 20) return setTasks(s, ['medical', 'rest', 'shield', 'rest']);
  if (s.sol === 20) return setTasks(s, ['medical', 'rest', 'rest', 'rest']);
  setTasks(s, ['medical', s.sol % 5 === 0 ? 'rest' : 'obj:radio', s.sol % 4 === 0 ? 'maintain' : 'shield', s.sol % 5 === 2 ? 'rest' : 'obj:ice']);
});

// 3. Kilopower player
play('kilopower + greenhouse', { mode: 'astronaut', objectiveIds: ['harvest', 'print'], cargo: { kilopower: 1, rations: 1 } }, (s) => {
  if (s.sol === 20) return setTasks(s, ['medical', 'farm', 'rest', 'obj:print']);
  setTasks(s, ['medical', 'farm', s.sol % 4 === 0 ? 'maintain' : (s.sol % 6 === 0 ? 'rest' : 'shield'), s.sol % 4 === 3 ? 'rest' : 'obj:print']);
});

// 4. Greedy science, ignore shadow
play('greedy traverse+ice', { mode: 'astronaut', objectiveIds: ['traverse', 'ice'], cargo: { rations: 1, solar: 2 } }, (s) => {
  setTasks(s, ['obj:ice', 'obj:traverse', 'obj:traverse', 'obj:ice']);
});

// 5. Greenhouse with batteries
play('greenhouse + batteries', { mode: 'astronaut', objectiveIds: ['harvest', 'radio'], cargo: { battery: 3, water: 1, rations: 1 } }, (s) => {
  const shadow = s.sol >= 11 && s.sol <= 14;
  s.plan.eclss = shadow ? 'eco' : 'full';
  s.plan.greenhouse = true;
  if (s.sol === 20) return setTasks(s, ['medical', 'farm', 'rest', 'rest']);
  setTasks(s, ['medical', 'farm', s.sol % 4 === 0 ? 'maintain' : (s.sol % 5 === 0 ? 'rest':'shield'), s.sol % 5 === 4 ? 'rest' : 'obj:radio']);
}, (st) => st.choices.length - 1);

// power snapshot
const s0 = newMission({ mode: 'astronaut', objectiveIds: ['ice', 'radio'], cargo: {} });
console.log('\nSol 1 power budget (no cargo):', JSON.stringify(powerBudget(s0)));
