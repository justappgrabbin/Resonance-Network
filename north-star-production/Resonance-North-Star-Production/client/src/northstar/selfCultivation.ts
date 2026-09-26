export type CultivationStage = "awareness" | "orientation" | "cultivation" | "action" | "integration";
export type CultivationStatus = "active" | "integrated";

export const CULTIVATION_STAGES: CultivationStage[] = [
  "awareness",
  "orientation",
  "cultivation",
  "action",
  "integration",
];

export const INTERROGATIVE_PROJECTION = Object.freeze({
  Who: "Space",
  What: "Evolution",
  Where: "Being",
  When: "Movement",
  Why: "Design",
} as const);

export interface CultivationField {
  dimension: (typeof INTERROGATIVE_PROJECTION)[keyof typeof INTERROGATIVE_PROJECTION];
  value: string;
  known: boolean;
}

export interface CultivationProjection {
  Who: CultivationField;
  What: CultivationField;
  Where: CultivationField;
  When: CultivationField;
  Why: CultivationField;
}

export interface HumanDesignContext {
  type?: string;
  authority?: string;
  profile?: string;
  gates?: number[];
  channels?: string[];
}

export interface CultivationObservation {
  at: string;
  stage: CultivationStage;
  worked: boolean;
  actualOutcome: string;
  evidence: string;
  friction?: string;
}

export interface CultivationCycle {
  id: string;
  goal: string;
  context: string;
  purpose: string;
  quality: string;
  stage: CultivationStage;
  stageIndex: number;
  status: CultivationStatus;
  projection: CultivationProjection;
  next: string | null;
  observations: CultivationObservation[];
  humanDesign?: HumanDesignContext;
  createdAt: string;
  updatedAt: string;
  integratedAt?: string;
  integrationSummary?: string;
}

export interface CultivationState {
  cycles: CultivationCycle[];
  verifiedProgress: number;
}

export interface StartCultivationInput {
  goal: string;
  context?: string;
  purpose?: string;
  who?: string;
  where?: string;
  when?: string;
  why?: string;
  humanDesign?: HumanDesignContext;
}

export interface ObserveCultivationInput {
  worked: boolean;
  actualOutcome: string;
  evidence?: string;
  friction?: string;
}

const NEXT: Record<CultivationStage, string> = {
  awareness: "Name what is actually happening and what outcome would count as better.",
  orientation: "Read the situation through Who / What / Where / When / Why without collapsing the dimensions.",
  cultivation: "Choose the quality or capability to practice so you improve with the outcome.",
  action: "Make the smallest real-world move that can test the current hypothesis.",
  integration: "Compare prediction to consequence, keep what worked, and update the next cycle.",
};

const QUALITY: Record<CultivationStage, string> = {
  awareness: "accurate self-observation",
  orientation: "clear orientation",
  cultivation: "intentional capability development",
  action: "real-world execution",
  integration: "outcome integration",
};

const clean = (value?: string | null) => String(value ?? "").trim();

export function createCultivationState(): CultivationState {
  return { cycles: [], verifiedProgress: 0 };
}

export function resolveCultivationProjection(input: StartCultivationInput): CultivationProjection {
  const goal = clean(input.goal);
  const context = clean(input.context);
  const purpose = clean(input.purpose);
  const who = clean(input.who);
  const where = clean(input.where);
  const when = clean(input.when);
  const why = clean(input.why) || purpose;

  return {
    Who: {
      dimension: "Space",
      value: who || "you and the people or systems materially involved",
      known: Boolean(who),
    },
    What: {
      dimension: "Evolution",
      value: goal || "unresolved",
      known: Boolean(goal),
    },
    Where: {
      dimension: "Being",
      value: where || context || "unresolved",
      known: Boolean(where || context),
    },
    When: {
      dimension: "Movement",
      value: when || "the current cultivation cycle",
      known: Boolean(when),
    },
    Why: {
      dimension: "Design",
      value: why || "unresolved",
      known: Boolean(why),
    },
  };
}

