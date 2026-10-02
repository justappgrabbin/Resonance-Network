import * as FileSystem from 'expo-file-system';

const ROOT = `${FileSystem.documentDirectory}ResonanceNetwork/data/trajectory/`;
const FILE = `${ROOT}events.json`;

async function ensureRoot() {
  const info = await FileSystem.getInfoAsync(ROOT);
  if (!info.exists) await FileSystem.makeDirectoryAsync(ROOT, { intermediates: true });
}

async function readEvents() {
  await ensureRoot();
  const info = await FileSystem.getInfoAsync(FILE);
  if (!info.exists) return [];
  try { return JSON.parse(await FileSystem.readAsStringAsync(FILE)); }
  catch (_) { return []; }
}

async function writeEvents(events) {
  await ensureRoot();
  await FileSystem.writeAsStringAsync(FILE, JSON.stringify(events, null, 2));
}

export const trajectoryStore = {
  async list(limit = 100) {
    const events = await readEvents();
    return events.slice(-Math.max(1, limit)).reverse();
  },

  async append(type, payload = {}) {
    const events = await readEvents();
    const event = {
      id: `event-${Date.now()}-${events.length + 1}`,
      type,
      createdAt: new Date().toISOString(),
      payload,
    };
    events.push(event);
    await writeEvents(events);
    return event;
  },
};
