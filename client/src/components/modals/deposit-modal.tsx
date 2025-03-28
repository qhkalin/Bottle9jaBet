import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSound } from '@/hooks/use-sound';
import { initializeDeposit } from '@/lib/monnify';
import { PaymentMethod } from '@/lib/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Phone, Banknote } from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [amount, setAmount] = useState(500);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { play } = useSound();
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setAmount(value);
    } else {
      setAmount(0);
    }
  };
  
  const handleMethodSelect = (method: PaymentMethod) => {
    play('click');
    setSelectedMethod(method);
    setShowBankDetails(method === 'ACCOUNT_TRANSFER');
  };
  
  const handleProceed = async () => {
    if (!selectedMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method",
        variant: "destructive"
      });
      return;
    }
    
    if (amount < 500) {
      toast({
        title: "Invalid Amount",
        description: "Minimum deposit amount is ₦500",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      play('click');
      
      const response = await initializeDeposit(amount, selectedMethod);
      
      // Redirect to Monnify checkout page
      window.location.href = response.checkoutUrl;
    } catch (error) {
      console.error("Deposit error:", error);
      toast({
        title: "Deposit Failed",
        description: "Could not process your deposit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">Deposit Funds</DialogTitle>
          <DialogDescription>
            Add money to your account to place bets.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deposit-amount">Amount (₦)</Label>
            <Input
              id="deposit-amount"
              type="number"
              min={500}
              step={100}
              value={amount}
              onChange={handleAmountChange}
              className="w-full p-3"
              placeholder="Enter amount"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={selectedMethod === 'ACCOUNT_TRANSFER' ? "default" : "outline"}
                className={`p-2 flex flex-col items-center h-auto ${
                  selectedMethod === 'ACCOUNT_TRANSFER' ? 'border-secondary' : ''
                }`}
                onClick={() => handleMethodSelect('ACCOUNT_TRANSFER')}
              >
                <Banknote className="mb-1 h-6 w-6" />
                <span className="text-xs">Bank Transfer</span>
              </Button>
              
              <Button
                variant={selectedMethod === 'CARD' ? "default" : "outline"}
                className={`p-2 flex flex-col items-center h-auto ${
                  selectedMethod === 'CARD' ? 'border-secondary' : ''
                }`}
                onClick={() => handleMethodSelect('CARD')}
              >
                <CreditCard className="mb-1 h-6 w-6" />
                <span className="text-xs">Card</span>
              </Button>
              
              <Button
                variant={selectedMethod === 'USSD' ? "default" : "outline"}
                className={`p-2 flex flex-col items-center h-auto ${
                  selectedMethod === 'USSD' ? 'border-secondary' : ''
                }`}
                onClick={() => handleMethodSelect('USSD')}
              >
                <Phone className="mb-1 h-6 w-6" />
                <span className="text-xs">USSD</span>
              </Button>
            </div>
          </div>
          
          {showBankDetails && (
            <div className="bg-muted rounded p-3 space-y-3" id="bank-details">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank Name:</span>
                <span className="font-medium">Monnify Bank</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Number:</span>
                <span className="font-medium">9393579338</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Name:</span>
                <span className="font-medium">Bottle9jaBet</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Your account will be credited automatically after payment is confirmed.
              </div>
            </div>
          )}
          
          <Button 
            className="w-full py-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
            onClick={handleProceed}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Proceed to Payment"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DepositModal;
