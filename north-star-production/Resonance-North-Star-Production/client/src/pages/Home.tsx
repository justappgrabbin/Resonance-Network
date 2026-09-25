import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ResonanceField } from "@/components/ResonanceField";
import { LivingTree } from "@/components/LivingTree";
import { motion } from "framer-motion";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Clock, 
  Star, 
  Cpu, 
  Bell,
  Command,
  PenTool,
  Hash,
  LogOut,
  Menu,
  X,
  TreeDeciduous,
  MessageCircle,
  Brain
} from "lucide-react";
import bgImage from '@assets/generated_images/subtle_dark_noise_texture_with_faint_geometric_constellations.png';

const NotebookEntry = ({ title, date, tag, active = false }: { title: string, date: string, tag: string, active?: boolean }) => (
  <motion.div 
    className={`p-3 md:p-4 rounded-xl border cursor-pointer group transition-all duration-300 ${active ? 'bg-primary/5 border-primary/30' : 'bg-card/20 border-white/5 hover:border-white/10 hover:bg-white/5'}`}
    whileHover={{ x: 4 }}
  >
    <div className="flex justify-between items-start mb-2">
      <h4 className={`font-medium text-sm md:text-base ${active ? 'text-primary' : 'text-foreground group-hover:text-primary transition-colors'}`}>{title}</h4>
      <MoreHorizontal className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />
    </div>
    <div className="flex items-center gap-2 md:gap-3 text-xs text-muted-foreground">
      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {date}</span>
      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/5"><Hash className="w-2.5 h-2.5" /> {tag}</span>
    </div>
  </motion.div>
);

