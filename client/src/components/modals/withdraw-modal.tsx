import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSound } from '@/hooks/use-sound';
import { getUserBankAccounts, processWithdrawal } from '@/lib/monnify';
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
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const [amount, setAmount] = useState(500);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingAccounts, setFetchingAccounts] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { play } = useSound();
  
  useEffect(() => {
    if (isOpen) {
      fetchBankAccounts();
    }
  }, [isOpen]);
  
  const fetchBankAccounts = async () => {
    try {
      setFetchingAccounts(true);
      const accounts = await getUserBankAccounts();
      setAccounts(accounts);
      
      // Set default account if available
      const defaultAccount = accounts.find(acc => acc.isDefault);
      if (defaultAccount) {
        setSelectedAccountId(defaultAccount.id);
      } else if (accounts.length > 0) {
        setSelectedAccountId(accounts[0].id);
      }
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      toast({
        title: "Error",
        description: "Could not fetch your bank accounts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setFetchingAccounts(false);
    }
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setAmount(value);
    } else {
      setAmount(0);
    }
  };
  
  const handleAccountSelect = (value: string) => {
    setSelectedAccountId(parseInt(value));
  };
  
  const handleWithdraw = async () => {
    if (!selectedAccountId) {
      toast({
        title: "Bank Account Required",
        description: "Please select a bank account",
        variant: "destructive"
      });
      return;
    }
    
    if (amount < 500) {
      toast({
        title: "Invalid Amount",
        description: "Minimum withdrawal amount is ₦500",
        variant: "destructive"
      });
      return;
    }
    
    if (!user || amount > user.balance / 100) { // Convert kobo to naira
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds to withdraw this amount",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      play('click');
      
      const response = await processWithdrawal(amount, selectedAccountId);
      
      if (response.status === "completed") {
        play('withdraw');
        toast({
          title: "Withdrawal Successful",
          description: `₦${amount.toLocaleString()} has been sent to your bank account.`,
        });
        onClose();
      } else {
        toast({
          title: "Withdrawal Failed",
          description: response.status,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast({
        title: "Withdrawal Failed",
        description: "Could not process your withdrawal. Please try again.",
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
          <DialogTitle className="text-xl font-heading font-bold">Withdraw Funds</DialogTitle>
          <DialogDescription>
            Withdraw money from your account to your bank account.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">Amount (₦)</Label>
            <Input
              id="withdraw-amount"
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
            <Label htmlFor="bank-account">Bank Account</Label>
            {fetchingAccounts ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : accounts.length === 0 ? (
              <div className="bg-muted rounded p-4 text-center">
                <p className="text-muted-foreground">No bank accounts found</p>
                <Button 
                  variant="link" 
                  className="mt-2 text-secondary"
                  onClick={() => {
                    onClose();
                    // Navigate to profile page
                    window.location.href = '/profile';
                  }}
                >
                  Add a bank account
                </Button>
              </div>
            ) : (
              <Select onValueChange={handleAccountSelect} defaultValue={selectedAccountId?.toString()}>
                <SelectTrigger id="bank-account" className="w-full p-3">
                  <SelectValue placeholder="Select a bank account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.bankName} - {account.accountNumber}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>
          
          <Button 
            className="w-full py-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
            onClick={handleWithdraw}
            disabled={loading || accounts.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Withdraw"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default WithdrawModal;
