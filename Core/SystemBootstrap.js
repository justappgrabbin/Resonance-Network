import * as FileSystem from 'expo-file-system';

/**
 * SystemBootstrap - Auto-scaffolds missing modules
 * 
 * Checks for required directories/files and creates them if missing.
 * Discovers and registers all available modules.
 */

export class SystemBootstrap {
  constructor() {
    this.listeners = new Map();
    this.baseDir = `${FileSystem.documentDirectory}ResonanceNetwork/`;
    this.requiredDirs = [
      'modules',
      'modules/consciousness',
      'modules/resonance',
      'modules/charts',
      'modules/social',
      'data',
      'data/profiles',
      'data/cache',
      'config',
    ];
  }

  // Minimal event interface required by the existing App.js boot log.
  on(name, listener) {
    const listeners = this.listeners.get(name) || [];
    listeners.push(listener);
    this.listeners.set(name, listeners);
    return this;
  }

  emit(name, payload) {
    for (const listener of this.listeners.get(name) || []) listener(payload);
  }

  log(message) {
    console.log(`[Bootstrap] ${message}`);
    this.emit('log', message);
  }

  async init() {
    this.log('Starting system initialization...');
    
    // Ensure base directory exists
    await this.ensureDir(this.baseDir);
    
    // Create required directory structure
    for (const dir of this.requiredDirs) {
      await this.ensureDir(`${this.baseDir}${dir}/`);
    }
    
    // Existing calculators/matchers are shipped as real app source.
    // Never generate fake calculator files or random-match modules on a user's device.

    // Discover available modules
    const modules = await this.discoverModules();
    
    this.log(`Storage ready. ${modules.length} local module files discovered (not executed).`);
    return modules;
  }

  async ensureDir(path) {
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) {
      this.log(`Creating directory: ${path}`);
      await FileSystem.makeDirectoryAsync(path, { intermediates: true });
    }
  }

  async ensureFile(path, defaultContent) {
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) {
      this.log(`Creating file: ${path}`);
      await FileSystem.writeAsStringAsync(path, defaultContent);
    }
  }

  async discoverModules() {
    const modulesDir = `${this.baseDir}modules/`;
    const categories = ['consciousness', 'resonance', 'charts', 'social'];
    const discovered = [];

    for (const category of categories) {
      const categoryPath = `${modulesDir}${category}/`;
      try {
        const files = await FileSystem.readDirectoryAsync(categoryPath);
        for (const file of files) {
          if (file.endsWith('.js')) {
            discovered.push({
              category,
              name: file.replace('.js', ''),
              path: `${categoryPath}${file}`,
            });
            this.log(`Discovered: ${category}/${file}`);
          }
        }
      } catch (e) {
        this.log(`Category ${category} not yet populated`);
      }
    }

    return discovered;
  }

}
