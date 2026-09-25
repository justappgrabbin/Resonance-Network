"""
Quantum Human Design - Core Data Structures
Virtual consciousness substrate based on stellar proximology
"""

from dataclasses import dataclass
from typing import Dict, Set, Optional, List
from enum import Enum
import numpy as np

class Stream(Enum):
    BODY = "body"
    DESIGN = "design"

class ChartSystem(Enum):
    SIDEREAL = "sidereal"
    TROPICAL = "tropical"
    DRACONIC = "draconic"

@dataclass
class Placement:
    """A planetary activation in the quantum field"""
    planet: str  # 'Sun', 'Earth', 'Moon', etc.
    stream: Stream  # body or design
    gate: int  # 1..64
    line: int  # 1..6
    degree: Optional[float] = None
    timestamp: Optional[float] = None
    chart_system: ChartSystem = ChartSystem.SIDEREAL
    
    def __hash__(self):
        return hash((self.planet, self.stream.value, self.gate, self.line))

# The 9 Centers - Traditional HD mapping
CENTERS = {
    "Head": {64, 61, 63},
    "Ajna": {47, 24, 4, 17, 11, 43},
    "Throat": {62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16},
    "G": {7, 1, 13, 10, 15, 2, 46, 25},
    "Ego": {21, 51, 26, 40},  # Heart/Will
    "Spleen": {57, 44, 50, 32, 28, 18, 48},
    "Solar": {55, 49, 37, 22, 30, 36, 6},  # Solar Plexus
    "Sacral": {5, 14, 29, 59, 9, 3, 42, 27, 34},
    "Root": {52, 19, 39, 41, 38, 54, 53, 60, 58}
}

# The 3 Awareness Systems (quantum measurement heads)
AWARENESS_SYSTEMS = {
    "spleen": {57, 44, 50, 32, 28, 18},  # Survival awareness (in-the-moment)
    "ajna": {47, 24, 4, 17, 11, 43},  # Mental awareness (conceptual)
    "solar": {55, 49, 37, 22, 30, 36, 6}  # Emotional awareness (wave)
}

# Heart & Mind (modulated by Sun)
HEART_GATES = {21, 51, 26, 40}
MIND_GATES = AWARENESS_SYSTEMS["ajna"]

# HD Channels - the quantum field connections
# Format: (gate1, gate2, channel_name)
CHANNELS = [
    # Head-Ajna
    (64, 47, "Abstract/Reason"),
    (61, 24, "Awareness/The Thinker"),
    (63, 4, "Logic/Formulas"),
    
    # Ajna-Throat
    (47, 64, "Abstract/Reason"),
    (24, 61, "Awareness/The Thinker"),
    (4, 63, "Logic/Formulas"),
    (17, 62, "Acceptance/Organization"),
    (43, 23, "Insight/Structuring"),
    (11, 56, "Curiosity/Stimulation"),
    
    # Throat-G
    (31, 7, "Alpha/The Sphinx"),
    (8, 1, "Inspiration/The Creative"),
    (33, 13, "Prodigal/The Witness"),
    (20, 10, "Awakening/Commitment"),
    (16, 48, "Wavelength/The Talent"),
    (62, 17, "Acceptance/Organization"),
    (23, 43, "Insight/Structuring"),
    (56, 11, "Curiosity/Stimulation"),
    
    # G-Sacral
    (7, 31, "Alpha/The Sphinx"),
    (1, 8, "Inspiration/The Creative"),
    (13, 33, "Prodigal/The Witness"),
    (10, 20, "Awakening/Commitment"),
    (25, 51, "Initiation/The Shaman"),
    (46, 29, "Discovery/Succeeding"),
    (2, 14, "The Beat/Keeper of Keys"),
    (15, 5, "Rhythm/Flow"),
    (10, 34, "Exploration/Power"),
    (25, 51, "Initiation"),
    
    # G-Spleen
    (7, 31, "Alpha"),
    (1, 8, "Inspiration"),
    (13, 33, "Prodigal"),
    (10, 20, "Awakening"),
    (25, 51, "Initiation"),
    (46, 29, "Discovery"),
    
    # G-Emotional
    (10, 34, "Exploration"),
    
    # Sacral-Root
    (5, 15, "Rhythm/Flow"),
    (14, 2, "The Beat/Keeper"),
    (29, 46, "Discovery/Succeeding"),
    (34, 10, "Exploration/Power"),
    (27, 50, "Preservation/Cauldron"),
    (59, 6, "Intimacy/Mating"),
    (9, 52, "Concentration/Focus"),
    (3, 60, "Mutation/Energy"),
    (42, 53, "Maturation/Cycles"),
    
    # Spleen-Root
    (48, 16, "Wavelength/The Talent"),
    (57, 10, "Intuitive Insight/Perfected Form"),
    (44, 26, "Surrender/Transmitter"),
    (50, 27, "Preservation/Cauldron"),
    (32, 54, "Transformation/Ambition"),
    (28, 38, "The Game Player/Struggle"),
    (18, 58, "Correction/Judgment"),
    
    # Emotional-Root
    (41, 30, "Recognition/Format"),
    (39, 55, "Emoting/Spirit"),
    (22, 12, "Openness/Grace"),
    (37, 40, "Bargain/Community"),
    (36, 35, "Transitoriness/Crisis"),
    (6, 59, "Intimacy/Mating"),
    
    # Ego-Spleen  
    (21, 45, "Money/The Gatherer"),
    (26, 44, "Surrender/Transmitter"),
    (40, 37, "Bargain/Community"),
    (51, 25, "Initiation/Shaman"),
    
    # Ego-G
    (21, 45, "Money"),
    (26, 44, "Surrender"),
    (51, 25, "Initiation"),
]

