import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Recording from "@/pages/Recording";
import PostSession from "@/pages/PostSession";
import Auth from "@/pages/Auth";
import Account from "@/pages/Account";
import Settings from "@/pages/Settings";
import ChallengePage from "@/pages/ChallengePage";
import WeeklyChallenge from "@/pages/WeeklyChallenge";
import WeeklyChallengeSelect from "@/pages/WeeklyChallengeSelect";
import Badges from "@/pages/Badges";
import Help from "@/pages/Help";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  const [location] = useLocation();
  
  // Determine if the current route should have the Layout
  const shouldHaveLayout = !['/auth'].includes(location);
  
  const content = (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <ProtectedRoute path="/recording" component={Recording} />
      <ProtectedRoute path="/post-session" component={PostSession} />
      <ProtectedRoute path="/account" component={Account} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/challenge" component={ChallengePage} />
      <ProtectedRoute path="/weekly-challenge" component={WeeklyChallenge} />
      <ProtectedRoute path="/weekly-challenge-select" component={WeeklyChallengeSelect} />
      <ProtectedRoute path="/badges" component={Badges} />
      <Route path="/help" component={Help} />
      <Route component={NotFound} />
    </Switch>
  );
  
  // Conditionally wrap with layout
  if (shouldHaveLayout) {
    return <Layout currentPath={location}>{content}</Layout>;
  }
  
  return content;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
