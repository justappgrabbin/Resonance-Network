import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

function dataUrl(content) {
  return 'data:text/javascript;base64,' + Buffer.from(content).toString('base64');
}
const root = new URL('../Core/',import.meta.url);
const peer = await import(dataUrl(await readFile(new URL('PeerExchange.js',root),'utf8')));
const donor = await readFile(new URL('donors/SynthAiComputerExperience.js',root),'utf8');
let bridgeSrc = await readFile(new URL('CultivationBridge.js',root),'utf8');
bridgeSrc=bridgeSrc.replace("'./donors/SynthAiComputerExperience'", `'${dataUrl(donor)}'`)
  .replace("'./JourneyJournal'", `'${dataUrl('export const journeyJournal = {}')}'`);
const {makeCultivationBridge} = await import(dataUrl(bridgeSrc));

test('user-authored social update round trips without exposing private profile',()=>{
  const source={
    senderId:'profile-900',senderName:'A',
    messageId:'e-12-2-77',createdAt:'2026-10-19T09:30:00Z',
    text:'Anyone want to investigate shared experiences?',
    birthDate:'private',coordinates:[1,2],humanDesign:{type:'Private'}
  };
  const token=peer.encodePeerUpdate(source);
  assert.ok(token.startsWith('RESONANCE1:'));
  assert.ok(!token.includes('private'));
  assert.deepEqual(peer.decodePeerUpdate('Update: '+token),{
    senderId:source.senderId,senderName:source.senderName,
    messageId:source.messageId,createdAt:source.createdAt,text:source.text
  });
});

test('reject invalid, oversized or unsupported peer codes',()=>{
  assert.throws(()=>peer.decodePeerUpdate('garbage'),/No Resonance/);
  assert.throws(()=>peer.decodePeerUpdate('RESONANCE1:%J'),/could not be decoded/);
  assert.throws(()=>peer.encodePeerUpdate({
    senderId:'profile-1',senderName:'S',messageId:'e-1',
    createdAt:new Date().toISOString(),text:'x'.repeat(1300)
  }),/1200/);
  const foreign=encodeURIComponent(JSON.stringify({
    protocol:'resonance-peer-update',version:2,senderId:'a',
    senderName:'A',messageId:'b',createdAt:new Date().toISOString(),text:'yes'
  }));
  assert.throws(()=>peer.decodePeerUpdate('RESONANCE1:'+foreign),/validation/);
});

test('duplicate import is sender+message scoped and private per profile',()=>{
  const update={senderId:'p2',messageId:'m2'};
  const events=[
    {type:'peer-incoming',profileId:'p1',payload:{senderId:'p2',messageId:'m2'}}
  ];
  assert.equal(peer.alreadyReceived(events,update),true);
  assert.equal(peer.alreadyReceived(events,{...update,senderId:'p3'}),false);
  assert.equal(peer.feedItems(events,'p3').length,0);
});

test('real SynthAi CultivationEngine begin, observe, act and integrate survive journal replay',async()=>{
  const events=[];
  const journal={
    async append(profileId,type,payload) {
      const event={id:'j-'+events.length,profileId,type,payload,
        createdAt:new Date(Date.now()+events.length).toISOString()};
      events.push(event);return event;
    }
  };
  const a=makeCultivationBridge('person-a',events,journal);
  const initial=await a.beginAndAct({
    goal:'Build a local support circle',
    experiment:{id:'existing-lab',title:'Existing Lab activity'},
    evidence:{observationIds:['obs-3'],actualReviews:2}
  });
  assert.equal(initial.state.stage,'receive-outcome');
  assert.deepEqual(initial.state.history[0].evidence.actualLabObservationIds,['obs-3']);
  assert.equal(initial.state.history[1].action.experimentId,'existing-lab');
  assert.deepEqual(events.map(e=>e.type),['cultivation-state','cultivation-state','cultivation-state']);

  const replayed=makeCultivationBridge('person-a',events,journal);
  const result=await replayed.integrate({
    cycleId:initial.cycleId,experimentId:'existing-lab',rating:'not-helpful',
    notes:'This did not help',observationIds:['obs-4']
  });
  assert.equal(result.stage,'integrated');
  assert.equal(result.status,'complete');
  assert.equal(events.length,4);
  assert.equal(events.at(-1).payload.cycle.history.at(-1).outcome.scientificClassification,'observation');
  assert.equal(makeCultivationBridge('person-a',events,journal)
    .getCycle(initial.cycleId).stage,'integrated');
  assert.equal(makeCultivationBridge('person-b',events,journal)
    .getCycle(initial.cycleId),null);
  await assert.rejects(()=>replayed.integrate({
    cycleId:initial.cycleId,experimentId:'existing-lab',rating:'helped'
  }),/not awaiting an outcome/);
});

test('recovered Synthia relational donor learns only from explicit message outcomes',async()=>{
  const relationDonor=await readFile(new URL('donors/SynthiaResonanceNetwork.js',root),'utf8');
  let bridge=await readFile(new URL('CommunityRelations.js',root),'utf8');
  bridge=bridge.replace("'./donors/SynthiaResonanceNetwork'", `'${dataUrl(relationDonor)}'`);
  const {communityRelations,hasReviewedPeerMessage}=await import(dataUrl(bridge));
  const events=[
    {id:'recv-1',profileId:'person-a',type:'peer-incoming',payload:{
      senderId:'person-b',senderName:'Friend',messageId:'m1',text:'hello'
    }},
    {id:'vote-1',profileId:'person-a',type:'peer-feedback',payload:{
      senderId:'person-b',messageId:'m1',rating:'helped'
    }},
    {id:'recv-2',profileId:'person-a',type:'peer-incoming',payload:{
      senderId:'person-b',senderName:'Friend',messageId:'m2',text:'another'
    }}
  ];
  const s1=communityRelations(events,'person-a');
  assert.equal(s1.totalReports,1);
  assert.equal(s1.peers[0].selfReportedFeedbackCount,1);
  assert.ok(s1.peers[0].usefulnessSignal>0);
  assert.equal(hasReviewedPeerMessage(events,'person-a',{
    senderId:'person-b',messageId:'m1'
  }),true);
  assert.equal(hasReviewedPeerMessage(events,'person-a',{
    senderId:'person-b',messageId:'m2'
  }),false);
  events.push({id:'vote-2',profileId:'person-a',type:'peer-feedback',payload:{
    senderId:'person-b',messageId:'m2',rating:'not-helpful'
  }});
  const s2=communityRelations(events,'person-a');
  assert.equal(s2.totalReports,2);
  assert.equal(s2.peers[0].selfReportedFeedbackCount,2);
  assert.ok(s2.peers[0].usefulnessSignal<s1.peers[0].usefulnessSignal);
  assert.equal(communityRelations(events,'person-other').totalReports,0);
  assert.equal(communityRelations(events.filter(e=>e.type!=='peer-feedback'),'person-a').totalReports,0);
});
