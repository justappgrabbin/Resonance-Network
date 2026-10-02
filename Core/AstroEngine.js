import {
  Body,
  Ecliptic,
  EclipticGeoMoon,
  GeoVector,
  NextMoonNode,
  NodeEventKind,
  SearchMoonNode,
  SiderealTime,
} from 'astronomy-engine';

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;
const DAY_MS = 86400000;
const normalize = (value) => ((value % 360) + 360) % 360;

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const ASPECTS = [
  { name: 'Conjunction', angle: 0, orb: 8 },
  { name: 'Sextile', angle: 60, orb: 5 },
  { name: 'Square', angle: 90, orb: 6 },
  { name: 'Trine', angle: 120, orb: 6 },
  { name: 'Opposition', angle: 180, orb: 8 },
];

const PLANET_BODIES = [
  ['Sun', Body.Sun],
  ['Moon', Body.Moon],
  ['Mercury', Body.Mercury],
  ['Venus', Body.Venus],
  ['Mars', Body.Mars],
  ['Jupiter', Body.Jupiter],
  ['Saturn', Body.Saturn],
  ['Uranus', Body.Uranus],
  ['Neptune', Body.Neptune],
  ['Pluto', Body.Pluto],
];

function signedDelta(from, to) {
  return ((to - from + 540) % 360) - 180;
}

function tropicalLongitude(body, date) {
  if (body === Body.Moon) return normalize(EclipticGeoMoon(date).lon);
  return normalize(Ecliptic(GeoVector(body, date, true)).elon);
}

function nodeLongitudeAtEvent(event) {
  const moon = EclipticGeoMoon(event.time).lon;
  return normalize(event.kind === NodeEventKind.Ascending ? moon : moon + 180);
}

function trueNodeLongitude(date) {
  let event = SearchMoonNode(new Date(date.getTime() - 35 * DAY_MS));
  let previous = event;
  while (event.time.date.getTime() <= date.getTime()) {
    previous = event;
    event = NextMoonNode(event);
  }
  const before = nodeLongitudeAtEvent(previous);
  const after = nodeLongitudeAtEvent(event);
  const span = event.time.date.getTime() - previous.time.date.getTime();
  const fraction = span ? (date.getTime() - previous.time.date.getTime()) / span : 0;
  return normalize(before + signedDelta(before, after) * fraction);
}

function faganBradleyAyanamsa(date) {
  const j2000 = Date.UTC(2000, 0, 1, 12);
  const tropicalYears = (date.getTime() - j2000) / (365.2425 * DAY_MS);
  return normalize(24.7366667 + (50.290966 / 3600) * tropicalYears);
}

function equalHouseAscendant(date, latitude, longitude) {
  const lst = normalize(SiderealTime(date) * 15 + Number(longitude || 0));
  const theta = lst * DEG;
  const phi = Number(latitude || 0) * DEG;
  const obliquity = 23.4392911 * DEG;
  const ascendant = Math.atan2(
    -Math.cos(theta),
    Math.sin(obliquity) * Math.tan(phi) + Math.cos(obliquity) * Math.sin(theta),
  ) * RAD;
  return normalize(ascendant);
}

export class AstrologyEngine {
  constructor() {
    this.signs = SIGNS;
    this.planets = PLANET_BODIES.map(([name]) => name);
  }

  parseBirthDate(birthData) {
    if (birthData instanceof Date) return new Date(birthData.getTime());
    if (birthData?.date instanceof Date) return new Date(birthData.date.getTime());

    const date = String(birthData?.date || '2000-01-01');
    const time = String(birthData?.time || '12:00:00');
    const [year, month, day] = date.split('-').map(Number);
    const [hour = 0, minute = 0, second = 0] = time.split(':').map(Number);
    const offset = Number(birthData?.timezoneOffset || 0);
    const parsed = new Date(Date.UTC(year, month - 1, day, hour - offset, minute, second));
    if (Number.isNaN(parsed.getTime())) throw new Error('Invalid birth date/time');
    return parsed;
  }

  julianDay(date) {
    return date.getTime() / DAY_MS + 2440587.5;
  }

  zodiac(longitude) {
    const lon = normalize(longitude);
    const signIndex = Math.floor(lon / 30);
    return {
      longitude: lon,
      sign: SIGNS[signIndex],
      signIndex,
      degree: lon % 30,
    };
  }

  faganBradleyAyanamsa(date) {
    return faganBradleyAyanamsa(date);
  }

  // Compatibility alias for older callers; the actual sidereal method is Fagan-Bradley.
  lahiriAyanamsa(date) {
    return this.faganBradleyAyanamsa(date);
  }

