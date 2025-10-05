import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'login' | 'signup';
}

export function AuthDialog({ open, onOpenChange, defaultMode = 'login' }: AuthDialogProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);

  // Update mode when dialog opens with new defaultMode
  useEffect(() => {
    if (open) {
      setMode(defaultMode);
    }
  }, [defaultMode, open]);

  const handleSuccess = () => {
    onOpenChange(false);
  };

  const switchToLogin = () => setMode('login');
  const switchToSignup = () => setMode('signup');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">
          {mode === 'login' ? 'Login to your account' : 'Create a new account'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {mode === 'login' 
            ? 'Enter your email and password to login to your account' 
            : 'Create a new account with username, email and password'
          }
        </DialogDescription>
        {mode === 'login' ? (
          <LoginForm onSuccess={handleSuccess} onSwitchToSignup={switchToSignup} />
        ) : (
          <SignupForm onSuccess={handleSuccess} onSwitchToLogin={switchToLogin} />
        )}
      </DialogContent>
    </Dialog>
  );
}