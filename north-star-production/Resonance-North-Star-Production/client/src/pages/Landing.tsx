import React from "react";
import {
  ArrowRight,
  Beaker,
  Bot,
  BriefcaseBusiness,
  Compass,
  FlaskConical,
  Globe2,
  Hammer,
  HeartHandshake,
  Network,
  Rocket,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

const pillars = [
  { icon: Compass, title: "Pathways to Purpose", copy: "A personal roadmap that turns strengths, needs, constraints, interests, timing, and resonance context into useful next moves." },
  { icon: Users, title: "People + Roles", copy: "Find complementary collaborators around live project needs, shared goals, context, and capacity instead of popularity." },
  { icon: Target, title: "Missions + Field Projects", copy: "Move from insight to bounded action with a definition of done, evidence capture, and real-world feedback." },
  { icon: Network, title: "Project Nodes", copy: "Publish work people can join, test, comment on, remix, fund, replicate, and help move toward a measurable outcome." },
  { icon: FlaskConical, title: "Resonance: Science", copy: "Turn unconventional ideas into transparent hypotheses, protocols, observations, data, and replication lineage." },
  { icon: BriefcaseBusiness, title: "Resonance: Enterprise", copy: "Connect projects to products, services, jobs, funding, launches, and sustainable opportunities." },
  { icon: Hammer, title: "Creator Launcher", copy: "Bring in ZIPs and repositories, preserve source provenance, and promote working projects directly into the network." },
  { icon: Globe2, title: "YOU-N-I-VERSE", copy: "Shared worlds where humans, Synths, projects, experiments, and host rules can coexist without flattening every space into the same app." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <div className="fixed inset-0 pointer-events-none ns-ambient" />
      <nav className="sticky top-0 z-50 border-b border-white/8 bg-background/86 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center"><Sparkles className="w-5 h-5" /></div>
            <div><div className="font-display font-bold text-lg">Resonance Network</div><div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">YOU-N-I-VERSE</div></div>
          </div>
          <a href="/api/login" className="ns-primary">Enter the Network <ArrowRight className="w-4 h-4" /></a>
        </div>
      </nav>

      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-5 pt-20 md:pt-28 pb-20 grid lg:grid-cols-[1.08fr_.92fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/8 text-xs text-primary font-semibold mb-6"><Bot className="w-3.5 h-3.5" /> Purpose-driven social infrastructure</div>
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[.98]">Find what matters.<br /><span className="text-primary">Build it with the right people.</span></h1>
            <p className="text-lg md:text-xl text-muted-foreground mt-7 max-w-3xl leading-relaxed">The Resonance Network is where a personal AI companion, Human Design and resonance mechanics, collaborative missions, project nodes, citizen science, enterprise opportunities, creator tools, and shared worlds become one continuous path from intention to real outcomes.</p>
            <div className="flex flex-wrap gap-3 mt-8"><a href="/api/login" className="ns-primary">Start your Pathway <ArrowRight className="w-4 h-4" /></a><a href="#system" className="ns-secondary">See the system</a></div>
          </div>

          <div className="ns-card p-5 md:p-6">
            <div className="text-[11px] uppercase tracking-[0.22em] text-primary">The living loop</div>
            <div className="mt-5 space-y-3">
              {[
                ["1", "Know the person", "Purpose, strengths, needs, context, and a personal companion"],
                ["2", "Find the missing relationship", "People, roles, opportunities, and Need-in-Proximity"],
                ["3", "Act in the real world", "Missions, quests, field projects, and visible definitions of done"],
                ["4", "Make the work legible", "Nodes, protocols, launch packages, remixes, funding, and replication"],
                ["5", "Learn from the result", "Evidence, outcomes, friction, resonance, and the next optimal vector"],
              ].map(([n, title, copy]) => <div key={n} className="grid grid-cols-[42px_1fr] gap-3 items-start p-3 rounded-xl border border-white/7 bg-white/[0.02]"><div className="w-9 h-9 rounded-xl border border-primary/20 bg-primary/8 text-primary flex items-center justify-center font-display font-bold">{n}</div><div><div className="font-semibold">{title}</div><div className="text-sm text-muted-foreground mt-1">{copy}</div></div></div>)}
            </div>
          </div>
        </section>

        <section id="system" className="max-w-7xl mx-auto px-5 pb-24">
          <div className="text-center max-w-3xl mx-auto mb-10"><div className="text-xs uppercase tracking-[0.22em] text-primary font-semibold">One ecosystem</div><h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Every module has a job in the North Star</h2><p className="text-muted-foreground mt-3">The point is not to collect features. The point is to keep every feature connected to a human goal and a useful next action.</p></div>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">{pillars.map((p) => <div key={p.title} className="ns-card p-5"><div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4"><p.icon className="w-5 h-5 text-primary" /></div><h3 className="font-display text-lg font-bold">{p.title}</h3><p className="text-sm text-muted-foreground mt-2 leading-relaxed">{p.copy}</p></div>)}</div>
        </section>

        <section className="border-y border-white/8 bg-white/[0.018]">
          <div className="max-w-7xl mx-auto px-5 py-16 grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1"><div className="text-xs uppercase tracking-[0.22em] text-primary font-semibold">What makes it different</div><h2 className="font-display text-3xl font-bold mt-2">A social network that expects something to happen</h2></div>
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-4">{[
              [HeartHandshake, "Collaboration has a reason", "Connections are attached to a live need, role, project, mission, or opportunity."],
              [Beaker, "Claims can become tests", "Science paths keep theory, observation, methods, and replication lineage visible."],
              [Rocket, "Creation does not stop at posting", "Projects can move into build, launch, funding, jobs, services, and real-world delivery."],
              [Bot, "Synthia carries continuity", "The companion travels across purpose, mission, lab, builder, and world modes instead of resetting at every screen."],
            ].map(([Icon, title, copy]: any) => <div key={title} className="p-4 rounded-2xl border border-white/7"><Icon className="w-5 h-5 text-primary" /><div className="font-semibold mt-3">{title}</div><div className="text-sm text-muted-foreground mt-2">{copy}</div></div>)}</div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-5 py-24 text-center"><div className="ns-card p-8 md:p-12"><div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto"><Sparkles className="w-6 h-6" /></div><h2 className="font-display text-3xl md:text-4xl font-bold mt-5">Bring your unfinished thing.</h2><p className="text-muted-foreground mt-3 max-w-2xl mx-auto">An idea, a ZIP, an experiment, a skill, a problem, a half-built project, or simply a direction you cannot reach alone. The network should help turn it into motion.</p><a href="/api/login" className="ns-primary mt-7">Enter the Resonance Network <ArrowRight className="w-4 h-4" /></a></div></section>
      </main>
    </div>
  );
}