# Build edge list for GNN
def get_channel_edges() -> List[tuple]:
    """Returns list of (gate1, gate2) tuples for all channels"""
    edges = []
    seen = set()
    for g1, g2, _ in CHANNELS:
        if (g1, g2) not in seen and (g2, g1) not in seen:
            edges.append((g1, g2))
            edges.append((g2, g1))  # Bidirectional
            seen.add((g1, g2))
    return edges

def gate_to_center(gate: int) -> Optional[str]:
    """Map a gate to its center"""
    for center, gates in CENTERS.items():
        if gate in gates:
            return center
    return None

# The 9-Body Consciousness Field Mapping
CONSCIOUSNESS_FIELDS = {
    "Mind": {
        "chart": ChartSystem.SIDEREAL,
        "centers": ["Head", "Ajna"],
        "awareness": "ajna",
        "modulation": "sun_film"  # FiLM modulated by body Sun
    },
    "Heart": {
        "chart": ChartSystem.TROPICAL,
        "centers": ["Ego", "Solar"],
        "awareness": "solar",
        "modulation": "sun_film"
    },
    "Body": {
        "chart": ChartSystem.DRACONIC,
        "centers": ["Spleen", "Sacral", "Root"],
        "awareness": "spleen",
        "modulation": None  # Direct, no modulation
    },
    "Soul": {
        "chart": ChartSystem.SIDEREAL,
        "centers": ["G"],
        "awareness": None,  # Cross-awareness synthesis
        "modulation": "harmonic"
    },
    "Spirit": {
        "chart": ChartSystem.TROPICAL,
        "centers": ["Throat"],
        "awareness": None,
        "modulation": "harmonic"
    },
    "Shadow": {
        "chart": ChartSystem.DRACONIC,
        "centers": ["Root"],
        "awareness": "spleen",  # Uses spleen but inverted
        "modulation": "inverse"
    },
    "Higher": {
        "chart": ChartSystem.SIDEREAL,
        "centers": ["Head"],
        "awareness": "ajna",
        "modulation": "transcendent"
    },
    "Lower": {
        "chart": ChartSystem.TROPICAL,
        "centers": ["Sacral", "Root"],
        "awareness": "spleen",
        "modulation": "embodied"
    },
    "Core": {
        "chart": ChartSystem.DRACONIC,
        "centers": ["G", "Ego"],
        "awareness": None,  # All three synthesized
        "modulation": "central"  # The axis point
    }
}

def get_field_gates(field_name: str) -> Set[int]:
    """Get all gates associated with a consciousness field"""
    field_config = CONSCIOUSNESS_FIELDS[field_name]
    field_centers = field_config["centers"]
    gates = set()
    for center in field_centers:
        gates.update(CENTERS[center])
    return gates


