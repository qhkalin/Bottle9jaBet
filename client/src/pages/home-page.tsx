import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { BetResult, WheelNumber } from '@/lib/types';
import { SoundProvider } from '@/hooks/use-sound';
import Header from '@/components/navigation/header';
import FooterNav from '@/components/navigation/footer-nav';
import BottleWheel from '@/components/bottle-game/bottle-wheel';
import BetControls from '@/components/bottle-game/bet-controls';
import LiveFeed from '@/components/bottle-game/live-feed';
import ResultModal from '@/components/modals/result-modal';
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [showResultModal, setShowResultModal] = useState(false);
  const [betResult, setBetResult] = useState<BetResult | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return 30; // Reset to 30
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const handleSpinEnd = (winningNumber: WheelNumber) => {
    // This is just for UI feedback - actual bet results come from the server
    // when the onPlaceBet function is called before the spin
    if (betResult) {
      setShowResultModal(true);
    }
  };
  
  const handlePlaceBet = async (betAmount: number, selectedNumber: WheelNumber) => {
    try {
      const response = await apiRequest('POST', '/api/bets', {
        betAmount,
        selectedNumber
      });
      
      const result = await response.json();
      setBetResult(result);
      
      // Start spinning
      setIsSpinning(true);
      
      // Result modal will be shown in handleSpinEnd
    } catch (error) {
      console.error("Error placing bet:", error);
      toast({
        title: "Bet Failed",
        description: "Could not place your bet. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <SoundProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 pt-16 pb-20">
          <div className="container mx-auto p-4">
            <div className="bg-card rounded-lg shadow-lg overflow-hidden">
              {/* Game Header */}
              <div className="p-4 bg-primary flex justify-between items-center">
                <h2 className="text-xl font-heading font-bold text-foreground">Spin the Bottle</h2>
              </div>
              
              {/* Game Content */}
              <div className="p-4">
                {/* Countdown */}
                <div className="text-center mb-4">
                  <p className="text-muted-foreground">Next round starts in:</p>
                  <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                    <span id="countdown" className="text-2xl font-heading font-bold text-secondary">
                      {countdown}
                    </span>
                  </div>
                </div>
                
                {/* Wheel */}
                <BottleWheel 
                  onSpinEnd={handleSpinEnd}
                  isSpinning={isSpinning}
                  setIsSpinning={setIsSpinning}
                />
                
                {/* Betting Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <BetControls 
                    onPlaceBet={handlePlaceBet}
                    isSpinning={isSpinning}
                    balance={user?.balance || 0}
                  />
                  
                  <LiveFeed />
                </div>
              </div>
            </div>
            
            {/* Sport Center Banner */}
            <div className="mt-8 bg-card rounded-lg overflow-hidden shadow-lg">
              <h2 className="text-xl font-heading font-bold p-4 bg-primary text-foreground">Sport Center</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-2">
                <img src="https://cdn.pixabay.com/photo/2016/05/31/23/21/football-1428047_960_720.jpg" alt="Football" className="w-full h-24 object-cover rounded" />
                <img src="https://cdn.pixabay.com/photo/2020/01/22/10/18/basketball-4784037_960_720.jpg" alt="Basketball" className="w-full h-24 object-cover rounded" />
                <img src="https://cdn.pixabay.com/photo/2016/09/15/15/27/tennis-court-1671852_960_720.jpg" alt="Tennis" className="w-full h-24 object-cover rounded" />
                <img src="https://cdn.pixabay.com/photo/2017/03/27/14/21/horse-2179162_960_720.jpg" alt="Horse Racing" className="w-full h-24 object-cover rounded" />
              </div>
            </div>
          </div>
        </main>
        
        <FooterNav />
        
        <ResultModal 
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          result={betResult}
        />
      </div>
    </SoundProvider>
  );
}
