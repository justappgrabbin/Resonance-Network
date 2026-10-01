import { astrology } from './AstroEngine.js';
import { humanDesign, CHANNELS } from './HumanDesignEngine.js';

const FIELD_SOURCES = [
  { name: 'Mind', method: 'Tropical', planet: 'Sun', chart: 'tropical' },
  { name: 'Heart', method: 'Draconic', planet: 'Sun', chart: 'draconic' },
  { name: 'Body', method: 'Sidereal', planet: 'Sun', chart: 'sidereal' },
  { name: 'Spirit', method: 'Tropical', planet: 'Moon', chart: 'tropical' },
  { name: 'Shadow', method: 'Tropical', planet: 'Pluto', chart: 'tropical' },
  { name: 'Light', method: 'Tropical', planet: 'Jupiter', chart: 'tropical' },
  { name: 'Void', method: 'Draconic', planet: 'North Node', chart: 'draconic' },
  { name: 'Form', method: 'Sidereal', planet: 'Saturn', chart: 'sidereal' },
  { name: 'Flow', method: 'Tropical', planet: 'Neptune', chart: 'tropical' },
];

const clamp01 = (v) => Math.max(0, Math.min(1, v));

export class ConsciousnessEngine {
  constructor() {
    this.fields = FIELD_SOURCES.map(f => f.name);
    this.cache = new Map();
  }

  async calculateProfile(birthData) {
    const normalized = {
      ...birthData,
      lat: Number(birthData?.lat || 0),
      lon: Number(birthData?.lon || 0),
      timezoneOffset: Number(birthData?.timezoneOffset || 0),
    };
    const cacheKey = this.getCacheKey(normalized);
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    const astro = astrology.calculateTriad(normalized);
    const hd = humanDesign.calculate(normalized, astro);
    const fields = {};
    for (const source of FIELD_SOURCES) {
      fields[source.name] = this.calculateField(source, astro, hd);
    }

    const profile = {
      id: birthData?.id || null,
      name: birthData?.name || 'Profile',
      birthData: normalized,
      timestamp: Date.now(),
      astrology: astro,
      humanDesign: hd,
      fields,
    };
    profile.coherence = this.calculateCoherence(fields);
    profile.dominant = this.findDominantField(fields);
    this.cache.set(cacheKey, profile);
    return profile;
  }

  calculateField(source, astro, hd) {
    const chart = astro[source.chart];
    const point = source.planet === 'North Node'
      ? chart.northNode
      : chart.positions.find(p => p.planet === source.planet);
    const activation = humanDesign.longitudeToActivation(point.longitude);
    const opposite = humanDesign.longitudeToActivation(point.longitude + 180);
    const waveform = this.generateWaveform(hd, activation.gate, source.name);
    const energy = this.waveEnergy(waveform);
    return {
      field: source.name,
      method: source.method,
      sourcePlanet: source.planet,
      primary: activation,
      sun: activation,
      earth: opposite,
      waveform,
      resonanceFreq: 220 * (1 + (activation.gate - 1) / 64) * (1 + activation.line / 72),
      energy,
    };
  }

  generateWaveform(hd, focusGate, fieldName) {
    const phase = this.fields.indexOf(fieldName) / this.fields.length * Math.PI * 2;
    const gates = hd.activeGates || [];
    return Array.from({ length: 64 }, (_, i) => {
      const gate = i + 1;
      let value = 0;
      for (const active of gates) {
        const distance = Math.min(Math.abs(active - gate), 64 - Math.abs(active - gate));
        value += Math.cos((distance / 32) * Math.PI) * 0.08;
      }
      const focusDistance = Math.min(Math.abs(focusGate - gate), 64 - Math.abs(focusGate - gate));
      value += Math.cos((focusDistance / 32) * Math.PI + phase) * 0.55;
      return Math.max(-1, Math.min(1, value));
    });
  }

  waveEnergy(waveform) {
    const rms = Math.sqrt(waveform.reduce((s, v) => s + v*v, 0) / waveform.length);
    return clamp01(rms);
  }

