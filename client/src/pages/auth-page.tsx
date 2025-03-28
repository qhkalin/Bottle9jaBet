import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import AuthForm from '@/components/auth/auth-form';

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  
  // Redirect to home if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      setLocation('/');
    }
  }, [user, isLoading, setLocation]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen login-bg flex flex-col justify-center items-center p-4 relative">
      {/* Logo */}
      <div className="mb-8 z-10">
        <h1 className="text-4xl font-heading font-bold text-center">
          <span className="text-primary">Bottle</span>
          <span className="text-secondary">9ja</span>
          <span className="text-primary">Bet</span>
        </h1>
        <p className="text-muted-foreground text-center mt-2">Spin the bottle & win big!</p>
      </div>
      
      {/* Auth Form */}
      <div className="z-10">
        <AuthForm />
      </div>
    </div>
  );
}
