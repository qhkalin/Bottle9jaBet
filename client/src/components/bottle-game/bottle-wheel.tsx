import { useState, useEffect, useRef } from 'react';
import { WheelNumber, WheelSectionData } from '@/lib/types';
import { useSound } from '@/hooks/use-sound';

interface BottleWheelProps {
  onSpinEnd: (winningNumber: WheelNumber) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

// Wheel sections data with numbers and colors
const wheelSections: WheelSectionData[] = [
  { number: 2, color: 'hsl(30, 76%, 31%)' },   // primary
  { number: 5, color: 'hsl(30, 58%, 40%)' },   // primary-light
  { number: 8, color: 'hsl(30, 76%, 31%)' },   // primary
  { number: 10, color: 'hsl(30, 58%, 40%)' },  // primary-light
  { number: 13, color: 'hsl(30, 76%, 31%)' },  // primary
  { number: 15, color: 'hsl(30, 58%, 40%)' },  // primary-light
  { number: 18, color: 'hsl(30, 76%, 31%)' },  // primary
  { number: 20, color: 'hsl(30, 58%, 40%)' },  // primary-light
];

export function BottleWheel({ onSpinEnd, isSpinning, setIsSpinning }: BottleWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const bottleRef = useRef<HTMLDivElement>(null);
  const [spinAngle, setSpinAngle] = useState(0);
  const { play } = useSound();

  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    play('spin');
    
    // Random angle between 720 and 1080 degrees (2-3 full rotations)
    const newSpinAngle = 720 + Math.random() * 360;
    setSpinAngle(newSpinAngle);
    
    // Apply the animation
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'transform 5s cubic-bezier(0.2, 0.8, 0.2, 1)';
      wheelRef.current.style.transform = `rotate(${newSpinAngle}deg)`;
    }
    
    if (bottleRef.current) {
      bottleRef.current.style.transition = 'transform 5s cubic-bezier(0.2, 0.8, 0.2, 1)';
      bottleRef.current.style.transform = `translate(-50%, -50%) rotate(${-newSpinAngle * 1.2}deg)`;
    }
    
    // Handle spin end
    setTimeout(() => {
      setIsSpinning(false);
      
      // Calculate winning number
      const finalAngle = newSpinAngle % 360;
      const section = Math.floor(finalAngle / 45) % 8;
      const winningNumber = wheelSections[section].number;
      
      onSpinEnd(winningNumber);
      
      // Reset transitions
      if (wheelRef.current) {
        wheelRef.current.style.transition = '';
      }
      
      if (bottleRef.current) {
        bottleRef.current.style.transition = '';
      }
    }, 5000);
  };

  return (
    <div className="wheel-container my-8">
      <div 
        ref={wheelRef} 
        id="bottle-wheel" 
        className="wheel bg-primary border-4 border-secondary"
      >
        {wheelSections.map((section, index) => (
          <div 
            key={index} 
            className="wheel-section" 
            style={{ 
              transform: `rotate(${index * 45}deg)`, 
              backgroundColor: section.color 
            }}
          >
            <div className="absolute top-1/4 left-1/3 text-xl font-bold text-secondary">
              {section.number}
            </div>
          </div>
        ))}
      </div>
      
      <div 
        ref={bottleRef} 
        id="bottle" 
        className="bottle"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#FFC107" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="h-full w-full"
        >
          <path d="M7 5h10a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z"></path>
          <path d="M11 3h2a1 1 0 0 1 1 1v1h-4V4a1 1 0 0 1 1-1Z"></path>
          <path d="M8 14a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1H8v-1Z"></path>
        </svg>
      </div>
      
      {!isSpinning && (
        <button 
          onClick={spinWheel}
          className="absolute bottom-[-60px] left-1/2 transform -translate-x-1/2 bg-secondary hover:bg-secondary/90 text-black font-semibold py-2 px-4 rounded-full shadow-lg transition-all"
        >
          Spin
        </button>
      )}
    </div>
  );
}

export default BottleWheel;
