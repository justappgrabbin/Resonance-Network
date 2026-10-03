import * as FileSystem from 'expo-file-system';

const ROOT = `${FileSystem.documentDirectory}ResonanceNetwork/data/`;
const FILE = `${ROOT}purpose.json`;

function blankState() {
  return {
    version: 1,
    answers: {},
    pathway: null,
    completed: false,
    profileId: null,
    startedAt: null,
    updatedAt: null,
  };
}

async function ensureRoot() {
  const info = await FileSystem.getInfoAsync(ROOT);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(ROOT, { intermediates: true });
  }
}

async function readState() {
  await ensureRoot();
  const info = await FileSystem.getInfoAsync(FILE);
  if (!info.exists) return blankState();

  try {
    const parsed = JSON.parse(await FileSystem.readAsStringAsync(FILE));
    return {
      ...blankState(),
      ...parsed,
      answers: { ...(parsed?.answers || {}) },
    };
  } catch (_) {
    return blankState();
  }
}

async function writeState(state) {
  await ensureRoot();
  const next = {
    ...blankState(),
    ...state,
    answers: { ...(state?.answers || {}) },
    updatedAt: new Date().toISOString(),
  };
  await FileSystem.writeAsStringAsync(FILE, JSON.stringify(next, null, 2));
  return next;
}

export const purposeStore = {
  async get() {
    return readState();
  },

  async answer(key, value) {
    const state = await readState();
    const next = {
      ...state,
      startedAt: state.startedAt || new Date().toISOString(),
      answers: {
        ...state.answers,
        [key]: String(value ?? '').trim(),
      },
      completed: false,
    };
    return writeState(next);
  },

  async attachProfile(profileId) {
    const state = await readState();
    return writeState({
      ...state,
      profileId: profileId || null,
    });
  },

  async complete(profileId, pathway) {
    const state = await readState();
    return writeState({
      ...state,
      profileId: profileId || state.profileId || null,
      pathway,
      completed: Boolean(pathway),
    });
  },

  async reopen() {
    const state = await readState();
    return writeState({
      ...state,
      completed: false,
      pathway: null,
    });
  },

  async reset() {
    return writeState(blankState());
  },
};
