import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ResonanceField } from "@/components/ResonanceField";
import { NorthStarGraph } from "@/components/NorthStarGraph";
import { northStarApi } from "@/northstar/api";
import { cloneStarterWorkspace, type NorthStarWorkspaceState, type BuilderRun } from "@/northstar/workspace";
import type { EnterpriseOffer, Experiment, Mission, NetworkNode, Pathway } from "@/northstar/types";
import {
  Activity,
  ArrowRight,
  Beaker,
  Bell,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleDollarSign,
  Compass,
  Download,
  Cpu,
  FlaskConical,
  Globe2,
  Hammer,
  HeartHandshake,
  Home,
  Lightbulb,
  Link2,
  Loader2,
  LogOut,
  MapPin,
  Menu,
  Network,
  PackageOpen,
  Plus,
  Rocket,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  Users,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";

type Section = "command" | "purpose" | "design" | "network" | "missions" | "projects" | "science" | "enterprise" | "builder" | "worlds" | "synthia";

const nav: Array<{ id: Section; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "command", label: "Command", icon: Home },
  { id: "purpose", label: "Purpose", icon: Compass },
  { id: "design", label: "Design", icon: Activity },
  { id: "network", label: "People", icon: Users },
  { id: "missions", label: "Missions", icon: Target },
  { id: "projects", label: "Projects", icon: Network },
  { id: "science", label: "Science", icon: FlaskConical },
  { id: "enterprise", label: "Enterprise", icon: BriefcaseBusiness },
  { id: "builder", label: "Build + Launch", icon: Hammer },
  { id: "worlds", label: "Worlds", icon: Globe2 },
  { id: "synthia", label: "Synthia", icon: Bot },
];

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function SectionTitle({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="mb-6">
      <div className="text-[11px] uppercase tracking-[0.24em] text-primary font-semibold mb-2">{eyebrow}</div>
      <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground mt-2 max-w-3xl leading-relaxed">{copy}</p>
    </div>
  );
}

