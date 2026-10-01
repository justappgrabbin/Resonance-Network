import * as FileSystem from 'expo-file-system';

const ROOT = `${FileSystem.documentDirectory}ResonanceNetwork/data/`;
const FILE = `${ROOT}profiles.json`;

async function ensureRoot() {
  const info = await FileSystem.getInfoAsync(ROOT);
  if (!info.exists) await FileSystem.makeDirectoryAsync(ROOT, { intermediates: true });
}

async function readState() {
  await ensureRoot();
  const info = await FileSystem.getInfoAsync(FILE);
  if (!info.exists) return { currentId: null, profiles: [] };
  try {
    return JSON.parse(await FileSystem.readAsStringAsync(FILE));
  } catch (_) {
    return { currentId: null, profiles: [] };
  }
}

async function writeState(state) {
  await ensureRoot();
  await FileSystem.writeAsStringAsync(FILE, JSON.stringify(state, null, 2));
}

export const profileStore = {
  async list() {
    return (await readState()).profiles;
  },

  async getCurrent() {
    const state = await readState();
    return state.profiles.find(p => p.id === state.currentId) || state.profiles[0] || null;
  },

  async save(profile, name = null) {
    const state = await readState();
    const id = profile.id || `profile-${Date.now()}`;
    const record = { ...profile, id, name: name || profile.name || 'Profile', savedAt: new Date().toISOString() };
    const index = state.profiles.findIndex(p => p.id === id);
    if (index >= 0) state.profiles[index] = record;
    else state.profiles.push(record);
    state.currentId = id;
    await writeState(state);
    return record;
  },

  async setCurrent(id) {
    const state = await readState();
    if (state.profiles.some(p => p.id === id)) {
      state.currentId = id;
      await writeState(state);
    }
  },
};