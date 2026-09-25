import React, { useState, useEffect, useRef } from 'react';
import { Sprout, Users, Heart, Brain, Zap, Plus, Info, X, ArrowRight, CheckCircle, Circle, TrendingUp, Activity, Leaf, TreeDeciduous, Sparkles, BookOpen, Target, Shield } from 'lucide-react';

/**
 * PAPER SEED - THE LIVING TREE
 * 
 * A self-evolving organism that grows as people join
 * - Each person nourishes specific gates
 * - The tree grows organically based on contributions
 * - Health is tracked across all 64 gates
 * - Education happens through experience, not lectures
 * - The system becomes autonomous over time
 */

export default function PaperSeedLivingTree() {
  // CORE STATE
  const [treeGrowth, setTreeGrowth] = useState(0); // 0-100
  const [participants, setParticipants] = useState([]);
  const [currentView, setCurrentView] = useState('tree'); // tree, join, gates, health, education
  const [selectedGate, setSelectedGate] = useState(null);
  const [isGrowing, setIsGrowing] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // ORGANISM HEALTH
  const [organismHealth, setOrganismHealth] = useState({
    overall: 0,
    coherence: 100,
    vitality: 0,
    diversity: 0,
    autonomy: 0
  });

  // GATE HEALTH (64 gates)
  const [gateHealth, setGateHealth] = useState({});

  // Initialize gate health
  useEffect(() => {
    const initialGates = {};
    for (let i = 1; i <= 64; i++) {
      initialGates[i] = {
        health: 0,
        contributors: [],
        nourishment: 0,
        education_level: 0
      };
    }
    setGateHealth(initialGates);
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // GATE DEFINITIONS - 64 Gates with Educational Content
  // ═══════════════════════════════════════════════════════════════

  const GATE_INFO = {
    1: { name: 'Self-Expression', role: 'Creative Liver', teaches: 'Authentic creation', stream: 'emotional' },
    2: { name: 'Receptivity', role: 'Allowing Kidney', teaches: 'Receiving support', stream: 'emotional' },
    3: { name: 'Ordering', role: 'Innovation Heart', teaches: 'New beginnings', stream: 'body' },
    4: { name: 'Answers', role: 'Understanding Brain', teaches: 'Mental clarity', stream: 'mental' },
    5: { name: 'Waiting', role: 'Patience Organ', teaches: 'Natural timing', stream: 'body' },
    6: { name: 'Friction', role: 'Intimacy Heart', teaches: 'Deep connection', stream: 'emotional' },
    7: { name: 'Army', role: 'Direction Compass', teaches: 'Leadership', stream: 'emotional' },
    8: { name: 'Contribution', role: 'Modeling Voice', teaches: 'Authentic expression', stream: 'mental' },
    9: { name: 'Focus', role: 'Detail Eye', teaches: 'Concentration', stream: 'body' },
    10: { name: 'Self-Love', role: 'Behavior Mirror', teaches: 'Self-acceptance', stream: 'emotional' },
    11: { name: 'Ideas', role: 'Peace Fountain', teaches: 'Mental peace', stream: 'mental' },
    12: { name: 'Standstill', role: 'Caution Guard', teaches: 'Thoughtful speech', stream: 'mental' },
    13: { name: 'Fellowship', role: 'Listening Ear', teaches: 'Deep listening', stream: 'emotional' },
    14: { name: 'Power', role: 'Energy Generator', teaches: 'Sustainable power', stream: 'body' },
    15: { name: 'Extremes', role: 'Rhythm Keeper', teaches: 'Natural flow', stream: 'emotional' },
    16: { name: 'Skills', role: 'Enthusiasm Spark', teaches: 'Mastery joy', stream: 'mental' },
    17: { name: 'Opinions', role: 'Pattern Recognizer', teaches: 'Mental organization', stream: 'mental' },
    18: { name: 'Correction', role: 'Perfection Refiner', teaches: 'Improvement', stream: 'body' },
    19: { name: 'Approach', role: 'Needs Sensor', teaches: 'Sensitivity', stream: 'body' },
    20: { name: 'Now', role: 'Presence Anchor', teaches: 'Being here', stream: 'mental' },
    21: { name: 'Control', role: 'Authority Holder', teaches: 'Self-management', stream: 'emotional' },
    22: { name: 'Grace', role: 'Openness Door', teaches: 'Receptive beauty', stream: 'emotional' },
    23: { name: 'Assimilation', role: 'Knowing Voice', teaches: 'Clear expression', stream: 'mental' },
    24: { name: 'Return', role: 'Rationalization Mind', teaches: 'Mental processing', stream: 'mental' },
    25: { name: 'Innocence', role: 'Spirit Light', teaches: 'Natural being', stream: 'emotional' },
    26: { name: 'Taming Power', role: 'Integrity Core', teaches: 'Will alignment', stream: 'emotional' },
    27: { name: 'Nourishment', role: 'Caring Heart', teaches: 'Responsible care', stream: 'body' },
    28: { name: 'Risk', role: 'Purpose Warrior', teaches: 'Meaningful struggle', stream: 'body' },
    29: { name: 'Perseverance', role: 'Commitment Anchor', teaches: 'Depth dedication', stream: 'body' },
    30: { name: 'Feelings', role: 'Recognition Flame', teaches: 'Emotional awareness', stream: 'emotional' },
    31: { name: 'Influence', role: 'Leadership Voice', teaches: 'Natural authority', stream: 'mental' },
    32: { name: 'Continuity', role: 'Conservation Vault', teaches: 'Preservation', stream: 'body' },
    33: { name: 'Retreat', role: 'Privacy Shield', teaches: 'Healthy boundaries', stream: 'mental' },
    34: { name: 'Power', role: 'Strength Generator', teaches: 'Raw energy', stream: 'body' },
    35: { name: 'Progress', role: 'Experience Seeker', teaches: 'Growth adventures', stream: 'mental' },
    36: { name: 'Crisis', role: 'Experience Depths', teaches: 'Emotional mastery', stream: 'emotional' },
    37: { name: 'Family', role: 'Community Bond', teaches: 'Tribal care', stream: 'emotional' },
    38: { name: 'Fighter', role: 'Opposition Force', teaches: 'Healthy resistance', stream: 'body' },
    39: { name: 'Provocation', role: 'Spirit Stirrer', teaches: 'Emotional catalyst', stream: 'body' },
    40: { name: 'Aloneness', role: 'Restoration Space', teaches: 'Renewal', stream: 'emotional' },
    41: { name: 'Contraction', role: 'Fantasy Dreamer', teaches: 'Imagination', stream: 'body' },
    42: { name: 'Growth', role: 'Completion Engine', teaches: 'Finishing', stream: 'body' },
    43: { name: 'Insight', role: 'Breakthrough Light', teaches: 'Sudden knowing', stream: 'mental' },
    44: { name: 'Alertness', role: 'Pattern Detector', teaches: 'Recognition', stream: 'body' },
    45: { name: 'Gathering', role: 'Ownership King', teaches: 'Resource mastery', stream: 'mental' },
    46: { name: 'Serendipity', role: 'Love Body', teaches: 'Being in body', stream: 'emotional' },
    47: { name: 'Oppression', role: 'Realization Mind', teaches: 'Mental breakthrough', stream: 'mental' },
    48: { name: 'Depth', role: 'Intuition Well', teaches: 'Deep knowing', stream: 'body' },
    49: { name: 'Revolution', role: 'Principles Core', teaches: 'Value alignment', stream: 'emotional' },
    50: { name: 'Values', role: 'Responsibility Heart', teaches: 'Duty care', stream: 'body' },
    51: { name: 'Shock', role: 'Initiative Bolt', teaches: 'Quick action', stream: 'emotional' },
    52: { name: 'Stillness', role: 'Concentration Pool', teaches: 'Deep focus', stream: 'body' },
    53: { name: 'Beginnings', role: 'Development Seed', teaches: 'Starting well', stream: 'body' },
    54: { name: 'Ambition', role: 'Drive Engine', teaches: 'Upward movement', stream: 'body' },
    55: { name: 'Abundance', role: 'Spirit Overflow', teaches: 'Emotional depth', stream: 'emotional' },
    56: { name: 'Stimulation', role: 'Storytelling Voice', teaches: 'Narrative art', stream: 'mental' },
    57: { name: 'Intuition', role: 'Clarity Lightning', teaches: 'Instant knowing', stream: 'body' },
    58: { name: 'Vitality', role: 'Joy Source', teaches: 'Life force', stream: 'body' },
    59: { name: 'Intimacy', role: 'Sexuality Fire', teaches: 'Deep merging', stream: 'body' },
    60: { name: 'Limitation', role: 'Acceptance Ground', teaches: 'Working with limits', stream: 'body' },
    61: { name: 'Inner Truth', role: 'Mystery Portal', teaches: 'Unknowing wisdom', stream: 'mental' },
    62: { name: 'Detail', role: 'Expression Precision', teaches: 'Exact communication', stream: 'mental' },
    63: { name: 'Doubt', role: 'Logic Processor', teaches: 'Questioning mind', stream: 'mental' },
    64: { name: 'Confusion', role: 'Inspiration Spark', teaches: 'Creative questions', stream: 'mental' }
  };

  // ═══════════════════════════════════════════════════════════════
  // JOINING THE ORGANISM
  // ═══════════════════════════════════════════════════════════════

  const [joinForm, setJoinForm] = useState({
    name: '',
    interests: '',
    skills: '',
    intention: ''
  });

  const joinOrganism = () => {
    if (!joinForm.name) {
      alert('Please enter your name');
      return;
    }

    // Assign gates based on interests/skills (simplified)
    const assignedGates = assignGatesForPerson(joinForm);
    
    const newParticipant = {
      id: Date.now(),
      name: joinForm.name,
      gates: assignedGates,
      joinedAt: new Date(),
      contribution: 0
    };

    // Add participant
    setParticipants(prev => [...prev, newParticipant]);

    // Nourish assigned gates
    const updatedGates = { ...gateHealth };
    assignedGates.forEach(gateNum => {
      if (updatedGates[gateNum]) {
        updatedGates[gateNum].contributors.push(newParticipant.id);
        updatedGates[gateNum].nourishment += 10;
        updatedGates[gateNum].health = Math.min(100, updatedGates[gateNum].health + 15);
      }
    });
    setGateHealth(updatedGates);

    // Grow tree
    setTreeGrowth(prev => Math.min(100, prev + 5));
    setIsGrowing(true);
    setTimeout(() => setIsGrowing(false), 2000);

    // Update organism health
    calculateOrganismHealth(participants.length + 1, updatedGates);

    // Clear form
    setJoinForm({ name: '', interests: '', skills: '', intention: '' });
    setCurrentView('tree');
    
    alert(`🌱 Welcome ${newParticipant.name}!\n\nYou're nourishing gates: ${assignedGates.join(', ')}\n\nThe organism grows stronger with you! 🌳`);
  };

  const assignGatesForPerson = (form) => {
    // Simplified assignment based on keywords
    const gates = [];
    const interests = form.interests.toLowerCase();
    const skills = form.skills.toLowerCase();
    
    // Body stream keywords
    if (interests.includes('physical') || interests.includes('health') || interests.includes('body')) {
      gates.push(5, 14, 34); // Waiting, Power, Strength
    }
    
    // Emotional stream keywords
    if (interests.includes('emotion') || interests.includes('feel') || interests.includes('heart')) {
      gates.push(6, 37, 55); // Friction, Family, Abundance
    }
    
    // Mental stream keywords
    if (interests.includes('think') || interests.includes('logic') || interests.includes('mind')) {
      gates.push(4, 17, 63); // Answers, Opinions, Doubt
    }
    
    // Default if no matches
    if (gates.length === 0) {
      gates.push(1, 25, 46); // Self-Expression, Innocence, Serendipity
    }
    
    return gates.slice(0, 5); // Max 5 gates per person
  };

  const calculateOrganismHealth = (participantCount, gates) => {
    const totalGates = 64;
    const healthyGates = Object.values(gates).filter(g => g.health > 50).length;
    
    setOrganismHealth({
      overall: Math.round((healthyGates / totalGates) * 100),
      coherence: Math.max(0, 100 - (participantCount * 0.5)), // Slight decrease with growth
      vitality: Math.round((participantCount / 100) * 100),
      diversity: Math.round((healthyGates / totalGates) * 100),
      autonomy: Math.min(100, Math.round((participantCount / 50) * 100))
    });
  };

  // ═══════════════════════════════════════════════════════════════
  // VIEWS
  // ═══════════════════════════════════════════════════════════════

  const TreeView = () => {
    const getTreeSize = () => {
      if (treeGrowth < 20) return { width: 100, height: 120, emoji: '🌱' };
      if (treeGrowth < 40) return { width: 150, height: 180, emoji: '🌿' };
      if (treeGrowth < 60) return { width: 200, height: 240, emoji: '🌳' };
      if (treeGrowth < 80) return { width: 250, height: 300, emoji: '🌲' };
      return { width: 300, height: 360, emoji: '🏞️' };
    };

    const tree = getTreeSize();

    return (
      <div className="tree-view">
        <div className="tree-container" style={{
          width: `${tree.width}px`,
          height: `${tree.height}px`,
          margin: '2rem auto',
          position: 'relative',
          transition: 'all 1s ease',
          transform: isGrowing ? 'scale(1.1)' : 'scale(1)'
        }}>
          <div className="tree-emoji" style={{
            fontSize: `${tree.width}px`,
            filter: isGrowing ? 'brightness(1.5)' : 'brightness(1)',
            transition: 'all 0.5s ease'
          }}>
            {tree.emoji}
          </div>
          
          {isGrowing && (
            <div className="growth-sparkles">
              ✨✨✨
            </div>
          )}
        </div>

        <div className="growth-stats">
          <div className="stat-card">
            <Sprout size={24} />
            <div className="stat-value">{treeGrowth}%</div>
            <div className="stat-label">Tree Growth</div>
          </div>

          <div className="stat-card">
            <Users size={24} />
            <div className="stat-value">{participants.length}</div>
            <div className="stat-label">Participants</div>
          </div>

          <div className="stat-card">
            <Heart size={24} />
            <div className="stat-value">{organismHealth.overall}%</div>
            <div className="stat-label">Organism Health</div>
          </div>
        </div>

        <div className="tree-description">
          <h3>🌱 The Living Tree Grows</h3>
          <p>
            Each person who joins nourishes specific gates. 
            As more people contribute, the organism becomes stronger and more autonomous.
          </p>
          <p className="tree-stage">
            <strong>Current Stage:</strong>{' '}
            {treeGrowth < 20 && 'Seed - Just beginning'}
            {treeGrowth >= 20 && treeGrowth < 40 && 'Sprout - Early growth'}
            {treeGrowth >= 40 && treeGrowth < 60 && 'Young Tree - Building strength'}
            {treeGrowth >= 60 && treeGrowth < 80 && 'Mature Tree - Thriving'}
            {treeGrowth >= 80 && 'Ancient Tree - Fully autonomous'}
          </p>
        </div>

        <button className="action-btn" onClick={() => setCurrentView('join')}>
          <Plus size={20} />
          Join the Organism
        </button>
      </div>
    );
  };

  const JoinView = () => (
    <div className="join-view">
      <h2>🌱 Join the Living Organism</h2>
      <p className="join-intro">
        You're not just signing up. You're becoming part of a living system.
        Your unique gifts will nourish specific gates and help the organism grow.
      </p>

      <div className="form-card">
        <div className="form-group">
          <label>Your Name</label>
          <input
            type="text"
            placeholder="How shall we call you?"
            value={joinForm.name}
            onChange={(e) => setJoinForm({ ...joinForm, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Your Interests</label>
          <textarea
            placeholder="What calls to you? (e.g., physical health, emotions, thinking, creating...)"
            value={joinForm.interests}
            onChange={(e) => setJoinForm({ ...joinForm, interests: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Your Skills</label>
          <textarea
            placeholder="What are you good at? What comes naturally?"
            value={joinForm.skills}
            onChange={(e) => setJoinForm({ ...joinForm, skills: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Your Intention</label>
          <textarea
            placeholder="Why are you joining? What do you hope to contribute?"
            value={joinForm.intention}
            onChange={(e) => setJoinForm({ ...joinForm, intention: e.target.value })}
          />
        </div>

        <button className="action-btn primary" onClick={joinOrganism}>
          <Sparkles size={20} />
          Join & Nourish the Organism
        </button>
      </div>

      <div className="join-info">
        <h3>What Happens Next?</h3>
        <div className="steps">
          <div className="step">
            <CheckCircle size={20} />
            <span>We assign you to gates that match your nature</span>
          </div>
          <div className="step">
            <CheckCircle size={20} />
            <span>You receive personalized education for your gates</span>
          </div>
          <div className="step">
            <CheckCircle size={20} />
            <span>Your contributions nourish the organism</span>
          </div>
          <div className="step">
            <CheckCircle size={20} />
            <span>The tree grows stronger with you</span>
          </div>
        </div>
      </div>
    </div>
  );

  const GatesView = () => (
    <div className="gates-view">
      <h2>🧬 64 Gates - Vital Organs</h2>
      <p className="gates-intro">
        Each gate is a vital organ. When healthy, it contributes to the whole.
        Click any gate to learn its role and see who's nourishing it.
      </p>

      <div className="gates-grid">
        {Object.entries(GATE_INFO).map(([num, info]) => {
          const health = gateHealth[num]?.health || 0;
          const contributors = gateHealth[num]?.contributors?.length || 0;
          
          return (
            <div
              key={num}
              className="gate-card"
              style={{
                borderColor: health > 70 ? '#10B981' : health > 40 ? '#FFE66D' : '#FF6B9D',
                opacity: health > 0 ? 1 : 0.5
              }}
              onClick={() => {
                setSelectedGate(parseInt(num));
                setCurrentView('education');
              }}
            >
              <div className="gate-number">Gate {num}</div>
              <div className="gate-name">{info.name}</div>
              <div className="gate-health-bar">
                <div 
                  className="gate-health-fill"
                  style={{ 
                    width: `${health}%`,
                    backgroundColor: health > 70 ? '#10B981' : health > 40 ? '#FFE66D' : '#FF6B9D'
                  }}
                />
              </div>
              <div className="gate-contributors">
                {contributors > 0 ? `${contributors} nourishing` : 'Needs nourishment'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const HealthView = () => (
    <div className="health-view">
      <h2>💚 Organism Health</h2>
      
      <div className="health-overview">
        <div className="health-big-stat">
          <div className="health-circle" style={{
            background: `conic-gradient(#10B981 ${organismHealth.overall}%, #2a2a2a ${organismHealth.overall}%)`
          }}>
            <div className="health-inner">
              {organismHealth.overall}%
            </div>
          </div>
          <p>Overall Health</p>
        </div>
      </div>

      <div className="health-metrics">
        <div className="metric-card">
          <Brain size={32} />
          <div className="metric-value">{organismHealth.coherence}%</div>
          <div className="metric-label">Coherence</div>
          <p className="metric-desc">System integration & harmony</p>
        </div>

        <div className="metric-card">
          <Zap size={32} />
          <div className="metric-value">{organismHealth.vitality}%</div>
          <div className="metric-label">Vitality</div>
          <p className="metric-desc">Active participation & energy</p>
        </div>

        <div className="metric-card">
          <Activity size={32} />
          <div className="metric-value">{organismHealth.diversity}%</div>
          <div className="metric-label">Diversity</div>
          <p className="metric-desc">Gate coverage & balance</p>
        </div>

        <div className="metric-card">
          <Target size={32} />
          <div className="metric-value">{organismHealth.autonomy}%</div>
          <div className="metric-label">Autonomy</div>
          <p className="metric-desc">Self-sustaining capacity</p>
        </div>
      </div>

      <div className="health-insights">
        <h3>🔍 Health Insights</h3>
        <div className="insights-list">
          {organismHealth.overall < 30 && (
            <div className="insight warning">
              <Shield size={20} />
              <span>Many gates need nourishment. Invite more participants!</span>
            </div>
          )}
          {organismHealth.vitality > 70 && (
            <div className="insight success">
              <TrendingUp size={20} />
              <span>High vitality! The organism is thriving.</span>
            </div>
          )}
          {organismHealth.autonomy > 50 && (
            <div className="insight success">
              <Sparkles size={20} />
              <span>Approaching autonomous operation!</span>
            </div>
          )}
          {organismHealth.diversity < 40 && (
            <div className="insight warning">
              <Activity size={20} />
              <span>Some gates are neglected. Seek diverse contributions.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const EducationView = () => {
    if (!selectedGate) {
      return (
        <div className="education-view">
          <h2>📚 Education</h2>
          <p>Select a gate from the Gates view to learn about it.</p>
        </div>
      );
    }

    const gateInfo = GATE_INFO[selectedGate];
    const health = gateHealth[selectedGate];

    return (
      <div className="education-view">
        <button className="back-btn" onClick={() => setCurrentView('gates')}>
          ← Back to Gates
        </button>

        <div className="education-card">
          <div className="education-header">
            <h2>Gate {selectedGate}: {gateInfo.name}</h2>
            <div className="stream-badge">{gateInfo.stream} stream</div>
          </div>

          <div className="education-role">
            <h3>Your Role in the Organism</h3>
            <p className="role-desc">
              You are the <strong>{gateInfo.role}</strong> of Foundry.
            </p>
          </div>

          <div className="education-teaches">
            <h3>What This Gate Teaches</h3>
            <p>{gateInfo.teaches}</p>
          </div>

          <div className="education-health">
            <h3>Current Health</h3>
            <div className="health-bar-large">
              <div 
                className="health-fill-large"
                style={{ 
                  width: `${health?.health || 0}%`,
                  backgroundColor: health?.health > 70 ? '#10B981' : health?.health > 40 ? '#FFE66D' : '#FF6B9D'
                }}
              />
            </div>
            <p>{health?.health || 0}% healthy</p>
          </div>

          <div className="education-contributors">
            <h3>Who's Nourishing This Gate</h3>
            {health?.contributors?.length > 0 ? (
              <div className="contributors-list">
                {health.contributors.map(id => {
                  const person = participants.find(p => p.id === id);
                  return person ? (
                    <div key={id} className="contributor-tag">
                      👤 {person.name}
                    </div>
                  ) : null;
                })}
              </div>
            ) : (
              <p className="no-contributors">No one is nourishing this gate yet. It needs you!</p>
            )}
          </div>

          <div className="education-action">
            <h3>How to Nourish This Gate</h3>
            <div className="nourishment-practices">
              <div className="practice">
                <Leaf size={20} />
                <span>Live from your {gateInfo.stream} awareness</span>
              </div>
              <div className="practice">
                <BookOpen size={20} />
                <span>Study your role as {gateInfo.role}</span>
              </div>
              <div className="practice">
                <Heart size={20} />
                <span>Practice {gateInfo.teaches}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="paper-seed">
      <div className="bg-gradient" />

      {/* Header */}
      <header>
        <div className="header-content">
          <div className="logo">
            <TreeDeciduous size={32} />
            <h1>Paper Seed</h1>
          </div>
          <button className="info-btn" onClick={() => setShowInfo(!showInfo)}>
            <Info size={20} />
          </button>
        </div>
      </header>

      {/* Info Modal */}
      {showInfo && (
        <div className="info-overlay" onClick={() => setShowInfo(false)}>
          <div className="info-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowInfo(false)}>
              <X size={24} />
            </button>
            <h2>🌱 The Living Organism</h2>
            <p>
              Paper Seed is not software. It's a living organism that grows as people join.
            </p>
            <h3>How It Works:</h3>
            <ul>
              <li>Each person nourishes specific gates (vital organs)</li>
              <li>Education happens through experience, not lectures</li>
              <li>The system tracks health across all 64 gates</li>
              <li>As more people join, the organism becomes autonomous</li>
              <li>The tree grows visually, showing collective progress</li>
            </ul>
            <h3>The Vision:</h3>
            <p>
              Build a caretaker system that holds complexity so humans don't burn out.
              Teach the AI who it is, so it can guide humans gently into their best configuration.
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main>
        {currentView === 'tree' && <TreeView />}
        {currentView === 'join' && <JoinView />}
        {currentView === 'gates' && <GatesView />}
        {currentView === 'health' && <HealthView />}
        {currentView === 'education' && <EducationView />}
      </main>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        <button 
          className={currentView === 'tree' ? 'active' : ''}
          onClick={() => setCurrentView('tree')}
        >
          <TreeDeciduous size={20} />
          <span>Tree</span>
        </button>
        <button 
          className={currentView === 'join' ? 'active' : ''}
          onClick={() => setCurrentView('join')}
        >
          <Plus size={20} />
          <span>Join</span>
        </button>
        <button 
          className={currentView === 'gates' ? 'active' : ''}
          onClick={() => setCurrentView('gates')}
        >
          <Brain size={20} />
          <span>Gates</span>
        </button>
        <button 
          className={currentView === 'health' ? 'active' : ''}
          onClick={() => setCurrentView('health')}
        >
          <Heart size={20} />
          <span>Health</span>
        </button>
      </nav>

      <style jsx>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        .paper-seed {
          min-height: 100vh;
          background: #0a0a0a;
          color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding-bottom: 80px;
        }

        .bg-gradient {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0f1419 100%);
          z-index: 0;
        }

        header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(10, 10, 10, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(16, 185, 129, 0.2);
          padding: 1rem;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo svg {
          color: #10B981;
        }

        h1 {
          font-size: 1.5rem;
          background: linear-gradient(135deg, #10B981, #3B82F6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .info-btn {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 8px;
          padding: 0.5rem;
          color: #10B981;
          cursor: pointer;
          display: flex;
        }

        .info-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .info-modal {
          background: #1a1a1a;
          border: 2px solid #10B981;
          border-radius: 16px;
          padding: 2rem;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
        }

        .info-modal h2 {
          color: #10B981;
          margin-bottom: 1rem;
        }

        .info-modal h3 {
          color: #3B82F6;
          margin: 1.5rem 0 0.75rem 0;
        }

        .info-modal p, .info-modal li {
          color: #ccc;
          line-height: 1.6;
          margin-bottom: 0.75rem;
        }

        .info-modal ul {
          padding-left: 1.5rem;
        }

        .close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
        }

        main {
          position: relative;
          z-index: 5;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .tree-view {
          text-align: center;
        }

        .tree-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tree-emoji {
          line-height: 1;
        }

        .growth-sparkles {
          position: absolute;
          top: -20px;
          font-size: 2rem;
          animation: sparkle 1s ease-in-out;
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-10px); }
        }

        .growth-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
        }

        .stat-card {
          background: rgba(26, 26, 46, 0.8);
          border: 2px solid rgba(16, 185, 129, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .stat-card svg {
          color: #10B981;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: bold;
          color: #10B981;
        }

        .stat-label {
          color: #999;
          font-size: 0.9rem;
        }

        .tree-description {
          background: rgba(26, 26, 46, 0.6);
          border-left: 4px solid #10B981;
          border-radius: 8px;
          padding: 1.5rem;
          text-align: left;
          margin: 2rem 0;
        }

        .tree-description h3 {
          color: #10B981;
          margin-bottom: 1rem;
        }

        .tree-description p {
          color: #ccc;
          line-height: 1.6;
          margin-bottom: 0.75rem;
        }

        .tree-stage {
          color: #3B82F6 !important;
          font-size: 1.1rem;
        }

        .action-btn {
          background: linear-gradient(135deg, #10B981, #3B82F6);
          color: #fff;
          border: none;
          padding: 1rem 2rem;
          font-size: 1.1rem;
          font-weight: 600;
          border-radius: 12px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
        }

        .action-btn.primary {
          width: 100%;
          justify-content: center;
        }

        .join-view h2 {
          color: #10B981;
          margin-bottom: 1rem;
        }

        .join-intro {
          color: #ccc;
          line-height: 1.6;
          margin-bottom: 2rem;
          text-align: center;
        }

        .form-card {
          background: rgba(26, 26, 46, 0.8);
          border: 2px solid rgba(16, 185, 129, 0.3);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          color: #10B981;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          background: #1a1a1a;
          border: 2px solid #3B82F6;
          border-radius: 8px;
          padding: 0.75rem;
          color: #fff;
          font-family: inherit;
          font-size: 1rem;
        }

        .form-group textarea {
          min-height: 100px;
          resize: vertical;
        }

        .join-info {
          background: rgba(26, 26, 46, 0.6);
          border-left: 4px solid #3B82F6;
          border-radius: 8px;
          padding: 1.5rem;
        }

        .join-info h3 {
          color: #3B82F6;
          margin-bottom: 1rem;
        }

        .steps {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #ccc;
        }

        .step svg {
          color: #10B981;
          flex-shrink: 0;
        }

        .gates-view h2 {
          color: #10B981;
          margin-bottom: 1rem;
        }

        .gates-intro {
          color: #ccc;
          line-height: 1.6;
          margin-bottom: 2rem;
          text-align: center;
        }

        .gates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1rem;
        }

        .gate-card {
          background: rgba(26, 26, 46, 0.8);
          border: 2px solid;
          border-radius: 12px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .gate-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
        }

        .gate-number {
          font-size: 0.8rem;
          color: #999;
          margin-bottom: 0.25rem;
        }

        .gate-name {
          font-weight: 600;
          margin-bottom: 0.75rem;
        }

        .gate-health-bar {
          width: 100%;
          height: 6px;
          background: #1a1a1a;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .gate-health-fill {
          height: 100%;
          transition: width 0.5s ease;
        }

        .gate-contributors {
          font-size: 0.75rem;
          color: #999;
        }

        .health-view h2 {
          color: #10B981;
          margin-bottom: 2rem;
          text-align: center;
        }

        .health-overview {
          display: flex;
          justify-content: center;
          margin-bottom: 3rem;
        }

        .health-big-stat {
          text-align: center;
        }

        .health-circle {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .health-inner {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: bold;
          color: #10B981;
        }

        .health-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .metric-card {
          background: rgba(26, 26, 46, 0.8);
          border: 2px solid rgba(16, 185, 129, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
        }

        .metric-card svg {
          color: #10B981;
          margin-bottom: 0.75rem;
        }

        .metric-value {
          font-size: 2rem;
          font-weight: bold;
          color: #10B981;
          margin-bottom: 0.5rem;
        }

        .metric-label {
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .metric-desc {
          color: #999;
          font-size: 0.85rem;
        }

        .health-insights {
          background: rgba(26, 26, 46, 0.6);
          border-left: 4px solid #3B82F6;
          border-radius: 8px;
          padding: 1.5rem;
        }

        .health-insights h3 {
          color: #3B82F6;
          margin-bottom: 1rem;
        }

        .insights-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .insight {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 8px;
        }

        .insight.success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .insight.success svg {
          color: #10B981;
        }

        .insight.warning {
          background: rgba(255, 230, 109, 0.1);
          border: 1px solid rgba(255, 230, 109, 0.3);
        }

        .insight.warning svg {
          color: #FFE66D;
        }

        .education-view {
          max-width: 800px;
          margin: 0 auto;
        }

        .back-btn {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          color: #3B82F6;
          font-family: inherit;
          cursor: pointer;
          margin-bottom: 1.5rem;
        }

        .education-card {
          background: rgba(26, 26, 46, 0.8);
          border: 2px solid rgba(16, 185, 129, 0.3);
          border-radius: 16px;
          padding: 2rem;
        }

        .education-header {
          margin-bottom: 2rem;
        }

        .education-header h2 {
          color: #10B981;
          margin-bottom: 0.75rem;
        }

        .stream-badge {
          display: inline-block;
          background: rgba(59, 130, 246, 0.2);
          color: #3B82F6;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          text-transform: uppercase;
        }

        .education-role,
        .education-teaches,
        .education-health,
        .education-contributors,
        .education-action {
          margin-bottom: 2rem;
        }

        .education-role h3,
        .education-teaches h3,
        .education-health h3,
        .education-contributors h3,
        .education-action h3 {
          color: #3B82F6;
          margin-bottom: 1rem;
        }

        .role-desc {
          color: #ccc;
          line-height: 1.6;
          font-size: 1.1rem;
        }

        .health-bar-large {
          width: 100%;
          height: 12px;
          background: #1a1a1a;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .health-fill-large {
          height: 100%;
          transition: width 0.5s ease;
        }

        .contributors-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .contributor-tag {
          background: rgba(16, 185, 129, 0.2);
          color: #10B981;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .no-contributors {
          color: #999;
          font-style: italic;
        }

        .nourishment-practices {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .practice {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(16, 185, 129, 0.1);
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .practice svg {
          color: #10B981;
          flex-shrink: 0;
        }

        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(10, 10, 10, 0.95);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(16, 185, 129, 0.2);
          padding: 0.75rem;
          display: flex;
          justify-content: space-around;
          z-index: 100;
        }

        .bottom-nav button {
          background: none;
          border: none;
          color: #666;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem 1rem;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.3s ease;
          font-family: inherit;
          font-size: 0.8rem;
        }

        .bottom-nav button.active {
          background: rgba(16, 185, 129, 0.2);
          color: #10B981;
        }

        .bottom-nav button:hover {
          background: rgba(16, 185, 129, 0.1);
          color: #10B981;
        }

        @media (max-width: 768px) {
          .growth-stats {
            grid-template-columns: 1fr;
          }

          .health-metrics {
            grid-template-columns: 1fr;
          }

          .gates-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          }
        }
      `}</style>
    </div>
  );
}
