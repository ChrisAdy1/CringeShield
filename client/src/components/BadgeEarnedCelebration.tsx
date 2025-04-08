import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface BadgeEarnedCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  badgeInfo: {
    title: string;
    description: string;
    tier?: string;
    milestone?: number;
    badgeColor?: string;
  };
}

const BadgeEarnedCelebration: React.FC<BadgeEarnedCelebrationProps> = ({
  isOpen,
  onClose,
  badgeInfo
}) => {
  const [confettiTriggered, setConfettiTriggered] = useState(false);
  
  // Trigger confetti when the dialog opens
  useEffect(() => {
    // Force reset confetti trigger when dialog opens to ensure it always runs
    if (isOpen) {
      console.log("Badge celebration opened, triggering confetti");
      
      // Force reset the confetti trigger if it was somehow already set
      if (confettiTriggered) {
        setConfettiTriggered(false);
      }
      
      // Small delay to ensure state update happens before the next check
      setTimeout(() => {
        if (isOpen && !confettiTriggered) {
          // Trigger the confetti animation
          const duration = 3000;
          const animationEnd = Date.now() + duration;
          
          const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
          };
          
          const confettiColors = ['#2470ff', '#4488ff', '#6ba6ff', '#C7F9CC', '#FFD6A5'];
          
          // More impressive confetti burst with multiple origins
          confetti({
            particleCount: 80,
            spread: 100,
            origin: { x: 0.5, y: 0.5 },
            colors: confettiColors,
            gravity: 0.8,
            scalar: 1.2,
            zIndex: 1500,
            shapes: ['circle', 'square']
          });
          
          // Continuous confetti animation
          const confettiAnimation = () => {
            const timeLeft = animationEnd - Date.now();
            
            if (timeLeft <= 0) {
              return;
            }
            
            // Add continuous confetti from the sides and top
            if (Math.random() > 0.6) {
              confetti({
                particleCount: 2,
                angle: randomInRange(55, 125), // Mostly upward
                spread: randomInRange(50, 70),
                origin: { x: randomInRange(0.4, 0.6), y: randomInRange(0.5, 0.6) },
                colors: confettiColors,
                zIndex: 1500,
                gravity: 0.8, // Lower gravity for floating effect
                shapes: ['circle', 'square'],
                scalar: randomInRange(0.8, 1.2) // Bigger confetti
              });
            }
            
            // Create some smaller, quick-falling particles too
            if (Math.random() > 0.7) {
              confetti({
                particleCount: 2,
                angle: randomInRange(45, 135),
                spread: randomInRange(40, 60),
                origin: { x: randomInRange(0.3, 0.7), y: 0.5 },
                colors: confettiColors,
                zIndex: 1500,
                gravity: 1.5, // Higher gravity for quicker fall
                scalar: randomInRange(0.4, 0.8) // Smaller confetti
              });
            }
            
            // Schedule next frame
            requestAnimationFrame(confettiAnimation);
          };
          
          // Start the animation
          confettiAnimation();
          setConfettiTriggered(true);
          console.log("Confetti animation triggered");
        }
      }, 50);
    }
    
    // Reset the trigger when dialog closes
    if (!isOpen) {
      setConfettiTriggered(false);
    }
  }, [isOpen]);
  
  // Get badge icon based on tier or milestone
  const getBadgeIcon = () => {
    if (badgeInfo.tier) {
      // Weekly challenge tier badges
      const tierIcons: Record<string, string> = {
        'shy_starter': '🌱',
        'growing_speaker': '🌿',
        'confident_creator': '🌳'
      };
      return tierIcons[badgeInfo.tier] || '🏆';
    } else if (badgeInfo.milestone) {
      // Challenge day milestone badges
      if (badgeInfo.milestone === 7) return '🥉';
      if (badgeInfo.milestone === 15) return '🥈';
      if (badgeInfo.milestone === 30) return '🥇';
      return '🏆';
    }
    return '🏆'; // Default icon
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md text-center">
        <div className="flex flex-col items-center justify-center py-3">
          <div className={`text-6xl ${badgeInfo.badgeColor || 'text-primary'} mb-3 animate-bounce`}>
            {getBadgeIcon()}
          </div>
          
          <DialogTitle className="text-2xl mb-2">
            Congratulations!
          </DialogTitle>
          
          <Badge className="mb-4 text-lg px-4 py-1 bg-primary/20 border-primary/30 text-primary font-semibold">
            {badgeInfo.title}
          </Badge>
          
          <DialogDescription className="mb-6 text-base">
            {badgeInfo.description}
          </DialogDescription>
          
          <Button onClick={onClose} className="w-full max-w-xs">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BadgeEarnedCelebration;