import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/navigation/header';
import FooterNav from '@/components/navigation/footer-nav';
import CardModal from '@/components/modals/card-modal';
import BankAccountModal from '@/components/modals/bank-account-modal';
import VerificationModal from '@/components/modals/verification-modal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Lock, 
  CreditCard, 
  LogOut, 
  Loader2,
  Shield,
  Check,
  X,
  Building,
  Building2
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { getUserCards, getUserBankAccounts } from '@/lib/monnify';
import { useQuery } from '@tanstack/react-query';

export default function ProfilePage() {
  const [showCardModal, setShowCardModal] = useState(false);
  const [showBankAccountModal, setShowBankAccountModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const { user, logoutMutation, enable2FAMutation, disable2FAMutation } = useAuth();
  const { toast } = useToast();
  
  const { data: cards } = useQuery({
    queryKey: ['/api/cards'],
    queryFn: getUserCards,
  });
  
  const { data: bankAccounts } = useQuery({
    queryKey: ['/api/bank-accounts'],
    queryFn: getUserBankAccounts,
  });
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const handleEnable2FA = async () => {
    try {
      await enable2FAMutation.mutateAsync();
      setShow2FAModal(true);
    } catch (error) {
      // Error handling is in the mutation
    }
  };
  
  const handleDisable2FA = async () => {
    try {
      await disable2FAMutation.mutateAsync();
    } catch (error) {
      // Error handling is in the mutation
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16 pb-20">
        <div className="container mx-auto p-4">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <User size={32} className="text-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">{user?.fullName}</CardTitle>
                  <CardDescription>{user?.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Username</span>
                  <span className="font-medium">{user?.username}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Balance</span>
                  <span className="font-medium">₦{(user?.balance || 0) / 100}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Email Status</span>
                  <span className="font-medium flex items-center">
                    {user?.isEmailVerified ? (
                      <>
                        <Check className="h-4 w-4 text-green-500 mr-1" /> Verified
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 text-red-500 mr-1" /> Not Verified
                      </>
                    )}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">2-Step Verification</span>
                  <span className="font-medium flex items-center">
                    {user?.isTwoFactorEnabled ? (
                      <>
                        <Check className="h-4 w-4 text-green-500 mr-1" /> Enabled
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 text-red-500 mr-1" /> Disabled
                      </>
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="security" className="mb-6">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="payment">Payment Methods</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <div className="flex items-center">
                      <Shield className="h-6 w-6 mr-3 text-primary" />
                      <div>
                        <h3 className="font-medium">2-Step Verification</h3>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                    </div>
                    {user?.isTwoFactorEnabled ? (
                      <Button 
                        onClick={handleDisable2FA}
                        variant="outline"
                        disabled={disable2FAMutation.isPending}
                      >
                        {disable2FAMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Disabling...
                          </>
                        ) : (
                          "Disable"
                        )}
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleEnable2FA}
                        disabled={enable2FAMutation.isPending}
                      >
                        {enable2FAMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enabling...
                          </>
                        ) : (
                          "Enable"
                        )}
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <div className="flex items-center">
                      <Lock className="h-6 w-6 mr-3 text-primary" />
                      <div>
                        <h3 className="font-medium">Change Password</h3>
                        <p className="text-sm text-muted-foreground">
                          Update your password regularly for better security
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Change</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payment">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Manage your cards and bank accounts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <div className="flex items-center">
                      <CreditCard className="h-6 w-6 mr-3 text-primary" />
                      <div>
                        <h3 className="font-medium">Saved Cards</h3>
                        <p className="text-sm text-muted-foreground">
                          You have {cards?.length || 0} saved cards
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => setShowCardModal(true)}
                    >
                      Manage
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <div className="flex items-center">
                      <Building2 className="h-6 w-6 mr-3 text-primary" />
                      <div>
                        <h3 className="font-medium">Bank Accounts</h3>
                        <p className="text-sm text-muted-foreground">
                          You have {bankAccounts?.length || 0} bank accounts
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => setShowBankAccountModal(true)}
                    >
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <div className="flex items-center">
                      <User className="h-6 w-6 mr-3 text-primary" />
                      <div>
                        <h3 className="font-medium">Edit Profile</h3>
                        <p className="text-sm text-muted-foreground">
                          Update your personal information
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Edit</Button>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <div className="flex items-center">
                      <LogOut className="h-6 w-6 mr-3 text-destructive" />
                      <div>
                        <h3 className="font-medium">Logout</h3>
                        <p className="text-sm text-muted-foreground">
                          Sign out from all devices
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="destructive"
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                    >
                      {logoutMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging out...
                        </>
                      ) : (
                        "Logout"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <FooterNav />
      
      <CardModal
        isOpen={showCardModal}
        onClose={() => setShowCardModal(false)}
      />
      
      <BankAccountModal
        isOpen={showBankAccountModal}
        onClose={() => setShowBankAccountModal(false)}
      />
      
      <VerificationModal
        isOpen={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        mode="setup"
      />
    </div>
  );
}