  ascendant(jd, latitude, longitude, date = null) {
    const at = date || new Date((jd - 2440587.5) * DAY_MS);
    return equalHouseAscendant(at, latitude, longitude);
  }

  calculateTropical(date, latitude = 0, longitude = 0) {
    const lat = Number(latitude || 0);
    const lon = Number(longitude || 0);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) throw new Error('Latitude must be between -90 and 90 degrees');
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) throw new Error('Longitude must be between -180 and 180 degrees');

    const jd = this.julianDay(date);
    const asc = equalHouseAscendant(date, lat, lon);
    const node = trueNodeLongitude(date);
    const positions = PLANET_BODIES.map(([planet, body]) => {
      const z = this.zodiac(tropicalLongitude(body, date));
      return { planet, ...z, house: Math.floor(normalize(z.longitude - asc) / 30) + 1 };
    });

    return {
      system: 'Tropical',
      date: date.toISOString(),
      julianDay: jd,
      positions,
      northNode: { ...this.zodiac(node), planet: 'North Node', house: Math.floor(normalize(node - asc) / 30) + 1 },
      southNode: { ...this.zodiac(node + 180), planet: 'South Node', house: Math.floor(normalize(node + 180 - asc) / 30) + 1 },
      ascendant: this.zodiac(asc),
      houseSystem: 'Equal houses from calculated tropical ascendant',
      precision: 'astronomy-engine 2.1.19 geocentric true-ecliptic-of-date; interpolated true lunar node.',
    };
  }

  transformChart(chart, system, transform) {
    const asc = this.zodiac(transform(chart.ascendant.longitude));
    return {
      ...chart,
      system,
      positions: chart.positions.map((p) => {
        const z = this.zodiac(transform(p.longitude));
        return { ...p, ...z, house: Math.floor(normalize(z.longitude - asc.longitude) / 30) + 1 };
      }),
      northNode: (() => {
        const z = this.zodiac(transform(chart.northNode.longitude));
        return { ...chart.northNode, ...z, house: Math.floor(normalize(z.longitude - asc.longitude) / 30) + 1 };
      })(),
      southNode: (() => {
        const z = this.zodiac(transform(chart.southNode.longitude));
        return { ...chart.southNode, ...z, house: Math.floor(normalize(z.longitude - asc.longitude) / 30) + 1 };
      })(),
      ascendant: asc,
    };
  }

  calculateForDate(date, latitude = 0, longitude = 0) {
    const tropical = this.calculateTropical(date, latitude, longitude);
    const ayanamsa = this.faganBradleyAyanamsa(date);
    const sidereal = this.transformChart(tropical, 'Sidereal (Fagan-Bradley)', (value) => normalize(value - ayanamsa));
    const trueNode = tropical.northNode.longitude;
    const draconic = this.transformChart(tropical, 'Draconic (True Node)', (value) => normalize(value - trueNode));
    return {
      tropical,
      sidereal,
      draconic,
      ayanamsa,
      faganBradleyAyanamsa: ayanamsa,
      trueNodeLongitude: trueNode,
      aspects: this.calculateAspects(tropical.positions),
      methods: {
        ephemeris: 'astronomy-engine 2.1.19 geocentric true-ecliptic-of-date',
        sidereal: 'Fagan-Bradley J2000 offset with general-precession rate',
        draconic: 'tropical longitude minus interpolated true ascending lunar node',
        houses: 'equal houses from calculated tropical ascendant',
      },
    };
  }

  calculateTriad(birthData) {
    const date = this.parseBirthDate(birthData);
    return {
      ...this.calculateForDate(date, Number(birthData?.lat || 0), Number(birthData?.lon || 0)),
      inputDate: date.toISOString(),
    };
  }

  calculateAspects(positions) {
    const aspects = [];
    for (let i = 0; i < positions.length; i += 1) {
      for (let j = i + 1; j < positions.length; j += 1) {
        const a = positions[i];
        const b = positions[j];
        let angle = Math.abs(a.longitude - b.longitude);
        if (angle > 180) angle = 360 - angle;
        for (const aspect of ASPECTS) {
          const delta = Math.abs(angle - aspect.angle);
          if (delta <= aspect.orb) {
            aspects.push({ a: a.planet, b: b.planet, type: aspect.name, angle, orb: delta });
            break;
          }
        }
      }
    }
    return aspects.sort((a, b) => a.orb - b.orb);
  }

  findPlanet(chart, name) {
    if (name === 'North Node') return chart.northNode;
    if (name === 'South Node') return chart.southNode;
    return chart.positions.find((p) => p.planet === name) || null;
  }
}

export const astrology = new AstrologyEngine();
export { normalize, faganBradleyAyanamsa, trueNodeLongitude };
