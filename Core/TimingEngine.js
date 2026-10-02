import { consciousness } from './ConsciousnessEngine.js';

const orderedDelta = (natal, transit) => {
  const transitSet = new Set(transit);
  const natalSet = new Set(natal);
  return {
    shared: natal.filter((item) => transitSet.has(item)),
    natalOnly: natal.filter((item) => !transitSet.has(item)),
    transitOnly: transit.filter((item) => !natalSet.has(item)),
  };
};

const definedCenters = (profile) => Object.values(profile?.humanDesign?.centers || {}).filter((c) => c.defined).map((c) => c.name);
const channelCodes = (profile) => (profile?.humanDesign?.channels || []).map((c) => `${c.a}-${c.b}`);
const gates = (profile) => [...(profile?.humanDesign?.activeGates || [])];

function utcBirthData(profile, at) {
  const iso = at.toISOString();
  return {
    name: `Transit ${iso}`,
    date: iso.slice(0, 10),
    time: iso.slice(11, 19),
    timezoneOffset: 0,
    city: profile?.birthData?.city || 'Transit location',
    lat: Number(profile?.birthData?.lat || 0),
    lon: Number(profile?.birthData?.lon || 0),
  };
}

export class TimingEngine {
  async analyze(natalProfile, at = new Date(), timingLabel = 'current') {
    if (!natalProfile?.humanDesign) throw new Error('A calculated natal profile is required');
    const transitProfile = await consciousness.calculateProfile(utcBirthData(natalProfile, at));
    const centers = orderedDelta(definedCenters(natalProfile), definedCenters(transitProfile));
    const channels = orderedDelta(channelCodes(natalProfile), channelCodes(transitProfile));
    const gateDelta = orderedDelta(gates(natalProfile), gates(transitProfile));
    return {
      generatedAt: new Date().toISOString(),
      timingLabel,
      transitDateTimeUtc: at.toISOString(),
      pressuredOpenCenters: centers.transitOnly,
      anchoredDefinedCenters: centers.shared,
      centers,
      channels,
      gates: gateDelta,
      transitProfile,
    };
  }
}

export const timing = new TimingEngine();
