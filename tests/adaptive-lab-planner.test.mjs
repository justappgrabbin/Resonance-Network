import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../Core/AdaptiveLabPlanner.js', import.meta.url), 'utf8');
// The Expo project is CommonJS-configured; isolate the dependency-free ESM planner
// without changing the app's package/module semantics.
const mod = await import('data:text/javascript;base64,' +
  Buffer.from(source, 'utf8').toString('base64'));

const profile = {id:'person-a',humanDesign:{activeGates:[46]}};
const experiments = [
  {id:'joy',title:'Creative joy and trust',hypothesis:'Investigate joy',metric:'joy',gate:46,field:'Heart'},
  {id:'focus',title:'Investigate clarity in learning',hypothesis:'Focus and clarity',metric:'clarity',gate:43,field:'Mind'}
];

function rank(goal, events=[], observations=[], useHumanDesign=false, as=profile) {
  return mod.rankExperiments({
    profile:as,goal,events,observations,experiments,useHumanDesign
  });
}

test('no fabricated plan before a goal and real profile', () => {
  assert.deepEqual(rank(''),[]);
  assert.deepEqual(mod.rankExperiments({goal:'learn',experiments}),[]);
});

test('goal terms rank supplied Lab experiments, not a fixed curriculum', () => {
  assert.equal(rank('I want creative joy')[0].experiment.id,'joy');
  assert.equal(rank('I want better clarity in learning')[0].experiment.id,'focus');
});

test('recorded negative feedback changes the next choice for a neutral goal', () => {
  const before = rank('try something')[0].experiment.id;
  assert.equal(before,'joy');
  const events = [
    {id:'r1',type:'recommendation',profileId:'person-a',payload:{experimentId:'joy'}},
    {id:'v1',type:'review',profileId:'person-a',payload:{experimentId:'joy',rating:'not-helpful'}},
    {id:'r2',type:'recommendation',profileId:'person-a',payload:{experimentId:'joy'}},
    {id:'v2',type:'review',profileId:'person-a',payload:{experimentId:'joy',rating:'not-helpful'}}
  ];
  assert.equal(rank('try something',events)[0].experiment.id,'focus');
});

test('one person\'s events cannot silently change another person\'s ranking', () => {
  const events = [
    {type:'review',profileId:'person-b',payload:{experimentId:'joy',rating:'not-helpful'}}
  ];
  assert.deepEqual(rank('try something',events).map(e=>e.score),
    rank('try something').map(e=>e.score));
});

test('Human Design remains opt-in annotation, not a ranking or outcome claim', () => {
  const plain = rank('something new',[],[],false);
  const opted = rank('something new',[],[],true);
  assert.deepEqual(plain.map(e=>e.score),opted.map(e=>e.score));
  assert.equal(plain[0].hdActive,false);
  const joy = opted.find(e=>e.experiment.id==='joy');
  assert.equal(joy.hdActive,true);
  assert.match(mod.explainRecommendation(joy),/not evidence of efficacy/);
});

test('observations are counted without fabricating outcome benefit', () => {
  const observations=[
    {profileId:'person-a',experimentId:'joy',metrics:{joy:4}},
    {profileId:'person-a',experimentId:'joy',metrics:{joy:8}}
  ];
  const observed=rank('learning',[],observations).find(e=>e.experiment.id==='joy');
  assert.equal(observed.observationsCount,2);
  assert.equal(observed.metricAverage,6);
  assert.equal(observed.ratingCount,0);
});

test('goal changes and reviews resolve pending plans append-only', () => {
  const events=[
    {id:'g1',type:'goal',profileId:'person-a',payload:{text:'old'}},
    {id:'r1',type:'recommendation',profileId:'person-a',payload:{goalEventId:'g1',experimentId:'joy'}},
    {id:'v1',type:'review',profileId:'person-a',payload:{goalEventId:'g1',recommendationEventId:'r1',rating:'helped'}},
    {id:'g2',type:'goal',profileId:'person-a',payload:{text:'new'}},
    {id:'r2',type:'recommendation',profileId:'person-a',payload:{goalEventId:'g2',experimentId:'focus'}}
  ];
  assert.equal(mod.activeGoal(events,'person-a').id,'g2');
  assert.equal(mod.pendingRecommendation(events,'person-a','g1'),null);
  assert.equal(mod.pendingRecommendation(events,'person-a','g2').id,'r2');
});