function Metric({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="ns-card p-4 md:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
          <div className="text-2xl md:text-3xl font-display font-bold mt-1">{value}</div>
          <div className="text-xs text-muted-foreground mt-2">{detail}</div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-white/8 bg-white/[0.035] text-xs text-muted-foreground">{children}</span>;
}

export default function NorthStarHome() {
  const { user, logout } = useAuth();
  const [workspace, setWorkspace] = useState<NorthStarWorkspaceState>(() => cloneStarterWorkspace());
  const [section, setSection] = useState<Section>("command");
  const [mobileNav, setMobileNav] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [saveState, setSaveState] = useState<"loading" | "saved" | "saving" | "local">("loading");
  const [search, setSearch] = useState("");
  const lastSaved = useRef("");

  useEffect(() => {
    let alive = true;
    northStarApi.getWorkspace()
      .then((result) => {
        if (!alive) return;
        if (result?.state) {
          setWorkspace(result.state as NorthStarWorkspaceState);
          lastSaved.current = JSON.stringify(result.state);
        } else {
          const seed = cloneStarterWorkspace();
          setWorkspace(seed);
          lastSaved.current = JSON.stringify(seed);
        }
        setSaveState("saved");
        setHydrated(true);
      })
      .catch(() => {
        if (!alive) return;
        setSaveState("local");
        setHydrated(true);
      });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const serialized = JSON.stringify(workspace);
    if (serialized === lastSaved.current) return;
    setSaveState("saving");
    const timer = window.setTimeout(() => {
      northStarApi.saveWorkspace(workspace, workspace.version)
        .then(() => {
          lastSaved.current = serialized;
          setSaveState("saved");
        })
        .catch(() => setSaveState("local"));
    }, 650);
    return () => window.clearTimeout(timer);
  }, [workspace, hydrated]);

  const update = (fn: (draft: NorthStarWorkspaceState) => void) => {
    setWorkspace((current) => {
      const next: NorthStarWorkspaceState = JSON.parse(JSON.stringify(current));
      fn(next);
      next.version = (current.version || 1) + 1;
      return next;
    });
  };

  const addActivity = (draft: NorthStarWorkspaceState, kind: NorthStarWorkspaceState["activity"][number]["kind"], title: string, detail: string) => {
    draft.activity.unshift({ id: id("activity"), kind, title, detail, createdAt: new Date().toISOString() });
    draft.activity = draft.activity.slice(0, 50);
  };

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return workspace.projects;
    return workspace.projects.filter((p) => [p.title, p.summary, ...p.tags, ...p.needs, ...p.offers].join(" ").toLowerCase().includes(q));
  }, [search, workspace.projects]);

  const exportWorkspace = () => {
    const blob = new Blob([JSON.stringify(workspace, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resonance-north-star-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const activeMission = workspace.missions.find((m) => m.status === "active") || workspace.missions[0];
  const completedActions = activeMission?.actions.filter((a) => a.done).length || 0;
  const totalActions = activeMission?.actions.length || 1;
  const support = workspace.projects.reduce((sum, p) => sum + (p.support || 0), 0);
  const avgResonance = Math.round(workspace.projects.reduce((sum, p) => sum + p.resonance, 0) / Math.max(workspace.projects.length, 1));

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <div className="fixed inset-0 pointer-events-none ns-ambient" />
      <header className="lg:hidden sticky top-0 z-50 border-b border-white/8 bg-background/90 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
        <button className="flex items-center gap-2" onClick={() => setSection("command")}>
          <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center"><Sparkles className="w-4 h-4" /></div>
          <div className="text-left"><div className="font-display font-bold">Resonance</div><div className="text-[10px] text-muted-foreground">North Star</div></div>
        </button>
        <button onClick={() => setMobileNav(true)} className="p-2 rounded-lg border border-white/8 bg-white/[0.03]"><Menu className="w-5 h-5" /></button>
      </header>

      {mobileNav && (
        <div className="fixed inset-0 z-[80] lg:hidden bg-black/60 backdrop-blur-sm" onClick={() => setMobileNav(false)}>
          <aside className="w-[86%] max-w-sm h-full bg-background border-r border-white/10 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5"><strong className="font-display">Move through the network</strong><button onClick={() => setMobileNav(false)}><X className="w-5 h-5" /></button></div>
            <NavList section={section} setSection={(s) => { setSection(s); setMobileNav(false); }} />
          </aside>
        </div>
      )}

      <div className="relative z-10 max-w-[1800px] mx-auto lg:grid lg:grid-cols-[250px_minmax(0,1fr)_320px] min-h-screen">
        <aside className="hidden lg:flex sticky top-0 h-screen border-r border-white/8 p-4 flex-col bg-background/65 backdrop-blur-xl">
          <button className="flex items-center gap-3 px-2 py-2 mb-5" onClick={() => setSection("command")}>
            <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-[0_0_30px_hsl(var(--primary)/0.18)]"><Sparkles className="w-5 h-5" /></div>
            <div className="text-left"><div className="font-display font-bold text-lg">Resonance</div><div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">North Star Network</div></div>
          </button>

          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..." className="ns-input pl-9" />
          </div>
          <NavList section={section} setSection={setSection} />
          <div className="mt-auto pt-4 border-t border-white/8 space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
              <span>Workspace</span>
              <span className="flex items-center gap-1.5">{saveState === "saving" ? <Loader2 className="w-3 h-3 animate-spin" /> : <span className={`w-2 h-2 rounded-full ${saveState === "saved" ? "bg-emerald-400" : "bg-amber-400"}`} />}{saveState}</span>
            </div>
            <button onClick={exportWorkspace} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] rounded-xl"><Download className="w-4 h-4" /> Export workspace</button>
            <button onClick={() => logout()} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] rounded-xl"><LogOut className="w-4 h-4" /> Sign out</button>
          </div>
        </aside>

        <main className="min-w-0 p-4 md:p-7 lg:p-9 pb-28 lg:pb-10">
          {section === "command" && <CommandView workspace={workspace} setSection={setSection} activeMission={activeMission} completedActions={completedActions} totalActions={totalActions} support={support} avgResonance={avgResonance} />}
          {section === "purpose" && <PurposeView workspace={workspace} update={update} />}
          {section === "design" && <DesignView workspace={workspace} />}
          {section === "network" && <NetworkView workspace={workspace} update={update} />}
          {section === "missions" && <MissionsView workspace={workspace} update={update} addActivity={addActivity} />}
          {section === "projects" && <ProjectsView workspace={workspace} projects={filteredProjects} update={update} addActivity={addActivity} />}
          {section === "science" && <ScienceView workspace={workspace} update={update} addActivity={addActivity} />}
          {section === "enterprise" && <EnterpriseView workspace={workspace} update={update} addActivity={addActivity} />}
          {section === "builder" && <BuilderView workspace={workspace} update={update} addActivity={addActivity} />}
          {section === "worlds" && <WorldsView workspace={workspace} update={update} />}
          {section === "synthia" && <SynthiaView workspace={workspace} update={update} addActivity={addActivity} />}
        </main>

        <aside className="hidden xl:block sticky top-0 h-screen border-l border-white/8 p-5 bg-background/45 backdrop-blur-lg overflow-y-auto">
          <div className="flex items-center justify-between mb-5"><div><div className="text-[10px] uppercase tracking-[0.22em] text-primary">Live field</div><div className="font-display font-semibold">What matters now</div></div><Bell className="w-4 h-4 text-muted-foreground" /></div>
          <div className="ns-card p-4 mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold"><Bot className="w-4 h-4 text-primary" /> Synthia</div>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{workspace.synthia.currentFocus}</p>
            <button onClick={() => setSection("synthia")} className="ns-link mt-4">Open companion <ChevronRight className="w-4 h-4" /></button>
          </div>
          {activeMission && <div className="ns-card p-4 mb-4"><div className="text-xs uppercase tracking-wider text-muted-foreground">Active mission</div><div className="font-semibold mt-2">{activeMission.title}</div><div className="mt-4 h-2 rounded-full bg-white/5 overflow-hidden"><div className="h-full bg-primary" style={{ width: `${(completedActions / totalActions) * 100}%` }} /></div><div className="text-xs text-muted-foreground mt-2">{completedActions} of {totalActions} actions complete</div></div>}
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Recent signals</div>
            {workspace.activity.slice(0, 5).map((a) => <div key={a.id} className="border-l border-white/10 pl-3"><div className="text-sm font-medium">{a.title}</div><div className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.detail}</div></div>)}
          </div>
        </aside>
      </div>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/94 backdrop-blur-xl border-t border-white/8 px-2 py-2 grid grid-cols-5 gap-1">
        {nav.slice(0, 5).map((item) => <button key={item.id} onClick={() => setSection(item.id)} className={`py-2 rounded-xl flex flex-col items-center gap-1 text-[10px] ${section === item.id ? "bg-primary/12 text-primary" : "text-muted-foreground"}`}><item.icon className="w-4 h-4" />{item.label}</button>)}
      </nav>
    </div>
  );
}

