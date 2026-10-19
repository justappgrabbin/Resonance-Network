/**
 * Resonance peer exchange v1: manual, offline, opt-in public updates.
 * Not an authenticated account or live sync protocol.
 * No birth data, coordinates, Human Design chart, hidden goals or private logs
 * ever enter the envelope. Only a message intentionally authored for sharing.
 */
export const PEER_PREFIX = 'RESONANCE1:';
const maxText = 1200;
const maxToken = 6500;
const goodId = value => typeof value === 'string' &&
  /^[a-zA-Z0-9._:-]{1,150}$/.test(value);
const validTime = value => typeof value === 'string' &&
  !Number.isNaN(Date.parse(value)) && value.length <= 35;

export function encodePeerUpdate({senderId, senderName, messageId, createdAt, text}) {
  if (!goodId(senderId) || !goodId(messageId)) throw new Error('A saved sender and message are required.');
  const author = String(senderName || '').trim();
  const message = String(text || '').trim();
  if (!author || author.length > 100) throw new Error('The sender name is invalid.');
  if (!message || message.length > maxText) throw new Error('Message must be 1–1200 characters.');
  if (!validTime(createdAt)) throw new Error('A recorded message time is required.');
  // A fixed allowlist ensures private profile fields cannot accidentally leak.
  const payload = {
    protocol:'resonance-peer-update',
    version:1,
    senderId, senderName:author, messageId, createdAt, text:message
  };
  return PEER_PREFIX + encodeURIComponent(JSON.stringify(payload));
}

export function decodePeerUpdate(raw) {
  const input = String(raw || '');
  const start = input.indexOf(PEER_PREFIX);
  if (start === -1) throw new Error('No Resonance update code found.');
  const token = input.slice(start + PEER_PREFIX.length).trim().split(/\s/)[0];
  if (!token || token.length > maxToken) throw new Error('The update code is empty or too large.');
  let payload;
  try { payload = JSON.parse(decodeURIComponent(token)); }
  catch (_) { throw new Error('Update could not be decoded. Copy the complete code.'); }
  if (!payload || payload.protocol !== 'resonance-peer-update' || payload.version !== 1 ||
      !goodId(payload.senderId) || !goodId(payload.messageId) ||
      !validTime(payload.createdAt) ||
      typeof payload.senderName !== 'string' ||
      payload.senderName.trim().length === 0 || payload.senderName.length > 100 ||
      typeof payload.text !== 'string' ||
      payload.text.trim().length === 0 || payload.text.length > maxText) {
    throw new Error('Update failed format validation.');
  }
  // Return only trusted, explicitly public schema fields; ignore extras.
  return {
    senderId:payload.senderId,
    senderName:payload.senderName.trim(),
    messageId:payload.messageId,
    createdAt:payload.createdAt,
    text:payload.text.trim()
  };
}

export function alreadyReceived(events, update) {
  return events.some(e => e.type === 'peer-incoming' &&
    e.payload?.senderId === update.senderId &&
    e.payload?.messageId === update.messageId);
}

export function feedItems(events, currentId) {
  return events
    .filter(e => e.profileId === currentId &&
      (e.type === 'peer-outgoing' || e.type === 'peer-incoming'))
    .map(e => e.type === 'peer-outgoing'
      ? {id:e.id, messageId:e.id, senderId:currentId, senderName:'Me', text:e.payload?.text,
         createdAt:e.createdAt, source:'mine'}
      : {id:e.id,messageId:e.payload?.messageId,senderId:e.payload?.senderId,senderName:e.payload?.senderName,
         text:e.payload?.text,createdAt:e.payload?.createdAt,source:'imported'})
    .sort((a,b)=>b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
}
