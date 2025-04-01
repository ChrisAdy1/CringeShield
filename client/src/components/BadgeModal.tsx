import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Award, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WeeklyBadge } from '@shared/schema';
import { cn } from '@/lib/utils';

interface BadgeModalProps {
  badge: WeeklyBadge;
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to determine badge color based on tier
const getTierColor = (tier: string) => {
  switch (tier) {
    case 'shy_starter':
      return 'bg-purple-100 text-purple-500 border-purple-200';
    case 'growing_speaker':
      return 'bg-blue-100 text-blue-500 border-blue-200';
    case 'confident_creator':
      return 'bg-green-100 text-green-500 border-green-200';
    default:
      return 'bg-gray-100 text-gray-500 border-gray-200';
  }
};

// Helper function to format tier name
const formatTierName = (tier: string) => {
  return tier
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const BadgeModal: React.FC<BadgeModalProps> = ({ badge, isOpen, onClose }) => {
  // Trigger confetti when the modal opens
  React.useEffect(() => {
    if (isOpen) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Trigger confetti from both sides
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#9A7DFF', '#EDE9FE', '#C7F9CC'],
        });
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#9A7DFF', '#EDE9FE', '#C7F9CC'],
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Badge award message based on tier
  const getBadgeMessage = () => {
    switch (badge.tier) {
      case 'shy_starter':
        return "Congratulations on completing Week " + badge.weekNumber + " of the Shy Starter challenges! You're building the foundations of becoming more comfortable on camera.";
      case 'growing_speaker':
        return "Great job completing Week " + badge.weekNumber + " of Growing Speaker challenges! Your speaking skills are developing impressively.";
      case 'confident_creator':
        return "Outstanding achievement! You've mastered Week " + badge.weekNumber + " of the Confident Creator challenges. You're well on your way to becoming a skilled public speaker.";
      default:
        return "Congratulations on earning a new badge!";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Badge Earned!
          </DialogTitle>
          <DialogDescription className="text-center">
            You've completed a weekly challenge milestone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-4">
          <div 
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center border-2",
              getTierColor(badge.tier)
            )}
          >
            <Award className="w-12 h-12" />
          </div>
          
          <h3 className="mt-4 text-lg font-medium">
            {formatTierName(badge.tier)} - Week {badge.weekNumber}
          </h3>
          
          <p className="mt-2 text-center text-muted-foreground">
            {getBadgeMessage()}
          </p>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-2">
          <Button onClick={onClose} className="w-full sm:w-auto">
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BadgeModal;