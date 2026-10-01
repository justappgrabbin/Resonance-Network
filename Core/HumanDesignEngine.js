import { astrology, normalize } from './AstroEngine.js';

const GATE_SEQUENCE = [
  41,19,13,49,30,55,37,63,22,36,25,17,21,51,42,3,
  27,24,2,23,8,20,16,35,45,12,15,52,39,53,62,56,
  31,33,7,4,29,59,40,64,47,6,46,18,48,57,32,50,28,
  44,1,43,14,34,9,5,26,11,10,58,38,54,61,60,
];

const GATE_KEYWORDS = {
  1:'Creative',2:'Receptive',3:'Ordering',4:'Formulization',5:'Fixed Rhythms',6:'Friction',7:'Leadership',8:'Contribution',
  9:'Focus',10:'Behavior of Self',11:'Ideas',12:'Caution',13:'Listener',14:'Power Skills',15:'Extremes',16:'Skills',
  17:'Opinions',18:'Correction',19:'Approach',20:'The Now',21:'Control',22:'Grace',23:'Assimilation',24:'Rationalization',
  25:'Spirit of Self',26:'Egoist',27:'Caring',28:'Game Player',29:'Commitment',30:'Feelings',31:'Influence',32:'Continuity',
  33:'Privacy',34:'Power',35:'Change',36:'Crisis',37:'Family',38:'Fighter',39:'Provocation',40:'Aloneness',
  41:'Contraction',42:'Growth',43:'Insight',44:'Alertness',45:'Gatherer',46:'Determination of Self',47:'Realization',48:'Depth',
  49:'Principles',50:'Values',51:'Shock',52:'Stillness',53:'Beginnings',54:'Ambition',55:'Spirit',56:'Stimulation',
  57:'Intuition',58:'Vitality',59:'Sexuality',60:'Limitation',61:'Mystery',62:'Details',63:'Doubt',64:'Confusion',
};

const LINE_ARCHETYPES = {
  1: 'Investigator / Foundation',
  2: 'Hermit / Natural',
  3: 'Experimenter / Adaptation',
  4: 'Networker / Opportunity',
  5: 'Problem Solver / Projection',
  6: 'Role Model / Perspective',
};

const CHANNELS = [
  [64,47,'Head','Ajna'], [61,24,'Head','Ajna'], [63,4,'Head','Ajna'],
  [17,62,'Ajna','Throat'], [43,23,'Ajna','Throat'], [11,56,'Ajna','Throat'],
  [16,48,'Throat','Spleen'], [20,57,'Throat','Spleen'], [10,20,'G','Throat'],
  [34,20,'Sacral','Throat'], [1,8,'G','Throat'], [7,31,'G','Throat'], [13,33,'G','Throat'],
  [21,45,'Ego','Throat'], [12,22,'Solar Plexus','Throat'], [35,36,'Solar Plexus','Throat'],
  [10,57,'G','Spleen'], [34,10,'Sacral','G'], [5,15,'Sacral','G'], [2,14,'G','Sacral'], [29,46,'Sacral','G'],
  [25,51,'G','Ego'], [34,57,'Sacral','Spleen'], [27,50,'Sacral','Spleen'],
  [18,58,'Spleen','Root'], [28,38,'Spleen','Root'], [32,54,'Spleen','Root'], [44,26,'Spleen','Ego'],
  [42,53,'Sacral','Root'], [3,60,'Sacral','Root'], [9,52,'Sacral','Root'],
  [59,6,'Sacral','Solar Plexus'], [37,40,'Solar Plexus','Ego'],
  [19,49,'Root','Solar Plexus'], [39,55,'Root','Solar Plexus'], [41,30,'Root','Solar Plexus'],
].map(([a,b,centerA,centerB]) => ({ a,b,centerA,centerB }));

const CENTERS = ['Head','Ajna','Throat','G','Ego','Spleen','Sacral','Solar Plexus','Root'];
const MOTORS = new Set(['Sacral','Solar Plexus','Ego','Root']);

