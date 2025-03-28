import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSound } from '@/hooks/use-sound';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getBankList, 
  validateBankAccount, 
  getUserBankAccounts, 
  deleteBankAccount,
  setDefaultBankAccount
} from '@/lib/monnify';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  BankType, 
  BankAccountDetails 
} from '@/lib/types';
import { 
  Loader2, 
  Star, 
  Trash2, 
  Plus,
  CheckCircle2
} from 'lucide-react';
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader
} from '@/components/ui/card';
import { queryClient } from '@/lib/queryClient';

interface BankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BankAccountModal({ isOpen, onClose }: BankAccountModalProps) {
  const { user } = useAuth();
  const { play } = useSound();
  const { toast } = useToast();
  
  // Bank list state
  const [banks, setBanks] = useState<BankType[]>([]);
  const [fetchingBanks, setFetchingBanks] = useState(false);
  
  // Bank accounts state
  const [accounts, setAccounts] = useState<any[]>([]);
  const [fetchingAccounts, setFetchingAccounts] = useState(false);
  
  // Action states
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingDefault, setLoadingDefault] = useState(false);
  
  // Form state
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Fetch banks list
  useEffect(() => {
    if (isOpen) {
      fetchBanks();
      fetchAccounts();
    }
  }, [isOpen]);
  
  const fetchBanks = async () => {
    setFetchingBanks(true);
    try {
      const bankList = await getBankList();
      setBanks(bankList);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch bank list. Please try again.",
        variant: "destructive"
      });
    } finally {
      setFetchingBanks(false);
    }
  };
  
  const fetchAccounts = async () => {
    setFetchingAccounts(true);
    try {
      const bankAccounts = await getUserBankAccounts();
      setAccounts(bankAccounts);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch bank accounts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setFetchingAccounts(false);
    }
  };
  
  const handleDeleteAccount = async (accountId: number) => {
    setLoadingDelete(true);
    try {
      await deleteBankAccount(accountId);
      play('click');
      toast({
        title: "Success",
        description: "Bank account removed successfully",
      });
      
      // Refresh accounts
      fetchAccounts();
      
      // Update global query cache
      queryClient.invalidateQueries({ queryKey: ['/api/bank-accounts'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove bank account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingDelete(false);
    }
  };
  
  const handleSetDefault = async (accountId: number) => {
    setLoadingDefault(true);
    try {
      await setDefaultBankAccount(accountId);
      play('click');
      toast({
        title: "Success",
        description: "Default bank account updated",
      });
      
      // Refresh accounts
      fetchAccounts();
      
      // Update global query cache
      queryClient.invalidateQueries({ queryKey: ['/api/bank-accounts'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set default bank account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingDefault(false);
    }
  };
  
  const handleBankSelect = (bank: string) => {
    setSelectedBank(bank);
    // Reset account number validation when bank changes
    setValidated(false);
    setAccountName('');
  };
  
  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and limit to 10 digits
    if (/^\d*$/.test(value) && value.length <= 10) {
      setAccountNumber(value);
      // Reset validation when changing account number
      setValidated(false);
      setAccountName('');
      
      // Auto-validate when account number reaches 10 digits
      if (value.length === 10 && selectedBank) {
        validateAccount(value, selectedBank);
      }
    }
  };
  
  const validateAccount = async (accNumber: string, bankCode: string) => {
    if (!accNumber || accNumber.length !== 10 || !bankCode) {
      toast({
        title: "Validation Error",
        description: "Please select a bank and enter a 10-digit account number",
        variant: "destructive"
      });
      return;
    }
    
    setValidating(true);
    
    try {
      const result = await validateBankAccount(accNumber, bankCode);
      setAccountName(result.accountName);
      setValidated(true);
      play('click');
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Failed to validate account number. Please check and try again.",
        variant: "destructive"
      });
      setValidated(false);
      setAccountName('');
    } finally {
      setValidating(false);
    }
  };
  
  const handleAddAccount = async () => {
    if (!validated || !selectedBank || !accountNumber || !accountName) {
      toast({
        title: "Validation Error",
        description: "Please validate your account details first",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // The validateBankAccount function already performs the API call to add the account
      // So we just need to refresh our accounts
      play('click');
      toast({
        title: "Success",
        description: "Bank account added successfully",
      });
      
      // Refresh accounts
      fetchAccounts();
      
      // Update global query cache
      queryClient.invalidateQueries({ queryKey: ['/api/bank-accounts'] });
      
      // Reset form
      setSelectedBank('');
      setAccountNumber('');
      setAccountName('');
      setValidated(false);
    } catch (error) {
      // This should not happen since the validateBankAccount function already handled the API call
      toast({
        title: "Error",
        description: "Failed to add bank account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const selectedBankName = banks.find(bank => bank.code === selectedBank)?.name || '';
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">Bank Accounts</DialogTitle>
          <DialogDescription>
            Manage your bank accounts for withdrawals
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="accounts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="accounts">My Accounts</TabsTrigger>
            <TabsTrigger value="add">Add New</TabsTrigger>
          </TabsList>
          
          <TabsContent value="accounts" className="space-y-4 mt-4">
            {fetchingAccounts ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center p-6 bg-muted rounded-lg">
                <p className="mb-2">You don't have any bank accounts yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Add a bank account to withdraw your winnings
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map((account: any) => (
                  <Card key={account.id} className={account.isDefault ? "border-primary" : ""}>
                    <CardHeader className="py-3 px-4">
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{account.bankName}</div>
                        {account.isDefault && (
                          <div className="flex items-center text-xs text-primary">
                            <Star className="h-3 w-3 mr-1 fill-primary" />
                            <span>Default</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="py-2 px-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Account Number:</span>
                        <span>{account.accountNumber}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Account Name:</span>
                        <span>{account.accountName}</span>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between py-2 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAccount(account.id)}
                        disabled={loadingDelete || loadingDefault}
                      >
                        {loadingDelete ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                      
                      {!account.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleSetDefault(account.id)}
                          disabled={loadingDelete || loadingDefault}
                        >
                          {loadingDefault ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <Star className="h-4 w-4 mr-1" />
                          )}
                          Set as Default
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="add" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bank">Select Bank</Label>
                {fetchingBanks ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading banks...</span>
                  </div>
                ) : (
                  <Select onValueChange={handleBankSelect} value={selectedBank}>
                    <SelectTrigger id="bank" className="w-full">
                      <SelectValue placeholder="Select your bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {banks.map(bank => (
                          <SelectItem key={bank.code} value={bank.code}>
                            {bank.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="account-number">Account Number</Label>
                <div className="space-y-1">
                  <Input
                    id="account-number"
                    type="text"
                    placeholder="Enter 10-digit account number"
                    value={accountNumber}
                    onChange={handleAccountNumberChange}
                    className="w-full"
                    disabled={!selectedBank || validating}
                    maxLength={10}
                  />
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      {accountNumber.length}/10 digits
                    </div>
                    
                    {!validated && accountNumber.length === 10 && selectedBank && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => validateAccount(accountNumber, selectedBank)}
                        disabled={validating}
                        className="text-xs h-7 py-0"
                      >
                        {validating ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            Validating...
                          </>
                        ) : (
                          'Validate'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {validating && (
                <div className="bg-muted rounded p-3 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>Validating account details...</span>
                </div>
              )}
              
              {validated && accountName && (
                <div className="bg-muted rounded p-3 space-y-2">
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    <span>Account validated successfully</span>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="account-name">Account Name</Label>
                    <Input
                      id="account-name"
                      value={accountName}
                      readOnly
                      className="bg-background"
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm mt-2">
                    <div>
                      <span className="text-muted-foreground">Bank: </span>
                      <span>{selectedBankName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Account #: </span>
                      <span>{accountNumber}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <Button
                className="w-full"
                onClick={handleAddAccount}
                disabled={!validated || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adding Account...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Bank Account
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}