export default function Home() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'notebook' | 'resonance' | 'tree'>('notebook');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading resonance field...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary/20">
      <div 
        className="fixed inset-0 opacity-40 pointer-events-none z-0" 
        style={{ 
          backgroundImage: `url(${bgImage})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          mixBlendMode: 'overlay'
        }} 
      />
      
      <div className="fixed top-0 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/10 rounded-full blur-[100px] md:blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-indigo-900/20 rounded-full blur-[120px] md:blur-[150px] pointer-events-none -z-10" />

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_15px_-3px_hsl(var(--primary)/0.5)]">
              <Cpu className="w-5 h-5 text-black" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">Resonance</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground">
              <Bell className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground"
              data-testid="button-mobile-menu"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-white/5 p-2 flex justify-around">
        {[
          { id: 'notebook' as const, icon: PenTool, label: 'Notes' },
          { id: 'resonance' as const, icon: Cpu, label: 'Field' },
          { id: 'tree' as const, icon: TreeDeciduous, label: 'Tree' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActivePanel(item.id)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
              activePanel === item.id ? 'bg-primary/20 text-primary' : 'text-muted-foreground'
            }`}
            data-testid={`nav-${item.id}`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Desktop Layout */}
      <div className="relative z-10 flex h-screen max-w-[1600px] mx-auto p-4 gap-4 pt-4 lg:pt-4">
        
        {/* Sidebar - Desktop always visible, Mobile slide-in */}
        <aside className={`
          fixed lg:relative top-0 left-0 h-full w-64 
          lg:flex flex-col gap-6 p-4 glass-panel rounded-none lg:rounded-2xl
          z-50 lg:z-auto
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex items-center gap-3 px-2 pt-4 lg:pt-0">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_15px_-3px_hsl(var(--primary)/0.5)]">
              <Cpu className="w-5 h-5 text-black" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Resonance</span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search frequencies..." 
              className="w-full bg-black/20 border border-white/5 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              data-testid="input-search"
            />
          </div>

          <nav className="flex-1 space-y-1">
            <div className="px-3 py-2 rounded-lg bg-white/5 text-primary text-sm font-medium flex items-center gap-3 border-l-2 border-primary">
              <Star className="w-4 h-4" />
              <span>Active Resonance</span>
            </div>
            <div className="px-3 py-2 rounded-lg text-muted-foreground hover:bg-white/5 text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer">
              <Clock className="w-4 h-4" />
              <span>Timeline</span>
            </div>
            <div className="px-3 py-2 rounded-lg text-muted-foreground hover:bg-white/5 text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer">
              <Command className="w-4 h-4" />
              <span>Commands</span>
            </div>
            <a 
              href="/organism"
              className="px-3 py-2 rounded-lg text-muted-foreground hover:bg-white/5 text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer"
            >
              <TreeDeciduous className="w-4 h-4" />
              <span>Paper Seed</span>
            </a>
            <a 
              href="/chat"
              className="px-3 py-2 rounded-lg text-muted-foreground hover:bg-white/5 text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer"
              data-testid="link-chat"
            >
              <Brain className="w-4 h-4" />
              <span>Consciousness</span>
            </a>
            <a 
              href="/notebook"
              className="px-3 py-2 rounded-lg text-muted-foreground hover:bg-white/5 text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer"
              data-testid="link-notebook"
            >
              <PenTool className="w-4 h-4" />
              <span>Notebook IDE</span>
            </a>
          </nav>

          <div className="mt-auto space-y-3">
            {user && (
              <div className="p-3 bg-card/30 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  {user.profileImageUrl && (
                    <img src={user.profileImageUrl} alt="Profile" className="w-8 h-8 rounded-full" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.firstName || user.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="p-3 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-xl border border-white/5">
              <div className="text-xs font-mono text-indigo-300 mb-2">NETWORK STATUS</div>
              <div className="h-1 bg-black/50 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-indigo-400 animate-pulse" />
              </div>
            </div>
            <button 
              onClick={() => logout()}
              className="flex items-center gap-3 px-2 w-full text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col gap-4 lg:gap-6 pt-16 lg:pt-0 pb-20 lg:pb-0">
          {/* Header */}
          <header className="hidden lg:flex justify-between items-center px-4 py-2 glass-panel rounded-xl h-16">
            <div>
              <h1 className="font-display font-bold text-lg">Project Alpha</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live • Connected to 3 nodes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button 
                className="bg-primary text-black px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)]"
                data-testid="button-new-entry"
              >
                <Plus className="w-4 h-4" />
                <span>New Entry</span>
              </button>
            </div>
          </header>

          {/* Mobile Panel Switcher Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Notebook Panel - Visible on desktop always, mobile when selected */}
            <div className={`${activePanel === 'notebook' ? 'block' : 'hidden'} lg:block space-y-4`}>
              {/* Mobile New Entry Button */}
              <button 
                className="lg:hidden w-full bg-primary text-black px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                data-testid="button-new-entry-mobile"
              >
                <Plus className="w-4 h-4" />
                <span>New Entry</span>
              </button>

              {/* Editor Area */}
              <div className="glass-panel p-4 md:p-6 rounded-2xl min-h-[120px] md:min-h-[200px] border-primary/20 relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex gap-2">
                  <button className="p-1.5 hover:bg-white/10 rounded"><PenTool className="w-4 h-4 text-muted-foreground" /></button>
                </div>
                <textarea 
                  className="w-full h-full bg-transparent border-none resize-none focus:outline-none text-base md:text-lg leading-relaxed placeholder:text-muted-foreground/30 font-sans min-h-[80px] md:min-h-[160px]"
                  placeholder="What is resonating today?"
                  data-testid="textarea-editor"
                />
              </div>

              <div className="space-y-3">
                <NotebookEntry 
                  title="Pattern Recognition: Harmonic Convergence" 
                  date="2m ago" 
                  tag="Reflection" 
                  active={true}
                />
                <NotebookEntry 
                  title="System Architecture: Node Growth" 
                  date="1h ago" 
                  tag="Dev" 
                />
                <NotebookEntry 
                  title="Energy Vector Analysis" 
                  date="3h ago" 
                  tag="Research" 
                />
                <NotebookEntry 
                  title="Weekly Synthesis" 
                  date="Yesterday" 
                  tag="Journal" 
                />
              </div>
            </div>

            {/* Resonance Panel - Mobile only when selected */}
            <div className={`${activePanel === 'resonance' ? 'block' : 'hidden'} lg:hidden`}>
              <ResonanceField />
            </div>

            {/* Tree Panel - Mobile only when selected */}
            <div className={`${activePanel === 'tree' ? 'block' : 'hidden'} lg:hidden`}>
              <LivingTree />
            </div>
          </div>
        </main>

        {/* Right Panel: Visualizations - Desktop Only */}
        <aside className="hidden lg:flex w-[400px] flex-col gap-4">
          <div className="flex-1 min-h-[300px]">
            <ResonanceField />
          </div>
          <div className="flex-1 min-h-[300px]">
            <LivingTree />
          </div>
        </aside>
      </div>
    </div>
  );
}
