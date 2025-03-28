import { Link, useLocation } from 'wouter';
import { Home, CreditCard, Wallet, History, User, AlertTriangle } from 'lucide-react';
import { useSound } from '@/hooks/use-sound';

export function FooterNav() {
  const [location] = useLocation();
  const { play } = useSound();
  
  const handleNavClick = () => {
    play('click');
  };
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  return (
    <nav className="bg-card fixed bottom-0 w-full shadow-lg z-20">
      {/* Age verification banner */}
      <div className="bg-muted text-center py-1 border-t border-muted">
        <p className="text-xs flex items-center justify-center gap-1 text-muted-foreground">
          <AlertTriangle size={12} className="text-destructive" /> 
          18+ Only. Play Responsibly. Gambling Can Be Addictive.
        </p>
      </div>
      
      {/* Navigation items */}
      <div className="flex justify-around items-center h-16">
        <Link 
          to="/" 
          onClick={handleNavClick}
          className="flex flex-col items-center justify-center"
        >
          <Home 
            size={20} 
            className={isActive('/') ? 'text-secondary' : 'text-muted-foreground'} 
          />
          <span className={`text-xs ${isActive('/') ? 'text-foreground' : 'text-muted-foreground'}`}>
            Home
          </span>
        </Link>
        
        <Link 
          to="/deposit" 
          onClick={handleNavClick}
          className="flex flex-col items-center justify-center"
        >
          <CreditCard 
            size={20} 
            className={isActive('/deposit') ? 'text-secondary' : 'text-muted-foreground'} 
          />
          <span className={`text-xs ${isActive('/deposit') ? 'text-foreground' : 'text-muted-foreground'}`}>
            Deposit
          </span>
        </Link>
        
        <Link 
          to="/withdraw" 
          onClick={handleNavClick}
          className="flex flex-col items-center justify-center"
        >
          <Wallet 
            size={20} 
            className={isActive('/withdraw') ? 'text-secondary' : 'text-muted-foreground'} 
          />
          <span className={`text-xs ${isActive('/withdraw') ? 'text-foreground' : 'text-muted-foreground'}`}>
            Withdraw
          </span>
        </Link>
        
        <Link 
          to="/history" 
          onClick={handleNavClick}
          className="flex flex-col items-center justify-center"
        >
          <History 
            size={20} 
            className={isActive('/history') ? 'text-secondary' : 'text-muted-foreground'} 
          />
          <span className={`text-xs ${isActive('/history') ? 'text-foreground' : 'text-muted-foreground'}`}>
            History
          </span>
        </Link>
        
        <Link 
          to="/profile" 
          onClick={handleNavClick}
          className="flex flex-col items-center justify-center"
        >
          <User 
            size={20} 
            className={isActive('/profile') ? 'text-secondary' : 'text-muted-foreground'} 
          />
          <span className={`text-xs ${isActive('/profile') ? 'text-foreground' : 'text-muted-foreground'}`}>
            Profile
          </span>
        </Link>
      </div>
    </nav>
  );
}

export default FooterNav;
