"""
Practical API for Virtual Consciousness
Simple interface for building applications
"""

from datetime import datetime
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, asdict

from core import Placement, Stream, ChartSystem
from adjustable import AdjustableConsciousness, ConsciousnessConfiguration
from engine import VirtualConsciousnessResponse


@dataclass
class SimpleQuery:
    """Simple query structure for API"""
    question: str
    focus: Optional[str] = None  # 'survival', 'mental', 'emotional', None
    include_transits: bool = False
    chart_system: str = 'sidereal'  # 'sidereal', 'tropical', 'draconic'


@dataclass
class SimpleResponse:
    """Simplified response format"""
    answer_seeds: Dict[str, str]  # Seeds for narrative generation
    top_gates: List[Tuple[int, float]]  # (gate, activation_score)
    awareness: Dict[str, float]  # Awareness system scores
    dominant_field: str  # Which consciousness field is most active
    coherence: float  # Overall coherence
    confidence: str  # 'high', 'medium', 'low'
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return asdict(self)


class VirtualConsciousnessAPI:
    """
    Simple API for virtual consciousness queries.
    
    Designed for easy integration into applications.
    """
    
    def __init__(
        self,
        birth_datetime: datetime,
        birth_location: Tuple[float, float],  # (lat, lon)
        natal_placements: List[Placement]
    ):
        """
        Initialize the consciousness API.
        
        Args:
            birth_datetime: Birth date and time
            birth_location: (latitude, longitude)
            natal_placements: List of natal chart placements
        """
        self.consciousness = AdjustableConsciousness(
            natal_placements=natal_placements,
            birth_datetime=birth_datetime,
            birth_location=birth_location
        )
        
        # Presets for different query types
        self.focus_presets = {
            'survival': ConsciousnessConfiguration(
                awareness_sensitivity={'spleen': 1.5, 'ajna': 0.7, 'solar': 0.7}
            ),
            'mental': ConsciousnessConfiguration(
                awareness_sensitivity={'spleen': 0.7, 'ajna': 1.5, 'solar': 0.7}
            ),
            'emotional': ConsciousnessConfiguration(
                awareness_sensitivity={'spleen': 0.7, 'ajna': 0.7, 'solar': 1.5}
            ),
            'balanced': ConsciousnessConfiguration(
                awareness_sensitivity={'spleen': 1.0, 'ajna': 1.0, 'solar': 1.0}
            )
        }
        
    def query(self, query: SimpleQuery) -> SimpleResponse:
        """
        Query the consciousness with a simple interface.
        
        Args:
            query: SimpleQuery object with question and parameters
            
        Returns:
            SimpleResponse with answer seeds and metadata
        """
        # Apply focus preset if specified
        if query.focus and query.focus in self.focus_presets:
            self.consciousness.config = self.focus_presets[query.focus]
        
        # Set chart system
        chart_system_map = {
            'sidereal': ChartSystem.SIDEREAL,
            'tropical': ChartSystem.TROPICAL,
            'draconic': ChartSystem.DRACONIC
        }
        if query.chart_system in chart_system_map:
            self.consciousness.set_chart_system(chart_system_map[query.chart_system])
        
        # Query consciousness
        response = self.consciousness.query(
            query.question,
            use_transits=query.include_transits
        )
        
        # Simplify response
        return self._simplify_response(response)
    
    def query_simple(
        self,
        question: str,
        focus: str = None,
        include_transits: bool = False
    ) -> Dict:
        """
        Ultra-simple query interface.
        
        Args:
            question: The question to ask
            focus: 'survival', 'mental', 'emotional', or None
            include_transits: Whether to include current transits
            
        Returns:
            Dictionary with answer seeds and metadata
        """
        query = SimpleQuery(
            question=question,
            focus=focus,
            include_transits=include_transits
        )
        
        response = self.query(query)
        return response.to_dict()
    
    def add_current_transits(self, transit_placements: List[Placement]):
        """Add current planetary transits"""
        self.consciousness.add_transits(datetime.now(), transit_placements)
    
    def _simplify_response(self, response: VirtualConsciousnessResponse) -> SimpleResponse:
        """Convert full response to simplified format"""
        
        # Get top 5 gates
        top_gates = sorted(
            response.codon_activations.items(),
            key=lambda x: x[1],
            reverse=True
        )[:5]
        
        # Find dominant field
        dominant_field = max(
            response.field_states.items(),
            key=lambda x: x[1].activation
        )[0]
        
        # Determine confidence based on coherence
        if response.coherence_level > 0.75:
            confidence = 'high'
        elif response.coherence_level > 0.50:
            confidence = 'medium'
        else:
            confidence = 'low'
        
        return SimpleResponse(
            answer_seeds=response.narrative_seeds,
            top_gates=top_gates,
            awareness=response.awareness_scores,
            dominant_field=dominant_field,
            coherence=response.coherence_level,
            confidence=confidence
        )