  calculateResonance(profileA, profileB) {
    if (!profileA?.fields || !profileB?.fields) {
      return { overall: 0, fields: [], compatibility: 'Insufficient data', electromagneticChannels: [], sharedGates: [] };
    }
    const fieldResults = this.fields.map(fieldName => {
      const score = this.compareFields(profileA.fields[fieldName], profileB.fields[fieldName]);
      return {
        field: fieldName,
        resonance: score,
        type: this.getResonanceType(profileA.fields[fieldName], profileB.fields[fieldName]),
      };
    });
    const gatesA = new Set(profileA.humanDesign?.activeGates || []);
    const gatesB = new Set(profileB.humanDesign?.activeGates || []);
    const sharedGates = [...gatesA].filter(g => gatesB.has(g));
    const electromagneticChannels = CHANNELS.filter(ch =>
      (gatesA.has(ch.a) && gatesB.has(ch.b)) || (gatesA.has(ch.b) && gatesB.has(ch.a))
    ).map(ch => `${ch.a}-${ch.b}`);

    const base = fieldResults.reduce((s, f) => s + f.resonance, 0) / fieldResults.length;
    const gateBonus = Math.min(0.12, sharedGates.length * 0.008 + electromagneticChannels.length * 0.018);
    const overall = clamp01(base * 0.88 + gateBonus);
    return {
      overall,
      fields: fieldResults.sort((a,b) => b.resonance - a.resonance),
      compatibility: this.getCompatibilityType(overall),
      electromagneticChannels,
      sharedGates,
    };
  }

  compareFields(fieldA, fieldB) {
    const sameGate = fieldA.primary.gate === fieldB.primary.gate ? 1 : 0;
    const gateDistanceRaw = Math.abs(fieldA.primary.gate - fieldB.primary.gate);
    const gateDistance = Math.min(gateDistanceRaw, 64 - gateDistanceRaw);
    const gateCloseness = 1 - gateDistance / 32;
    const lineCloseness = 1 - Math.abs(fieldA.primary.line - fieldB.primary.line) / 5;
    const waveMatch = this.compareWaveforms(fieldA.waveform, fieldB.waveform);
    return clamp01(0.2*sameGate + 0.25*gateCloseness + 0.15*lineCloseness + 0.4*waveMatch);
  }

  compareWaveforms(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    let dot = 0, aa = 0, bb = 0;
    for (let i = 0; i < a.length; i += 1) {
      dot += a[i]*b[i]; aa += a[i]*a[i]; bb += b[i]*b[i];
    }
    if (!aa || !bb) return 0;
    return clamp01((dot / Math.sqrt(aa*bb) + 1) / 2);
  }

  calculateCoherence(fields) {
    const values = Object.values(fields).map(f => f.energy);
    const avg = values.reduce((a,b) => a+b, 0) / values.length;
    const variance = values.reduce((s,v) => s + (v-avg)*(v-avg), 0) / values.length;
    return clamp01(1 - Math.sqrt(variance));
  }

  findDominantField(fields) {
    return Object.values(fields).reduce((best, field) => !best || field.energy > best.energy ? field : best, null);
  }

  getResonanceType(a, b) {
    if (a.primary.gate === b.primary.gate) return 'Shared gate';
    const diff = Math.min(Math.abs(a.primary.gate - b.primary.gate), 64 - Math.abs(a.primary.gate - b.primary.gate));
    if (diff <= 4) return 'Near resonance';
    if (diff >= 28) return 'Polar tension';
    return 'Distinct pattern';
  }

  getCompatibilityType(value) {
    if (value >= 0.85) return 'High resonance';
    if (value >= 0.7) return 'Strong resonance';
    if (value >= 0.55) return 'Mixed resonance';
    return 'Low overlap';
  }

  getCacheKey(data) {
    return JSON.stringify([data.date,data.time,data.timezoneOffset,data.lat,data.lon]);
  }

  async exportProfile(profile) {
    return { version: '2.0', exported: new Date().toISOString(), data: profile };
  }

  async importProfile(exportData) {
    if (!exportData?.data) throw new Error('Invalid profile export');
    return exportData.data;
  }
}

export const consciousness = new ConsciousnessEngine();