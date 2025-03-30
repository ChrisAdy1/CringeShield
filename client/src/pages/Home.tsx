import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Medal, Activity, Clock, BarChart } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useBadges } from '@/hooks/useBadges';
import { Badge } from '@/components/ui/badge';

const Home: React.FC = () => {
  const [, navigate] = useLocation();
  const { preferences } = useUserPreferences();
  const { badgeState, newBadges, markBadgesAsSeen, getEarnedBadgeDetails } = useBadges();
  const [showAllBadges, setShowAllBadges] = useState(false);
  
  // Get sessions from local storage
  const sessions = JSON.parse(localStorage.getItem('practice-sessions') || '[]');
  
  // Calculate progress data (simplified for MVP)
  const totalSessions = sessions.length;
  const lastSessionDate = totalSessions > 0 
    ? new Date(sessions[sessions.length - 1].date).toLocaleDateString()
    : 'No sessions yet';
  
  // Handle the first time user or returning user
  const isFirstTime = !preferences.hasSeenOnboarding || !preferences.hasCompletedAssessment;
  
  // Get badges
  const earnedBadgeDetails = getEarnedBadgeDetails();
  const displayBadges = showAllBadges 
    ? earnedBadgeDetails 
    : earnedBadgeDetails.slice(0, 3);
  
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-1">CringeShield</h1>
          <p className="text-muted-foreground">
            Practice your speaking skills without the cringe
          </p>
        </div>
        
        {/* Main call to action */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {isFirstTime ? "Let's Get Started" : "Continue Practicing"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isFirstTime 
                    ? "Take a quick quiz to personalize your experience" 
                    : "Choose a prompt and improve your skills"}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-primary" />
              </div>
            </div>
            
            <Button 
              className="w-full"
              onClick={() => navigate(isFirstTime ? '/onboarding' : '/prompts')}
            >
              {isFirstTime ? "Start Confidence Quiz" : "Practice Now"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        
        {!isFirstTime && (
          <>
            {/* Progress summary */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BarChart className="h-5 w-5 mr-2" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-muted-foreground text-xs mb-1 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Sessions Completed
                    </div>
                    <div className="text-2xl font-semibold">{totalSessions}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-muted-foreground text-xs mb-1">Last Session</div>
                    <div className="text-sm font-medium">{lastSessionDate}</div>
                  </div>
                </div>
                
                {/* Confidence level indication */}
                {preferences.confidenceTier && (
                  <div className="mt-4">
                    <div className="text-muted-foreground text-xs mb-1">
                      Your Confidence Level
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      {preferences.confidenceTier === 'shy_starter' && 'Shy Starter'}
                      {preferences.confidenceTier === 'growing_speaker' && 'Growing Speaker'}
                      {preferences.confidenceTier === 'confident_creator' && 'Confident Creator'}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Badges section */}
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <Medal className="h-5 w-5 mr-2" />
                    Your Achievements
                  </div>
                  {earnedBadgeDetails.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate('/badges')}
                      className="text-xs h-8"
                    >
                      View All
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {earnedBadgeDetails.length > 0 ? (
                  <>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {displayBadges.map((badge, index) => (
                        <div 
                          key={index} 
                          className="flex flex-col items-center p-2 rounded-lg bg-gray-50"
                        >
                          <div className="text-2xl mb-1">{badge.icon}</div>
                          <div className="text-xs text-center font-medium truncate w-full">
                            {badge.name}
                          </div>
                        </div>
                      ))}
                    </div>
                    {!showAllBadges && earnedBadgeDetails.length > 3 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs w-full" 
                        onClick={() => setShowAllBadges(true)}
                      >
                        Show All ({earnedBadgeDetails.length})
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <div className="text-3xl mb-2">🏆</div>
                    <p className="mb-4">Complete sessions to earn badges!</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate('/prompts')}
                    >
                      Start Practicing
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;