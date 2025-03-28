import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { TwoStepModalMode } from '@/lib/types';
import OtpInput from '@/components/ui/otp-input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: TwoStepModalMode;
}

export function VerificationModal({ isOpen, onClose, mode }: VerificationModalProps) {
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const { 
    verify2FASetupMutation, 
    verify2FAMutation,
    verifyEmailMutation 
  } = useAuth();
  
  // Set up countdown timer
  useEffect(() => {
    if (!isOpen) return;
    
    setTimer(300); // Reset timer when modal opens
    
    const interval = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isOpen]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleVerify = async () => {
    if (code.length !== 6) return;
    
    try {
      if (mode === 'setup') {
        await verify2FASetupMutation.mutateAsync({ code });
      } else if (mode === 'verification') {
        // This is for the initial verification after enabling 2FA
        // It's similar to 'setup' but might have different behaviors
        await verify2FASetupMutation.mutateAsync({ code });
      } else if (mode === 'login') {
        // This is for login verification (user ID would be passed from login form)
        // await verify2FAMutation.mutateAsync({ userId: someUserId, code });
      }
      
      onClose();
    } catch (error) {
      // Error handling is in the mutations
    }
  };
  
  const handleResendCode = () => {
    // Logic to resend verification code
    // Call the appropriate backend endpoint based on mode
    setTimer(300); // Reset timer
  };
  
  const isPending = 
    mode === 'setup' ? verify2FASetupMutation.isPending :
    mode === 'verification' ? verify2FASetupMutation.isPending :
    verify2FAMutation.isPending;
  
  const getTitle = () => {
    switch (mode) {
      case 'setup': return '2-Step Verification Setup';
      case 'verification': return 'Email Verification';
      case 'login': return '2-Step Verification';
      default: return 'Verification';
    }
  };
  
  const getDescription = () => {
    switch (mode) {
      case 'setup': return 'We\'ve sent a verification code to your email to set up 2-Step Verification.';
      case 'verification': return 'Please enter the verification code sent to your email.';
      case 'login': return 'Please enter the 2-Step Verification code sent to your email.';
      default: return 'Please enter the verification code.';
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">{getTitle()}</DialogTitle>
          <DialogDescription>
            {getDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="verification-code">Verification Code</Label>
            <OtpInput 
              length={6} 
              onChange={setCode} 
              value={code}
              autoFocus
            />
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground" id="verification-timer">
              Code expires in: {formatTime(timer)}
            </span>
            <Button 
              variant="link" 
              className="text-sm text-secondary p-0"
              onClick={handleResendCode}
              disabled={timer > 0}
            >
              Resend Code
            </Button>
          </div>
          
          <Button 
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
            onClick={handleVerify}
            disabled={code.length !== 6 || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default VerificationModal;
