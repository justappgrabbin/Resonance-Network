const BUILT_INS = [
  { id:'profiles', name:'Local Profiles', owner:'Resonance Network', execution:'local', status:'active', route:'CreateProfile' },
  { id:'human-design', name:'Human Design + BodyGraph', owner:'Resonance Network', execution:'local', status:'active', route:'HumanDesign' },
  { id:'astrology', name:'Astrology / Geonatal', owner:'Resonance Network', execution:'local', status:'active', route:'Astrology' },
  { id:'cynthia', name:'Cynthia Cognition', owner:'Resonance Network', execution:'local', status:'active', route:'Cynthia' },
  { id:'stellar', name:'Stellar Proximology', owner:'Resonance Network', execution:'local + optional web adapter', status:'active', route:'Stellar' },
  { id:'relationship', name:'Relationship + Composite', owner:'Resonance Network', execution:'local', status:'active', route:'Relationship' },
  { id:'timing', name:'Timing + Transits', owner:'Resonance Network', execution:'local', status:'active', route:'Timing' },
  { id:'portability', name:'Profile Portability', owner:'User', execution:'local', status:'active', route:'Portability' },
  { id:'trajectory', name:'Learning / Trajectory State', owner:'User', execution:'local append-only', status:'active', route:'Cynthia' },
  { id:'mesh', name:'Resonance Mesh Bridge', owner:'Resonance Network', execution:'donor runtime adapter', status:'adapter-port', route:null },
  { id:'chatgpt', name:'ChatGPT MCP Adapter', owner:'Optional adapter', execution:'remote /mcp', status:'optional', route:null },
];

class CapabilityRegistry {
  constructor() {
    this.entries = new Map(BUILT_INS.map((item) => [item.id, { ...item }]));
  }

  register(capability) {
    if (!capability?.id || !capability?.name) throw new Error('Capability id and name are required');
    const existing = this.entries.get(capability.id) || {};
    const registered = { ...existing, ...capability, registeredAt: capability.registeredAt || new Date().toISOString() };
    this.entries.set(capability.id, registered);
    return { ...registered };
  }

  unregister(id) {
    if (BUILT_INS.some((item) => item.id === id)) throw new Error('Built-in capabilities cannot be removed');
    return this.entries.delete(id);
  }

  list() {
    return [...this.entries.values()].map((item) => ({ ...item }));
  }

  get(id) {
    const item = this.entries.get(id);
    return item ? { ...item } : null;
  }
}

export const capabilityRegistry = new CapabilityRegistry();
export { BUILT_INS as CAPABILITIES };
