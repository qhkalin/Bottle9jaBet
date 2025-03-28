import { useState } from 'react';
import { WheelNumber } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useSound } from '@/hooks/use-sound';

interface BetControlsProps {
  onPlaceBet: (betAmount: number, selectedNumber: WheelNumber) => void;
  isSpinning: boolean;
  balance: number;
}

export function BetControls({ onPlaceBet, isSpinning, balance }: BetControlsProps) {
  const [betAmount, setBetAmount] = useState(500);
  const [selectedNumber, setSelectedNumber] = useState<WheelNumber | null>(null);
  const { toast } = useToast();
  const { play } = useSound();
  
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setBetAmount(value);
    } else {
      setBetAmount(0);
    }
  };
  
  const handleNumberSelect = (value: string) => {
    setSelectedNumber(parseInt(value) as WheelNumber);
  };
  
  const handlePlaceBet = () => {
    if (isSpinning) return;
    
    // Validate bet amount
    if (betAmount < 500) {
      toast({
        title: "Invalid Bet Amount",
        description: "Minimum bet amount is ₦500",
        variant: "destructive"
      });
      return;
    }
    
    if (betAmount > 10000000) {
      toast({
        title: "Invalid Bet Amount",
        description: "Maximum bet amount is ₦10,000,000",
        variant: "destructive"
      });
      return;
    }
    
    // Validate balance
    if (betAmount > balance / 100) { // Convert kobo to naira
      toast({
        title: "Insufficient Balance",
        description: "Please deposit funds to continue",
        variant: "destructive"
      });
      return;
    }
    
    // Validate number selection
    if (!selectedNumber) {
      toast({
        title: "Number Selection Required",
        description: "Please select a number to bet on",
        variant: "destructive"
      });
      return;
    }
    
    play('click');
    onPlaceBet(betAmount, selectedNumber);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="selected-number" className="block text-sm font-medium text-muted-foreground mb-1">
          Select Number
        </Label>
        <Select onValueChange={handleNumberSelect} disabled={isSpinning}>
          <SelectTrigger id="selected-number" className="w-full p-3 bg-muted border border-muted rounded">
            <SelectValue placeholder="Select a number" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="8">8</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="13">13</SelectItem>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="18">18</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="bet-amount" className="block text-sm font-medium text-muted-foreground mb-1">
          Bet Amount (₦500 - ₦10M)
        </Label>
        <Input
          id="bet-amount"
          type="number"
          min={500}
          max={10000000}
          step={100}
          value={betAmount}
          onChange={handleBetAmountChange}
          className="w-full p-3 bg-muted border border-muted rounded"
          disabled={isSpinning}
        />
      </div>
      
      <Button 
        onClick={handlePlaceBet} 
        className="w-full py-3 px-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold rounded-lg shadow transition"
        disabled={isSpinning}
      >
        <i className="ri-play-fill mr-1"></i> Spin the Bottle
      </Button>
    </div>
  );
}

export default BetControls;
