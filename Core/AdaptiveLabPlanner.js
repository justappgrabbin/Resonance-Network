/**
 * Resonance Network: evidence-led selection among executable experiments.
 *
 * This is a small, deterministic adapter for the existing Lab and event journal,
 * NOT a replacement for Synthia's state-space resolver, Klein tools or planner.
 * Callers supply the experiment catalog; no lesson/curriculum is embedded here.
 * Do not interpret Human Design as validated psychological prediction.
 */
const STOP_WORDS = new Set([
  'a','an','and','are','as','at','be','been','by','can','do','for','from','have',
  'how','i','in','into','is','it','me','my','of','on','or','our','that','the',
  'their','them','there','this','to','us','want','we','what','when','with','you'
]);

export function terms(value) {
  return new Set(String(value || '').toLowerCase()
    .match(/[a-z0-9]+/g)?.filter(word => word.length > 2 && !STOP_WORDS.has(word)) || []);
}

const finiteNumber = value => typeof value === 'number' && Number.isFinite(value);
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

/**
 * Recommend one real, available experiment for a person's current goal.
 * A UCB-style exploration bonus avoids assuming early ratings are certainty.
 * Every numerical input comes from the profile, actual feedback, or catalog.
 */
export function rankExperiments({
  profile, goal, experiments = [], observations = [], events = [], useHumanDesign = false
}) {
  if (!profile?.id || !String(goal || '').trim()) return [];
  const goalTerms = terms(goal);
  const profileEvents = events.filter(e => e.profileId === profile.id);
  const ratings = profileEvents.filter(e => e.type === 'review');
  const presentations = profileEvents.filter(e => e.type === 'recommendation');
  const totalReviews = ratings.filter(e => e.payload?.rating !== 'not-tried').length;

  return experiments.filter(exp => exp && typeof exp.id === 'string' && exp.title)
    .map((exp, index) => {
      const sourceTerms = terms([
        exp.title, exp.hypothesis, exp.field, exp.metric,
        ...(Array.isArray(exp.keywords) ? exp.keywords : [])
      ].filter(Boolean).join(' '));
      const shared = [...goalTerms].filter(t => sourceTerms.has(t));
      const relevance = goalTerms.size ? shared.length / Math.sqrt(goalTerms.size) : 0;
      const reviews = ratings.filter(e => e.payload?.experimentId === exp.id);
      const tried = reviews.filter(e => e.payload?.rating !== 'not-tried');
      const positives = tried.filter(e => e.payload?.rating === 'helped').length;
      const negatives = tried.filter(e => e.payload?.rating === 'not-helpful').length;
      // Smoothed feedback signal: neutral at zero reviews, negative when contradicted.
      const feedbackSignal = (positives - negatives) / (tried.length + 2);
      const visits = presentations.filter(e => e.payload?.experimentId === exp.id).length;
      const observationsCount = observations.filter(o =>
        o.profileId === profile.id && o.experimentId === exp.id
      ).length;
      const exploration = Math.sqrt(Math.log(totalReviews + 2) / (visits + tried.length + 1));
      const observed = observations.filter(o =>
        o.profileId === profile.id && o.experimentId === exp.id
      );
      // Measured observations establish that an activity was logged, not that it worked.
      const metricValues = observed.map(o => o.metrics?.[exp.metric])
        .filter(finiteNumber);
      const metricAverage = metricValues.length
        ? metricValues.reduce((sum, v) => sum + v, 0) / metricValues.length : null;
      const hdActive = useHumanDesign === true &&
        profile.humanDesign?.activeGates?.includes(exp.gate) === true;
      // HD is an opt-in interpretive annotation, not a behavioral ranking signal.
      const score = 2.4 * relevance + 1.8 * feedbackSignal +
        0.35 * clamp(exploration, 0, 2) - 0.12 * visits;
      return {
        experiment: exp,
        index,
        score: Number(score.toFixed(6)),
        relevanceTerms: shared,
        observationsCount,
        ratingCount: tried.length,
        helpfulCount: positives,
        unhelpfulCount: negatives,
        metricAverage,
        hdActive,
        evidence: {
          goalTerms: goalTerms.size,
          overlap: shared.length,
          previouslyShown: visits,
          actualReviews: tried.length,
          actualObservations: observationsCount
        }
      };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index);
}

export function explainRecommendation(result) {
  if (!result) return 'No available experiment for this goal.';
  const parts = [];
  if (result.relevanceTerms.length) {
    parts.push('Related to your goal: ' + result.relevanceTerms.join(', ') + '.');
  } else {
    parts.push('A candidate to investigate; no direct topic match was found.');
  }
  if (result.ratingCount) {
    parts.push(result.helpfulCount + ' helpful and ' + result.unhelpfulCount +
      ' unhelpful responses previously recorded.');
  } else {
    parts.push('No helpfulness feedback recorded yet; this is exploratory.');
  }
  if (result.observationsCount) {
    parts.push(result.observationsCount + ' real Lab observations exist for this experiment.');
  }
  if (result.hdActive) {
    parts.push('Its gate appears in your chart; this is an optional interpretive connection, not evidence of efficacy.');
  }
  return parts.join(' ');
}

export function activeGoal(events, profileId) {
  const matches = events.filter(e => e.profileId === profileId && e.type === 'goal');
  return matches.length ? matches[matches.length - 1] : null;
}

export function pendingRecommendation(events, profileId, goalEventId) {
  const relevant = events.filter(e => e.profileId === profileId && (
    (e.type === 'recommendation' && e.payload?.goalEventId === goalEventId) ||
    (e.type === 'review' && e.payload?.goalEventId === goalEventId)
  ));
  let pending = null;
  for (const event of relevant) {
    if (event.type === 'recommendation') pending = event;
    else if (pending && event.payload?.recommendationEventId === pending.id) pending = null;
  }
  return pending;
}
