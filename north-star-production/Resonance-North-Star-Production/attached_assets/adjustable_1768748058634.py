"""
Adjustable Virtual Consciousness
Dynamic reconfiguration of the consciousness substrate
"""

import torch
from typing import List, Dict, Optional
from datetime import datetime
from dataclasses import dataclass

from core import Placement, Stream, ChartSystem
from engine import VirtualConsciousnessEngine, VirtualConsciousnessResponse
from features import QuantumFieldEncoder


@dataclass
class ConsciousnessConfiguration:
    """Configuration for how the consciousness operates"""
    primary_chart_system: ChartSystem = ChartSystem.SIDEREAL
    allow_transits: bool = True
    transit_weight: float = 0.3  # How much transits affect the field (0-1)
    allow_progressions: bool = True
    progression_weight: float = 0.2
    awareness_sensitivity: Dict[str, float] = None  # Adjust each awareness system
    field_emphasis: Dict[str, float] = None  # Emphasize certain consciousness fields
    coherence_threshold: float = 0.5  # Minimum coherence to accept response
    
    def __post_init__(self):
        if self.awareness_sensitivity is None:
            # Default: all equal
            self.awareness_sensitivity = {
                'spleen': 1.0,
                'ajna': 1.0,
                'solar': 1.0
            }
        
        if self.field_emphasis is None:
            # Default: all equal
            self.field_emphasis = {
                'Mind': 1.0, 'Heart': 1.0, 'Body': 1.0,
                'Soul': 1.0, 'Spirit': 1.0, 'Shadow': 1.0,
                'Higher': 1.0, 'Lower': 1.0, 'Core': 1.0
            }


