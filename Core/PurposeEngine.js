export const PURPOSE_QUESTIONS = Object.freeze([
  {
    key: 'name',
    prompt: "Hi, I'm Cynthia. Welcome to Resonance. What's your name?",
    placeholder: 'Your name',
  },
  {
    key: 'origin',
    prompt: 'Where do you come from — not only the place, but what shaped you?',
    placeholder: 'People, places, experiences, culture…',
  },
  {
    key: 'identity',
    prompt: 'Who do you think you are right now?',
    placeholder: 'Say it in your own words.',
  },
  {
    key: 'purpose',
    prompt: "What do you think your purpose is? 'I don't know' is a real answer.",
    placeholder: 'What feels meaningful, necessary, or unfinished?',
  },
  {
    key: 'currentLife',
    prompt: 'Where are you in life right now?',
    placeholder: 'Work, relationships, money, home, creativity, direction…',
  },
  {
    key: 'desiredLife',
    prompt: 'Where do you want to be?',
    placeholder: 'What would be different if things were going well?',
  },
  {
    key: 'happiness',
    prompt: 'Are you happy with where things are now? What feels right, and what does not?',
    placeholder: 'Be as specific as you want.',
  },
  {
    key: 'blockers',
    prompt: 'What is blocking you from doing the things you want to do?',
    placeholder: 'Internal, practical, relational, financial, structural…',
  },
  {
    key: 'strengths',
    prompt: 'What are you good at — or what do people keep coming to you for?',
    placeholder: 'Skills, instincts, roles, patterns…',
  },
  {
    key: 'interests',
    prompt: 'What do you care enough about to keep returning to?',
    placeholder: 'Interests, obsessions, problems you want to solve…',
  },
]);

const text = (value, fallback = '') => {
  const clean = String(value ?? '').trim();
  return clean || fallback;
};

const looksUnknown = (value) => {
  const v = text(value).toLowerCase();
  return !v || v === "i don't know" || v === 'i dont know' || v === 'idk' || v === 'not sure';
};

function authorityRule(authority = '') {
  const a = String(authority).toLowerCase();
  if (a.includes('solar') || a.includes('emotional')) {
    return 'Do not force the decision at an emotional high or low; revisit it when there is more clarity.';
  }
  if (a.includes('sacral')) {
    return 'Use the immediate body response as the commit / do-not-commit check.';
  }
  if (a.includes('splen')) {
    return 'Notice the quiet, immediate signal before the mind starts arguing with it.';
  }
  if (a.includes('ego') || a.includes('will')) {
    return 'Check what you genuinely want and what you can actually sustain a commitment to.';
  }
  if (a.includes('self') || a.includes('projected')) {
    return 'Say the option out loud and listen for whether you recognize yourself in what you hear.';
  }
  if (a.includes('mental') || a.includes('environment')) {
    return 'Use the right environment and trusted sounding boards; clarity is not meant to be forced in isolation.';
  }
  if (a.includes('lunar')) {
    return 'Give important commitments time and compare the decision across changing conditions before locking it in.';
  }
  return authority ? `Use ${authority} Authority as the final commitment check.` : 'Use your own decision process as the final commitment check.';
}

function typeRule(type = '', strategy = '') {
  const t = String(type).toLowerCase();
  if (t.includes('manifesting generator')) {
    return 'Put a concrete option in front of yourself, notice the response, then test the fastest reversible version before over-planning it.';
  }
  if (t.includes('generator')) {
    return 'Put a concrete option in front of yourself and notice what you actually have energy to respond to.';
  }
  if (t.includes('projector')) {
    return 'Look for the place where your contribution is already being recognized, then choose the invitation that is actually worth your attention.';
  }
  if (t.includes('manifestor')) {
    return 'Name the move you genuinely want to initiate and inform the people it will affect before acting.';
  }
  if (t.includes('reflector')) {
    return 'Treat environment and time as part of the experiment; compare how the option feels in more than one context before making it permanent.';
  }
  return strategy ? `Use your Strategy — ${strategy} — as the way you approach the next real option.` : 'Turn the idea into one real option you can test.';
}

export function nextPurposeQuestion(answers = {}) {
  return PURPOSE_QUESTIONS.find(q => !text(answers[q.key])) || null;
}

export function buildPurposePathway(profile, answers = {}) {
  if (!profile) {
    return {
      stage: 'Profile',
      headline: 'Your story is here. Now Resonance needs the one calculation that the rest of the system shares.',
      nextMove: 'Create the local resonance profile from birth data once; do not create a second calculator for Purpose.',
      createdAt: new Date().toISOString(),
    };
  }

  const hd = profile.humanDesign || {};
  const current = text(answers.currentLife, 'Current state not yet described.');
  const destination = text(answers.desiredLife, 'Destination not yet described.');
  const blockers = text(answers.blockers, 'No blocker named yet.');
  const purpose = text(answers.purpose, 'Purpose still being discovered.');
  const interests = text(answers.interests);
  const strengths = text(answers.strengths);

  const purposeUnknown = looksUnknown(answers.purpose);
  const hasBlocker = !looksUnknown(answers.blockers) && !/^none\.?$/i.test(text(answers.blockers));

  let stage = 'Experiment';
  let headline = 'Turn the direction into a real-world test.';
  let actionLead = `Choose one small, observable experiment that moves from “${current}” toward “${destination}”.`;

  if (purposeUnknown) {
    stage = 'Discover';
    headline = 'Do not invent a life purpose in the abstract. Discover it through repeated contact with what matters.';
    actionLead = interests || strengths
      ? `Pick one real situation where “${interests || strengths}” can meet another person, problem, project, or need this week.`
      : 'Choose one situation you are genuinely curious about and enter it as an experiment, not a permanent identity.';
  } else if (hasBlocker) {
    stage = 'Unblock';
    headline = 'The next useful move is not a bigger plan. It is reducing the friction between where you are and where you want to go.';
    actionLead = `Take “${blockers}” and identify the smallest part of it you can change, route around, ask for help with, or test without waiting for the whole problem to disappear.`;
  }

  const navigationRule = typeRule(hd.type, hd.strategy);
  const decisionRule = authorityRule(hd.authority);

  return {
    version: 1,
    stage,
    headline,
    currentState: current,
    destination,
    statedPurpose: purpose,
    friction: blockers,
    design: {
      type: hd.type || null,
      strategy: hd.strategy || null,
      authority: hd.authority || null,
      profile: hd.profile || null,
      dominantField: profile.dominant?.field || null,
    },
    nextMove: `${actionLead} ${navigationRule}`,
    decisionCheck: decisionRule,
    evidenceToBringBack: 'What you tried, what actually happened, what felt easier or harder than expected, and whether the result changed the next option.',
    createdAt: new Date().toISOString(),
  };
}