export function startCultivation(
  state: CultivationState | undefined,
  input: StartCultivationInput,
): CultivationState {
  const current = state ? structuredClone(state) : createCultivationState();
  const goal = clean(input.goal);
  if (!goal) throw new Error("A cultivation goal is required.");

  const now = new Date().toISOString();
  const cycle: CultivationCycle = {
    id: `cultivation-${Date.now()}-${current.cycles.length + 1}`,
    goal,
    context: clean(input.context),
    purpose: clean(input.purpose) || goal,
    quality: QUALITY.awareness,
    stage: "awareness",
    stageIndex: 0,
    status: "active",
    projection: resolveCultivationProjection(input),
    next: NEXT.awareness,
    observations: [],
    humanDesign: input.humanDesign ? structuredClone(input.humanDesign) : undefined,
    createdAt: now,
    updatedAt: now,
  };

  current.cycles.unshift(cycle);
  return current;
}

export function activeCultivation(state?: CultivationState): CultivationCycle | null {
  return state?.cycles.find((cycle) => cycle.status === "active") ?? null;
}

export function setCultivationQuality(
  state: CultivationState,
  cycleId: string,
  quality: string,
): CultivationState {
  const nextState = structuredClone(state);
  const cycle = nextState.cycles.find((item) => item.id === cycleId);
  if (!cycle) throw new Error("Cultivation cycle not found.");
  const value = clean(quality);
  if (!value) throw new Error("Cultivation quality is required.");
  cycle.quality = value;
  cycle.updatedAt = new Date().toISOString();
  return nextState;
}

export function observeCultivation(
  state: CultivationState,
  cycleId: string,
  input: ObserveCultivationInput,
): CultivationState {
  const nextState = structuredClone(state);
  const cycle = nextState.cycles.find((item) => item.id === cycleId);
  if (!cycle) throw new Error("Cultivation cycle not found.");
  if (cycle.status !== "active") throw new Error("Cultivation cycle is already integrated.");

  const actualOutcome = clean(input.actualOutcome);
  if (!actualOutcome) throw new Error("Record what actually happened before advancing.");

  cycle.observations.push({
    at: new Date().toISOString(),
    stage: cycle.stage,
    worked: Boolean(input.worked),
    actualOutcome,
    evidence: clean(input.evidence) || "user observation",
    friction: clean(input.friction) || undefined,
  });

  if (input.worked) {
    nextState.verifiedProgress += 1;
    if (cycle.stageIndex < CULTIVATION_STAGES.length - 1) {
      cycle.stageIndex += 1;
      cycle.stage = CULTIVATION_STAGES[cycle.stageIndex];
      cycle.quality = QUALITY[cycle.stage];
      cycle.next = NEXT[cycle.stage];
    } else {
      cycle.status = "integrated";
      cycle.integratedAt = new Date().toISOString();
      cycle.next = null;
    }
  } else {
    cycle.next = `Keep the ${cycle.stage} stage open. Name the friction, adjust the route, and run one smaller test.`;
  }

  cycle.updatedAt = new Date().toISOString();
  return nextState;
}

export function integrateCultivation(
  state: CultivationState,
  cycleId: string,
  summary: string,
): CultivationState {
  const nextState = structuredClone(state);
  const cycle = nextState.cycles.find((item) => item.id === cycleId);
  if (!cycle) throw new Error("Cultivation cycle not found.");

  cycle.stage = "integration";
  cycle.stageIndex = CULTIVATION_STAGES.length - 1;
  cycle.status = "integrated";
  cycle.integrationSummary = clean(summary) || "Cycle integrated from recorded observations.";
  cycle.integratedAt = new Date().toISOString();
  cycle.updatedAt = cycle.integratedAt;
  cycle.next = null;
  return nextState;
}

export function cultivationNextVector(state?: CultivationState): string {
  const active = activeCultivation(state);
  if (active) {
    return `${active.stage}: ${active.next ?? "integrate the observed result"}`;
  }

  const latest = state?.cycles[0];
  if (latest?.status === "integrated") {
    return `Carry forward what worked from “${latest.goal}” and choose the next observable cultivation goal.`;
  }

  return "Choose one real situation you want to improve and start a cultivation cycle.";
}

export function cultivationReport(state?: CultivationState) {
  const active = activeCultivation(state);
  const latest = state?.cycles[0] ?? null;
  return {
    active,
    latest,
    verifiedProgress: state?.verifiedProgress ?? 0,
    stages: [...CULTIVATION_STAGES],
    projection: INTERROGATIVE_PROJECTION,
    nextVector: cultivationNextVector(state),
  };
}
