import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { useAuth } from '@/hooks/useAuth';

export default function Auth() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(
    location === '/signup' ? 'signup' : 'login'
  );

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    setMode(location === '/signup' ? 'signup' : 'login');
  }, [location]);

  const handleSuccess = () => {
    navigate('/');
  };

  const switchToLogin = () => {
    setMode('login');
    navigate('/login');
  };

  const switchToSignup = () => {
    setMode('signup');
    navigate('/signup');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-purple-950/20 p-4">
      <div className="w-full max-w-md" data-testid="auth-page">
        {mode === 'login' ? (
          <LoginForm onSuccess={handleSuccess} onSwitchToSignup={switchToSignup} />
        ) : (
          <SignupForm onSuccess={handleSuccess} onSwitchToLogin={switchToLogin} />
        )}
      </div>
    </div>
  );
}
