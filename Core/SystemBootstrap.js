import * as FileSystem from 'expo-file-system';
import { capabilityRegistry } from './CapabilityRegistry';

/**
 * Resonance Network sovereign local bootstrap.
 *
 * It prepares persistent local state and exposes the capabilities already
 * bundled with the computer. It does not generate placeholder calculators.
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
      'data/learning',
      'config',
    ];
    this.requiredFiles = {
      'config/app.json': JSON.stringify({
        version: '1.0.2',
        name: 'Resonance Network',
        localFirst: true,
        sovereign: true,
        profileOwner: 'user',
        adaptersAreAuthority: false,
      }, null, 2),
      'data/trajectory/events.json': '[]',
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
    this.emitLog('Starting sovereign local initialization…');
    await this.ensureDir(this.baseDir);

    for (const dir of this.requiredDirs) await this.ensureDir(`${this.baseDir}${dir}/`);
    for (const [path, content] of Object.entries(this.requiredFiles)) await this.ensureFile(`${this.baseDir}${path}`, content);

    const capabilities = capabilityRegistry.list();
    this.emitLog(`System ready. ${capabilities.filter(c=>c.status==='active').length} executable local capabilities registered.`);
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
      this.emitLog(`Created local state: ${path}`);
    }
  }
}
