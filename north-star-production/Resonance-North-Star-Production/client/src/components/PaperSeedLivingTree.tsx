import React, { useState, useEffect } from 'react';
import { 
  Sprout, Users, Heart, Brain, Zap, Plus, Info, X, ArrowRight, 
  CheckCircle, TrendingUp, Activity, Leaf, TreeDeciduous, 
  Sparkles, BookOpen, Target, Shield 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const GATE_INFO: Record<number, { name: string; role: string; teaches: string; stream: string }> = {
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

interface Participant {
  id: number;
  name: string;
  gates: number[];
  joinedAt: Date;
  contribution: number;
}

interface GateHealth {
  health: number;
  contributors: number[];
  nourishment: number;
  education_level: number;
}

export default function PaperSeedLivingTree() {
  const [treeGrowth, setTreeGrowth] = useState(0);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentView, setCurrentView] = useState<'tree' | 'join' | 'gates' | 'health'>('tree');
  const [selectedGate, setSelectedGate] = useState<number | null>(null);
  const [isGrowing, setIsGrowing] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [gateHealth, setGateHealth] = useState<Record<number, GateHealth>>({});

  const [organismHealth, setOrganismHealth] = useState({
    overall: 0,
    coherence: 100,
    vitality: 0,
    diversity: 0,
    autonomy: 0
  });

  const [joinForm, setJoinForm] = useState({
    name: '',
    interests: '',
    skills: '',
    intention: ''
  });

  useEffect(() => {
    const initialGates: Record<number, GateHealth> = {};
    for (let i = 1; i <= 64; i++) {
      initialGates[i] = { health: 0, contributors: [], nourishment: 0, education_level: 0 };
    }
    setGateHealth(initialGates);
  }, []);

  const assignGatesForPerson = (form: typeof joinForm): number[] => {
    const gates: number[] = [];
    const interests = form.interests.toLowerCase();
    
    if (interests.includes('physical') || interests.includes('health') || interests.includes('body')) {
      gates.push(5, 14, 34);
    }
    if (interests.includes('emotion') || interests.includes('feel') || interests.includes('heart')) {
      gates.push(6, 37, 55);
    }
    if (interests.includes('think') || interests.includes('logic') || interests.includes('mind')) {
      gates.push(4, 17, 63);
    }
    if (gates.length === 0) {
      gates.push(1, 25, 46);
    }
    return gates.slice(0, 5);
  };

  const calculateOrganismHealth = (participantCount: number, gates: Record<number, GateHealth>) => {
    const totalGates = 64;
    const healthyGates = Object.values(gates).filter(g => g.health > 50).length;
    
    setOrganismHealth({
      overall: Math.round((healthyGates / totalGates) * 100),
      coherence: Math.max(0, 100 - (participantCount * 0.5)),
      vitality: Math.round((participantCount / 100) * 100),
      diversity: Math.round((healthyGates / totalGates) * 100),
      autonomy: Math.min(100, Math.round((participantCount / 50) * 100))
    });
  };

  const joinOrganism = () => {
    if (!joinForm.name) return;

    const assignedGates = assignGatesForPerson(joinForm);
    const newParticipant: Participant = {
      id: Date.now(),
      name: joinForm.name,
      gates: assignedGates,
      joinedAt: new Date(),
      contribution: 0
    };

    setParticipants(prev => [...prev, newParticipant]);

    const updatedGates = { ...gateHealth };
    assignedGates.forEach(gateNum => {
      if (updatedGates[gateNum]) {
        updatedGates[gateNum].contributors.push(newParticipant.id);
        updatedGates[gateNum].nourishment += 10;
        updatedGates[gateNum].health = Math.min(100, updatedGates[gateNum].health + 15);
      }
    });
    setGateHealth(updatedGates);

    setTreeGrowth(prev => Math.min(100, prev + 5));
    setIsGrowing(true);
    setTimeout(() => setIsGrowing(false), 2000);

    calculateOrganismHealth(participants.length + 1, updatedGates);
    setJoinForm({ name: '', interests: '', skills: '', intention: '' });
    setCurrentView('tree');
  };

  const getTreeEmoji = () => {
    if (treeGrowth < 20) return '🌱';
    if (treeGrowth < 40) return '🌿';
    if (treeGrowth < 60) return '🌳';
    if (treeGrowth < 80) return '🌲';
    return '🏞️';
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-primary/20 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <TreeDeciduous className="w-8 h-8 text-primary" />
            <h1 className="font-display text-xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              Paper Seed
            </h1>
          </div>
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 bg-primary/10 border border-primary/30 rounded-lg text-primary"
            data-testid="button-info"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {showInfo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4"
            onClick={() => setShowInfo(false)}
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-card border-2 border-primary rounded-2xl p-6 max-w-lg max-h-[80vh] overflow-auto"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowInfo(false)} className="absolute top-4 right-4 text-muted-foreground">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-primary text-xl font-bold mb-4">The Living Organism</h2>
              <p className="text-muted-foreground mb-4">Paper Seed is not software. It's a living organism that grows as people join.</p>
              <h3 className="text-blue-500 font-semibold mb-2">How It Works:</h3>
              <ul className="text-muted-foreground space-y-2 list-disc pl-4">
                <li>Each person nourishes specific gates (vital organs)</li>
                <li>Education happens through experience</li>
                <li>The system tracks health across all 64 gates</li>
                <li>As more people join, the organism becomes autonomous</li>
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-4xl mx-auto p-4">
        {currentView === 'tree' && (
          <div className="text-center">
            <motion.div 
              className="my-8"
              animate={{ scale: isGrowing ? 1.1 : 1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-[120px] md:text-[180px] leading-none">{getTreeEmoji()}</span>
              {isGrowing && <div className="text-2xl mt-2">✨✨✨</div>}
            </motion.div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: Sprout, value: `${treeGrowth}%`, label: 'Growth' },
                { icon: Users, value: participants.length, label: 'Participants' },
                { icon: Heart, value: `${organismHealth.overall}%`, label: 'Health' },
              ].map((stat, i) => (
                <div key={i} className="glass-panel p-4 rounded-xl text-center">
                  <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="glass-panel p-4 rounded-xl text-left border-l-4 border-primary mb-6">
              <h3 className="text-primary font-semibold mb-2">The Living Tree Grows</h3>
              <p className="text-muted-foreground text-sm">
                Each person who joins nourishes specific gates. As more people contribute, the organism becomes stronger and more autonomous.
              </p>
              <p className="text-blue-500 mt-2 text-sm">
                <strong>Current Stage:</strong> {
                  treeGrowth < 20 ? 'Seed - Just beginning' :
                  treeGrowth < 40 ? 'Sprout - Early growth' :
                  treeGrowth < 60 ? 'Young Tree - Building strength' :
                  treeGrowth < 80 ? 'Mature Tree - Thriving' :
                  'Ancient Tree - Fully autonomous'
                }
              </p>
            </div>

            <button 
              onClick={() => setCurrentView('join')}
              className="w-full bg-gradient-to-r from-primary to-blue-500 text-black font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2"
              data-testid="button-join-organism"
            >
              <Plus className="w-5 h-5" />
              Join the Organism
            </button>
          </div>
        )}

        {currentView === 'join' && (
          <div>
            <h2 className="text-primary text-2xl font-bold mb-2">Join the Living Organism</h2>
            <p className="text-muted-foreground mb-6">You're not just signing up. You're becoming part of a living system.</p>

            <div className="glass-panel p-6 rounded-xl space-y-4 mb-6">
              <div>
                <label className="block text-primary font-medium mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="How shall we call you?"
                  value={joinForm.name}
                  onChange={e => setJoinForm({ ...joinForm, name: e.target.value })}
                  className="w-full bg-black/50 border-2 border-blue-500 rounded-lg p-3 text-foreground"
                  data-testid="input-name"
                />
              </div>
              <div>
                <label className="block text-primary font-medium mb-1">Your Interests</label>
                <textarea
                  placeholder="What calls to you? (physical, emotional, mental...)"
                  value={joinForm.interests}
                  onChange={e => setJoinForm({ ...joinForm, interests: e.target.value })}
                  className="w-full bg-black/50 border-2 border-blue-500 rounded-lg p-3 text-foreground min-h-[80px]"
                  data-testid="input-interests"
                />
              </div>
              <div>
                <label className="block text-primary font-medium mb-1">Your Intention</label>
                <textarea
                  placeholder="Why are you joining? What do you hope to contribute?"
                  value={joinForm.intention}
                  onChange={e => setJoinForm({ ...joinForm, intention: e.target.value })}
                  className="w-full bg-black/50 border-2 border-blue-500 rounded-lg p-3 text-foreground min-h-[80px]"
                  data-testid="input-intention"
                />
              </div>
              <button 
                onClick={joinOrganism}
                className="w-full bg-gradient-to-r from-primary to-blue-500 text-black font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2"
                data-testid="button-submit-join"
              >
                <Sparkles className="w-5 h-5" />
                Join & Nourish the Organism
              </button>
            </div>

            <div className="glass-panel p-4 rounded-xl border-l-4 border-blue-500">
              <h3 className="text-blue-500 font-semibold mb-3">What Happens Next?</h3>
              <div className="space-y-2">
                {[
                  'We assign you to gates that match your nature',
                  'You receive personalized education for your gates',
                  'Your contributions nourish the organism',
                  'The tree grows stronger with you'
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-muted-foreground text-sm">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'gates' && (
          <div>
            <h2 className="text-primary text-2xl font-bold mb-2">64 Gates - Vital Organs</h2>
            <p className="text-muted-foreground mb-6 text-center">Each gate is a vital organ. Click any gate to learn its role.</p>

            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {Object.entries(GATE_INFO).map(([num, info]) => {
                const health = gateHealth[parseInt(num)]?.health || 0;
                return (
                  <motion.button
                    key={num}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedGate(parseInt(num))}
                    className={cn(
                      "aspect-square rounded-lg p-2 border-2 text-center transition-all",
                      health > 70 ? "border-emerald-500 bg-emerald-500/10" :
                      health > 40 ? "border-amber-500 bg-amber-500/10" :
                      "border-rose-500/30 bg-rose-500/5 opacity-60"
                    )}
                    data-testid={`button-gate-${num}`}
                  >
                    <div className="text-lg font-bold">{num}</div>
                    <div className="text-[8px] text-muted-foreground truncate">{info.name}</div>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {selectedGate && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-6 glass-panel p-6 rounded-xl"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-primary text-xl font-bold">Gate {selectedGate}: {GATE_INFO[selectedGate].name}</h3>
                      <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-1 rounded">{GATE_INFO[selectedGate].stream} stream</span>
                    </div>
                    <button onClick={() => setSelectedGate(null)} className="text-muted-foreground">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-muted-foreground mb-2">Role: <strong className="text-foreground">{GATE_INFO[selectedGate].role}</strong></p>
                  <p className="text-muted-foreground">Teaches: <strong className="text-foreground">{GATE_INFO[selectedGate].teaches}</strong></p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {currentView === 'health' && (
          <div>
            <h2 className="text-primary text-2xl font-bold mb-6 text-center">Organism Health</h2>
            
            <div className="flex justify-center mb-8">
              <div 
                className="w-48 h-48 rounded-full flex items-center justify-center"
                style={{ background: `conic-gradient(hsl(var(--primary)) ${organismHealth.overall}%, hsl(var(--card)) ${organismHealth.overall}%)` }}
              >
                <div className="w-36 h-36 rounded-full bg-card flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary">{organismHealth.overall}%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: Brain, value: organismHealth.coherence, label: 'Coherence', desc: 'System harmony' },
                { icon: Zap, value: organismHealth.vitality, label: 'Vitality', desc: 'Active energy' },
                { icon: Activity, value: organismHealth.diversity, label: 'Diversity', desc: 'Gate coverage' },
                { icon: Target, value: organismHealth.autonomy, label: 'Autonomy', desc: 'Self-sustaining' },
              ].map((metric, i) => (
                <div key={i} className="glass-panel p-4 rounded-xl text-center">
                  <metric.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">{metric.value}%</div>
                  <div className="font-medium text-sm">{metric.label}</div>
                  <div className="text-xs text-muted-foreground">{metric.desc}</div>
                </div>
              ))}
            </div>

            <div className="glass-panel p-4 rounded-xl border-l-4 border-blue-500">
              <h3 className="text-blue-500 font-semibold mb-3">Health Insights</h3>
              <div className="space-y-2">
                {organismHealth.overall < 30 && (
                  <div className="flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm">
                    <Shield className="w-4 h-4 text-amber-500" />
                    <span>Many gates need nourishment. Invite more participants!</span>
                  </div>
                )}
                {organismHealth.vitality > 70 && (
                  <div className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/30 rounded-lg text-sm">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span>High vitality! The organism is thriving.</span>
                  </div>
                )}
                {organismHealth.autonomy > 50 && (
                  <div className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/30 rounded-lg text-sm">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>Approaching autonomous operation!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-primary/20 p-2 flex justify-around z-50">
        {[
          { view: 'tree' as const, icon: TreeDeciduous, label: 'Tree' },
          { view: 'join' as const, icon: Plus, label: 'Join' },
          { view: 'gates' as const, icon: Brain, label: 'Gates' },
          { view: 'health' as const, icon: Heart, label: 'Health' },
        ].map(item => (
          <button
            key={item.view}
            onClick={() => setCurrentView(item.view)}
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all",
              currentView === item.view ? "bg-primary/20 text-primary" : "text-muted-foreground"
            )}
            data-testid={`nav-${item.view}`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
