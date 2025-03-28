import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LiveFeedItem } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data for demonstration - will be replaced by real API data
const mockBettingData: LiveFeedItem[] = Array(50).fill(0).map((_, i) => ({
  username: `user${i + 1}`,
  betAmount: Math.floor(Math.random() * 5000) + 500,
  winAmount: Math.floor(Math.random() * 10000) + 1000,
  isWin: Math.random() > 0.5,
  timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000000)).toISOString()
}));

export function LiveFeed() {
  const [feedItems, setFeedItems] = useState<LiveFeedItem[]>([]);
  const feedRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<number | null>(null);
  
  const { data, isLoading } = useQuery<LiveFeedItem[]>({
    queryKey: ['/api/bets/live-feed'],
    refetchInterval: 10000, // Refresh every 10 seconds
    initialData: mockBettingData, // Use mock data initially
  });
  
  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    // There's no need to construct the URL with the protocol and host
    // Just use the relative path which is more reliable in a Replit environment
    const wsUrl = `/ws`;
    
    let socket: WebSocket;
    let connectAttempt: number;
    
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.host;
        const fullUrl = `${protocol}//${host}${wsUrl}`;
        
        console.log('Connecting to WebSocket:', fullUrl);
        socket = new WebSocket(fullUrl);
        
        socket.onopen = () => {
          console.log('WebSocket connection established');
        };
        
        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'betResult') {
              addFeedItem(message.data);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
        
        socket.onclose = (event) => {
          console.log('WebSocket connection closed:', event.code, event.reason);
          // Try to reconnect if the socket is closed unexpectedly
          if (event.code !== 1000) {
            if (connectAttempt < 3) {
              console.log(`Reconnecting attempt ${connectAttempt + 1}/3...`);
              setTimeout(connectWebSocket, 3000);
              connectAttempt++;
            } else {
              console.error('Failed to reconnect after multiple attempts');
            }
          }
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
      }
    };
    
    connectAttempt = 0;
    connectWebSocket();
    
    // Auto add mock data every few seconds for demonstration
    const mockInterval = setInterval(() => {
      const randomUser = Math.floor(Math.random() * 100) + 1;
      const randomBet = Math.floor(Math.random() * 5000) + 500;
      const isWin = Math.random() > 0.6;
      const winAmount = isWin ? randomBet * (Math.random() * 3 + 1) : 0;
      
      addFeedItem({
        username: `user${randomUser}`,
        betAmount: randomBet,
        winAmount,
        isWin,
        timestamp: new Date().toISOString()
      });
    }, 3000);
    
    return () => {
      if (socket) socket.close();
      clearInterval(mockInterval);
      if (scrollTimerRef.current) {
        window.clearInterval(scrollTimerRef.current);
      }
    };
  }, []);
  
  // Initialize feed with data from API and set up auto-scroll
  useEffect(() => {
    if (data) {
      setFeedItems(data);
    }
    
    // Set up auto-scrolling
    if (feedRef.current) {
      const startAutoScroll = () => {
        if (scrollTimerRef.current) window.clearInterval(scrollTimerRef.current);
        
        scrollTimerRef.current = window.setInterval(() => {
          if (feedRef.current && feedItems.length > 10) {
            const scrollAmount = 1;
            feedRef.current.scrollTop += scrollAmount;
            
            // Reset scroll when we reach the bottom
            if (feedRef.current.scrollTop >= (feedRef.current.scrollHeight - feedRef.current.clientHeight)) {
              feedRef.current.scrollTop = 0;
            }
          }
        }, 50);
      };
      
      startAutoScroll();
      
      // Pause auto-scroll on hover
      const pauseScroll = () => {
        if (scrollTimerRef.current) {
          window.clearInterval(scrollTimerRef.current);
          scrollTimerRef.current = null;
        }
      };
      
      const resumeScroll = () => {
        if (!scrollTimerRef.current) {
          startAutoScroll();
        }
      };
      
      feedRef.current.addEventListener('mouseenter', pauseScroll);
      feedRef.current.addEventListener('mouseleave', resumeScroll);
      
      return () => {
        if (feedRef.current) {
          feedRef.current.removeEventListener('mouseenter', pauseScroll);
          feedRef.current.removeEventListener('mouseleave', resumeScroll);
        }
      };
    }
  }, [data, feedItems.length]);
  
  const addFeedItem = (item: LiveFeedItem) => {
    setFeedItems(prevItems => {
      const newItems = [item, ...prevItems];
      // Keep up to 50 items for more content to scroll through
      return newItems.slice(0, 50);
    });
  };
  
  if (isLoading) {
    return (
      <div>
        <h3 className="text-lg font-heading font-semibold mb-2 text-secondary">Live Betting Feed</h3>
        <div className="bg-muted rounded-lg p-2 h-48 overflow-y-auto space-y-1">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex justify-between items-center p-2 border-b border-muted">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <h3 className="text-lg font-heading font-semibold mb-2 text-secondary">Live Betting Feed</h3>
      <div 
        ref={feedRef}
        id="live-betting-feed" 
        className="bg-muted rounded-lg p-2 h-60 overflow-y-auto space-y-1 scroll-smooth"
      >
        {feedItems.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-muted-foreground">No recent bets</p>
          </div>
        ) : (
          feedItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-2 border-b border-muted hover:bg-background/30 transition-colors">
              <div className="text-sm font-medium">{item.username}</div>
              <div className="text-sm">Stake: ₦{item.betAmount.toLocaleString()}</div>
              <div className={`text-sm font-medium ${item.isWin ? 'text-green-500' : 'text-red-500'}`}>
                {item.isWin ? `Win: ₦${item.winAmount.toLocaleString()}` : 'Lost'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LiveFeed;
