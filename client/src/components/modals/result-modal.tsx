import { BetResult } from '@/lib/types';
import { useSound } from '@/hooks/use-sound';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { useEffect } from 'react';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: BetResult | null;
}

export function ResultModal({ isOpen, onClose, result }: ResultModalProps) {
  const { play } = useSound();
  
  useEffect(() => {
    if (isOpen && result) {
      // Play appropriate sound
      if (result.isWin) {
        play('win');
      } else {
        play('lose');
      }
    }
  }, [isOpen, result, play]);
  
  if (!result) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={`text-2xl font-bold text-center ${
            result.isWin ? 'text-green-500' : 'text-red-500'
          }`}>
            {result.isWin ? (
              <div className="flex items-center justify-center">
                <CheckCircle className="mr-2 h-6 w-6" />
                Congratulations!
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <XCircle className="mr-2 h-6 w-6" />
                Better luck next time!
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 text-center">
          {result.isWin ? (
            <p className="text-lg">
              You won <span className="text-secondary font-bold">₦{result.winAmount.toLocaleString()}</span>!
            </p>
          ) : (
            <p className="text-lg">
              The winning number was <span className="text-secondary font-bold">{result.winningNumber}</span>
            </p>
          )}
          
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-left text-muted-foreground">Your number:</div>
              <div className="text-right font-medium">{result.selectedNumber}</div>
              
              <div className="text-left text-muted-foreground">Bet amount:</div>
              <div className="text-right font-medium">₦{result.betAmount.toLocaleString()}</div>
              
              <div className="text-left text-muted-foreground">Winning number:</div>
              <div className="text-right font-medium">{result.winningNumber}</div>
              
              {result.isWin && (
                <>
                  <div className="text-left text-muted-foreground">Win amount:</div>
                  <div className="text-right font-medium text-green-500">₦{result.winAmount.toLocaleString()}</div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={onClose} 
            className="w-full bg-primary hover:bg-primary/90"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ResultModal;
