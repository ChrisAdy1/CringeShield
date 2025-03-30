import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Medal, Info } from 'lucide-react';
import { useBadges } from '@/hooks/useBadges';
import { useIsMobile } from '@/hooks/use-mobile';
import { badges } from '@/lib/badgeLogic';

interface BadgeDisplayProps {
  compact?: boolean;
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ compact = false }) => {
  const { getEarnedBadgeDetails, hasNewBadges, markBadgesAsSeen } = useBadges();
  const [showAllBadges, setShowAllBadges] = useState(false);
  const isMobile = useIsMobile();
  
  const earnedBadges = getEarnedBadgeDetails();
  const allBadges = badges;

  // Handle opening the full badge display
  const handleShowAllBadges = () => {
    setShowAllBadges(true);
    markBadgesAsSeen();
  };

  return (
    <>
      {compact ? (
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="p-1 h-auto flex items-center"
            onClick={handleShowAllBadges}
          >
            <Medal className={`h-5 w-5 ${hasNewBadges ? 'text-yellow-500' : 'text-gray-400'}`} />
            <span className="ml-1 text-sm">{earnedBadges.length}</span>
            {hasNewBadges && (
              <span className="inline-flex ml-1 h-2 w-2 bg-primary rounded-full animate-pulse"></span>
            )}
          </Button>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-base flex items-center">
                <Medal className="h-4 w-4 mr-2 text-primary" />
                Your Badges
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2"
                onClick={handleShowAllBadges}
              >
                View All
                {hasNewBadges && (
                  <span className="inline-flex ml-1 h-2 w-2 bg-primary rounded-full animate-pulse"></span>
                )}
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {earnedBadges.length > 0 ? (
                earnedBadges.slice(0, 4).map(badge => (
                  <div 
                    key={badge.id} 
                    className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xl"
                    title={badge.name}
                  >
                    {badge.icon}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 italic py-2">
                  Complete activities to earn badges
                </div>
              )}
              
              {earnedBadges.length > 4 && (
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                  +{earnedBadges.length - 4}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Dialog open={showAllBadges} onOpenChange={setShowAllBadges}>
        <DialogContent className={`${isMobile ? 'max-w-[90%]' : 'max-w-lg'} overflow-y-auto max-h-[80vh]`}>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Medal className="h-5 w-5 mr-2 text-primary" />
              Your Badges
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            {allBadges.map(badge => {
              const isEarned = earnedBadges.some(b => b.id === badge.id);
              return (
                <div 
                  key={badge.id}
                  className={`border rounded-lg p-3 ${isEarned ? 'bg-primary/5 border-primary/20' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-center mb-2">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xl ${isEarned ? 'bg-primary/10' : 'bg-gray-100 text-gray-400'}`}>
                      {isEarned ? badge.icon : '?'}
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-sm">{badge.name}</h4>
                      <p className="text-xs text-gray-500">
                        {isEarned ? 'Earned' : 'Locked'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <DialogFooter>
            <div className="flex items-center text-xs text-gray-500 italic mr-auto">
              <Info className="h-3 w-3 mr-1" />
              Keep practicing to unlock more badges!
            </div>
            <Button onClick={() => setShowAllBadges(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BadgeDisplay;