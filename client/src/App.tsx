import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Onboarding from "@/pages/Onboarding";
import Prompts from "@/pages/Prompts";
import Recording from "@/pages/Recording";
import PostSession from "@/pages/PostSession";
import Badges from "@/pages/Badges";

function Router() {
  const [location] = useLocation();
  
  return (
    <Layout currentPath={location}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/prompts" component={Prompts} />
        <Route path="/recording" component={Recording} />
        <Route path="/post-session" component={PostSession} />
        <Route path="/badges" component={Badges} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;
