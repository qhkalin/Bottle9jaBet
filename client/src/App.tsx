import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import ProfilePage from "@/pages/profile-page";
import DepositPage from "@/pages/deposit-page";
import WithdrawPage from "@/pages/withdraw-page";
import HistoryPage from "@/pages/history-page";
import { ProtectedRoute } from "./lib/protected-route";
import { FooterNav } from "@/components/navigation/footer-nav";
import { useLocation } from "wouter";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/deposit" component={DepositPage} />
      <ProtectedRoute path="/withdraw" component={WithdrawPage} />
      <ProtectedRoute path="/history" component={HistoryPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const showFooter = !location.startsWith("/auth");
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen pb-20">
        <Router />
        {showFooter && <FooterNav />}
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
