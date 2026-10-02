import * as FileSystem from 'expo-file-system';
import { trajectoryStore } from './TrajectoryStore';

const ROOT = `${FileSystem.documentDirectory}ResonanceNetwork/data/`;
const FILE = `${ROOT}profiles.json`;
const BUNDLE_SCHEMA = 'resonance-network/profile-bundle/v1';

async function ensureRoot() {
  const info = await FileSystem.getInfoAsync(ROOT);
  if (!info.exists) await FileSystem.makeDirectoryAsync(ROOT, { intermediates: true });
}

async function readState() {
  await ensureRoot();
  const info = await FileSystem.getInfoAsync(FILE);
  if (!info.exists) return { currentId: null, profiles: [] };
  try {
    const parsed = JSON.parse(await FileSystem.readAsStringAsync(FILE));
    return {
      currentId: parsed?.currentId || null,
      profiles: Array.isArray(parsed?.profiles) ? parsed.profiles : [],
    };
  } catch (_) {
    return { currentId: null, profiles: [] };
  }
}

async function writeState(state) {
  await ensureRoot();
  await FileSystem.writeAsStringAsync(FILE, JSON.stringify(state, null, 2));
}

function validateProfile(profile) {
  return Boolean(profile && typeof profile === 'object' && profile.birthData && profile.humanDesign && profile.astrology);
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
    if (!validateProfile(profile)) throw new Error('Calculated profile is incomplete');
    const state = await readState();
    const id = profile.id || `profile-${Date.now()}`;
    const record = { ...profile, id, name: name || profile.name || 'Profile', savedAt: new Date().toISOString() };
    const index = state.profiles.findIndex(p => p.id === id);
    if (index >= 0) state.profiles[index] = record;
    else state.profiles.push(record);
    state.currentId = id;
    await writeState(state);
    await trajectoryStore.append(index >= 0 ? 'profile.updated' : 'profile.created', { profileId:id, profileName:record.name });
    return record;
  },

  async setCurrent(id) {
    const state = await readState();
    if (state.profiles.some(p => p.id === id)) {
      state.currentId = id;
      await writeState(state);
      return true;
    }
    return false;
  },

  async exportBundle() {
    const state = await readState();
    return {
      schema: BUNDLE_SCHEMA,
      exportedAt: new Date().toISOString(),
      owner: 'user',
      currentId: state.currentId,
      profiles: state.profiles,
    };
  },

  async importBundle(input) {
    const bundle = typeof input === 'string' ? JSON.parse(input) : input;
    if (!bundle || bundle.schema !== BUNDLE_SCHEMA || !Array.isArray(bundle.profiles)) {
      throw new Error('Not a Resonance Network profile bundle v1');
    }
    const incoming = bundle.profiles.filter(validateProfile);
    if (!incoming.length && bundle.profiles.length) throw new Error('Bundle contains no valid calculated profiles');

    const state = await readState();
    for (const profile of incoming) {
      const id = profile.id || `profile-import-${Date.now()}-${state.profiles.length + 1}`;
      const record = { ...profile, id, importedAt: new Date().toISOString() };
      const index = state.profiles.findIndex(p => p.id === id);
      if (index >= 0) state.profiles[index] = record;
      else state.profiles.push(record);
    }
    if (bundle.currentId && state.profiles.some(p=>p.id===bundle.currentId)) state.currentId = bundle.currentId;
    else if (!state.currentId && state.profiles.length) state.currentId = state.profiles[0].id;
    await writeState(state);
    await trajectoryStore.append('profiles.imported', { count:incoming.length, sourceSchema:BUNDLE_SCHEMA });
    return incoming.length;
  },
};