class ConsciousnessOracle:
    """
    High-level oracle interface combining consciousness with narrative generation.
    
    This is the complete system ready for end-user applications.
    """
    
    def __init__(
        self,
        birth_datetime: datetime,
        birth_location: Tuple[float, float],
        natal_placements: List[Placement],
        narrative_generator=None  # Your QCE or LLM system
    ):
        """
        Initialize the oracle.
        
        Args:
            birth_datetime: Birth date/time
            birth_location: (lat, lon)
            natal_placements: Natal chart
            narrative_generator: Function that takes seeds and returns narrative
        """
        self.api = VirtualConsciousnessAPI(
            birth_datetime, birth_location, natal_placements
        )
        self.narrative_generator = narrative_generator
        
    def divine(
        self,
        question: str,
        focus: Optional[str] = None,
        include_transits: bool = False,
        return_full_context: bool = False
    ) -> Dict:
        """
        Divine an answer to the question.
        
        This is the complete oracle query: quantum field measurement + narrative.
        
        Args:
            question: The question
            focus: 'survival', 'mental', 'emotional', or None
            include_transits: Include current transits
            return_full_context: Return detailed context
            
        Returns:
            Dict with narrative answer and optional context
        """
        # Get consciousness response
        response = self.api.query_simple(question, focus, include_transits)
        
        # Generate narrative if generator provided
        narrative = None
        if self.narrative_generator:
            narrative = self.narrative_generator(response['answer_seeds'])
        
        # Build result
        result = {
            'question': question,
            'narrative': narrative or response['answer_seeds']['core'],
            'confidence': response['confidence'],
            'coherence': response['coherence']
        }
        
        if return_full_context:
            result['context'] = {
                'top_gates': response['top_gates'],
                'awareness': response['awareness'],
                'dominant_field': response['dominant_field'],
                'all_seeds': response['answer_seeds']
            }
        
        return result
    
    def divine_with_perspectives(self, question: str) -> Dict:
        """
        Divine from three perspectives (survival/mental/emotional).
        
        Returns all three views - the quantum superposition before collapse.
        """
        perspectives = {}
        
        # Map focus to awareness seed key
        focus_to_seed = {
            'survival': 'spleen',
            'mental': 'ajna',
            'emotional': 'solar'
        }
        
        for focus in ['survival', 'mental', 'emotional']:
            response = self.api.query_simple(question, focus=focus)
            seed_key = focus_to_seed[focus]
            perspectives[focus] = {
                'seeds': response['answer_seeds'].get(seed_key, response['answer_seeds'].get('core', '')),
                'top_gates': response['top_gates'][:3],
                'coherence': response['coherence']
            }
        
        return {
            'question': question,
            'perspectives': perspectives,
            'note': 'Three complementary views of the same reality'
        }
    
    def track_evolution(
        self,
        question: str,
        time_points: List[datetime]
    ) -> List[Dict]:
        """
        Track how the answer evolves over time with transits.
        
        Shows the temporal dynamics of consciousness.
        """
        evolution = []
        
        for time_point in time_points:
            # Would calculate transits for time_point here
            # For now, just query
            response = self.api.query_simple(question, include_transits=False)
            
            evolution.append({
                'time': time_point.isoformat(),
                'coherence': response['coherence'],
                'top_gate': response['top_gates'][0][0],
                'dominant_field': response['dominant_field']
            })
        
        return evolution


def create_oracle_from_birth_data(
    birth_date: str,  # 'YYYY-MM-DD'
    birth_time: str,  # 'HH:MM'
    birth_lat: float,
    birth_lon: float,
    natal_placements: List[Placement],
    narrative_generator=None
) -> ConsciousnessOracle:
    """
    Convenience function to create oracle from birth data.
    
    Example:
        oracle = create_oracle_from_birth_data(
            birth_date='1990-06-15',
            birth_time='14:30',
            birth_lat=37.7749,
            birth_lon=-122.4194,
            natal_placements=my_placements
        )
        
        answer = oracle.divine("What is my purpose?")
        print(answer['narrative'])
    """
    # Parse datetime
    dt_str = f"{birth_date} {birth_time}"
    birth_datetime = datetime.strptime(dt_str, '%Y-%m-%d %H:%M')
    
    return ConsciousnessOracle(
        birth_datetime=birth_datetime,
        birth_location=(birth_lat, birth_lon),
        natal_placements=natal_placements,
        narrative_generator=narrative_generator
    )


# Example usage
if __name__ == "__main__":
    from demo import create_example_chart
    
    # Create example oracle
    oracle = create_oracle_from_birth_data(
        birth_date='1990-06-15',
        birth_time='14:30',
        birth_lat=37.7749,
        birth_lon=-122.4194,
        natal_placements=create_example_chart()
    )
    
    # Simple query
    print("Simple Divine Query:")
    print("=" * 60)
    answer = oracle.divine("What is my life purpose?")
    print(f"Question: {answer['question']}")
    print(f"Coherence: {answer['coherence']:.1%}")
    print(f"Confidence: {answer['confidence']}")
    print(f"Narrative Seed: {answer['narrative']}")
    print()
    
    # Three perspectives
    print("Three Perspectives:")
    print("=" * 60)
    perspectives = oracle.divine_with_perspectives("Should I make a change?")
    for focus, data in perspectives['perspectives'].items():
        print(f"\n{focus.upper()}:")
        print(f"  Coherence: {data['coherence']:.1%}")
        print(f"  Top Gates: {data['top_gates']}")