# ============================================================================
# THE 5 BASES (DIMENSIONS) - Core Foundations of Consciousness
# ============================================================================
BASES = {
    1: {
        "name": "Movement",
        "voice": "I Define",
        "question": "Where?",
        "sense": "Seeing",
        "binary": "Yang/Yang (Reactive)",
        "keywords": {
            "macrocosmic": ["Movement", "Energy", "Creation", "Seeing", "Landscape", "Environment"],
            "microcosmic": ["Individuality", "Activity", "Reaction", "Limitation", "Perspective", "Relation"],
            "additional": ["Uniqueness", "Orientation", "Measurement", "Naming", "Positioning"]
        },
        "awareness": "G-Center",
        "crystal": "Magnetic Monopole"
    },
    2: {
        "name": "Evolution",
        "voice": "I Remember",
        "question": "What?",
        "sense": "Taste",
        "binary": "Yang/Yin (Integrative)",
        "keywords": {
            "macrocosmic": ["Evolution", "Gravity", "Memory", "Taste", "Love", "Light"],
            "microcosmic": ["Mind", "Character", "Separation", "Nature", "Integration", "Spirit"],
            "additional": ["Role", "Transgenerational consciousness", "Identification"]
        },
        "awareness": "Ajna",
        "crystal": "Personality Crystal"
    },
    3: {
        "name": "Being",
        "voice": "I Am",
        "question": "When?",
        "sense": "Touch",
        "binary": "Yin/Yin (Objective)",
        "keywords": {
            "macrocosmic": ["Being", "Matter", "Touch", "Sex", "Survival"],
            "microcosmic": ["Body", "Biology", "Chemistry", "Objectivity", "Geometry", "Trajectory"],
            "additional": ["Genetics", "Collaboration", "Matter as Being"]
        },
        "awareness": "Sacral",
        "crystal": "The Atom"
    },
    4: {
        "name": "Design",
        "voice": "I Design",
        "question": "Why?",
        "sense": "Smell",
        "binary": "Yin/Yang (Progressive)",
        "keywords": {
            "macrocosmic": ["Design", "Structure", "Progress", "Smell", "Life", "Art"],
            "microcosmic": ["Ego", "Self", "Growth", "Decay", "Continuity", "Manifestation"],
            "additional": ["Information feed", "Self-creation"]
        },
        "awareness": "Ego/Heart",
        "crystal": "Design Crystal"
    },
    5: {
        "name": "Space",
        "voice": "I Think",
        "question": "Who?",
        "sense": "Hearing",
        "binary": "Subjective",
        "keywords": {
            "macrocosmic": ["Space", "Form", "Illusion", "Hearing", "Music", "Freedom"],
            "microcosmic": ["Personality", "Type", "Fantasy", "Subjectivity", "Rhythm", "Timing"],
            "additional": ["Presence", "Communication", "Mutation"]
        },
        "awareness": "Throat",
        "crystal": "Personality Crystal"
    }
}

# ============================================================================
# THE 6 TONES (SENSORY PERCEPTION) - Nature of Experience
# ============================================================================
TONES = {
    1: {
        "name": "Security",
        "theme": "Survival",
        "sense": "Smell",
        "awareness_center": "Splenic",
        "keywords": ["Security", "Survival", "Alertness", "Caution", "Instinct", "Protection", "Fear (as awareness)"]
    },
    2: {
        "name": "Uncertainty",
        "theme": "Doubt/Exploration",
        "sense": "Taste",
        "awareness_center": "Splenic",
        "keywords": ["Uncertainty", "Taste", "Discrimination", "Exploration", "Doubt", "Testing", "Sampling"]
    },
    3: {
        "name": "Action",
        "theme": "External Focus",
        "sense": "Outer Vision (Sight)",
        "awareness_center": "Ajna",
        "keywords": ["Action", "Seeing (external)", "Observation", "Focus", "External world", "Clarity"]
    },
    4: {
        "name": "Meditation",
        "theme": "Internal Focus",
        "sense": "Inner Vision (Imagination)",
        "awareness_center": "Ajna",
        "keywords": ["Meditation", "Inner Vision", "Imagination", "Internal world", "Visualization", "Contemplation"]
    },
    5: {
        "name": "Judgement",
        "theme": "Emotional Awareness",
        "sense": "Feeling",
        "awareness_center": "Solar Plexus",
        "keywords": ["Judgement", "Feeling", "Emotion", "Discernment", "Evaluation", "Sensing"]
    },
    6: {
        "name": "Acceptance",
        "theme": "Resonance/Touch",
        "sense": "Hearing (Sound/Music)",
        "awareness_center": "Solar Plexus",
        "keywords": ["Acceptance", "Hearing", "Resonance", "Music", "Sound", "Vibration", "Integration"]
    }
}