function NavList({ section, setSection }: { section: Section; setSection: (section: Section) => void }) {
  return <nav className="space-y-1 overflow-y-auto">{nav.map((item) => <button key={item.id} onClick={() => setSection(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${section === item.id ? "bg-primary/12 text-primary border border-primary/15" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04] border border-transparent"}`}><item.icon className="w-4 h-4" /><span>{item.label}</span></button>)}</nav>;
}

function CommandView({ workspace, setSection, activeMission, completedActions, totalActions, support, avgResonance }: any) {
  return <>
    <SectionTitle eyebrow="One network, one living loop" title="Turn purpose into outcomes" copy="Your companion, people, missions, projects, experiments, enterprise opportunities, creator tools, and worlds share the same state. Each surface should move the work forward." />
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-7">
      <Metric label="Live projects" value={String(workspace.projects.length)} detail={`${workspace.projects.filter((p: NetworkNode) => p.status === "active" || p.status === "testing").length} moving now`} icon={Network} />
      <Metric label="Resonance" value={`${avgResonance}%`} detail="project fit + momentum" icon={Zap} />
      <Metric label="Network support" value={formatMoney(support)} detail="visible support across nodes" icon={CircleDollarSign} />
      <Metric label="Replications" value={String(workspace.projects.reduce((n: number, p: NetworkNode) => n + p.replications, 0))} detail="ideas tested by others" icon={Beaker} />
    </div>
    <div className="grid xl:grid-cols-[1.25fr_.75fr] gap-5 mb-7">
      <div className="ns-card p-5 md:p-6">
        <div className="flex items-center justify-between gap-4 mb-4"><div><div className="text-xs uppercase tracking-wider text-primary">Optimal vector</div><h2 className="font-display text-2xl font-bold mt-1">{workspace.purpose.currentVector}</h2></div><Compass className="w-8 h-8 text-primary shrink-0" /></div>
        <p className="text-sm text-muted-foreground leading-relaxed">This is the current bridge between who you are, what the project needs, who can help, and what can be observed next.</p>
        <div className="flex flex-wrap gap-2 mt-5"><button onClick={() => setSection("purpose")} className="ns-primary">Refine purpose <ArrowRight className="w-4 h-4" /></button><button onClick={() => setSection("network")} className="ns-secondary">Find people</button><button onClick={() => setSection("builder")} className="ns-secondary">Build something</button></div>
      </div>
      {activeMission && <div className="ns-card p-5 md:p-6"><div className="text-xs uppercase tracking-wider text-muted-foreground">Active mission</div><h3 className="font-display text-xl font-bold mt-2">{activeMission.title}</h3><p className="text-sm text-muted-foreground mt-2">{activeMission.objective}</p><div className="mt-5 h-2 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${Math.round((completedActions / totalActions) * 100)}%` }} /></div><div className="flex justify-between text-xs text-muted-foreground mt-2"><span>{completedActions}/{totalActions} actions</span><span>{activeMission.resonance}% resonance</span></div><button onClick={() => setSection("missions")} className="ns-link mt-4">Continue mission <ChevronRight className="w-4 h-4" /></button></div>}
    </div>
    <div className="mb-7"><NorthStarGraph projects={workspace.projects} matches={workspace.matches} missions={workspace.missions} /></div>
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
      {[{ t: "Pathways to Purpose", c: "Translate identity, constraints, strengths, and goals into a living roadmap.", i: Compass, s: "purpose" },{ t: "Resonance Network", c: "Match by complementary capability, context, shared goals, and active needs.", i: HeartHandshake, s: "network" },{ t: "Science + Enterprise", c: "Send a project toward replication, revenue, or both without splitting the ecosystem.", i: FlaskConical, s: "science" },{ t: "Creator Launcher", c: "Bring a ZIP or repository in, make it legible, attach it to a node, and launch.", i: Rocket, s: "builder" }].map((card: any) => <button key={card.t} onClick={() => setSection(card.s)} className="ns-card p-5 text-left hover:border-primary/30 transition"><card.i className="w-5 h-5 text-primary mb-4" /><div className="font-semibold">{card.t}</div><div className="text-sm text-muted-foreground mt-2 leading-relaxed">{card.c}</div></button>)}
    </div>
  </>;
}

function PurposeView({ workspace, update }: { workspace: NorthStarWorkspaceState; update: (fn: (draft: NorthStarWorkspaceState) => void) => void }) {
  const p = workspace.purpose;
  const setList = (key: "strengths" | "needs" | "constraints" | "interests", value: string) => update((d) => { d.purpose[key] = value.split("\n").map(v => v.trim()).filter(Boolean); });
  return <><SectionTitle eyebrow="Pathways to Purpose" title="Your roadmap should move" copy="Onboarding is not a personality report. It gives Synthia and the network enough context to turn strengths, goals, constraints, and timing into practical next moves." />
    <div className="grid xl:grid-cols-2 gap-5">
      <div className="ns-card p-5 space-y-4"><label className="ns-label">What are you trying to make true?</label><textarea className="ns-textarea min-h-28" value={p.intention} onChange={(e) => update(d => { d.purpose.intention = e.target.value; })} /><label className="ns-label">Current optimal vector</label><textarea className="ns-textarea min-h-24" value={p.currentVector} onChange={(e) => update(d => { d.purpose.currentVector = e.target.value; })} /><div className="grid md:grid-cols-3 gap-3"><input className="ns-input" type="date" value={p.birthDate || ""} onChange={(e) => update(d => { d.purpose.birthDate = e.target.value; })} /><input className="ns-input" type="time" value={p.birthTime || ""} onChange={(e) => update(d => { d.purpose.birthTime = e.target.value; })} /><input className="ns-input" placeholder="Birth place" value={p.birthPlace || ""} onChange={(e) => update(d => { d.purpose.birthPlace = e.target.value; })} /></div><div className="text-xs text-muted-foreground flex items-start gap-2"><ShieldCheck className="w-4 h-4 mt-0.5 text-primary" /> Birth information can feed your Human Design/resonance engine. The purpose layer still works when someone chooses not to provide it.</div></div>
      <div className="grid sm:grid-cols-2 gap-4">{([['strengths','Strengths'],['needs','Needs'],['constraints','Constraints'],['interests','Interests']] as const).map(([key,label]) => <div key={key} className="ns-card p-4"><label className="ns-label">{label}</label><textarea className="ns-textarea min-h-36 mt-2" value={p[key].join("\n")} onChange={(e) => setList(key, e.target.value)} /></div>)}</div>
    </div>
    <div className="mt-6"><h2 className="font-display text-xl font-bold mb-4">Living roadmap</h2><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">{p.roadmap.map((r, i) => <div className="ns-card p-4" key={`${r.title}-${i}`}><div className="text-[10px] uppercase tracking-wider text-primary">{r.status}</div><div className="font-semibold mt-2">{r.title}</div><div className="text-sm text-muted-foreground mt-2">{r.detail}</div></div>)}</div></div>
  </>;
}


function DesignView({ workspace }: { workspace: NorthStarWorkspaceState }) {
  const [profile, setProfile] = useState<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "offline">("loading");
  useEffect(() => {
    fetch("/api/resonance/profile", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        const data = await r.json();
        setProfile(data);
        setStatus(data ? "ready" : "empty");
      })
      .catch(() => setStatus("offline"));
  }, []);
  return <>
    <SectionTitle eyebrow="Human Design + resonance mechanics" title="Design is an input to action, not the destination" copy="The design layer can hold chart-derived data, Human Design and I Ching relationships, field coherence, and your resonance model. It feeds purpose, matching, missions, and reflection while keeping observations separate from research claims." />
    <div className="grid xl:grid-cols-[440px_1fr] gap-5">
      <ResonanceField />
      <div className="space-y-4">
        <div className="ns-card p-5">
          <div className="flex items-center justify-between"><div><div className="text-xs uppercase tracking-wider text-primary">Engine status</div><div className="font-display text-xl font-bold mt-1">{status === "ready" ? "Profile connected" : status === "empty" ? "Profile ready for calculation" : status === "offline" ? "Profile service offline" : "Loading profile"}</div></div><Cpu className="w-7 h-7 text-primary" /></div>
          <div className="grid sm:grid-cols-3 gap-3 mt-5"><div className="rounded-xl border border-white/7 p-3"><div className="text-[10px] uppercase text-muted-foreground">Birth date</div><div className="text-sm mt-1">{workspace.purpose.birthDate || "not set"}</div></div><div className="rounded-xl border border-white/7 p-3"><div className="text-[10px] uppercase text-muted-foreground">Birth time</div><div className="text-sm mt-1">{workspace.purpose.birthTime || "not set"}</div></div><div className="rounded-xl border border-white/7 p-3"><div className="text-[10px] uppercase text-muted-foreground">Birth place</div><div className="text-sm mt-1">{workspace.purpose.birthPlace || "not set"}</div></div></div>
          {profile && <div className="mt-5 rounded-xl bg-black/20 border border-white/7 p-4"><div className="text-xs uppercase tracking-wider text-muted-foreground">Stored resonance profile</div><div className="text-sm mt-2">Field coherence: <span className="text-primary font-semibold">{profile.fieldCoherence ?? 0}%</span></div></div>}
        </div>
        <div className="ns-card p-5"><div className="text-xs uppercase tracking-wider text-muted-foreground">How this layer is used</div><div className="grid sm:grid-cols-2 gap-3 mt-3">{[
          ["Purpose", "Translate recurring strengths, constraints, and timing into a roadmap."],
          ["Matching", "Add design complementarity to shared goals, needs, context, and evidence."],
          ["Missions", "Shape action prompts around the person's decision and energy framework."],
          ["Learning", "Compare predicted fit with actual outcomes so the system can be tested and refined."],
        ].map(([t,c]) => <div key={t} className="rounded-xl border border-white/7 p-3"><div className="font-semibold">{t}</div><div className="text-sm text-muted-foreground mt-1">{c}</div></div>)}</div></div>
      </div>
    </div>
  </>;
}

function NetworkView({ workspace, update }: { workspace: NorthStarWorkspaceState; update: (fn: (draft: NorthStarWorkspaceState) => void) => void }) {
  return <><SectionTitle eyebrow="Resonance matching" title="Find the missing relationship" copy="The network prioritizes complementarity around live goals. A useful match explains why the person matters now, what they can contribute, and what remains under the user's control." />
    <div className="ns-card p-4 mb-5 flex flex-wrap gap-4 items-center justify-between"><div><div className="font-semibold">Context controls</div><div className="text-sm text-muted-foreground">Need-in-Proximity and availability only operate after opt-in.</div></div><div className="flex flex-wrap gap-4 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={workspace.settings.locationOptIn} onChange={(e) => update(d => { d.settings.locationOptIn = e.target.checked; })} /> location zones</label><label className="flex items-center gap-2"><input type="checkbox" checked={workspace.settings.availabilityOptIn} onChange={(e) => update(d => { d.settings.availabilityOptIn = e.target.checked; })} /> availability</label><label className="flex items-center gap-2"><input type="checkbox" checked={workspace.settings.allowIntroductions} onChange={(e) => update(d => { d.settings.allowIntroductions = e.target.checked; })} /> introductions</label></div></div>
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{workspace.matches.map((m) => <div key={m.id} className="ns-card p-5"><div className="flex items-center justify-between"><div><div className="font-display text-xl font-bold">{m.name}</div><div className="text-sm text-primary">{m.role}</div></div><div className="w-14 h-14 rounded-full border border-primary/25 bg-primary/8 flex items-center justify-center font-display font-bold text-primary">{m.resonance}%</div></div><div className="mt-5"><div className="text-xs uppercase tracking-wider text-muted-foreground">Strength</div><p className="text-sm mt-1">{m.strength}</p></div><div className="mt-4"><div className="text-xs uppercase tracking-wider text-muted-foreground">Why now</div><p className="text-sm mt-1 text-muted-foreground">{m.complement}</p></div><div className="flex gap-2 flex-wrap mt-4">{m.availableFor.map(v => <Pill key={v}>{v}</Pill>)}</div><div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground"><MapPin className="w-3.5 h-3.5" />{m.zone}</div><button className="ns-primary mt-5 w-full justify-center">Open collaboration <ArrowRight className="w-4 h-4" /></button></div>)}</div>
  </>;
}

function MissionsView({ workspace, update, addActivity }: any) {
  const [title, setTitle] = useState("");
  const create = () => { if (!title.trim()) return; update((d: NorthStarWorkspaceState) => { const mission: Mission = { id: id("mission"), title: title.trim(), objective: "Define the measurable outcome and move the work one bounded step forward.", pathway: "purpose", status: "queued", role: "Creator", whyNow: "This mission was created from the current North Star workspace.", actions: [{ id: id("action"), label: "Define the outcome", done: false }, { id: id("action"), label: "Do the first observable action", done: false }], evidence: [], resonance: 75 }; d.missions.unshift(mission); addActivity(d, "mission", "Mission created", mission.title); }); setTitle(""); };
  return <><SectionTitle eyebrow="Mission Advisor" title="Calculated action, visible evidence" copy="Missions convert a roadmap into bounded real-world action. Each one names why it matters now, the role being played, the actions, and the evidence that closes the loop." />
    <div className="ns-card p-4 mb-5 flex gap-2"><input className="ns-input flex-1" placeholder="Create a mission..." value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && create()} /><button onClick={create} className="ns-primary"><Plus className="w-4 h-4" /> Add mission</button></div>
    <div className="space-y-4">{workspace.missions.map((m: Mission) => { const done = m.actions.filter(a => a.done).length; return <div key={m.id} className="ns-card p-5"><div className="flex flex-col md:flex-row md:items-start justify-between gap-4"><div><div className="flex items-center gap-2"><Pill>{m.status}</Pill><Pill>{m.pathway}</Pill><span className="text-xs text-primary">{m.resonance}%</span></div><h3 className="font-display text-xl font-bold mt-3">{m.title}</h3><p className="text-sm text-muted-foreground mt-1 max-w-3xl">{m.objective}</p></div><select className="ns-input md:w-36" value={m.status} onChange={(e) => update((d: NorthStarWorkspaceState) => { const x = d.missions.find(y => y.id === m.id); if (x) x.status = e.target.value as Mission["status"]; })}><option value="queued">queued</option><option value="active">active</option><option value="blocked">blocked</option><option value="complete">complete</option></select></div><div className="mt-5 grid lg:grid-cols-[1fr_300px] gap-5"><div className="space-y-2">{m.actions.map(a => <label key={a.id} className={`flex items-center gap-3 p-3 rounded-xl border ${a.done ? "border-primary/20 bg-primary/5" : "border-white/7 bg-white/[0.02]"}`}><input type="checkbox" checked={a.done} onChange={(e) => update((d: NorthStarWorkspaceState) => { const mission = d.missions.find(x => x.id === m.id); const action = mission?.actions.find(x => x.id === a.id); if (action) action.done = e.target.checked; if (mission && mission.actions.every(x => x.done)) { mission.status = "complete"; addActivity(d, "mission", "Mission completed", mission.title); } })} /><span className={a.done ? "line-through text-muted-foreground" : ""}>{a.label}</span></label>)}</div><div className="rounded-xl border border-white/7 p-4 bg-white/[0.02]"><div className="text-xs uppercase tracking-wider text-muted-foreground">Why now</div><p className="text-sm mt-2">{m.whyNow}</p><div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${(done / Math.max(m.actions.length, 1)) * 100}%` }} /></div><div className="text-xs text-muted-foreground mt-2">{done}/{m.actions.length} actions complete</div></div></div></div>; })}</div>
  </>;
}

function ProjectsView({ workspace, projects, update, addActivity }: any) {
  const [open, setOpen] = useState(false); const [title, setTitle] = useState(""); const [summary, setSummary] = useState(""); const [pathway, setPathway] = useState<Pathway>("hybrid");
  const create = () => { if (!title.trim()) return; update((d: NorthStarWorkspaceState) => { const node: NetworkNode = { id: id("node"), title: title.trim(), summary: summary.trim() || "New Resonance Network node", pathway, status: "forming", tags: [], needs: [], offers: [], targetOutcome: "Define the measurable outcome.", creator: "You", collaborators: 1, replications: 0, support: 0, resonance: 70 }; d.projects.unshift(node); addActivity(d, "project", "Project node created", node.title); }); setTitle(""); setSummary(""); setOpen(false); };
  return <><SectionTitle eyebrow="Project nodes" title="Publish work people can join" copy="A node is more than a post. It exposes the goal, needs, offers, progress, replication lineage, support, and a concrete next action so collaboration has somewhere to land." />
    <div className="flex gap-3 mb-5"><button onClick={() => setOpen(!open)} className="ns-primary"><Plus className="w-4 h-4" /> New node</button><div className="text-sm text-muted-foreground self-center">{projects.length} visible node{projects.length === 1 ? "" : "s"}</div></div>
    {open && <div className="ns-card p-5 mb-5 grid md:grid-cols-2 gap-3"><input className="ns-input" placeholder="Project title" value={title} onChange={(e) => setTitle(e.target.value)} /><select className="ns-input" value={pathway} onChange={(e) => setPathway(e.target.value as Pathway)}><option value="hybrid">hybrid</option><option value="science">science</option><option value="enterprise">enterprise</option><option value="purpose">purpose</option><option value="world">world</option></select><textarea className="ns-textarea md:col-span-2" placeholder="What is this project trying to do?" value={summary} onChange={(e) => setSummary(e.target.value)} /><div className="md:col-span-2 flex gap-2"><button onClick={create} className="ns-primary">Create node</button><button onClick={() => setOpen(false)} className="ns-secondary">Cancel</button></div></div>}
    <div className="grid md:grid-cols-2 gap-4">{projects.map((p: NetworkNode) => <div key={p.id} className="ns-card p-5"><div className="flex items-start justify-between gap-4"><div><div className="flex gap-2 flex-wrap"><Pill>{p.pathway}</Pill><Pill>{p.status}</Pill></div><h3 className="font-display text-xl font-bold mt-3">{p.title}</h3></div><div className="text-primary font-display font-bold">{p.resonance}%</div></div><p className="text-sm text-muted-foreground mt-3 leading-relaxed">{p.summary}</p><div className="grid grid-cols-3 gap-2 mt-5 text-center"><div className="rounded-xl bg-white/[0.025] border border-white/6 p-3"><div className="font-bold">{p.collaborators}</div><div className="text-[10px] text-muted-foreground">people</div></div><div className="rounded-xl bg-white/[0.025] border border-white/6 p-3"><div className="font-bold">{p.replications}</div><div className="text-[10px] text-muted-foreground">replications</div></div><div className="rounded-xl bg-white/[0.025] border border-white/6 p-3"><div className="font-bold">{formatMoney(p.support)}</div><div className="text-[10px] text-muted-foreground">support</div></div></div><div className="mt-4"><div className="text-xs uppercase tracking-wider text-muted-foreground">Target outcome</div><p className="text-sm mt-1">{p.targetOutcome}</p></div><div className="flex gap-2 flex-wrap mt-4">{p.needs.slice(0, 4).map(n => <Pill key={n}>needs: {n}</Pill>)}</div><div className="flex gap-2 mt-5"><button className="ns-primary flex-1 justify-center">Open node</button><button className="ns-secondary">Remix</button></div></div>)}</div>
  </>;
}

function ScienceView({ workspace, update, addActivity }: any) {
  const [title, setTitle] = useState("");
  const create = () => { if (!title.trim()) return; update((d: NorthStarWorkspaceState) => { const e: Experiment = { id: id("exp"), title: title.trim(), theory: "State the claim in a form that can be tested or observed.", variables: [], method: "Define a protocol another person can repeat.", observables: [], status: "draft", replications: 0 }; d.experiments.unshift(e); addActivity(d, "science", "Experiment created", e.title); }); setTitle(""); };
  return <><SectionTitle eyebrow="Resonance: Science" title="Make unconventional ideas testable" copy="Science nodes separate hypotheses, methods, variables, observations, and replication logs. The point is transparent inquiry, not automatic validation of the claim." />
    <div className="ns-card p-4 mb-5 flex gap-2"><input className="ns-input flex-1" placeholder="New experiment..." value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && create()} /><button onClick={create} className="ns-primary"><FlaskConical className="w-4 h-4" /> Start protocol</button></div>
    <div className="space-y-4">{workspace.experiments.map((e: Experiment) => <div key={e.id} className="ns-card p-5"><div className="flex flex-col md:flex-row md:items-start justify-between gap-4"><div><div className="flex gap-2"><Pill>{e.status}</Pill><Pill>{e.replications} replications</Pill></div><h3 className="font-display text-xl font-bold mt-3">{e.title}</h3></div><select className="ns-input md:w-36" value={e.status} onChange={(v) => update((d: NorthStarWorkspaceState) => { const x = d.experiments.find(y => y.id === e.id); if (x) x.status = v.target.value as Experiment["status"]; })}><option>draft</option><option>running</option><option>replicating</option><option>complete</option></select></div><div className="grid lg:grid-cols-2 gap-4 mt-5"><div><div className="ns-label">Theory / question</div><textarea className="ns-textarea mt-2 min-h-24" value={e.theory} onChange={(v) => update((d: NorthStarWorkspaceState) => { const x = d.experiments.find(y => y.id === e.id); if (x) x.theory = v.target.value; })} /></div><div><div className="ns-label">Method</div><textarea className="ns-textarea mt-2 min-h-24" value={e.method} onChange={(v) => update((d: NorthStarWorkspaceState) => { const x = d.experiments.find(y => y.id === e.id); if (x) x.method = v.target.value; })} /></div></div><div className="flex gap-2 mt-4"><button className="ns-secondary"><Upload className="w-4 h-4" /> Add data</button><button className="ns-secondary"><Beaker className="w-4 h-4" /> Replicate</button><button className="ns-primary"><BookOpen className="w-4 h-4" /> Publish protocol</button></div></div>)}</div>
  </>;
}

function EnterpriseView({ workspace, update, addActivity }: any) {
  const [title, setTitle] = useState(""); const [value, setValue] = useState("");
  const create = () => { if (!title.trim()) return; update((d: NorthStarWorkspaceState) => { const o: EnterpriseOffer = { id: id("offer"), title: title.trim(), type: "collaboration", value: value.trim() || "value negotiable", state: "open", description: "A network opportunity connected to a real project need or useful contribution." }; d.offers.unshift(o); addActivity(d, "enterprise", "Opportunity opened", o.title); }); setTitle(""); setValue(""); };
  return <><SectionTitle eyebrow="Resonance: Enterprise" title="Turn useful work into opportunity" copy="Products, services, jobs, collaborations, funding, and launches belong beside the projects that create them. Enterprise is how validated or useful work can sustain people and the network." />
    <div className="ns-card p-4 mb-5 grid sm:grid-cols-[1fr_180px_auto] gap-2"><input className="ns-input" placeholder="Opportunity title" value={title} onChange={(e) => setTitle(e.target.value)} /><input className="ns-input" placeholder="$ / terms" value={value} onChange={(e) => setValue(e.target.value)} /><button onClick={create} className="ns-primary"><Plus className="w-4 h-4" /> Open</button></div>
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{workspace.offers.map((o: EnterpriseOffer) => <div key={o.id} className="ns-card p-5"><div className="flex justify-between gap-3"><div><Pill>{o.type}</Pill><h3 className="font-display text-lg font-bold mt-3">{o.title}</h3></div><Pill>{o.state}</Pill></div><div className="text-primary font-semibold mt-3">{o.value}</div><p className="text-sm text-muted-foreground mt-3 leading-relaxed">{o.description}</p><div className="flex gap-2 mt-5"><button className="ns-primary flex-1 justify-center">Respond</button><button className="ns-secondary">Share</button></div></div>)}</div>
  </>;
}

function BuilderView({ workspace, update, addActivity }: any) {
  const [github, setGithub] = useState(""); const [uploading, setUploading] = useState(false); const [error, setError] = useState("");
  const addGithub = () => { if (!github.trim()) return; update((d: NorthStarWorkspaceState) => { const run: BuilderRun = { id: id("build"), sourceType: "github", sourceLabel: github.trim(), status: "received", createdAt: new Date().toISOString() }; d.builderRuns.unshift(run); addActivity(d, "builder", "Repository received", github.trim()); }); setGithub(""); };
  const upload = async (file?: File) => { if (!file) return; setUploading(true); setError(""); try { const asset = await northStarApi.uploadArchive(file); update((d: NorthStarWorkspaceState) => { const run: BuilderRun = { id: id("build"), sourceType: "zip", sourceLabel: file.name, status: "received", asset: { id: asset.id, name: asset.name, size: asset.size, sha256: asset.sha256, createdAt: asset.createdAt }, createdAt: new Date().toISOString() }; d.builderRuns.unshift(run); addActivity(d, "builder", "Archive stored", `${file.name} • ${Math.round(file.size / 1024)} KB`); }); } catch (e: any) { setError(e.message || "Upload failed"); } finally { setUploading(false); } };
  const promote = (run: BuilderRun) => update((d: NorthStarWorkspaceState) => { const x = d.builderRuns.find(r => r.id === run.id); if (x) x.status = "launched"; const node: NetworkNode = { id: id("node"), title: run.sourceLabel.replace(/\.zip$/i, ""), summary: "Project imported through the Creator Launcher and promoted into the Resonance Network.", pathway: "hybrid", status: "active", tags: ["creator launcher", run.sourceType], needs: ["define next collaborator"], offers: ["source package", "remixable project"], targetOutcome: "Define, launch, and measure the first useful outcome.", creator: "You", collaborators: 1, replications: 0, support: 0, resonance: 76 }; x!.projectId = node.id; d.projects.unshift(node); addActivity(d, "project", "Builder run promoted to node", node.title); });
  return <><SectionTitle eyebrow="Creator launcher" title="Bring the work in. Make it launchable." copy="The builder accepts real ZIP archives and repository references, preserves source identity, and promotes the result into a project node so the creator tool stays connected to purpose, collaboration, science, and enterprise." />
    <div className="grid lg:grid-cols-2 gap-5 mb-6"><label className="ns-card p-6 min-h-56 border-dashed cursor-pointer hover:border-primary/30 transition flex flex-col items-center justify-center text-center"><input type="file" accept=".zip,application/zip,application/x-zip-compressed" className="hidden" onChange={(e) => upload(e.target.files?.[0])} /><div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">{uploading ? <Loader2 className="w-5 h-5 text-primary animate-spin" /> : <PackageOpen className="w-5 h-5 text-primary" />}</div><div className="font-display text-xl font-bold">Drop a project ZIP</div><div className="text-sm text-muted-foreground mt-2 max-w-sm">Stored as an immutable source asset with size and SHA-256 provenance before it becomes a network node.</div>{error && <div className="text-sm text-red-400 mt-3">{error}</div>}</label><div className="ns-card p-6 min-h-56 flex flex-col justify-center"><Link2 className="w-6 h-6 text-primary mb-4" /><div className="font-display text-xl font-bold">Connect a repository</div><div className="text-sm text-muted-foreground mt-2 mb-4">Register the canonical source now. Deployment adapters can resolve the repository in the platform pipeline.</div><div className="flex gap-2"><input className="ns-input flex-1" placeholder="https://github.com/..." value={github} onChange={(e) => setGithub(e.target.value)} /><button onClick={addGithub} className="ns-primary">Add</button></div></div></div>
    <h2 className="font-display text-xl font-bold mb-3">Build intake</h2><div className="space-y-3">{workspace.builderRuns.length === 0 && <div className="ns-card p-6 text-center text-muted-foreground">No source packages have been added yet.</div>}{workspace.builderRuns.map((run: BuilderRun) => <div key={run.id} className="ns-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-white/[0.035] border border-white/8 flex items-center justify-center">{run.sourceType === "zip" ? <PackageOpen className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}</div><div><div className="font-semibold break-all">{run.sourceLabel}</div><div className="text-xs text-muted-foreground mt-1">{run.sourceType} • {run.status}{run.asset?.sha256 ? ` • sha ${run.asset.sha256.slice(0, 12)}` : ""}</div></div></div>{run.projectId ? <button className="ns-secondary"><Check className="w-4 h-4" /> Node created</button> : <button onClick={() => promote(run)} className="ns-primary"><Rocket className="w-4 h-4" /> Promote to node</button>}</div>)}</div>
  </>;
}

function WorldsView({ workspace, update }: any) {
  return <><SectionTitle eyebrow="YOU-N-I-VERSE" title="Worlds are shared contexts, not static skins" copy="Each world can carry its own host rules, project state, experiments, people, and Synthia behavior. Visitors adapt to the host world while identity and source lineage stay portable." />
    <div className="grid md:grid-cols-2 gap-4">{workspace.worlds.map((w: any) => <div key={w.id} className="ns-card p-5"><div className="flex items-center justify-between"><div><Pill>{w.status}</Pill><h3 className="font-display text-xl font-bold mt-3">{w.title}</h3></div><Globe2 className="w-8 h-8 text-primary" /></div><p className="text-sm text-muted-foreground mt-3">{w.description}</p><div className="mt-4"><div className="text-xs uppercase tracking-wider text-muted-foreground">Host contract</div><ul className="text-sm mt-2 space-y-2">{w.hostRules.map((r: string) => <li key={r} className="flex gap-2"><Check className="w-4 h-4 text-primary mt-0.5" />{r}</li>)}</ul></div><button className="ns-primary mt-5">Enter world <ArrowRight className="w-4 h-4" /></button></div>)}</div>
  </>;
}

function SynthiaView({ workspace, update, addActivity }: any) {
  const [question, setQuestion] = useState(""); const [reply, setReply] = useState(""); const [thinking, setThinking] = useState(false);
  const ask = async () => { if (!question.trim()) return; const q = question.trim(); setQuestion(""); setThinking(true); try { const response = await fetch("/api/consciousness/query", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q }) }); const data = await response.json(); const text = data.answer || data.response || data.message || data.result || "The local consciousness service returned without a text response."; setReply(typeof text === "string" ? text : JSON.stringify(text, null, 2)); update((d: NorthStarWorkspaceState) => { d.synthia.currentFocus = q; addActivity(d, "synthia", "Synthia focus updated", q); }); } catch { setReply("The local Synthia service is offline. Your North Star workspace is still available and continues saving independently."); } finally { setThinking(false); } };
  return <><SectionTitle eyebrow="Personal companion" title="Synthia travels with the work" copy="The companion is not a detached chatbot. She can hold the user's current vector, explain network context, move between mission, lab, builder, and world modes, and keep the next action attached to the larger purpose." />
    <div className="grid xl:grid-cols-[1fr_380px] gap-5"><div className="ns-card p-6"><div className="flex items-center gap-3 mb-5"><div className="w-12 h-12 rounded-2xl bg-primary/12 border border-primary/20 flex items-center justify-center"><Bot className="w-6 h-6 text-primary" /></div><div><div className="font-display text-2xl font-bold">{workspace.synthia.name}</div><div className="text-sm text-primary">{workspace.synthia.mode} mode</div></div></div><div className="rounded-2xl bg-white/[0.025] border border-white/7 p-4 min-h-40"><div className="text-xs uppercase tracking-wider text-muted-foreground">Current focus</div><p className="mt-2 leading-relaxed">{workspace.synthia.currentFocus}</p>{reply && <div className="mt-5 pt-5 border-t border-white/7 whitespace-pre-wrap text-sm text-muted-foreground">{reply}</div>}</div><div className="flex gap-2 mt-4"><input className="ns-input flex-1" value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask()} placeholder="Ask Synthia about the work..." /><button onClick={ask} disabled={thinking} className="ns-primary">{thinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}</button></div></div><div className="space-y-4"><div className="ns-card p-5"><div className="text-xs uppercase tracking-wider text-muted-foreground">Modes</div><div className="grid grid-cols-2 gap-2 mt-3">{(["companion","mission","lab","builder","world"] as const).map(mode => <button key={mode} onClick={() => update((d: NorthStarWorkspaceState) => { d.synthia.mode = mode; })} className={`px-3 py-2 rounded-xl border text-sm ${workspace.synthia.mode === mode ? "border-primary/30 bg-primary/10 text-primary" : "border-white/7 bg-white/[0.02] text-muted-foreground"}`}>{mode}</button>)}</div></div><div className="ns-card p-5"><div className="text-xs uppercase tracking-wider text-muted-foreground">Next actions</div><div className="space-y-3 mt-3">{workspace.synthia.nextActions.map((a: string) => <div key={a} className="flex gap-2 text-sm"><ChevronRight className="w-4 h-4 text-primary mt-0.5" />{a}</div>)}</div></div></div></div>
  </>;
}
