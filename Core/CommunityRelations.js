import { ResonanceNetwork } from './donors/SynthiaResonanceNetwork';

/**
 * Project explicitly self-reported Community feedback into the original
 * Synthia relational engine. Replaying immutable events reconstructs state.
 * A helpful update is NOT evidence of personality, trustworthiness or
 * scientific Human Design compatibility.
 */
export function communityRelations(events = [], profileId) {
  const network = new ResonanceNetwork({ learningRate:.15 });
  if (!profileId) return { peers:[], totalReports:0, snapshot:network.snapshot() };
  network.addNode(profileId,{kind:'local-person'});
  const names = new Map();
  for (const event of events) {
    if (event?.profileId !== profileId) continue;
    if (event.type === 'peer-incoming' && event.payload?.senderId) {
      names.set(event.payload.senderId,event.payload.senderName || 'Unverified member');
    }
    if (event.type !== 'peer-feedback') continue;
    const p = event.payload || {};
    if (!p.senderId || !['helped','not-helpful'].includes(p.rating)) continue;
    network.observe({
      a:profileId,b:p.senderId,
      outcome:p.rating === 'helped' ? 1 : -1,
      type:'self-reported-message-usefulness',
      verified:true,
      evidence:{source:'local-feedback',eventId:event.id,messageId:p.messageId}
    });
  }
  const current=network.snapshot();
  return {
    peers:current.edges
      .filter(e=>e.a===profileId||e.b===profileId)
      .map(e=>({
        senderId:e.a===profileId?e.b:e.a,
        name:names.get(e.a===profileId?e.b:e.a)||'Unverified member',
        selfReportedFeedbackCount:e.observations,
        usefulnessSignal:Number(e.weight.toFixed(4))
      })).sort((a,b)=>b.selfReportedFeedbackCount-a.selfReportedFeedbackCount),
    totalReports:current.events.length,
    snapshot:current
  };
}

export function hasReviewedPeerMessage(events, profileId, incoming) {
  return events.some(e=>e.type==='peer-feedback' && e.profileId===profileId &&
    e.payload?.senderId===incoming.senderId &&
    e.payload?.messageId===incoming.messageId);
}
