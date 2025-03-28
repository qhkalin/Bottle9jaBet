import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/navigation/header';
import FooterNav from '@/components/navigation/footer-nav';
import DepositModal from '@/components/modals/deposit-modal';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Plus, RefreshCw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DepositPage() {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const { user } = useAuth();
  
  // Fetch recent transactions
  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ['/api/transactions'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/transactions');
      return res.json();
    },
    select: (data) => {
      // Filter to show only deposits and limit to last 5
      return data
        .filter((tx: any) => tx.type === 'deposit')
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
    }
  });
  
  const openDepositModal = () => {
    setShowDepositModal(true);
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
              <CardTitle>Deposit</CardTitle>
              <CardDescription>
                Add funds to your account balance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-muted-foreground">Current Balance</p>
                  <p className="text-3xl font-bold">₦{((user?.balance || 0) / 100).toLocaleString()}</p>
                </div>
                <Button onClick={openDepositModal} size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Funds
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Recent Deposits</h3>
                  <Button variant="ghost" size="sm" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </Button>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : transactions?.length === 0 ? (
                  <div className="text-center py-8 bg-muted rounded-lg">
                    <p className="text-muted-foreground">No recent deposits</p>
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
                        {transactions?.map((tx: any) => (
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
              <Button variant="outline" className="w-full" onClick={openDepositModal}>
                <Plus className="mr-2 h-4 w-4" />
                Make a Deposit
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Deposit Methods</CardTitle>
              <CardDescription>
                We support multiple payment methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted p-4 rounded-lg text-center">
                  <div className="bg-secondary/10 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="h-8 w-8 text-secondary"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" x2="22" y1="10" y2="10" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Bank Transfer</h3>
                  <p className="text-sm text-muted-foreground">
                    Make a direct transfer from your bank account
                  </p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg text-center">
                  <div className="bg-secondary/10 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="h-8 w-8 text-secondary"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" x2="22" y1="10" y2="10" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Debit/Credit Card</h3>
                  <p className="text-sm text-muted-foreground">
                    Pay with your Visa, Mastercard, or Verve card
                  </p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg text-center">
                  <div className="bg-secondary/10 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="h-8 w-8 text-secondary"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">USSD</h3>
                  <p className="text-sm text-muted-foreground">
                    Quick payment using USSD codes from your mobile phone
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <FooterNav />
      
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
      />
    </div>
  );
}
