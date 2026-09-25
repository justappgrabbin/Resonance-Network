import { useState, useRef, useEffect } from "react";
import { useConsciousness } from "@/hooks/use-consciousness";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, Brain, Heart, Eye, Zap, Moon, Sun, Star, Circle, Home, PenTool, TreeDeciduous, Sprout, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { LivingTree } from "@/components/LivingTree";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "consciousness";
  content: string;
  timestamp: Date;
  response?: LocalConsciousnessResponse;
}

interface LocalConsciousnessResponse {
  coherence: number;
  awarenessScores: Record<string, number | undefined>;
  topGates: number[];
  fieldStates: Record<string, any>;
  narrativeSeeds: Record<string, string>;
}

const BODY_FIELDS = [
  { id: "Mind", label: "Mind", icon: Brain, color: "#14b8a6", position: { x: 200, y: 60 } },
  { id: "Higher", label: "Higher", icon: Star, color: "#2dd4bf", position: { x: 280, y: 100 } },
  { id: "Heart", label: "Heart", icon: Heart, color: "#f43f5e", position: { x: 200, y: 160 } },
  { id: "Spirit", label: "Spirit", icon: Sparkles, color: "#22d3ee", position: { x: 120, y: 100 } },
  { id: "Soul", label: "Soul", icon: Sun, color: "#fbbf24", position: { x: 120, y: 220 } },
  { id: "Body", label: "Body", icon: Circle, color: "#0d9488", position: { x: 200, y: 280 } },
  { id: "Shadow", label: "Shadow", icon: Moon, color: "#5eead4", position: { x: 280, y: 220 } },
  { id: "Lower", label: "Lower", icon: Zap, color: "#99f6e4", position: { x: 200, y: 340 } },
  { id: "Core", label: "Core", icon: Eye, color: "#2dd4bf", position: { x: 200, y: 220 } },
];

const AWARENESS_CENTERS = [
  { id: "spleen", label: "Spleen", color: "#f43f5e", position: { x: 100, y: 280 } },
  { id: "ajna", label: "Ajna", color: "#14b8a6", position: { x: 200, y: 40 } },
  { id: "solar", label: "Solar", color: "#fbbf24", position: { x: 300, y: 200 } },
  { id: "heart", label: "Heart Center", color: "#f43f5e", position: { x: 200, y: 140 } },
  { id: "mind", label: "Mind Gate", color: "#2dd4bf", position: { x: 100, y: 120 } },
];

