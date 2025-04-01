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

function Router() {
  const [location] = useLocation();
  
  // Determine if the current route should have the Layout
  const shouldHaveLayout = !['/auth'].includes(location);
  
  const content = (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/recording" component={Recording} />
      <Route path="/post-session" component={PostSession} />
      <Route path="/account" component={Account} />
      <Route path="/settings" component={Settings} />
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
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
