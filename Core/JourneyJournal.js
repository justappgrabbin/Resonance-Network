import * as FileSystem from 'expo-file-system';

/**
 * Immutable, profile-scoped learning event journal.
 * Each new fact gets a distinct file; existing history is never overwritten.
 * This is local-only and must not be confused with multi-device sharing.
 */
const ROOT = `${FileSystem.documentDirectory}ResonanceNetwork/data/journey-events/`;
let sequence = 0;

async function ensureRoot() {
  const info = await FileSystem.getInfoAsync(ROOT);
  if (!info.exists) await FileSystem.makeDirectoryAsync(ROOT, { intermediates: true });
}

function eventId() {
  sequence += 1;
  return `e-${Date.now()}-${sequence}-${Math.floor(Math.random() * 1000000000)}`;
}

export const journeyJournal = {
  async append(profileId, type, payload = {}) {
    if (!profileId || typeof profileId !== 'string') throw new Error('A saved profile is required.');
    if (!['goal','recommendation','review'].includes(type)) throw new Error('Unknown journal event type.');
    await ensureRoot();
    let id = eventId();
    let path = `${ROOT}${id}.json`;
    // Refuse to overwrite history even if the device clock repeats.
    while ((await FileSystem.getInfoAsync(path)).exists) {
      id = eventId();
      path = `${ROOT}${id}.json`;
    }
    const event = {
      id, version: 1, profileId, type,
      createdAt: new Date().toISOString(),
      payload: JSON.parse(JSON.stringify(payload))
    };
    await FileSystem.writeAsStringAsync(path, JSON.stringify(event));
    return event;
  },

  async list(profileId) {
    if (!profileId || typeof profileId !== 'string') return [];
    await ensureRoot();
    const files = (await FileSystem.readDirectoryAsync(ROOT))
      .filter(name => /^e-[0-9]+-[0-9]+-[0-9]+\.json$/.test(name));
    const records = await Promise.all(files.map(async name => {
      const raw = await FileSystem.readAsStringAsync(ROOT + name);
      const event = JSON.parse(raw);
      if (!event || !event.id || !event.type || !event.createdAt) {
        throw new Error('Invalid learning event: ' + name);
      }
      return event;
    }));
    return records.filter(e => e.profileId === profileId)
      .sort((a,b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  }
};
