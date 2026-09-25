import { useState, useCallback } from 'react';

export interface AwarenessScores {
  spleen: number;
  ajna: number;
  solar: number;
  heart?: number;
  mind?: number;
  [key: string]: number | undefined;
}

export interface FieldState {
  field_name: string;
  activation: number;
  dominant_gates: number[];
  awareness_type: string | null;
  coherence: number;
  resonance: Record<string, number>;
  narrative_seed: string;
}

export interface ConsciousnessResponse {
  success: boolean;
  question: string;
  codon_activations: Record<number, number>;
  awareness_scores: AwarenessScores;
  coherence_level: number;
  observer_context: {
    sun_gate: number | null;
    sun_line: number | null;
  };
  narrative_seeds: Record<string, string>;
  field_states: Record<string, FieldState>;
}

export interface GateActivations {
  success: boolean;
  gates: Record<number, number>;
  coherence_level: number;
}

export function useConsciousness() {
  const [isQuerying, setIsQuerying] = useState(false);
  const [lastResponse, setLastResponse] = useState<ConsciousnessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queryConsciousness = useCallback(async (question: string): Promise<ConsciousnessResponse | null> => {
    setIsQuerying(true);
    setError(null);
    
    try {
      const response = await fetch('/api/consciousness/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Query failed');
      }
      
      const data: ConsciousnessResponse = await response.json();
      setLastResponse(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Consciousness query failed');
      return null;
    } finally {
      setIsQuerying(false);
    }
  }, []);

  const getGateActivations = useCallback(async (): Promise<GateActivations | null> => {
    try {
      const response = await fetch('/api/consciousness/gates');
      if (!response.ok) {
        throw new Error('Failed to fetch gate activations');
      }
      return await response.json();
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, []);

  const getAwarenessScores = useCallback(async (): Promise<AwarenessScores | null> => {
    try {
      const response = await fetch('/api/consciousness/awareness');
      if (!response.ok) {
        throw new Error('Failed to fetch awareness scores');
      }
      const data = await response.json();
      return data.awareness;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, []);

  const getTopGates = useCallback((response: ConsciousnessResponse, count: number = 5): [number, number][] => {
    const entries = Object.entries(response.codon_activations)
      .map(([gate, score]) => [parseInt(gate), score] as [number, number])
      .sort((a, b) => b[1] - a[1]);
    return entries.slice(0, count);
  }, []);

  const getDominantField = useCallback((response: ConsciousnessResponse): string => {
    let maxActivation = 0;
    let dominantField = 'Core';
    
    for (const [fieldName, state] of Object.entries(response.field_states)) {
      if (state.activation > maxActivation) {
        maxActivation = state.activation;
        dominantField = fieldName;
      }
    }
    
    return dominantField;
  }, []);

  return {
    isQuerying,
    lastResponse,
    error,
    queryConsciousness,
    getGateActivations,
    getAwarenessScores,
    getTopGates,
    getDominantField,
  };
}
