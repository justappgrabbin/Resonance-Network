import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Activity, Heart, Brain, Eye, Waves, Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as Tone from 'tone';

// Simplified interface for the cell data
interface ResonanceCell {
  id: number;
  position: string;
  gate: number;
  line: number;
  zodiac: string;
  house: number;
  field: 'Body' | 'Mind' | 'Heart';
  type: string;
  resonanceLevel: number;
  aspectType: string;
  waveform: string;
}

const squareData: ResonanceCell[] = [
  // Row 1
  {
    id: 0, position: 'top-left', gate: 6, line: 4, zodiac: "Libra", house: 6,
    field: "Body", type: "The Focus", resonanceLevel: 78, aspectType: "Foundation", waveform: "Tribal-Emotional"
  },
  {
    id: 1, position: 'top-center', gate: 59, line: 3, zodiac: "Virgo", house: 4,
    field: "Mind", type: "Communication", resonanceLevel: 85, aspectType: "Outer Authority", waveform: "Individual-Knowing"
  },
  {
    id: 2, position: 'top-right', gate: 19, line: 1, zodiac: "Capricorn", house: 10,
    field: "Heart", type: "The Sidekick", resonanceLevel: 62, aspectType: "y-Learning", waveform: "Collective-Sensing"
  },
  // Row 2
  {
    id: 3, position: 'middle-left', gate: 36, line: 2, zodiac: "Cancer", house: 2,
    field: "Body", type: "The Situation", resonanceLevel: 91, aspectType: "Foundation", waveform: "Individual-Emotional"
  },
  {
    id: 4, position: 'center', gate: 25, line: 6, zodiac: "Scorpio", house: 8,
    field: "Mind", type: "Mutation", resonanceLevel: 67, aspectType: "Outer Authority", waveform: "Tribal-Mental"
  },
  {
    id: 5, position: 'middle-right', gate: 17, line: 5, zodiac: "Taurus", house: 12,
    field: "Heart", type: "Misformattance", resonanceLevel: 73, aspectType: "y-Learning", waveform: "Collective-Logical"
  },
  // Row 3
  {
    id: 6, position: 'bottom-left', gate: 21, line: 3, zodiac: "Gemini", house: 1,
    field: "Body", type: "The Constraint", resonanceLevel: 82, aspectType: "Foundation", waveform: "Individual-Splenic"
  },
  {
    id: 7, position: 'bottom-center', gate: 51, line: 4, zodiac: "Pisces", house: 11,
    field: "Mind", type: "The Constraint", resonanceLevel: 88, aspectType: "Outer Authority", waveform: "Tribal-Intuitive"
  },
  {
    id: 8, position: 'bottom-right', gate: 20, line: 6, zodiac: "Aquarius", house: 9,
    field: "Heart", type: "The Constraint", resonanceLevel: 76, aspectType: "y-Learning", waveform: "Collective-Emotional"
  }
];

export function ResonanceField() {
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [audioStarted, setAudioStarted] = useState(false);

  const handleCellClick = async (id: number) => {
    setActiveCell(activeCell === id ? null : id);
    if (!audioStarted) {
      await Tone.start();
      setAudioStarted(true);
    }
    
    // Play a subtle sound on click
    if (activeCell !== id) {
      const synth = new Tone.MembraneSynth().toDestination();
      synth.volume.value = -20;
      synth.triggerAttackRelease(id % 2 === 0 ? "C2" : "G2", "8n");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-card/30 backdrop-blur-xl border border-white/5 rounded-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg font-medium text-foreground tracking-tight flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Field Coherence
        </h3>
        <div className="text-xs font-mono text-muted-foreground">
          {audioStarted ? "AUDIO ACTIVE" : "SILENT MODE"}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 relative z-10">
        {squareData.map((cell) => (
          <motion.button
            key={cell.id}
            onClick={() => handleCellClick(cell.id)}
            className={cn(
              "aspect-square relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-500",
              activeCell === cell.id 
                ? "bg-primary/10 border-primary/50 shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]" 
                : "bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/5"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={cn(
              "absolute top-2 right-2 w-1.5 h-1.5 rounded-full transition-colors duration-500",
              cell.resonanceLevel > 80 ? "bg-emerald-400" : cell.resonanceLevel > 60 ? "bg-amber-400" : "bg-rose-400",
              activeCell === cell.id && "animate-pulse"
            )} />

            <span className="font-mono text-2xl font-light text-foreground/90">
              {cell.gate}
              <span className="text-xs text-muted-foreground align-top ml-0.5">.{cell.line}</span>
            </span>

            {activeCell === cell.id && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-2 text-center rounded-xl"
              >
                <span className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">{cell.field}</span>
                <span className="text-xs text-white leading-tight">{cell.type}</span>
                <div className="mt-2 h-0.5 w-8 bg-gradient-to-r from-transparent via-primary to-transparent" />
                <span className="text-[9px] text-muted-foreground mt-1 font-mono">{cell.zodiac}</span>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground font-mono">
        <div className="flex items-center gap-2">
          <Waves className="w-3 h-3" />
          <span>FREQ: 432Hz</span>
        </div>
        <div className="flex items-center gap-2">
          <span>COHERENCE: 94%</span>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </div>
  );
}
