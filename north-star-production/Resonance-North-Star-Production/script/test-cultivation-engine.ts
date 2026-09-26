import assert from "node:assert/strict";
import {
  activeCultivation,
  createCultivationState,
  cultivationNextVector,
  observeCultivation,
  setCultivationQuality,
  startCultivation,
} from "../client/src/northstar/selfCultivation";

let state = createCultivationState();
assert.equal(state.verifiedProgress, 0);
assert.equal(state.cycles.length, 0);

state = startCultivation(state, {
  goal: "Finish one useful project and learn from the result",
  context: "inside the Resonance Network",
  purpose: "turn purpose into a real-world outcome",
  who: "creator + Synthia",
  where: "Resonance Network",
  when: "this cycle",
});

let cycle = activeCultivation(state);
assert.ok(cycle);
assert.equal(cycle.stage, "awareness");
assert.equal(cycle.projection.Who.dimension, "Space");
assert.equal(cycle.projection.What.dimension, "Evolution");
assert.equal(cycle.projection.Where.dimension, "Being");
assert.equal(cycle.projection.When.dimension, "Movement");
assert.equal(cycle.projection.Why.dimension, "Design");
assert.match(cultivationNextVector(state), /^awareness:/);

state = setCultivationQuality(state, cycle.id, "patience with evidence");
cycle = activeCultivation(state);
assert.equal(cycle?.quality, "patience with evidence");

state = observeCultivation(state, cycle!.id, {
  worked: false,
  actualOutcome: "I tried to jump ahead and still had no observable result.",
  friction: "skipped the smallest test",
});
cycle = activeCultivation(state);
assert.equal(cycle?.stage, "awareness");
assert.equal(state.verifiedProgress, 0);
assert.match(cycle?.next || "", /smaller test/i);

for (const outcome of [
  "I named the actual situation and target outcome.",
  "I resolved the five fields from facts I had.",
  "I practiced the selected quality before acting.",
  "I completed one observable real-world action.",
  "I compared the result with the prediction and kept the evidence.",
]) {
  cycle = activeCultivation(state);
  assert.ok(cycle);
  state = observeCultivation(state, cycle.id, {
    worked: true,
    actualOutcome: outcome,
    evidence: "test evidence",
  });
}

assert.equal(activeCultivation(state), null);
assert.equal(state.verifiedProgress, 5);
assert.equal(state.cycles[0].status, "integrated");
assert.equal(state.cycles[0].observations.length, 6);
assert.match(cultivationNextVector(state), /Carry forward what worked/);

assert.throws(
  () => {
    const s = startCultivation(createCultivationState(), { goal: "test empty outcome" });
    const c = activeCultivation(s)!;
    observeCultivation(s, c.id, { worked: true, actualOutcome: "" });
  },
  /Record what actually happened/,
);

console.log("SELF-CULTIVATION ENGINE PASS");
