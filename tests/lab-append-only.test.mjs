import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('Lab preserves old observations and appends each new entry as a unique file', async () => {
  const source=await readFile(new URL('../Core/LabEngine.js',import.meta.url),'utf8');
  const legacy='/mock/ResonanceNetwork/data/lab-observations.json';
  const files=new Map([[legacy,JSON.stringify([{
    id:'obs-old',createdAt:'2026-10-01T00:00:00Z',
    profileId:'person-a',experimentId:'gate46-joy',metrics:{joy:3}
  }])]]);
  const directories=new Set(['/mock/']);
  let legacyOverwrites=0;
  const FileSystem={
    documentDirectory:'/mock/',
    async getInfoAsync(path) {return {exists:directories.has(path)||files.has(path)};},
    async makeDirectoryAsync(path) {directories.add(path);},
    async readDirectoryAsync(path) {return [...files.keys()]
      .filter(p=>p.startsWith(path)).map(p=>p.slice(path.length)).filter(x=>!x.includes('/'));},
    async readAsStringAsync(path) {
      if(!files.has(path))throw Error('file not found: '+path);
      return files.get(path);
    },
    async writeAsStringAsync(path,body) {
      if(path===legacy)legacyOverwrites+=1;
      files.set(path,body);
    }
  };
  // Load the original source unmodified except substituting in-memory
  // FileSystem and inert unused astro imports. No Expo package in node tests.
  const wrapped=source.replace(
    "import * as FileSystem from 'expo-file-system';",
    'const FileSystem = globalThis.__testLabFS;'
  ).replace("import { astrology } from './AstroEngine.js';",
    'const astrology = {};'
  ).replace("import { humanDesign } from './HumanDesignEngine.js';",
    'const humanDesign = {};'
  );
  globalThis.__testLabFS=FileSystem;
  try {
    const url='data:text/javascript;base64,'+Buffer.from(wrapped).toString('base64');
    const {lab}=await import(url);
    const experiment={id:'gate46-joy',planet:'Venus',gate:46,field:'Heart'};
    const profile={id:'person-a',name:'A',humanDesign:{activeGates:[46]},fields:{}};
    const transitState={at:'2026-10-19T00:00:00Z',gates:{Venus:{gate:46,line:1}}};
    await lab.logObservation({experiment,profile,metrics:{joy:8},transitState,notes:'real observation'});
    await lab.logObservation({experiment,profile,metrics:{joy:6},transitState,notes:'second observation'});
    const all=await lab.observations(null,'person-a');
    assert.equal(all.length,3);
    assert.equal(all[0].id,'obs-old');
    assert.equal(legacyOverwrites,0,'old file must never be overwritten');
    assert.equal(JSON.parse(files.get(legacy)).length,1,'old content remains byte-preserved');
    const additions=[...files.keys()].filter(k=>k.includes('/lab-observation-events/'));
    assert.equal(additions.length,2,'new observations saved to separate immutable files');
    assert.notEqual(additions[0],additions[1]);
    assert.equal(lab.summarize(all).count,3);
  } finally {delete globalThis.__testLabFS;}
});
