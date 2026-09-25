import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, Users, Zap } from 'lucide-react';

interface Branch {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  thickness: number;
  depth: number;
  children: Branch[];
}

export function LivingTree() {
  const [growthStage, setGrowthStage] = useState(0);
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGrowthStage(prev => (prev + 1) % 100);
      setPulsePhase(prev => (prev + 0.1) % (Math.PI * 2));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const generateBranches = useMemo(() => {
    const branches: Branch[] = [];
    
    const createBranch = (
      id: string,
      startX: number,
      startY: number,
      angle: number,
      length: number,
      thickness: number,
      depth: number,
      maxDepth: number
    ): Branch => {
      const endX = startX + Math.sin(angle) * length;
      const endY = startY - Math.cos(angle) * length;
      
      const children: Branch[] = [];
      
      if (depth < maxDepth && thickness > 2) {
        const leftAngle = angle - (0.4 + Math.random() * 0.3);
        const rightAngle = angle + (0.4 + Math.random() * 0.3);
        const newLength = length * (0.65 + Math.random() * 0.15);
        const newThickness = thickness * 0.6;
        
        children.push(
          createBranch(`${id}-L`, endX, endY, leftAngle, newLength, newThickness, depth + 1, maxDepth),
          createBranch(`${id}-R`, endX, endY, rightAngle, newLength, newThickness, depth + 1, maxDepth)
        );
        
        if (Math.random() > 0.5 && depth < 2) {
          children.push(
            createBranch(`${id}-C`, endX, endY, angle + (Math.random() - 0.5) * 0.2, newLength * 0.9, newThickness * 0.9, depth + 1, maxDepth)
          );
        }
      }
      
      return { id, startX, startY, endX, endY, thickness, depth, children };
    };

    const trunk = createBranch('trunk', 100, 230, 0, 60, 16, 0, 4);
    branches.push(trunk);
    
    return branches;
  }, []);

  const renderBranch = (branch: Branch, delay: number = 0): React.ReactNode => {
    const halfThick = branch.thickness / 2;
    const angle = Math.atan2(branch.endX - branch.startX, branch.startY - branch.endY);
    const perpX = Math.cos(angle);
    const perpY = Math.sin(angle);
    
    const x1Left = branch.startX - perpX * halfThick;
    const y1Left = branch.startY - perpY * halfThick;
    const x1Right = branch.startX + perpX * halfThick;
    const y1Right = branch.startY + perpY * halfThick;
    
    const taperFactor = branch.children.length > 0 ? 0.7 : 0.3;
    const endHalfThick = halfThick * taperFactor;
    
    const x2Left = branch.endX - perpX * endHalfThick;
    const y2Left = branch.endY - perpY * endHalfThick;
    const x2Right = branch.endX + perpX * endHalfThick;
    const y2Right = branch.endY + perpY * endHalfThick;

    const pathD = branch.children.length > 0
      ? `M ${x1Left} ${y1Left} L ${x2Left} ${y2Left} L ${x2Right} ${y2Right} L ${x1Right} ${y1Right} Z`
      : `M ${x1Left} ${y1Left} L ${branch.endX} ${branch.endY} L ${x1Right} ${y1Right} Z`;

    const baseOpacity = 0.7 + (0.3 * (1 - branch.depth / 4));
    
    return (
      <g key={branch.id}>
        <motion.path
          d={pathD}
          fill={branch.depth === 0 ? "url(#trunk-fill)" : "url(#branch-fill)"}
          stroke="hsl(var(--primary))"
          strokeWidth={branch.depth === 0 ? 1.5 : 1}
          strokeOpacity={baseOpacity * 0.6}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: baseOpacity, scale: 1 }}
          transition={{ duration: 0.8, delay: delay + branch.depth * 0.3, ease: "easeOut" }}
        />
        
        {branch.children.length === 0 && (
          <motion.circle
            cx={branch.endX}
            cy={branch.endY}
            r={3 + Math.random() * 2}
            fill="hsl(var(--primary))"
            opacity={0.6}
            initial={{ scale: 0 }}
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{ 
              duration: 2 + Math.random(),
              delay: delay + 1.5,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        )}
        
        {branch.children.map((child, i) => renderBranch(child, delay + 0.1 * i))}
      </g>
    );
  };

  const renderYFork = (
    x: number, 
    y: number, 
    size: number, 
    angle: number = 0,
    delay: number = 0
  ) => {
    const trunkLen = size * 0.4;
    const branchLen = size * 0.5;
    const thickness = size * 0.15;
    const forkAngle = 0.5;
    
    const trunkEndY = y - trunkLen;
    
    const leftEndX = x + Math.sin(-forkAngle + angle) * branchLen;
    const leftEndY = trunkEndY - Math.cos(-forkAngle + angle) * branchLen;
    const rightEndX = x + Math.sin(forkAngle + angle) * branchLen;
    const rightEndY = trunkEndY - Math.cos(forkAngle + angle) * branchLen;
    
    const halfT = thickness / 2;
    const tipT = thickness * 0.15;
    
    return (
      <motion.path
        d={`
          M ${x - halfT} ${y}
          L ${x - halfT} ${trunkEndY}
          L ${leftEndX - tipT} ${leftEndY}
          L ${leftEndX + tipT} ${leftEndY}
          L ${x} ${trunkEndY - halfT * 0.5}
          L ${rightEndX - tipT} ${rightEndY}
          L ${rightEndX + tipT} ${rightEndY}
          L ${x + halfT} ${trunkEndY}
          L ${x + halfT} ${y}
          Z
        `}
        fill="url(#branch-fill)"
        stroke="hsl(var(--primary))"
        strokeWidth={1}
        strokeOpacity={0.5}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.8, scale: 1 }}
        transition={{ duration: 0.8, delay }}
      />
    );
  };

  return (
    <div className="w-full h-full min-h-[300px] md:min-h-[400px] flex flex-col p-4 md:p-6 bg-card/30 backdrop-blur-xl border border-white/5 rounded-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
      
      <div className="flex items-start justify-between relative z-10 mb-2 md:mb-4">
        <div>
          <h3 className="font-display text-base md:text-lg font-medium text-foreground tracking-tight flex items-center gap-2">
            <Sprout className="w-4 h-4 text-secondary-foreground" />
            Living Organism
          </h3>
          <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Growth Stage: Sapling (Level {Math.floor(growthStage / 10)})</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end text-[10px] md:text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 12 Active</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> +24% Flow</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative z-10 flex items-center justify-center">
        <svg className="w-full h-full max-h-[250px] md:max-h-none" viewBox="0 0 200 250" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="trunk-fill" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="hsl(35, 60%, 25%)" />
              <stop offset="50%" stopColor="hsl(35, 50%, 30%)" />
              <stop offset="100%" stopColor="hsl(35, 40%, 35%)" />
            </linearGradient>
            <linearGradient id="branch-fill" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="hsl(35, 45%, 28%)" />
              <stop offset="100%" stopColor="hsl(160, 50%, 35%)" />
            </linearGradient>
            <filter id="tree-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <radialGradient id="leaf-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g filter="url(#tree-glow)">
            {generateBranches.map(branch => renderBranch(branch))}
          </g>

          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 2, duration: 1 }}
          >
            <path
              d="M 92 235 Q 75 250 55 240 M 108 235 Q 125 250 145 240 M 100 238 L 100 250"
              stroke="hsl(35, 50%, 25%)"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
            />
          </motion.g>

          {[
            { x: 60, y: 85 },
            { x: 140, y: 90 },
            { x: 100, y: 70 },
            { x: 75, y: 55 },
            { x: 125, y: 60 },
            { x: 45, y: 100 },
            { x: 155, y: 105 },
          ].map((pos, i) => (
            <motion.circle
              key={`glow-${i}`}
              cx={pos.x}
              cy={pos.y}
              r={8}
              fill="url(#leaf-glow)"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0.3, 0.7, 0.3],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 3 + i * 0.5,
                delay: 2 + i * 0.2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          ))}

          {Array.from({ length: 8 }).map((_, i) => (
            <motion.circle
              key={`particle-${i}`}
              r={1.5}
              fill="hsl(var(--primary))"
              initial={{ 
                cx: 100, 
                cy: 220, 
                opacity: 0 
              }}
              animate={{ 
                cx: [100, 100 + (Math.random() - 0.5) * 120],
                cy: [220, 40 + Math.random() * 60],
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: 5 + Math.random() * 3,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeOut"
              }}
            />
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2 md:mt-4 relative z-10">
        {['Vitality', 'Coherence', 'Diversity'].map((stat, i) => (
          <div key={stat} className="bg-black/20 rounded-lg p-1.5 md:p-2 text-center border border-white/5">
            <div className="text-[8px] md:text-[10px] uppercase text-muted-foreground tracking-wider mb-0.5 md:mb-1">{stat}</div>
            <div className="text-xs md:text-sm font-mono text-primary">{(85 + i * 4)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
