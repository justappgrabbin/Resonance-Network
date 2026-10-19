import { CultivationEngine } from './donors/SynthAiComputerExperience';
import { journeyJournal } from './JourneyJournal';

/**
 * React Native storage adapter for the *existing* SynthAi Computer CultivationEngine.
 * No stage logic is reimplemented here: begin, observe, act and integrate are
 * delegated to the donor. Each donor state change becomes a new immutable event.
 */
class JournalStateAdapter {
  constructor(profileId, history, journal) {
    this.profileId = profileId;
    this.journal = journal;
    this.cycles = new Map();
    for (const event of history) {
      if (event.profileId !== profileId || event.type !== 'cultivation-state') continue;
      const cycle = event.payload?.cycle;
      if (cycle?.id) this.cycles.set(cycle.id, cycle);
    }
  }

  get(path, fallback = null) {
    if (!String(path).startsWith('cultivation.cycles.')) return fallback;
    const id = String(path).slice('cultivation.cycles.'.length);
    const value = this.cycles.get(id);
    return value ? JSON.parse(JSON.stringify(value)) : fallback;
  }

  async set(path, cycle, { source = 'cultivation' } = {}) {
    if (path !== `cultivation.cycles.${cycle?.id}`) {
      throw new Error('Unexpected cultivation state address.');
    }
    // Save first; failed writes never advance the in-memory projection.
    await this.journal.append(this.profileId, 'cultivation-state', { cycle, source });
    this.cycles.set(cycle.id, JSON.parse(JSON.stringify(cycle)));
    return cycle;
  }
}

export function makeCultivationBridge(profileId, events, journal = journeyJournal) {
  const state = new JournalStateAdapter(profileId, events, journal);
  const donor = new CultivationEngine({state});

  return {
    async beginAndAct({goal, experiment, evidence}) {
      if (!goal?.trim() || !experiment?.id) throw new Error('A goal and an available action are required.');
      const started = await donor.begin({goal, owner:profileId, context:'Resonance Network Lab'});
      // Observations are factual counts/references from storage, not predicted outcomes.
      await donor.observe(started.id, {
        kind:'baseline-observation',
        source:'Core/LabEngine + Core/JourneyJournal',
        actualLabObservationIds:evidence?.observationIds || [],
        reviewedExperiments:evidence?.actualReviews || 0
      });
      await donor.act(started.id, {
        kind:'existing-lab-experiment',
        experimentId:experiment.id,
        title:experiment.title
      });
      return {cycleId:started.id, state:state.get(`cultivation.cycles.${started.id}`)};
    },

    async integrate({cycleId, experimentId, rating, notes='', observationIds=[]}) {
      if (!['helped','not-helpful','not-tried'].includes(rating)) throw new Error('Invalid outcome.');
      const current = state.get(`cultivation.cycles.${cycleId}`);
      if (!current) throw new Error('Cultivation cycle not found in local history.');
      if (current.stage !== 'receive-outcome') {
        throw new Error('Cultivation cycle is not awaiting an outcome.');
      }
      const output = await donor.integrate(cycleId, {
        kind:'participant-report', experimentId, rating,
        notes:String(notes).slice(0,2000),
        realLabObservationIds:observationIds,
        evidenceStatus: observationIds.length ? 'self-report+observation' : 'self-report-only',
        // Lab notes or ratings must NEVER be auto-promoted to supported results.
        scientificClassification:'observation'
      });
      return output;
    },

    getCycle: cycleId => state.get(`cultivation.cycles.${cycleId}`)
  };
}
