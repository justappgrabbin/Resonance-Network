export const RESONANCE_PACKET_SCHEMA = 'resonance.profile.packet/v1';

export function profileToResonancePacket(profile) {
  if (!profile || typeof profile !== 'object') {
    throw new Error('A Resonance profile is required');
  }
  return {
    schema: RESONANCE_PACKET_SCHEMA,
    name: profile.name || 'Profile',
    source: 'resonance-network',
    portable: true,
    account_bound: false,
    exportedAt: new Date().toISOString(),
    birthData: profile.birthData || null,
    humanDesign: profile.humanDesign || null,
    astrology: profile.astrology || null,
    fields: profile.fields || null,
    coherence: profile.coherence ?? null,
    dominant: profile.dominant || null,
  };
}

export function resonancePacketToProfile(packet) {
  if (!packet || packet.schema !== RESONANCE_PACKET_SCHEMA) {
    throw new Error('Unsupported Resonance profile packet');
  }
  return {
    name: packet.name || 'Imported Profile',
    birthData: packet.birthData || {},
    humanDesign: packet.humanDesign || null,
    astrology: packet.astrology || null,
    fields: packet.fields || {},
    coherence: packet.coherence ?? null,
    dominant: packet.dominant || null,
    importedFrom: packet.source || 'resonance-profile-packet',
  };
}

export function isPortableResonancePacket(value) {
  return Boolean(value && value.schema === RESONANCE_PACKET_SCHEMA && value.portable === true);
}
