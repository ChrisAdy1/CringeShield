import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
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

// Define the 30-day challenge data
export const challengeDays = [
  {
    day: 1,
    title: "Record a 1-min intro video just for yourself",
    description: "Introduce yourself, where you're from, and one interesting fact about you."
  },
  {
    day: 2,
    title: "Share a goal you have for improving your speaking",
    description: "What specific area would you like to improve most? Why is it important to you?"
  },
  {
    day: 3,
    title: "Explain something you're knowledgeable about",
    description: "Choose a topic you know well and explain it in simple terms as if teaching someone."
  },
  {
    day: 4,
    title: "Talk about your favorite place",
    description: "Describe a place you love visiting - what makes it special to you?"
  },
  {
    day: 5,
    title: "Share a memorable experience",
    description: "Talk about something memorable that happened to you and what you learned from it."
  },
  {
    day: 6,
    title: "Give yourself a pep talk",
    description: "Record yourself giving an encouraging pep talk as if you were motivating yourself."
  },
  {
    day: 7,
    title: "Reflect on week 1 progress",
    description: "Share how you've felt about the first week of challenges and what you've noticed."
  },
  {
    day: 8,
    title: "Tell a short story",
    description: "Share a brief story - can be something that happened to you or made up!"
  },
  {
    day: 9,
    title: "Practice answering an interview question",
    description: "What are your greatest strengths? Answer as if in a job interview."
  },
  {
    day: 10,
    title: "Explain your morning routine",
    description: "Walk through your typical morning routine step by step."
  },
  {
    day: 11,
    title: "Share a skill you'd like to learn",
    description: "Talk about something you'd like to learn and why it interests you."
  },
  {
    day: 12,
    title: "Describe your ideal day",
    description: "From morning to night, describe what your perfect day would look like."
  },
  {
    day: 13,
    title: "Give a recommendation",
    description: "Recommend a book, movie, podcast or product and why you like it."
  },
  {
    day: 14,
    title: "Reflect on week 2 progress",
    description: "What have you improved on since starting this challenge? What still feels difficult?"
  },
  {
    day: 15,
    title: "Share your opinion on a topic",
    description: "Pick a non-controversial topic and share your thoughts about it."
  },
  {
    day: 16,
    title: "Teach a simple exercise or stretch",
    description: "Demonstrate and explain a simple exercise or stretch anyone can do."
  },
  {
    day: 17,
    title: "Explain how to make something",
    description: "Walk through how to make something simple (a sandwich, a paper airplane, etc.)"
  },
  {
    day: 18,
    title: "Record yourself reading a paragraph",
    description: "Find a paragraph from a book or article and read it with expression."
  },
  {
    day: 19,
    title: "Share what motivates you",
    description: "Talk about what drives you and keeps you motivated in life."
  },
  {
    day: 20,
    title: "Give advice to your younger self",
    description: "What wisdom would you share with your younger self if you could?"
  },
  {
    day: 21,
    title: "Reflect on week 3 progress",
    description: "You're 3 weeks in! Reflect on how your confidence has changed since starting."
  },
  {
    day: 22,
    title: "Practice introducing yourself professionally",
    description: "Give a professional introduction as if meeting someone at a networking event."
  },
  {
    day: 23,
    title: "Share something you've learned recently",
    description: "Talk about something new you've learned in the past month."
  },
  {
    day: 24,
    title: "Explain a concept you understand well",
    description: "Pick a concept or idea and explain it clearly to someone who's never heard of it."
  },
  {
    day: 25,
    title: "Talk about a small win",
    description: "Share a recent accomplishment, no matter how small, and why it matters to you."
  },
  {
    day: 26,
    title: "Share a travel experience or dream destination",
    description: "Talk about a memorable trip or somewhere you'd love to visit someday."
  },
  {
    day: 27,
    title: "Give a brief 'how-to' tutorial",
    description: "Teach a simple skill or process that others might find useful."
  },
  {
    day: 28,
    title: "Reflect on week 4 progress",
    description: "You're almost done! Reflect on your journey over the past 4 weeks."
  },
  {
    day: 29,
    title: "Record a creative monologue",
    description: "Be creative! Try a short monologue as if you were in a play or movie."
  },
  {
    day: 30,
    title: "Share your 30-day challenge experience",
    description: "Reflect on the full 30 days - how has your speaking confidence changed?"
  }
];

const Challenge: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { completedDays, isLoading, completeDayMutation } = useChallengeProgress();
  const { badges, checkAndAwardBadgeMutation, getBadgeInfo } = useChallengeBadges();
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
      toast({
        title: "Day completed!",
        description: `Day ${dayNumber} has been marked as complete.`,
        variant: "default",
      });
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
      <Layout currentPath="/challenge">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
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
    <Layout currentPath="/challenge">
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
        
        {/* Challenge days */}
        <div className="grid gap-4 md:grid-cols-2">
          {challengeDays.map((challenge) => (
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
                {isDayCompleted(challenge.day) ? (
                  <Button variant="outline" className="gap-1" disabled>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Completed
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      className="gap-1"
                      onClick={() => completeDay(challenge.day)}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Mark Complete
                    </Button>
                    <Button 
                      variant="default" 
                      className="gap-1"
                      onClick={() => startRecording(challenge.day)}
                    >
                      Practice Now
                    </Button>
                  </>
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
    </Layout>
  );
};

export default Challenge;