const PLANETS = ['Sun','Earth','Moon','North Node','South Node','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];

function angularDistanceForward(from, to) {
  return normalize(to - from);
}

function componentCount(definedCenters, channels) {
  const graph = {};
  definedCenters.forEach(c => { graph[c] = []; });
  channels.forEach(ch => {
    if (graph[ch.centerA] && graph[ch.centerB]) {
      graph[ch.centerA].push(ch.centerB);
      graph[ch.centerB].push(ch.centerA);
    }
  });
  const seen = new Set();
  let count = 0;
  for (const center of definedCenters) {
    if (seen.has(center)) continue;
    count += 1;
    const stack = [center];
    seen.add(center);
    while (stack.length) {
      const current = stack.pop();
      for (const next of graph[current] || []) {
        if (!seen.has(next)) { seen.add(next); stack.push(next); }
      }
    }
  }
  return count;
}

function hasPath(channels, start, predicate) {
  const graph = {};
  CENTERS.forEach(c => { graph[c] = []; });
  channels.forEach(ch => {
    graph[ch.centerA].push(ch.centerB);
    graph[ch.centerB].push(ch.centerA);
  });
  const seen = new Set([start]);
  const queue = [start];
  while (queue.length) {
    const current = queue.shift();
    if (current !== start && predicate(current)) return true;
    for (const next of graph[current] || []) {
      if (!seen.has(next)) { seen.add(next); queue.push(next); }
    }
  }
  return false;
}

export class HumanDesignEngine {
  constructor() {
    this.gateSequence = GATE_SEQUENCE;
    this.channels = CHANNELS;
    this.centers = CENTERS;
  }

  longitudeToActivation(longitude) {
    const shifted = normalize(longitude - 302);
    const gateWidth = 360 / 64;
    const gateIndex = Math.floor(shifted / gateWidth) % 64;
    const withinGate = shifted - gateIndex * gateWidth;
    const lineWidth = gateWidth / 6;
    const line = Math.min(6, Math.floor(withinGate / lineWidth) + 1);
    const withinLine = withinGate - (line - 1) * lineWidth;
    const colorWidth = lineWidth / 6;
    const color = Math.min(6, Math.floor(withinLine / colorWidth) + 1);
    const withinColor = withinLine - (color - 1) * colorWidth;
    const toneWidth = colorWidth / 6;
    const tone = Math.min(6, Math.floor(withinColor / toneWidth) + 1);
    const withinTone = withinColor - (tone - 1) * toneWidth;
    const baseWidth = toneWidth / 5;
    const base = Math.min(5, Math.floor(withinTone / baseWidth) + 1);
    const gate = GATE_SEQUENCE[gateIndex];
    return {
      gate,
      keyword: GATE_KEYWORDS[gate],
      line,
      lineArchetype: LINE_ARCHETYPES[line],
      color,
      tone,
      base,
      longitude: normalize(longitude),
    };
  }

  getLongitude(chart, planet) {
    if (planet === 'Earth') {
      const sun = chart.positions.find(p => p.planet === 'Sun');
      return normalize(sun.longitude + 180);
    }
    if (planet === 'North Node') return chart.northNode.longitude;
    if (planet === 'South Node') return chart.southNode.longitude;
    return chart.positions.find(p => p.planet === planet)?.longitude ?? 0;
  }

  chartActivations(chart) {
    return PLANETS.map((planet) => ({
      planet,
      ...this.longitudeToActivation(this.getLongitude(chart, planet)),
    }));
  }

  findDesignDate(birthData, birthChart) {
    const birthDate = astrology.parseBirthDate(birthData);
    const birthSun = birthChart.positions.find(p => p.planet === 'Sun').longitude;
    let lo = 70;
    let hi = 105;
    for (let i = 0; i < 28; i += 1) {
      const days = (lo + hi) / 2;
      const candidate = new Date(birthDate.getTime() - days * 86400000);
      const sun = astrology.calculateTropical(candidate, Number(birthData?.lat || 0), Number(birthData?.lon || 0)).positions.find(p => p.planet === 'Sun').longitude;
      const arc = angularDistanceForward(sun, birthSun);
      if (arc < 88) lo = days;
      else hi = days;
    }
    return new Date(birthDate.getTime() - ((lo + hi) / 2) * 86400000);
  }

  resolveChannels(activeGates) {
    const gates = new Set(activeGates);
    return CHANNELS.filter(ch => gates.has(ch.a) && gates.has(ch.b));
  }

  resolveCenters(channels) {
    const defined = new Set();
    channels.forEach(ch => { defined.add(ch.centerA); defined.add(ch.centerB); });
    return CENTERS.reduce((acc, center) => {
      const centerChannels = channels.filter(ch => ch.centerA === center || ch.centerB === center);
      acc[center] = {
        name: center,
        defined: defined.has(center),
        channels: centerChannels.map(ch => `${ch.a}-${ch.b}`),
        gates: [...new Set(centerChannels.flatMap(ch => [ch.a, ch.b]))],
      };
      return acc;
    }, {});
  }

  resolveType(centers, channels) {
    const defined = new Set(Object.values(centers).filter(c => c.defined).map(c => c.name));
    if (defined.size === 0) return { type: 'Reflector', strategy: 'Wait a lunar cycle' };
    const sacral = defined.has('Sacral');
    const throat = defined.has('Throat');
    const motorToThroat = throat && hasPath(channels, 'Throat', center => MOTORS.has(center));
    if (sacral) {
      return motorToThroat
        ? { type: 'Manifesting Generator', strategy: 'Wait to respond, then inform' }
        : { type: 'Generator', strategy: 'Wait to respond' };
    }
    if (motorToThroat) return { type: 'Manifestor', strategy: 'Inform before acting' };
    return { type: 'Projector', strategy: 'Wait for recognition and invitation' };
  }

  resolveAuthority(centers, type, channels) {
    if (type === 'Reflector') return 'Lunar';
    if (centers['Solar Plexus'].defined) return 'Emotional';
    if (centers.Sacral.defined) return 'Sacral';
    if (centers.Spleen.defined) return 'Splenic';
    if (centers.Ego.defined) return 'Ego';
    if (centers.G.defined && centers.Throat.defined && hasPath(channels, 'G', c => c === 'Throat')) return 'Self-Projected';
    return 'Environmental / Mental';
  }

  resolveDefinition(centers, channels) {
    const definedCenters = Object.values(centers).filter(c => c.defined).map(c => c.name);
    const count = componentCount(definedCenters, channels);
    const labels = { 0:'No Definition', 1:'Single Definition', 2:'Split Definition', 3:'Triple Split Definition', 4:'Quadruple Split Definition' };
    return { count, type: labels[count] || `${count}-way Definition` };
  }

  calculate(birthData, existingAstrology = null) {
    const triad = existingAstrology || astrology.calculateTriad(birthData);
    const birthChart = triad.tropical;
    const designDate = this.findDesignDate(birthData, birthChart);
    const designChart = astrology.calculateTropical(designDate, Number(birthData?.lat || 0), Number(birthData?.lon || 0));
    const personality = this.chartActivations(birthChart);
    const design = this.chartActivations(designChart);
    const activeGates = [...new Set([...personality, ...design].map(a => a.gate))];
    const channels = this.resolveChannels(activeGates);
    const centers = this.resolveCenters(channels);
    const { type, strategy } = this.resolveType(centers, channels);
    const authority = this.resolveAuthority(centers, type, channels);
    const definition = this.resolveDefinition(centers, channels);
    const pSun = personality.find(a => a.planet === 'Sun');
    const pEarth = personality.find(a => a.planet === 'Earth');
    const dSun = design.find(a => a.planet === 'Sun');
    const dEarth = design.find(a => a.planet === 'Earth');

    return {
      type,
      strategy,
      authority,
      profile: `${pSun.line}/${dSun.line}`,
      profileDetail: {
        conscious: pSun.line,
        unconscious: dSun.line,
        consciousArchetype: LINE_ARCHETYPES[pSun.line],
        unconsciousArchetype: LINE_ARCHETYPES[dSun.line],
      },
      definition,
      centers,
      channels,
      activeGates,
      personality,
      design,
      designDate: designDate.toISOString(),
      incarnationCross: {
        personalitySun: pSun.gate,
        personalityEarth: pEarth.gate,
        designSun: dSun.gate,
        designEarth: dEarth.gate,
        label: `${pSun.gate}/${pEarth.gate} | ${dSun.gate}/${dEarth.gate}`,
      },
      calculation: {
        gateWheelStart: 'Gate 41 at 302° tropical longitude',
        designRule: 'Design chart solved locally at approximately 88° solar arc before birth',
        precision: triad.tropical.precision,
      },
    };
  }
}

export const humanDesign = new HumanDesignEngine();
export { GATE_KEYWORDS, LINE_ARCHETYPES, CHANNELS };