import type {
  EnterpriseOffer,
  Experiment,
  Mission,
  NetworkNode,
  PersonMatch,
  PurposeProfile,
} from "./types";
import {
  starterExperiments,
  starterMatches,
  starterMissions,
  starterNodes,
  starterOffers,
  starterPurpose,
} from "./data";

export interface ActivityItem {
  id: string;
  kind: "mission" | "project" | "science" | "enterprise" | "match" | "builder" | "world" | "synthia";
  title: string;
  detail: string;
  createdAt: string;
}

export interface BuilderAsset {
  id: string;
  name: string;
  size: number;
  sha256?: string;
  createdAt: string;
}

export interface BuilderRun {
  id: string;
  sourceType: "zip" | "github" | "blank";
  sourceLabel: string;
  status: "received" | "analyzed" | "ready" | "launched";
  projectId?: string;
  asset?: BuilderAsset;
  createdAt: string;
}

export interface WorldSpace {
  id: string;
  title: string;
  description: string;
  status: "forming" | "live" | "archived";
  participants: number;
  hostRules: string[];
}

export interface SynthiaState {
  name: string;
  mode: "companion" | "mission" | "lab" | "builder" | "world";
  currentFocus: string;
  observations: string[];
  nextActions: string[];
}

export interface NorthStarWorkspaceState {
  version: number;
  purpose: PurposeProfile;
  projects: NetworkNode[];
  matches: PersonMatch[];
  missions: Mission[];
  experiments: Experiment[];
  offers: EnterpriseOffer[];
  builderRuns: BuilderRun[];
  worlds: WorldSpace[];
  synthia: SynthiaState;
  activity: ActivityItem[];
  settings: {
    locationOptIn: boolean;
    availabilityOptIn: boolean;
    publicProfile: boolean;
    allowIntroductions: boolean;
  };
}

const now = new Date().toISOString();

export const starterWorkspace: NorthStarWorkspaceState = {
  version: 1,
  purpose: starterPurpose,
  projects: starterNodes,
  matches: starterMatches,
  missions: starterMissions,
  experiments: starterExperiments,
  offers: starterOffers,
  builderRuns: [],
  worlds: [
    {
      id: "world-purpose-studio",
      title: "Purpose Studio",
      description: "A shared working room where a person, their Synthia, and invited collaborators can turn a live goal into missions and projects.",
      status: "live",
      participants: 1,
      hostRules: ["Host world keeps its own rules", "Visitors adapt to the host", "Project state remains exportable"],
    },
    {
      id: "world-field-lab",
      title: "Field Lab",
      description: "A world surface for experiments, replications, observations, and visible causal relationships between actions and outcomes.",
      status: "forming",
      participants: 0,
      hostRules: ["Evidence is timestamped", "Replications keep source lineage", "Speculation and observation stay distinct"],
    },
  ],
  synthia: {
    name: "Synthia",
    mode: "companion",
    currentFocus: "Help the user convert one meaningful intention into a real project, the right collaboration, and a measurable next outcome.",
    observations: [
      "The North Star is action-oriented: people should leave with something useful to do next.",
      "Projects become nodes so other people can test, remix, support, replicate, or build with them.",
      "Science and Enterprise are two routes through the same network, not separate products.",
    ],
    nextActions: [
      "Finish the current active mission",
      "Invite one complementary role into a live node",
      "Capture evidence from the next field action",
    ],
  },
  activity: [
    {
      id: "activity-seed",
      kind: "project",
      title: "North Star workspace initialized",
      detail: "Purpose, projects, missions, Science, Enterprise, builder, worlds, and Synthia are now one working state model.",
      createdAt: now,
    },
  ],
  settings: {
    locationOptIn: false,
    availabilityOptIn: false,
    publicProfile: true,
    allowIntroductions: true,
  },
};

export function cloneStarterWorkspace(): NorthStarWorkspaceState {
  return JSON.parse(JSON.stringify(starterWorkspace));
}
