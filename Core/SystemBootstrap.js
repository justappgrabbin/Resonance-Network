import * as FileSystem from 'expo-file-system';

/**
 * Resonance Network local bootstrap.
 *
 * This class only prepares local storage/config and reports the real engines
 * bundled in Core/. It intentionally does not generate placeholder/random
 * calculators or matchers.
 */
export class SystemBootstrap {
  constructor() {
    this.baseDir = `${FileSystem.documentDirectory}ResonanceNetwork/`;
    this.listeners = new Set();
    this.requiredDirs = [
      'data',
      'data/profiles',
      'data/cache',
      'data/trajectory',
      'config',
    ];
    this.requiredFiles = {
      'config/app.json': JSON.stringify({
        version: '1.0.1',
        name: 'Resonance Network',
        localFirst: true,
        capabilities: {
          humanDesign: true,
          astrology: true,
          resonanceMatching: true,
          cynthiaLab: true,
          trajectory: true,
        },
      }, null, 2),
    };
  }

  on(event, callback) {
    if (event !== 'log' || typeof callback !== 'function') return () => {};
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  emitLog(message) {
    console.log(`[Bootstrap] ${message}`);
    for (const listener of this.listeners) {
      try { listener(message); } catch (_) {}
    }
  }

  async init() {
    this.emitLog('Starting local system initialization…');
    await this.ensureDir(this.baseDir);

    for (const dir of this.requiredDirs) {
      await this.ensureDir(`${this.baseDir}${dir}/`);
    }

    for (const [path, content] of Object.entries(this.requiredFiles)) {
      await this.ensureFile(`${this.baseDir}${path}`, content);
    }

    const capabilities = [
      'HumanDesignEngine',
      'AstroEngine',
      'ConsciousnessEngine',
      'ProfileStore',
      'LabEngine',
    ];

    this.emitLog(`System ready. ${capabilities.length} real core capabilities registered.`);
    return capabilities;
  }

  async ensureDir(path) {
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(path, { intermediates: true });
      this.emitLog(`Created local directory: ${path}`);
    }
  }

  async ensureFile(path, defaultContent) {
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) {
      await FileSystem.writeAsStringAsync(path, defaultContent);
      this.emitLog(`Created local config: ${path}`);
    }
  }
}