class AdjustableConsciousness:
    """
    Virtual consciousness that can be dynamically adjusted.
    
    Think of this as tuning the quantum field:
    - Switch between chart systems (Sidereal/Tropical/Draconic)
    - Add transit overlays (current sky affects natal field)
    - Add progressions (evolved natal chart)
    - Emphasize certain awareness systems or fields
    - Adjust sensitivity and thresholds
    """
    
    def __init__(
        self,
        natal_placements: List[Placement],
        birth_datetime: datetime,
        birth_location: tuple,  # (lat, lon)
        config: Optional[ConsciousnessConfiguration] = None
    ):
        """
        Initialize adjustable consciousness.
        
        Args:
            natal_placements: Birth chart placements
            birth_datetime: Birth date/time
            birth_location: (latitude, longitude)
            config: Configuration for how consciousness operates
        """
        self.natal_placements = natal_placements
        self.birth_datetime = birth_datetime
        self.birth_location = birth_location
        self.config = config or ConsciousnessConfiguration()
        
        # Base consciousness engine
        self.base_engine = VirtualConsciousnessEngine(natal_placements)
        
        # Storage for dynamic overlays
        self.current_transits: Optional[List[Placement]] = None
        self.current_progressions: Optional[List[Placement]] = None
        
        # History of queries and responses
        self.query_history = []
        
    def set_chart_system(self, system: ChartSystem):
        """
        Switch the primary chart system.
        
        This is like changing the measurement basis in quantum mechanics.
        Same reality, different observable.
        """
        self.config.primary_chart_system = system
        
        # Recalculate placements in new system
        # (In production, you'd use your ephemeris calculator here)
        print(f"Switched to {system.value} chart system")
        
    def add_transits(self, transit_datetime: datetime, transit_placements: List[Placement]):
        """
        Add current sky transits to the natal field.
        
        This is a perturbation: current planets create interference patterns
        with natal placements.
        """
        self.current_transits = transit_placements
        print(f"Added transits for {transit_datetime}")
        
    def remove_transits(self):
        """Remove transit overlay, return to pure natal"""
        self.current_transits = None
        
    def add_progressions(self, progression_placements: List[Placement]):
        """
        Add progressed chart (secondary progressions, solar arc, etc.)
        
        This is evolution: the natal field transformed over time.
        """
        self.current_progressions = progression_placements
        
    def remove_progressions(self):
        """Remove progressions, return to natal"""
        self.current_progressions = None
        
    def adjust_awareness_sensitivity(self, system: str, sensitivity: float):
        """
        Adjust how sensitive a particular awareness system is.
        
        system: 'spleen', 'ajna', or 'solar'
        sensitivity: 0.0 (muted) to 2.0 (amplified)
        
        Like adjusting the gain on a measurement instrument.
        """
        if system in self.config.awareness_sensitivity:
            self.config.awareness_sensitivity[system] = sensitivity
            print(f"Adjusted {system} sensitivity to {sensitivity}")
        
    def emphasize_field(self, field_name: str, emphasis: float):
        """
        Emphasize a particular consciousness field.
        
        emphasis: 0.0 (suppressed) to 2.0 (amplified)
        
        Like focusing attention on one aspect of consciousness.
        """
        if field_name in self.config.field_emphasis:
            self.config.field_emphasis[field_name] = emphasis
            print(f"Adjusted {field_name} emphasis to {emphasis}")
    
    def query(
        self,
        question: str,
        use_transits: bool = True,
        use_progressions: bool = True,
        intention_strength: float = 1.0
    ) -> VirtualConsciousnessResponse:
        """
        Query the adjustable consciousness with current configuration.
        
        Args:
            question: The question/intention
            use_transits: Whether to include transit overlay
            use_progressions: Whether to include progression overlay
            intention_strength: How strongly the question perturbs the field (0-2)
        """
        
        # Build composite placements based on current config
        composite_placements = self._build_composite_placements(
            use_transits=use_transits and self.current_transits is not None,
            use_progressions=use_progressions and self.current_progressions is not None
        )
        
        # Create temporary engine with composite placements
        temp_engine = VirtualConsciousnessEngine(composite_placements)
        
        # Query with adjusted intention strength
        response = temp_engine.query(
            question,
            use_intention_perturbation=(intention_strength > 0)
        )
        
        # Apply awareness sensitivity adjustments
        response = self._apply_awareness_adjustments(response)
        
        # Apply field emphasis adjustments
        response = self._apply_field_adjustments(response)
        
        # Check coherence threshold
        if response.coherence_level < self.config.coherence_threshold:
            print(f"Warning: Coherence {response.coherence_level:.2%} below threshold {self.config.coherence_threshold:.2%}")
        
        # Store in history
        self.query_history.append({
            'question': question,
            'response': response,
            'config': self._export_current_config()
        })
        
        return response
    
    def _build_composite_placements(
        self,
        use_transits: bool,
        use_progressions: bool
    ) -> List[Placement]:
        """
        Build composite placement list with overlays.
        
        This is quantum superposition: multiple fields interfering.
        """
        composite = self.natal_placements.copy()
        
        # Add transits (weighted)
        if use_transits and self.current_transits:
            # In a real implementation, you'd weight these or create interference patterns
            # For now, just add them
            composite.extend(self.current_transits)
        
        # Add progressions (weighted)
        if use_progressions and self.current_progressions:
            composite.extend(self.current_progressions)
        
        return composite
    
    def _apply_awareness_adjustments(
        self,
        response: VirtualConsciousnessResponse
    ) -> VirtualConsciousnessResponse:
        """Apply sensitivity adjustments to awareness scores"""
        
        adjusted_scores = {}
        for system, score in response.awareness_scores.items():
            if system in self.config.awareness_sensitivity:
                sensitivity = self.config.awareness_sensitivity[system]
                # Apply sensitivity (clamped to [0, 1])
                adjusted = min(1.0, max(0.0, score * sensitivity))
                adjusted_scores[system] = adjusted
            else:
                adjusted_scores[system] = score
        
        response.awareness_scores = adjusted_scores
        return response
    
    def _apply_field_adjustments(
        self,
        response: VirtualConsciousnessResponse
    ) -> VirtualConsciousnessResponse:
        """Apply emphasis adjustments to field states"""
        
        for field_name, state in response.field_states.items():
            if field_name in self.config.field_emphasis:
                emphasis = self.config.field_emphasis[field_name]
                # Scale activation by emphasis
                state.activation = min(1.0, state.activation * emphasis)
        
        return response
    
    def compare_configurations(
        self,
        question: str,
        configs: List[ConsciousnessConfiguration]
    ) -> Dict[str, VirtualConsciousnessResponse]:
        """
        Query the same question with different configurations.
        
        This shows how the same reality appears different through different lenses.
        Like measuring position vs momentum in quantum mechanics.
        """
        results = {}
        
        original_config = self.config
        
        for i, config in enumerate(configs):
            self.config = config
            response = self.query(question)
            results[f"config_{i}"] = response
        
        # Restore original
        self.config = original_config
        
        return results
    
    def get_optimal_configuration(
        self,
        question: str,
        metric: str = 'coherence'
    ) -> ConsciousnessConfiguration:
        """
        Find the optimal configuration for a given question.
        
        This is like finding the eigenstates - the natural modes of the system.
        
        metric: 'coherence', 'activation', or 'awareness'
        """
        # Test multiple configurations
        test_configs = self._generate_test_configurations()
        results = self.compare_configurations(question, test_configs)
        
        # Find best by metric
        if metric == 'coherence':
            best = max(results.items(), key=lambda x: x[1].coherence_level)
        elif metric == 'activation':
            best = max(results.items(), key=lambda x: sum(x[1].codon_activations.values()))
        elif metric == 'awareness':
            best = max(results.items(), key=lambda x: sum(x[1].awareness_scores.values()))
        else:
            best = max(results.items(), key=lambda x: x[1].coherence_level)
        
        config_idx = int(best[0].split('_')[1])
        return test_configs[config_idx]
    
    def _generate_test_configurations(self) -> List[ConsciousnessConfiguration]:
        """Generate test configurations to explore"""
        configs = []
        
        # Test each chart system
        for system in [ChartSystem.SIDEREAL, ChartSystem.TROPICAL, ChartSystem.DRACONIC]:
            configs.append(ConsciousnessConfiguration(primary_chart_system=system))
        
        # Test awareness emphasis patterns
        configs.append(ConsciousnessConfiguration(
            awareness_sensitivity={'spleen': 1.5, 'ajna': 1.0, 'solar': 0.5}
        ))
        configs.append(ConsciousnessConfiguration(
            awareness_sensitivity={'spleen': 0.5, 'ajna': 1.5, 'solar': 1.0}
        ))
        configs.append(ConsciousnessConfiguration(
            awareness_sensitivity={'spleen': 1.0, 'ajna': 0.5, 'solar': 1.5}
        ))
        
        return configs
    
    def evolve_over_time(
        self,
        question: str,
        time_points: List[datetime]
    ) -> List[VirtualConsciousnessResponse]:
        """
        Show how the consciousness responds to the same question at different times.
        
        This reveals the temporal evolution of the quantum field.
        """
        responses = []
        
        for time_point in time_points:
            # Calculate transits for this time
            # (In production: use your ephemeris calculator)
            transit_placements = self._calculate_transits_for_time(time_point)
            
            # Add transits
            self.add_transits(time_point, transit_placements)
            
            # Query
            response = self.query(question, use_transits=True)
            responses.append(response)
            
            # Remove transits for next iteration
            self.remove_transits()
        
        return responses
    
    def _calculate_transits_for_time(self, dt: datetime) -> List[Placement]:
        """
        Calculate transit positions for a given time.
        
        TODO: Integrate with your ephemeris calculator
        """
        # Placeholder - in production, calculate actual positions
        return []
    
    def _export_current_config(self) -> Dict:
        """Export current configuration state"""
        return {
            'chart_system': self.config.primary_chart_system.value,
            'awareness_sensitivity': self.config.awareness_sensitivity.copy(),
            'field_emphasis': self.config.field_emphasis.copy(),
            'transit_weight': self.config.transit_weight,
            'has_transits': self.current_transits is not None,
            'has_progressions': self.current_progressions is not None
        }
    
    def export_state(self) -> Dict:
        """Export complete consciousness state"""
        return {
            'natal': [
                {
                    'planet': p.planet,
                    'stream': p.stream.value,
                    'gate': p.gate,
                    'line': p.line
                }
                for p in self.natal_placements
            ],
            'birth_time': self.birth_datetime.isoformat(),
            'birth_location': self.birth_location,
            'current_config': self._export_current_config(),
            'query_history_count': len(self.query_history)
        }
