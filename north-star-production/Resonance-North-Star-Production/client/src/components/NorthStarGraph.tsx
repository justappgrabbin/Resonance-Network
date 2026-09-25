import React, { useMemo } from "react";
import type { Mission, NetworkNode, PersonMatch } from "@/northstar/types";

interface GraphProps {
  projects: NetworkNode[];
  matches: PersonMatch[];
  missions: Mission[];
  onOpen?: (kind: "project" | "person" | "mission", id: string) => void;
}

export function NorthStarGraph({ projects, matches, missions, onOpen }: GraphProps) {
  const nodes = useMemo(() => {
    const out: Array<{ id: string; kind: "purpose" | "project" | "person" | "mission"; label: string; x: number; y: number; score?: number }> = [
      { id: "purpose", kind: "purpose", label: "Purpose", x: 300, y: 210, score: 100 },
    ];
    const ring = (items: any[], kind: "project" | "person" | "mission", radius: number, offset: number) => {
      items.slice(0, 5).forEach((item, i) => {
        const angle = ((i + offset) / Math.max(items.slice(0, 5).length, 1)) * Math.PI * 2;
        out.push({
          id: item.id,
          kind,
          label: item.title || item.name,
          x: 300 + Math.cos(angle) * radius,
          y: 210 + Math.sin(angle) * radius,
          score: item.resonance,
        });
      });
    };
    ring(projects, "project", 150, 0.05);
    ring(matches, "person", 112, 0.38);
    ring(missions.filter((m) => m.status !== "complete"), "mission", 74, 0.68);
    return out;
  }, [projects, matches, missions]);

  const center = nodes[0];
  const color = (kind: string) => kind === "purpose" ? "hsl(var(--primary))" : kind === "project" ? "hsl(163 48% 42%)" : kind === "person" ? "hsl(18 72% 58%)" : "hsl(43 75% 64%)";

  return (
    <div className="ns-card p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div><div className="text-xs uppercase tracking-wider text-primary">Causal / collaboration view</div><div className="font-display font-semibold">Current field topology</div></div>
        <div className="flex gap-3 text-[10px] text-muted-foreground"><span>● project</span><span>● person</span><span>● mission</span></div>
      </div>
      <svg viewBox="0 0 600 420" className="w-full h-auto max-h-[420px]" role="img" aria-label="North Star relationship graph">
        <defs>
          <filter id="softGlow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {nodes.slice(1).map((n) => <line key={`edge-${n.id}`} x1={center.x} y1={center.y} x2={n.x} y2={n.y} stroke="hsl(36 15% 34% / .42)" strokeWidth="1" />)}
        {nodes.map((n) => {
          const r = n.kind === "purpose" ? 28 : n.kind === "project" ? 18 : 14;
          return <g key={n.id} className={n.kind === "purpose" ? "" : "cursor-pointer"} onClick={() => n.kind !== "purpose" && onOpen?.(n.kind, n.id)}>
            <circle cx={n.x} cy={n.y} r={r + 7} fill={`${color(n.kind)}`} opacity="0.08" />
            <circle cx={n.x} cy={n.y} r={r} fill="hsl(28 18% 7%)" stroke={color(n.kind)} strokeWidth={n.kind === "purpose" ? 3 : 2} filter={n.kind === "purpose" ? "url(#softGlow)" : undefined} />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fill="hsl(42 24% 92%)" fontSize={n.kind === "purpose" ? 11 : 9} fontWeight="700">{n.kind === "purpose" ? "NORTH" : n.score ? `${n.score}%` : "•"}</text>
            <text x={n.x} y={n.y + r + 16} textAnchor="middle" fill="hsl(35 9% 66%)" fontSize="9">{n.label.length > 23 ? `${n.label.slice(0, 21)}…` : n.label}</text>
          </g>;
        })}
      </svg>
    </div>
  );
}
