import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowLeft, Medal, Unlock, Lock } from 'lucide-react';
import { useBadges } from '@/hooks/useBadges';

const Badges: React.FC = () => {
  const [, navigate] = useLocation();
  const { badges, earnedBadges } = useBadges();
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  
  // Get all available badges
  const allBadges = [
    {
      id: 'first_step',
      name: 'First Step',
      description: 'Completed your first practice session!',
      icon: '🎯',
    },
    {
      id: 'smooth_reader',
      name: 'Smooth Reader',
      description: 'Successfully used a script in your practice.',
      icon: '📝',
    },
    {
      id: 'free_spirit',
      name: 'Free Spirit',
      description: 'Practiced without a script or prompt.',
      icon: '🦅',
    },
    {
      id: 'bounce_back',
      name: 'Bounce Back',
      description: 'Retried a session - showing real dedication!',
      icon: '🔄',
    },
    {
      id: 'reflector',
      name: 'Reflector',
      description: 'Added thoughtful self-reflection to your practice.',
      icon: '🤔',
    },
    {
      id: 'regular',
      name: 'Regular',
      description: 'Completed 5 practice sessions.',
      icon: '⭐',
    },
    {
      id: 'dedicated',
      name: 'Dedicated',
      description: 'Completed 10 practice sessions.',
      icon: '🌟',
    },
    {
      id: 'master',
      name: 'Master',
      description: 'Completed 25 practice sessions.',
      icon: '👑',
    },
  ];
  
  // Show badge detail dialog
  const handleBadgeClick = (badge: any) => {
    setSelectedBadge(badge);
  };
  
  // Close dialog
  const handleDialogClose = () => {
    setSelectedBadge(null);
  };
  
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="h-8 w-8 mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Your Achievements</h1>
        </div>
        
        <div className="mb-4 text-muted-foreground">
          <p>Track your progress and collect all the badges!</p>
        </div>
        
        {/* Badge grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {allBadges.map((badge) => {
            const isEarned = earnedBadges.includes(badge.name);
            
            return (
              <Card 
                key={badge.id}
                className={`cursor-pointer transition-all hover:shadow ${
                  isEarned ? 'border-primary/30' : 'opacity-70'
                }`}
                onClick={() => handleBadgeClick(badge)}
              >
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <h3 className="font-medium mb-1">{badge.name}</h3>
                  {isEarned ? (
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-primary/10 border-primary/30"
                    >
                      <Unlock className="h-3 w-3 mr-1" />
                      Earned
                    </Badge>
                  ) : (
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-gray-100 border-gray-200"
                    >
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Progress overview */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-medium">Achievement Progress</h2>
              <Badge variant="outline" className="flex items-center">
                <Medal className="h-3 w-3 mr-1" />
                {earnedBadges.length}/{allBadges.length}
              </Badge>
            </div>
            
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all"
                style={{ 
                  width: `${(earnedBadges.length / allBadges.length) * 100}%` 
                }}
              ></div>
            </div>
            
            <p className="text-sm text-muted-foreground mt-3">
              Keep practicing to unlock all achievements!
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Badge detail dialog */}
      {selectedBadge && (
        <Dialog open={!!selectedBadge} onOpenChange={handleDialogClose}>
          <DialogContent className="max-w-xs mx-auto">
            <DialogHeader>
              <div className="text-5xl text-center mb-2">{selectedBadge.icon}</div>
              <DialogTitle className="text-center">{selectedBadge.name}</DialogTitle>
            </DialogHeader>
            
            <DialogDescription className="text-center">
              {selectedBadge.description}
            </DialogDescription>
            
            <div className="text-center mt-2">
              {earnedBadges.includes(selectedBadge.name) ? (
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  <Unlock className="h-3 w-3 mr-1" />
                  Unlocked
                </Badge>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Complete the challenge to unlock this badge
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Badges;