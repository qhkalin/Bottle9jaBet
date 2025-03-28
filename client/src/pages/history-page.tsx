import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/navigation/header';
import FooterNav from '@/components/navigation/footer-nav';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, RefreshCw, Download, Clock, BarChart3, CreditCard } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function HistoryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("transactions");
  
  // Fetch all transactions
  const { 
    data: transactions, 
    isLoading: transactionsLoading, 
    refetch: refetchTransactions 
  } = useQuery({
    queryKey: ['/api/transactions'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/transactions');
      return res.json();
    }
  });
  
  // Fetch betting history
  const { 
    data: bettingHistory, 
    isLoading: bettingLoading, 
    refetch: refetchBettingHistory 
  } = useQuery({
    queryKey: ['/api/bets/history'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/bets/history');
      return res.json();
    }
  });
  
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
  
  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <CreditCard className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <CreditCard className="h-4 w-4 text-red-500" />;
      case 'bet':
        return <BarChart3 className="h-4 w-4 text-yellow-500" />;
      case 'win':
        return <BarChart3 className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  const formatTransactionType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  const downloadReport = (type: string) => {
    // In a real implementation, this would trigger a server endpoint to generate
    // a CSV or PDF file for download. For now, we'll just show a message.
    alert(`Downloading ${type} report...`);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16 pb-20">
        <div className="container mx-auto p-4">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    View your complete transaction and betting history
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => downloadReport(activeTab)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="transactions" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="betting">Betting History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="transactions">
                  <div className="flex justify-end mb-4">
                    <Button variant="ghost" size="sm" onClick={() => refetchTransactions()}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                  
                  {transactionsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : !transactions || transactions.length === 0 ? (
                    <div className="text-center py-12 bg-muted rounded-lg">
                      <p className="text-muted-foreground mb-2">No transaction history found</p>
                      <p className="text-sm text-muted-foreground">
                        Once you make deposits, withdrawals, or place bets, they will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-left">Type</th>
                            <th className="px-4 py-2 text-right">Amount</th>
                            <th className="px-4 py-2 text-center">Status</th>
                            <th className="px-4 py-2 text-left">Reference</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-muted">
                          {transactions.map((tx: any) => (
                            <tr key={tx.id}>
                              <td className="px-4 py-3">{formatDate(tx.createdAt)}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  {getTransactionTypeIcon(tx.type)}
                                  <span className="ml-2">{formatTransactionType(tx.type)}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className={tx.type === 'deposit' || tx.type === 'win' ? 'text-green-500' : ''}>
                                  {tx.type === 'withdrawal' || tx.type === 'bet' ? '-' : '+'} 
                                  ₦{tx.amount.toLocaleString()}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(tx.status)}`}>
                                  {tx.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono text-xs truncate max-w-[150px]">
                                {tx.reference}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="betting">
                  <div className="flex justify-end mb-4">
                    <Button variant="ghost" size="sm" onClick={() => refetchBettingHistory()}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                  
                  {bettingLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : !bettingHistory || bettingHistory.length === 0 ? (
                    <div className="text-center py-12 bg-muted rounded-lg">
                      <p className="text-muted-foreground mb-2">No betting history found</p>
                      <p className="text-sm text-muted-foreground">
                        Once you place bets, they will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-right">Bet Amount</th>
                            <th className="px-4 py-2 text-center">Your Number</th>
                            <th className="px-4 py-2 text-center">Winning Number</th>
                            <th className="px-4 py-2 text-center">Result</th>
                            <th className="px-4 py-2 text-right">Win Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-muted">
                          {bettingHistory.map((bet: any) => (
                            <tr key={bet.id}>
                              <td className="px-4 py-3">{formatDate(bet.createdAt)}</td>
                              <td className="px-4 py-3 text-right">₦{bet.betAmount.toLocaleString()}</td>
                              <td className="px-4 py-3 text-center">{bet.selectedNumber}</td>
                              <td className="px-4 py-3 text-center">{bet.winningNumber}</td>
                              <td className="px-4 py-3 text-center">
                                <span 
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    bet.isWin ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  }`}
                                >
                                  {bet.isWin ? 'Won' : 'Lost'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                {bet.isWin ? (
                                  <span className="text-green-500">
                                    ₦{bet.winAmount.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>
                Your gaming statistics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-center">Total Bets</h3>
                  <p className="text-3xl text-center font-bold">
                    {bettingLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    ) : (
                      bettingHistory?.length || 0
                    )}
                  </p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-center">Wins</h3>
                  <p className="text-3xl text-center font-bold text-green-500">
                    {bettingLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    ) : (
                      bettingHistory?.filter((bet: any) => bet.isWin).length || 0
                    )}
                  </p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-center">Win Rate</h3>
                  <p className="text-3xl text-center font-bold text-secondary">
                    {bettingLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    ) : (
                      bettingHistory?.length 
                        ? `${Math.round((bettingHistory.filter((bet: any) => bet.isWin).length / bettingHistory.length) * 100)}%` 
                        : '0%'
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <FooterNav />
    </div>
  );
}
