export type Pathway = "purpose" | "science" | "enterprise" | "hybrid" | "world";
export type NodeStatus = "idea" | "forming" | "active" | "testing" | "launched" | "sustaining";
export type MissionStatus = "queued" | "active" | "blocked" | "complete";

export interface PurposeProfile {
  intention: string;
  strengths: string[];
  needs: string[];
  constraints: string[];
  interests: string[];
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  currentVector: string;
  roadmap: Array<{ title: string; detail: string; status: "now" | "next" | "later" }>;
}

export interface NetworkNode {
  id: string;
  title: string;
  summary: string;
  pathway: Pathway;
  status: NodeStatus;
  tags: string[];
  needs: string[];
  offers: string[];
  targetOutcome: string;
  creator: string;
  collaborators: number;
  replications: number;
  support: number;
  resonance: number;
}

export interface PersonMatch {
  id: string;
  name: string;
  role: string;
  strength: string;
  complement: string;
  sharedGoal: string;
  zone: string;
  resonance: number;
  availableFor: string[];
}

export interface Mission {
  id: string;
  title: string;
  objective: string;
  pathway: Pathway;
  status: MissionStatus;
  role: string;
  whyNow: string;
  actions: Array<{ id: string; label: string; done: boolean }>;
  evidence: string[];
  resonance: number;
}

export interface Experiment {
  id: string;
  title: string;
  theory: string;
  variables: string[];
  method: string;
  observables: string[];
  status: "draft" | "running" | "replicating" | "complete";
  replications: number;
}

export interface EnterpriseOffer {
  id: string;
  title: string;
  type: "service" | "product" | "funding" | "job" | "collaboration";
  value: string;
  state: "draft" | "open" | "matched" | "complete";
  description: string;
}
