export interface ResonanceInput {
  sharedGoals?: number;
  complementaryNeeds?: number;
  evidenceActions?: number;
  followThrough?: number;
  contextFit?: number;
  friction?: number;
}

export interface ResonanceResult {
  score: number;
  reasons: string[];
  band: "forming" | "workable" | "strong" | "high";
}

/**
 * Product-level resonance heuristic used for transparent matching feedback.
 * This is intentionally legible and inspectable: it is a coordination score,
 * not a scientific measurement or a claim about a person's worth.
 */
export function calculateResonance(input: ResonanceInput): ResonanceResult {
  const shared = clamp(input.sharedGoals ?? 0.5);
  const complement = clamp(input.complementaryNeeds ?? 0.5);
  const evidence = clamp(input.evidenceActions ?? 0.5);
  const follow = clamp(input.followThrough ?? 0.5);
  const context = clamp(input.contextFit ?? 0.5);
  const friction = clamp(input.friction ?? 0.2);

  const raw = shared * 22 + complement * 26 + evidence * 18 + follow * 18 + context * 16 - friction * 20;
  const score = Math.max(0, Math.min(100, Math.round(raw)));
  const reasons = [
    `shared-goal fit ${Math.round(shared * 100)}%`,
    `complementarity ${Math.round(complement * 100)}%`,
    `evidence ${Math.round(evidence * 100)}%`,
    `follow-through ${Math.round(follow * 100)}%`,
    `context fit ${Math.round(context * 100)}%`,
    `friction load ${Math.round(friction * 100)}%`,
  ];

  const band = score >= 85 ? "high" : score >= 70 ? "strong" : score >= 50 ? "workable" : "forming";
  return { score, reasons, band };
}

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}