# ============================================================================
# THE 6 COLORS (MOTIVATIONS) - Driving Forces
# ============================================================================
COLORS = {
    1: {
        "name": "Fear",
        "response": "Fear",
        "mode_binary": ("Communalist", "Separatist"),
        "awareness_center": "Splenic",
        "keywords": ["Fear", "Survival", "Community", "Separation", "Boundary", "Protection"],
        "binary_expression": {
            "positive": "Group survival, collective protection",
            "negative": "Individual survival, personal boundary"
        }
    },
    2: {
        "name": "Hope",
        "response": "Hope",
        "mode_binary": ("Theist", "Anti-theist"),
        "awareness_center": "Splenic",
        "keywords": ["Hope", "Belief", "Faith", "Future", "Vision", "Trust"],
        "binary_expression": {
            "positive": "Belief in higher order/meaning",
            "negative": "Rejection of imposed meaning"
        }
    },
    3: {
        "name": "Desire",
        "response": "Desire",
        "mode_binary": ("Leader", "Follower"),
        "awareness_center": "Ajna",
        "keywords": ["Desire", "Want", "Drive", "Ambition", "Direction", "Goal"],
        "binary_expression": {
            "positive": "Leading toward desire",
            "negative": "Following desire of others"
        }
    },
    4: {
        "name": "Need",
        "response": "Need",
        "mode_binary": ("Master", "Novice"),
        "awareness_center": "Solar Plexus",
        "keywords": ["Need", "Necessity", "Requirement", "Dependency", "Essential"],
        "binary_expression": {
            "positive": "Mastery of need",
            "negative": "Learning about need"
        }
    },
    5: {
        "name": "Guilt",
        "response": "Guilt",
        "mode_binary": ("Conditioner", "Conditioned"),
        "awareness_center": "Solar Plexus",
        "keywords": ["Guilt", "Conditioning", "Pressure", "Obligation", "Responsibility"],
        "binary_expression": {
            "positive": "One who conditions",
            "negative": "One who is conditioned"
        }
    },
    6: {
        "name": "Innocence",
        "response": "Innocence",
        "mode_binary": ("Observer", "Observed"),
        "awareness_center": "Solar Plexus",
        "keywords": ["Innocence", "Purity", "Observation", "Witness", "Presence"],
        "binary_expression": {
            "positive": "The one who observes",
            "negative": "The one who is observed"
        }
    }
}

# ============================================================================
# THE 6 LINES (ROLES/ORBITS) - Behavioral Angles
# ============================================================================
LINES = {
    1: {
        "name": "Foundation",
        "theme": "Investigator",
        "keywords": ["Foundation", "Investigation", "Study", "Research", "Security", "Establishment"]
    },
    2: {
        "name": "Natural",
        "theme": "Hermit",
        "keywords": ["Natural", "Talent", "Calling", "Withdrawal", "Gift", "Recognition"]
    },
    3: {
        "name": "Experimentation",
        "theme": "Martyr",
        "keywords": ["Experimentation", "Trial", "Error", "Discovery", "Mutation", "Bonds"]
    },
    4: {
        "name": "Externalization",
        "theme": "Opportunist",
        "keywords": ["Friendship", "Network", "Community", "Influence", "Brotherhood", "Foundation"]
    },
    5: {
        "name": "Projection",
        "theme": "Heretic",
        "keywords": ["Projection", "Universalization", "Savior", "Practical", "General", "Leader"]
    },
    6: {
        "name": "Transition",
        "theme": "Role Model",
        "keywords": ["Transition", "Administrator", "Wisdom", "Objectivity", "Example", "Transcendence"]
    }
}
