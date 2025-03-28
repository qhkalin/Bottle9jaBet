import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/navigation/header';
import FooterNav from '@/components/navigation/footer-nav';
import WithdrawModal from '@/components/modals/withdraw-modal';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getUserBankAccounts } from '@/lib/monnify';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function WithdrawPage() {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const { user } = useAuth();
  
  // Fetch user's bank accounts
  const { data: bankAccounts, isLoading: loadingAccounts } = useQuery({
    queryKey: ['/api/bank-accounts'],
    queryFn: getUserBankAccounts
  });
  
  // Fetch recent transactions
  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ['/api/transactions'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/transactions');
      return res.json();
    },
    select: (data) => {
      // Filter to show only withdrawals and limit to last 5
      return data
        .filter((tx: any) => tx.type === 'withdrawal')
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
    }
  });
  
  const openWithdrawModal = () => {
    setShowWithdrawModal(true);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16 pb-20">
        <div className="container mx-auto p-4">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Withdraw</CardTitle>
              <CardDescription>
                Withdraw funds from your account to your bank account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-muted-foreground">Available Balance</p>
                  <p className="text-3xl font-bold">₦{((user?.balance || 0) / 100).toLocaleString()}</p>
                </div>
                <Button 
                  onClick={openWithdrawModal} 
                  size="lg"
                  disabled={!bankAccounts || bankAccounts.length === 0}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Withdraw
                </Button>
              </div>
              
              {loadingAccounts ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !bankAccounts || bankAccounts.length === 0 ? (
                <Alert variant="warning" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Bank Accounts</AlertTitle>
                  <AlertDescription>
                    You need to add a bank account before you can withdraw funds.
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-secondary"
                      onClick={() => {
                        window.location.href = '/profile';
                      }}
                    >
                      Add a bank account
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : null}
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Recent Withdrawals</h3>
                  <Button variant="ghost" size="sm" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </Button>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : !transactions || transactions.length === 0 ? (
                  <div className="text-center py-8 bg-muted rounded-lg">
                    <p className="text-muted-foreground">No recent withdrawals</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-right">Amount</th>
                          <th className="px-4 py-2 text-center">Status</th>
                          <th className="px-4 py-2 text-left">Reference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-muted">
                        {transactions.map((tx: any) => (
                          <tr key={tx.id}>
                            <td className="px-4 py-3">{formatDate(tx.createdAt)}</td>
                            <td className="px-4 py-3 text-right">₦{tx.amount.toLocaleString()}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(tx.status)}`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs">{tx.reference.substring(0, 12)}...</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={openWithdrawModal}
                disabled={!bankAccounts || bankAccounts.length === 0}
              >
                <Plus className="mr-2 h-4 w-4" />
                Make a Withdrawal
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Information</CardTitle>
              <CardDescription>
                Important details about withdrawals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Processing Time</h3>
                <p className="text-sm text-muted-foreground">
                  Withdrawals are processed instantly to your registered bank account.
                </p>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Minimum Withdrawal</h3>
                <p className="text-sm text-muted-foreground">
                  The minimum withdrawal amount is ₦500.
                </p>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Bank Accounts</h3>
                <p className="text-sm text-muted-foreground">
                  You can only withdraw to bank accounts registered on your profile.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <FooterNav />
      
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
      />
    </div>
  );
}
