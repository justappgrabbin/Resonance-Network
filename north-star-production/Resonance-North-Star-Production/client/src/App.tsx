import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import NorthStarHome from "@/pages/NorthStarHome";
import Landing from "@/pages/Landing";
import PaperSeedLivingTree from "@/components/PaperSeedLivingTree";
import NotebookIDE from "@/pages/NotebookIDE";
import Chat from "@/pages/Chat";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={isAuthenticated ? NorthStarHome : Landing} />
      <Route path="/legacy" component={Home} />
      <Route path="/notebook" component={NotebookIDE} />
      <Route path="/chat" component={Chat} />
      <Route path="/organism" component={PaperSeedLivingTree} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
