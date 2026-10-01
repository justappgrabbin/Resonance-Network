import * as FileSystem from 'expo-file-system';
import { astrology } from './AstroEngine.js';
import { humanDesign } from './HumanDesignEngine.js';

export const LAB_EXPERIMENTS = [
  { id:'gate46-joy', field:'Heart', gate:46, planet:'Venus', title:'Gate 46 Joy Enhancement', hypothesis:'When Gate 46 is active with a Venus transit, joy/trust observations may rise within the following 72 hours.', metric:'joy' },
  { id:'gate43-clarity', field:'Mind', gate:43, planet:'Jupiter', title:'Gate 43 Mind Clarity', hypothesis:'When Gate 43 is active with a Jupiter transit, journal clarity may differ from non-transit periods.', metric:'clarity' },
  { id:'gate29-perseverance', field:'Body', gate:29, planet:'Mars', title:'Gate 29 Body Perseverance', hypothesis:'When Gate 29 is active with a Mars transit, fatigue or overcommitment may change.', metric:'energy' },
  { id:'gate1-manifestation', field:'Will', gate:1, planet:'Jupiter', title:'Gate 1 Will Manifestation', hypothesis:'When Gate 1 is active with a Jupiter transit, completion and creative output may change.', metric:'completion' },
  { id:'gate15-synchronicity', field:'Soul', gate:15, planet:'Pluto', title:'Gate 15 Soul Synchronicity', hypothesis:'When Gate 15 is active with a Pluto transit, symbolic or synchronistic observations may change.', metric:'synchronicity' },
  { id:'gate36-crisis', field:'Shadow', gate:36, planet:'Mars', title:'Gate 36 Shadow Crisis', hypothesis:'When Gate 36 is active with a Mars transit, mood volatility may change.', metric:'volatility' },
];

const ROOT = `${FileSystem.documentDirectory}ResonanceNetwork/data/`;
const FILE = `${ROOT}lab-observations.json`;

async function ensureRoot() {
  const info = await FileSystem.getInfoAsync(ROOT);
  if (!info.exists) await FileSystem.makeDirectoryAsync(ROOT, { intermediates: true });
}

async function readLogs() {
  await ensureRoot();
  const info = await FileSystem.getInfoAsync(FILE);
  if (!info.exists) return [];
  try { return JSON.parse(await FileSystem.readAsStringAsync(FILE)); }
  catch (_) { return []; }
}

async function writeLogs(logs) {
  await ensureRoot();
  await FileSystem.writeAsStringAsync(FILE, JSON.stringify(logs, null, 2));
}

export class LabEngine {
  getTransitState(profile, at = new Date()) {
    const lat = Number(profile?.birthData?.lat || 0);
    const lon = Number(profile?.birthData?.lon || 0);
    const triad = astrology.calculateForDate(at, lat, lon);
    const gates = {};
    triad.tropical.positions.forEach(p => { gates[p.planet] = humanDesign.longitudeToActivation(p.longitude); });
    gates['North Node'] = humanDesign.longitudeToActivation(triad.tropical.northNode.longitude);
    return { at: at.toISOString(), triad, gates };
  }

  evaluate(experiment, profile, transitState) {
    const natalActive = Boolean(profile?.humanDesign?.activeGates?.includes(experiment.gate));
    const transit = transitState?.gates?.[experiment.planet] || null;
    const transitGateMatch = transit?.gate === experiment.gate;
    const field = profile?.fields?.[experiment.field] || null;
    return {
      natalActive,
      transitGateMatch,
      transit,
      fieldEnergy: field?.energy ?? null,
      status: natalActive && transitGateMatch ? 'active-window' : natalActive ? 'natal-gate-active' : transitGateMatch ? 'transit-window' : 'baseline',
    };
  }

  async logObservation({ experiment, profile, metrics, notes = '', transitState = null }) {
    const transit = transitState || this.getTransitState(profile);
    const evaluation = this.evaluate(experiment, profile, transit);
    const logs = await readLogs();
    const record = {
      id: `obs-${Date.now()}`,
      createdAt: new Date().toISOString(),
      experimentId: experiment.id,
      profileId: profile?.id || null,
      profileName: profile?.name || 'Profile',
      gate: experiment.gate,
      transitPlanet: experiment.planet,
      metrics,
      notes,
      evaluation,
      transitAt: transit.at,
    };
    logs.push(record);
    await writeLogs(logs);
    return record;
  }

  async observations(experimentId = null, profileId = null) {
    const logs = await readLogs();
    return logs.filter(log => (!experimentId || log.experimentId === experimentId) && (!profileId || log.profileId === profileId));
  }

  summarize(logs) {
    if (!logs.length) return { count:0, averages:{} };
    const sums = {};
    const counts = {};
    logs.forEach(log => {
      Object.entries(log.metrics || {}).forEach(([key, value]) => {
        const n = Number(value);
        if (Number.isFinite(n)) {
          sums[key] = (sums[key] || 0) + n;
          counts[key] = (counts[key] || 0) + 1;
        }
      });
    });
    const averages = {};
    Object.keys(sums).forEach(key => { averages[key] = sums[key] / counts[key]; });
    return { count: logs.length, averages };
  }
}

export const lab = new LabEngine();