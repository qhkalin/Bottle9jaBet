import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useSound } from '@/hooks/use-sound';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  User, 
  LogOut, 
  Settings, 
  CreditCard, 
  History, 
  Lock,
  Volume2,
  VolumeX
} from 'lucide-react';

export function Header() {
  const [, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { isEnabled, toggleSound, volume, setVolume } = useSound();
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const formatBalance = (balance: number) => {
    return (balance / 100).toLocaleString(); // Convert kobo to naira
  };
  
  return (
    <header className="bg-card shadow-md py-3 px-4 fixed top-0 w-full z-20">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/">
            <h1 className="text-xl font-heading font-bold cursor-pointer">
              <span className="text-primary">Bottle</span>
              <span className="text-secondary">9ja</span>
              <span className="text-primary">Bet</span>
            </h1>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center bg-muted rounded-full px-3 py-1">
              <span className="text-secondary font-semibold">₦</span>
              <span className="ml-1 font-medium">{formatBalance(user.balance)}</span>
            </div>
          )}
          
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowVolumeControl(!showVolumeControl)}
              className="rounded-full"
            >
              {isEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </Button>
            
            {showVolumeControl && (
              <div className="absolute right-0 mt-2 p-4 bg-card rounded-md shadow-lg z-30 w-48">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sound</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={toggleSound}
                      className="p-1"
                    >
                      {isEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </Button>
                  </div>
                  
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={volume} 
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full accent-secondary"
                    disabled={!isEnabled}
                  />
                </div>
              </div>
            )}
          </div>
          
          <Link to="/deposit">
            <Button className="p-2 bg-primary rounded-full">
              <CreditCard size={18} />
            </Button>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="p-1 border-2 border-primary rounded-full">
                <User className="text-foreground" size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start p-2">
                <div className="rounded-full bg-muted w-8 h-8 mr-2 flex items-center justify-center">
                  <User size={16} />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => setLocation('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setLocation('/deposit')}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Deposit</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setLocation('/history')}>
                <History className="mr-2 h-4 w-4" />
                <span>Transaction History</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setLocation('/profile')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setLocation('/profile')}>
                <Lock className="mr-2 h-4 w-4" />
                <span>Security</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Header;
