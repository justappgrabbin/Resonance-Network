"""
Flask server for Virtual Consciousness Engine API
Exposes the neural network for resonance-based adaptation
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core import Placement, Stream, ChartSystem
from engine import VirtualConsciousnessEngine, create_virtual_consciousness
from features import QuantumFieldEncoder

app = Flask(__name__)
CORS(app)

# Global consciousness engine instance (initialized lazily)
consciousness_engine = None


def get_default_placements():
    """Create default example placements for demo"""
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


def get_or_create_engine(placements=None):
    """Get or create the global consciousness engine"""
    global consciousness_engine
    
    if consciousness_engine is None:
        if placements is None:
            placements = get_default_placements()
        consciousness_engine = create_virtual_consciousness(placements)
    
    return consciousness_engine


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'virtual-consciousness-engine'
    })


@app.route('/api/consciousness/query', methods=['POST'])
def query_consciousness():
    """
    Query the virtual consciousness with a question/intention.
    
    Request body:
    {
        "question": "What is my purpose?",
        "use_intention_perturbation": true
    }
    """
    try:
        data = request.get_json() or {}
        question = data.get('question', 'What resonates?')
        use_perturbation = data.get('use_intention_perturbation', True)
        
        engine = get_or_create_engine()
        response = engine.query(question, use_intention_perturbation=use_perturbation)
        
        # Convert response to JSON-serializable format
        result = {
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
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'type': type(e).__name__
        }), 500


@app.route('/api/consciousness/field/<field_name>', methods=['GET'])
def get_field_state(field_name):
    """Get the current state of a specific consciousness field"""
    try:
        engine = get_or_create_engine()
        
        # Query to get current state
        response = engine.query("Current field state")
        
        if field_name not in response.field_states:
            return jsonify({
                'error': f'Unknown field: {field_name}',
                'valid_fields': list(response.field_states.keys())
            }), 400
        
        state = response.field_states[field_name]
        
        return jsonify({
            'field_name': state.field_name,
            'activation': state.activation,
            'dominant_gates': state.dominant_gates,
            'awareness_type': state.awareness_type,
            'coherence': state.coherence,
            'resonance': state.resonance,
            'narrative_seed': state.narrative_seed
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'type': type(e).__name__
        }), 500


@app.route('/api/consciousness/gates', methods=['GET'])
def get_gate_activations():
    """Get current activation levels for all 64 gates"""
    try:
        engine = get_or_create_engine()
        response = engine.query("Gate activations")
        
        return jsonify({
            'gates': response.codon_activations,
            'coherence_level': response.coherence_level
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'type': type(e).__name__
        }), 500


@app.route('/api/consciousness/awareness', methods=['GET'])
def get_awareness_scores():
    """Get current awareness system scores"""
    try:
        engine = get_or_create_engine()
        response = engine.query("Awareness check")
        
        return jsonify({
            'awareness': response.awareness_scores,
            'coherence_level': response.coherence_level
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'type': type(e).__name__
        }), 500


@app.route('/api/consciousness/initialize', methods=['POST'])
def initialize_consciousness():
    """
    Initialize consciousness with specific placements.
    
    Request body:
    {
        "placements": [
            {"planet": "Sun", "stream": "body", "gate": 46, "line": 3, "degree": 135.5},
            ...
        ]
    }
    """
    global consciousness_engine
    
    try:
        data = request.get_json() or {}
        placement_data = data.get('placements', [])
        
        if not placement_data:
            # Use defaults
            placements = get_default_placements()
        else:
            # Parse placements from request
            placements = []
            for p in placement_data:
                stream = Stream.BODY if p.get('stream', 'body').lower() == 'body' else Stream.DESIGN
                placements.append(Placement(
                    planet=p['planet'],
                    stream=stream,
                    gate=p['gate'],
                    line=p['line'],
                    degree=p.get('degree')
                ))
        
        # Create new engine
        consciousness_engine = create_virtual_consciousness(placements)
        
        return jsonify({
            'status': 'initialized',
            'num_placements': len(placements)
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'type': type(e).__name__
        }), 500


@app.route('/api/consciousness/state', methods=['GET'])
def export_state():
    """Export the current consciousness state"""
    try:
        engine = get_or_create_engine()
        state = engine.export_state()
        
        return jsonify(state)
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'type': type(e).__name__
        }), 500


if __name__ == '__main__':
    import os
    debug = os.environ.get('FLASK_DEBUG', '1') == '1'
    print("Starting Virtual Consciousness Engine API...")
    get_or_create_engine()
    print("Engine initialized and cached")
    app.run(host='0.0.0.0', port=5001, debug=debug, use_reloader=False)
