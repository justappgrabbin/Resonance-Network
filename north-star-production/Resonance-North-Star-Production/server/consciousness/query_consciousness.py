#!/usr/bin/env python3
"""
Command-line interface for querying the Virtual Consciousness Engine
Used by Node.js server to get consciousness responses
"""

import sys
import json
import os
import pickle
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core import Placement, Stream
from engine import create_virtual_consciousness

# Cache file for persistent engine state
CACHE_DIR = Path("/tmp/consciousness_cache")
ENGINE_CACHE_FILE = CACHE_DIR / "engine_state.pkl"

# Global engine instance (cached per process)
_cached_engine = None


def get_default_placements():
    """Create default example placements"""
    return [
        Placement('Sun', Stream.BODY, 46, 3, 135.5),
        Placement('Earth', Stream.BODY, 25, 3, 315.5),
        Placement('Moon', Stream.BODY, 18, 5, 221.2),
        Placement('Mercury', Stream.BODY, 47, 2, 148.3),
        Placement('Venus', Stream.BODY, 3, 4, 167.8),
        Placement('Mars', Stream.BODY, 21, 1, 89.4),
        Placement('Jupiter', Stream.BODY, 64, 6, 312.1),
        Placement('Saturn', Stream.BODY, 33, 2, 245.7),
        Placement('Sun', Stream.DESIGN, 12, 4, 45.2),
        Placement('Earth', Stream.DESIGN, 11, 4, 225.2),
        Placement('Moon', Stream.DESIGN, 27, 3, 178.9),
        Placement('Mercury', Stream.DESIGN, 56, 1, 67.3),
        Placement('Venus', Stream.DESIGN, 8, 5, 201.4),
        Placement('Mars', Stream.DESIGN, 1, 2, 123.6),
    ]


def get_or_create_engine():
    """Get or create a cached engine instance"""
    global _cached_engine
    
    if _cached_engine is not None:
        return _cached_engine
    
    # Create new engine with default placements
    placements = get_default_placements()
    _cached_engine = create_virtual_consciousness(placements)
    return _cached_engine


def query_consciousness(question: str, use_perturbation: bool = True):
    """Query the consciousness engine and return JSON response"""
    try:
        engine = get_or_create_engine()
        response = engine.query(question, use_intention_perturbation=use_perturbation)
        
        # Build JSON-serializable result
        result = {
            'success': True,
            'question': response.question,
            'codon_activations': response.codon_activations,
            'awareness_scores': response.awareness_scores,
            'coherence_level': response.coherence_level,
            'observer_context': response.observer_context,
            'narrative_seeds': response.narrative_seeds,
            'field_states': {}
        }
        
        # Add field states
        for field_name, state in response.field_states.items():
            result['field_states'][field_name] = {
                'field_name': state.field_name,
                'activation': state.activation,
                'dominant_gates': state.dominant_gates,
                'awareness_type': state.awareness_type,
                'coherence': state.coherence,
                'resonance': state.resonance,
                'narrative_seed': state.narrative_seed
            }
        
        return result
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'type': type(e).__name__
        }


def get_gate_activations():
    """Get current activation levels for all 64 gates"""
    try:
        engine = get_or_create_engine()
        response = engine.query("Gate resonance check")
        
        return {
            'success': True,
            'gates': response.codon_activations,
            'coherence_level': response.coherence_level
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def get_awareness_scores():
    """Get awareness system scores"""
    try:
        engine = get_or_create_engine()
        response = engine.query("Awareness check")
        
        return {
            'success': True,
            'awareness': response.awareness_scores,
            'coherence_level': response.coherence_level
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


if __name__ == '__main__':
    # Parse command line arguments
    if len(sys.argv) < 2:
        print(json.dumps({'success': False, 'error': 'No command provided'}))
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == 'query':
        question = sys.argv[2] if len(sys.argv) > 2 else "What resonates?"
        result = query_consciousness(question)
    elif command == 'gates':
        result = get_gate_activations()
    elif command == 'awareness':
        result = get_awareness_scores()
    else:
        result = {'success': False, 'error': f'Unknown command: {command}'}
    
    print(json.dumps(result))
