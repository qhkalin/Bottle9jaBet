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
          viewBox="0 0 100 200" 
          fill="none" 
          className="h-full w-full"
        >
          {/* Bottle neck */}
          <rect x="42" y="10" width="16" height="40" rx="5" fill="#8B4513" stroke="#603813" strokeWidth="2" />
          
          {/* Bottle body */}
          <path d="M35 50 L25 150 C25 170 75 170 75 150 L65 50 Z" fill="#FFE4C4" stroke="#8B4513" strokeWidth="2" />
          
          {/* Bottle cap */}
          <rect x="38" y="5" width="24" height="10" rx="3" fill="#CD7F32" stroke="#8B4513" strokeWidth="2" />
          
          {/* Bottle label */}
          <rect x="30" y="80" width="40" height="50" rx="5" fill="#FFC107" stroke="#8B4513" strokeWidth="1" />
          
          {/* Text on bottle */}
          <text x="50" y="110" textAnchor="middle" fill="#8B4513" fontFamily="Arial" fontSize="10" fontWeight="bold">Bottle</text>
          <text x="50" y="120" textAnchor="middle" fill="#8B4513" fontFamily="Arial" fontSize="6">9jaBet</text>
          
          {/* Bottle shine */}
          <path d="M35 60 Q45 70 35 80" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
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