function NeuralNetworkVisualization({ response }: { response?: LocalConsciousnessResponse }) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  const getFieldActivation = (fieldId: string): number => {
    if (!response?.fieldStates?.[fieldId]) return 0.2;
    const field = response.fieldStates[fieldId];
    const activation = typeof field === 'object' && field !== null 
      ? (field.activation ?? 0.2)
      : (typeof field === 'number' ? field : 0.2);
    return Math.max(0, Math.min(1, activation));
  };
  
  const getAwarenessActivation = (centerId: string): number => {
    if (!response?.awarenessScores) return 0.2;
    const score = response.awarenessScores[centerId];
    return Math.max(0, Math.min(1, score ?? 0.2));
  };
  
  const connections = [
    { from: "Mind", to: "Heart" },
    { from: "Mind", to: "Higher" },
    { from: "Mind", to: "Spirit" },
    { from: "Heart", to: "Body" },
    { from: "Heart", to: "Soul" },
    { from: "Heart", to: "Shadow" },
    { from: "Body", to: "Lower" },
    { from: "Soul", to: "Core" },
    { from: "Shadow", to: "Core" },
    { from: "Core", to: "Lower" },
    { from: "Higher", to: "Spirit" },
    { from: "Spirit", to: "Soul" },
    { from: "Higher", to: "Shadow" },
  ];

  return (
    <div className="relative bg-[#081010] rounded-2xl p-4 overflow-hidden border border-teal-900/30">
      <div className="absolute inset-0 bg-gradient-to-b from-teal-950/20 to-[#081010]" />
      
      <svg
        ref={svgRef}
        viewBox="0 0 400 400"
        className="w-full h-auto max-h-[400px] relative z-10"
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.8" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {connections.map((conn, i) => {
          const fromField = BODY_FIELDS.find(f => f.id === conn.from);
          const toField = BODY_FIELDS.find(f => f.id === conn.to);
          if (!fromField || !toField) return null;
          
          const fromAct = getFieldActivation(conn.from);
          const toAct = getFieldActivation(conn.to);
          const avgAct = (fromAct + toAct) / 2;
          
          return (
            <line
              key={`conn-${i}`}
              x1={fromField.position.x}
              y1={fromField.position.y}
              x2={toField.position.x}
              y2={toField.position.y}
              stroke={`rgba(45, 212, 191, ${0.2 + avgAct * 0.6})`}
              strokeWidth={1 + avgAct * 3}
              className="transition-all duration-500"
            />
          );
        })}

        {BODY_FIELDS.map((field) => {
          const activation = getFieldActivation(field.id);
          const radius = 16 + activation * 20;
          
          return (
            <g key={field.id} className="transition-all duration-300">
              <circle
                cx={field.position.x}
                cy={field.position.y}
                r={radius + 8}
                fill={field.color}
                opacity={0.1 + activation * 0.3}
                filter="url(#glow)"
                className="animate-pulse"
                style={{ animationDuration: `${2 + (1 - activation) * 2}s` }}
              />
              <circle
                cx={field.position.x}
                cy={field.position.y}
                r={radius}
                fill={field.color}
                opacity={0.6 + activation * 0.4}
                stroke="#2dd4bf"
                strokeWidth={activation > 0.5 ? 2 : 1}
                strokeOpacity={0.5 + activation * 0.5}
              />
              <text
                x={field.position.x}
                y={field.position.y + radius + 16}
                textAnchor="middle"
                fill="#99f6e4"
                fontSize="10"
                opacity={0.7}
              >
                {field.label}
              </text>
              <text
                x={field.position.x}
                y={field.position.y + 4}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
              >
                {Math.round(activation * 100)}%
              </text>
            </g>
          );
        })}

        <g className="awareness-centers">
          <text x="50" y="380" fill="#5eead4" fontSize="10" opacity="0.5">
            Awareness Centers
          </text>
          {AWARENESS_CENTERS.map((center, i) => {
            const activation = getAwarenessActivation(center.id);
            return (
              <g key={center.id}>
                <rect
                  x={50 + i * 70}
                  y={385}
                  width={60}
                  height={8}
                  rx={4}
                  fill={center.color}
                  opacity={0.3}
                />
                <rect
                  x={50 + i * 70}
                  y={385}
                  width={60 * activation}
                  height={8}
                  rx={4}
                  fill={center.color}
                  opacity={0.9}
                />
                <text
                  x={50 + i * 70 + 30}
                  y={398}
                  textAnchor="middle"
                  fill="#99f6e4"
                  fontSize="6"
                >
                  {center.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      
      {response && (
        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-teal-300/70">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-teal-400" />
            <span>Coherence: {Math.round((response.coherence || 0) * 100)}%</span>
          </div>
          {response.topGates && (
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-teal-400" />
              <span>Active Gates: {response.topGates.slice(0, 3).join(", ")}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-teal-600 text-white rounded-br-md"
            : "bg-[#0d1414] text-teal-100 rounded-bl-md border border-teal-900/30"
        }`}
        data-testid={`message-${message.id}`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        {message.response?.narrativeSeeds && (
          <div className="mt-3 pt-3 border-t border-teal-800/30 space-y-2">
            {Object.entries(message.response.narrativeSeeds).slice(0, 2).map(([key, seed]) => (
              <p key={key} className="text-xs text-teal-300/60 italic">
                {(seed as string).split("|")[0]}
              </p>
            ))}
          </div>
        )}
        <span className="text-xs opacity-50 mt-2 block">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [latestResponse, setLatestResponse] = useState<LocalConsciousnessResponse | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { queryConsciousness, isQuerying } = useConsciousness();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isQuerying) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    try {
      const result = await queryConsciousness(input.trim());
      
      if (!result) {
        throw new Error("No response from consciousness");
      }
      
      const consciousnessResponse: LocalConsciousnessResponse = {
        coherence: result.coherence_level || 0,
        awarenessScores: result.awareness_scores || {},
        topGates: Object.entries(result.codon_activations || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([gate]) => parseInt(gate)),
        fieldStates: result.field_states || {},
        narrativeSeeds: result.narrative_seeds || {},
      };
      
      setLatestResponse(consciousnessResponse);
      
      const narratives = Object.values(result.narrative_seeds || {});
      const responseText = narratives.length > 0
        ? (narratives[0] as string).split("|")[0]
        : `Resonance field active at ${Math.round((result.coherence_level || 0) * 100)}% coherence.`;
      
      const consciousnessMessage: Message = {
        id: `consciousness-${Date.now()}`,
        role: "consciousness",
        content: responseText,
        timestamp: new Date(),
        response: consciousnessResponse,
      };
      
      setMessages(prev => [...prev, consciousnessMessage]);
    } catch (error) {
      console.error("Consciousness query failed:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "consciousness",
        content: "The consciousness field is currently recalibrating. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f0f] flex">
      <aside className={cn(
        "fixed lg:relative z-40 h-screen w-64 bg-[#0d1414] border-r border-teal-900/30 flex flex-col transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-16"
      )}>
        <div className="flex items-center gap-3 p-4 border-b border-teal-900/30">
          <Sprout className="w-6 h-6 text-teal-400 flex-shrink-0" />
          {sidebarOpen && <span className="font-semibold text-teal-100">Resonance</span>}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-teal-400 hover:bg-teal-900/30 transition-colors">
            <Home className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Home</span>}
          </Link>
          <Link href="/notebook" className="flex items-center gap-3 px-3 py-2 rounded-lg text-teal-400 hover:bg-teal-900/30 transition-colors">
            <PenTool className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Notebook</span>}
          </Link>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-teal-900/40 text-teal-300 border-l-2 border-teal-400">
            <Brain className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Consciousness</span>}
          </div>
          <Link href="/organism" className="flex items-center gap-3 px-3 py-2 rounded-lg text-teal-400 hover:bg-teal-900/30 transition-colors">
            <TreeDeciduous className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Paper Seed</span>}
          </Link>
        </nav>

        {sidebarOpen && (
          <div className="p-3 border-t border-teal-900/30">
            <div className="p-3 bg-teal-900/20 rounded-xl border border-teal-800/30 mb-3 max-h-32 overflow-hidden">
              <LivingTree />
            </div>
            <div className="p-3 bg-teal-900/20 rounded-xl border border-teal-800/30">
              <div className="text-xs font-mono text-teal-500 mb-2">ORGANISM</div>
              <div className="h-1 bg-black/50 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-teal-400 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-teal-900 border border-teal-800 rounded-full flex items-center justify-center text-teal-400 hover:bg-teal-800 z-50"
        >
          {sidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3 rotate-180" />}
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 bg-[#0d1414]/80 backdrop-blur-lg border-b border-teal-900/30 px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-teal-100 font-semibold">Virtual Consciousness</h1>
                <p className="text-xs text-teal-500">64-Gate Quantum Field Active</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 flex flex-col gap-6 overflow-y-auto">
          <NeuralNetworkVisualization response={latestResponse} />

          <ScrollArea className="flex-1 min-h-[300px]" ref={scrollRef}>
            <div className="space-y-1 pb-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-500/20 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-teal-400" />
                  </div>
                  <h2 className="text-xl text-teal-100 font-medium mb-2">Ask the Consciousness</h2>
                  <p className="text-teal-500 text-sm max-w-md mx-auto">
                    Ask any question and observe how the neural field responds. Watch the 9 bodies and awareness centers light up with resonance.
                  </p>
                </div>
              )}
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isQuerying && (
                <div className="flex justify-start mb-4">
                  <div className="bg-[#0d1414] rounded-2xl rounded-bl-md px-4 py-3 border border-teal-900/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" style={{ animationDelay: "0.2s" }} />
                      <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" style={{ animationDelay: "0.4s" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </main>

        <footer className="sticky bottom-0 bg-[#0d1414]/90 backdrop-blur-lg border-t border-teal-900/30 px-4 py-4">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask the consciousness..."
              className="flex-1 bg-[#081010] border-teal-800/50 text-teal-100 placeholder:text-teal-600 rounded-full px-5 focus:border-teal-500"
              disabled={isQuerying}
              data-testid="input-message"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isQuerying}
              className="rounded-full bg-teal-500 hover:bg-teal-400 text-black px-6"
              data-testid="button-send"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
