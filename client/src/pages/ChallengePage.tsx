import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
import { useChallengeBadges, BadgeMilestone } from '@/hooks/useChallengeBadges';
import { Award, Medal, Trophy, Loader2, PlusCircle, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Progress } from "@/components/ui/progress";
import BadgeModal from '@/components/BadgeModal';
import { ChallengeBadge } from '@shared/schema';
import { challengeDays } from '@/lib/challengeDays';

const ChallengePage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { 
    completedDays, 
    isLoading, 
    completeDayMutation 
  } = useChallengeProgress();
  
  const { 
    badges, 
    checkAndAwardBadgeMutation, 
    getBadgeInfo 
  } = useChallengeBadges();
  
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [currentBadge, setCurrentBadge] = useState<ChallengeBadge | null>(null);

  // Calculate progress percentages
  const totalDays = challengeDays.length;
  const completedCount = completedDays.length;
  const progressPercentage = Math.round((completedCount / totalDays) * 100);

  // Define milestone progress
  const milestones: BadgeMilestone[] = [7, 15, 30];
  
  // Effect to check for badge eligibility after completing a day
  useEffect(() => {
    if (completedCount > 0) {
      // Check each milestone
      milestones.forEach(milestone => {
        if (completedCount >= milestone) {
          checkForMilestoneBadge(milestone);
        }
      });
    }
  }, [completedCount]);

  // Function to check for a milestone badge and show modal if newly awarded
  const checkForMilestoneBadge = async (milestone: BadgeMilestone) => {
    try {
      const result = await checkAndAwardBadgeMutation.mutateAsync(milestone);
      
      // If status is 201, it's a newly awarded badge, so show the modal
      if (checkAndAwardBadgeMutation.isSuccess && result && 'id' in result) {
        setCurrentBadge(result as ChallengeBadge);
        setShowBadgeModal(true);
      }
    } catch (error) {
      console.error(`Error checking for milestone ${milestone}:`, error);
      // Don't show error toast as this is an automatic check and might fail just because milestone isn't reached
    }
  };

  // Function to complete a day's challenge
  const completeDay = async (dayNumber: number) => {
    try {
      await completeDayMutation.mutateAsync(dayNumber);
      
      // Basic completion toast
      toast({
        title: "Day completed!",
        description: `Day ${dayNumber} has been marked as complete.`,
        variant: "default",
      });
      
      // Check for milestone days and show special celebration toast
      if (dayNumber === 7) {
        setTimeout(() => {
          toast({
            title: "🎉 First Week Complete!",
            description: "You've finished your first week! Keep the momentum going!",
            variant: "default",
            duration: 5000,
          });
        }, 1000);
      } else if (dayNumber === 15) {
        setTimeout(() => {
          toast({
            title: "🎉 Halfway There!",
            description: "You've reached the halfway point! You're making amazing progress!",
            variant: "default",
            duration: 5000,
          });
        }, 1000);
      } else if (dayNumber === 30) {
        setTimeout(() => {
          toast({
            title: "🏆 Challenge Complete!",
            description: "Congratulations! You've completed the entire 30-day challenge!",
            variant: "default",
            duration: 5000,
          });
        }, 1000);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark day as complete. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to start recording for a specific day
  const startRecording = (dayNumber: number) => {
    setLocation(`/recording?challenge=${dayNumber}`);
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl pb-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Check if a specific day is completed
  const isDayCompleted = (dayNumber: number) => {
    return completedDays.some(day => day.dayNumber === dayNumber);
  };

  // Render badge icons
  const renderBadgeIcon = (milestone: BadgeMilestone) => {
    const hasBadge = badges.some(badge => badge.milestone === milestone);
    const badgeInfo = getBadgeInfo(milestone);
    
    let Icon = Award;
    if (milestone === 15) Icon = Medal;
    if (milestone === 30) Icon = Trophy;
    
    return (
      <div className="flex flex-col items-center">
        <div 
          className={`w-12 h-12 rounded-full flex items-center justify-center border ${
            hasBadge 
              ? 'bg-amber-100 text-amber-600 border-amber-200' 
              : 'bg-gray-100 text-gray-400 border-gray-200'
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <span className="text-xs mt-1 text-center">
          {hasBadge ? (
            <span className="font-medium text-amber-700">{badgeInfo.emoji}</span>
          ) : (
            <span className="text-gray-500">{milestone} Days</span>
          )}
        </span>
      </div>
    );
  };

  return (
    <div className="container max-w-4xl pb-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">30-Day Challenge</h1>
        <p className="text-muted-foreground">
          Build your speaking confidence one day at a time. Complete all 30 days to master your camera presence.
        </p>
      </div>
      
      {/* Progress section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
          <CardDescription>
            You've completed {completedCount} out of {totalDays} days
            {completedCount > 0 && (
              <span> — {
                completedCount < 7 ? "Keep going! You're building momentum." :
                completedCount < 15 ? "You're making great progress!" :
                completedCount < 30 ? "Getting closer to the finish line!" :
                "Amazing! You've completed the challenge! 🏆"
              }</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progressPercentage} className="h-2" />
            
            <div className="flex justify-between items-center mt-6">
              {milestones.map(milestone => (
                <div key={milestone} className="flex flex-col items-center">
                  {renderBadgeIcon(milestone)}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Sticky CTA for next challenge */}
      {completedCount < totalDays && (
        <div className="sticky top-0 z-10 py-2 bg-background/95 backdrop-blur mb-4 border-b">
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => {
              // Find the next uncompleted day
              const nextDay = challengeDays.find(day => !isDayCompleted(day.day));
              if (nextDay) {
                startRecording(nextDay.day);
              }
            }}
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Continue with Day {challengeDays.find(day => !isDayCompleted(day.day))?.day || 1}
          </Button>
        </div>
      )}

      {/* Week 1: Warming Up */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center border-b pb-2">
          <span className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mr-2 text-primary">1</span>
          Week 1: Warming Up
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {challengeDays.slice(0, 7).map((challenge) => (
            <Card 
              key={challenge.day} 
              className={`overflow-hidden ${
                isDayCompleted(challenge.day) 
                  ? 'border-green-200 bg-green-50' 
                  : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold">
                    Day {challenge.day}
                  </CardTitle>
                  {isDayCompleted(challenge.day) && (
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                      Completed
                    </Badge>
                  )}
                </div>
                <CardDescription className="font-medium text-base">
                  {challenge.title}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm pb-3">
                <p>{challenge.description}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-0">
                {!isDayCompleted(challenge.day) && (
                  <Button 
                    variant="default" 
                    className="gap-1"
                    onClick={() => startRecording(challenge.day)}
                  >
                    <span className="mr-1">🎙️</span>
                    Practice Now
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Week 2: Finding Your Voice */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center border-b pb-2">
          <span className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mr-2 text-primary">2</span>
          Week 2: Finding Your Voice
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {challengeDays.slice(7, 14).map((challenge) => (
            <Card 
              key={challenge.day} 
              className={`overflow-hidden ${
                isDayCompleted(challenge.day) 
                  ? 'border-green-200 bg-green-50' 
                  : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold">
                    Day {challenge.day}
                  </CardTitle>
                  {isDayCompleted(challenge.day) && (
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                      Completed
                    </Badge>
                  )}
                </div>
                <CardDescription className="font-medium text-base">
                  {challenge.title}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm pb-3">
                <p>{challenge.description}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-0">
                {!isDayCompleted(challenge.day) && (
                  <Button 
                    variant="default" 
                    className="gap-1"
                    onClick={() => startRecording(challenge.day)}
                  >
                    <span className="mr-1">🎙️</span>
                    Practice Now
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Week 3: Express Yourself */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center border-b pb-2">
          <span className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mr-2 text-primary">3</span>
          Week 3: Express Yourself
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {challengeDays.slice(14, 21).map((challenge) => (
            <Card 
              key={challenge.day} 
              className={`overflow-hidden ${
                isDayCompleted(challenge.day) 
                  ? 'border-green-200 bg-green-50' 
                  : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold">
                    Day {challenge.day}
                  </CardTitle>
                  {isDayCompleted(challenge.day) && (
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                      Completed
                    </Badge>
                  )}
                </div>
                <CardDescription className="font-medium text-base">
                  {challenge.title}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm pb-3">
                <p>{challenge.description}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-0">
                {!isDayCompleted(challenge.day) && (
                  <Button 
                    variant="default" 
                    className="gap-1"
                    onClick={() => startRecording(challenge.day)}
                  >
                    <span className="mr-1">🎙️</span>
                    Practice Now
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Week 4: Bold & Real */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center border-b pb-2">
          <span className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mr-2 text-primary">4</span>
          Week 4: Bold & Real
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {challengeDays.slice(21, 30).map((challenge) => (
            <Card 
              key={challenge.day} 
              className={`overflow-hidden ${
                isDayCompleted(challenge.day) 
                  ? 'border-green-200 bg-green-50' 
                  : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold">
                    Day {challenge.day}
                  </CardTitle>
                  {isDayCompleted(challenge.day) && (
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                      Completed
                    </Badge>
                  )}
                </div>
                <CardDescription className="font-medium text-base">
                  {challenge.title}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm pb-3">
                <p>{challenge.description}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-0">
                {!isDayCompleted(challenge.day) && (
                  <Button 
                    variant="default" 
                    className="gap-1"
                    onClick={() => startRecording(challenge.day)}
                  >
                    <span className="mr-1">🎙️</span>
                    Practice Now
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Badge award modal */}
      {showBadgeModal && currentBadge && (
        <BadgeModal
          badge={currentBadge}
          badgeType="challenge"
          isOpen={showBadgeModal}
          onClose={() => setShowBadgeModal(false)}
        />
      )}
    </div>
  );
};

export default ChallengePage;