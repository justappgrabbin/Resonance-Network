import { humanDesign } from './HumanDesignEngine.js';

const SUMMARY_KEYS = ['type', 'strategy', 'authority', 'profile'];

const orderedDelta = (left, right) => {
  const rightSet = new Set(right);
  const leftSet = new Set(left);
  return {
    shared: left.filter((item) => rightSet.has(item)),
    leftOnly: left.filter((item) => !rightSet.has(item)),
    rightOnly: right.filter((item) => !leftSet.has(item)),
  };
};

const definedCenters = (profile) => Object.values(profile?.humanDesign?.centers || {}).filter((c) => c.defined).map((c) => c.name);
const channelCodes = (profile) => (profile?.humanDesign?.channels || []).map((c) => `${c.a}-${c.b}`);
const gateNumbers = (profile) => [...(profile?.humanDesign?.activeGates || [])];

export class RelationshipEngine {
  compare(left, right) {
    if (!left?.humanDesign || !right?.humanDesign) throw new Error('Two calculated profiles are required');
    const summaryFacets = SUMMARY_KEYS.map((key) => ({
      key,
      left: left.humanDesign[key],
      right: right.humanDesign[key],
      same: left.humanDesign[key] === right.humanDesign[key],
    }));
    summaryFacets.push({
      key: 'definition',
      left: left.humanDesign.definition?.type,
      right: right.humanDesign.definition?.type,
      same: left.humanDesign.definition?.type === right.humanDesign.definition?.type,
    });

    const gates = orderedDelta(gateNumbers(left), gateNumbers(right));
    const compositeGates = [...new Set([...gateNumbers(left), ...gateNumbers(right)])];
    const compositeChannels = humanDesign.resolveChannels(compositeGates);
    const compositeCenters = humanDesign.resolveCenters(compositeChannels);

    return {
      generatedAt: new Date().toISOString(),
      leftLabel: left.name || 'A',
      rightLabel: right.name || 'B',
      summaryFacets,
      centers: orderedDelta(definedCenters(left), definedCenters(right)),
      channels: orderedDelta(channelCodes(left), channelCodes(right)),
      gates,
      composite: {
        gates: compositeGates,
        channels: compositeChannels,
        centers: compositeCenters,
        definedCenters: Object.values(compositeCenters).filter((c) => c.defined).map((c) => c.name),
      },
    };
  }
}

export const relationship = new RelationshipEngine();
