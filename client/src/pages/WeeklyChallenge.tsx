import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWeeklyChallenge } from '@/hooks/useWeeklyChallenge';
import { useWeeklyBadges } from '@/hooks/useWeeklyBadges';
import { queryClient } from '../lib/queryClient';
import { WeeklyPrompt } from '@/lib/weeklyPrompts';
import { Redirect, Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { getProgressPercentage, isWeekUnlocked } from '@/lib/weeklyPrompts';
import { Loader2, LockIcon, CheckIcon, ArrowRightIcon, Award } from 'lucide-react';
import type { WeeklyChallengeTier, WeeklyBadge } from '@shared/schema';
import BadgeModal from '@/components/BadgeModal';

const WeeklyChallenge = () => {
  const { user } = useAuth();
  const { 
    weeklyChallenge, 
    isLoading, 
    isPromptCompleted, 
    getCurrentWeek,
    getWeeklyPrompts,
    completePrompt 
  } = useWeeklyChallenge();
  const { 
    checkForBadge, 
    checkAndAwardWeeklyBadge 
  } = useWeeklyBadges();
  // Check for week parameter in URL query (e.g. /weekly-challenge?week=2)
  const search = typeof window !== 'undefined' ? window.location.search : '';
  const urlParams = new URLSearchParams(search);
  const weekParam = urlParams.get('week');
  
  const [selectedWeek, setSelectedWeek] = useState<number>(
    weekParam ? parseInt(weekParam, 10) : 1
  );
  const [newBadge, setNewBadge] = useState<WeeklyBadge | null>(null);
  
  // Only set the selected week to current week on initial load, not after user selects a different week
  useEffect(() => {
    if (!isLoading && weeklyChallenge?.status === 'in_progress' && !weekParam && selectedWeek === 1) {
      const currentWeek = getCurrentWeek();
      setSelectedWeek(currentWeek);
    }
  }, [isLoading, weeklyChallenge, getCurrentWeek, weekParam]);
  
  // Check for week completion and award badges if needed
  useEffect(() => {
    if (!isLoading && weeklyChallenge?.status === 'in_progress') {
      const tier = weeklyChallenge.progress?.selectedTier as WeeklyChallengeTier;
      const completedPrompts = weeklyChallenge.progress?.completedPrompts || [];
      
      // Check for completion in the current week and all previous weeks
      const currentWeekNum = getCurrentWeek();
      
      console.log("Checking badge eligibility - Current week:", currentWeekNum, "Selected week:", selectedWeek);
      
      // Check the selected week's completion status
      const selectedWeekPrompts = getWeeklyPrompts(selectedWeek, tier);
      const allSelectedWeekPromptsCompleted = selectedWeekPrompts.every(prompt => 
        completedPrompts.includes(prompt.id)
      );
      
      console.log("Selected week completed?", allSelectedWeekPromptsCompleted, "Already has badge?", !!checkForBadge(tier, selectedWeek));
      
      // Also check the current week (which may be different from selected)
      const currentWeekPrompts = getWeeklyPrompts(currentWeekNum, tier);
      const allCurrentWeekPromptsCompleted = currentWeekPrompts.every(prompt => 
        completedPrompts.includes(prompt.id)
      );
      
      // First check the selected week (what the user is viewing)
      if (allSelectedWeekPromptsCompleted && !checkForBadge(tier, selectedWeek)) {
        console.log("Awarding badge for selected week:", selectedWeek);
        // Award badge for the selected week
        const checkAndAwardSelected = async () => {
          try {
            const badge = await checkAndAwardWeeklyBadge(tier, selectedWeek);
            if (badge) {
              console.log("Badge awarded for selected week:", badge);
              setNewBadge(badge);
            }
          } catch (error) {
            console.error("Error awarding badge for selected week:", error);
          }
        };
        checkAndAwardSelected();
      } 
      // Then check current week if it's different from selected
      else if (currentWeekNum !== selectedWeek && allCurrentWeekPromptsCompleted && !checkForBadge(tier, currentWeekNum)) {
        console.log("Awarding badge for current week:", currentWeekNum);
        // Award badge for the current week
        const checkAndAwardCurrent = async () => {
          try {
            const badge = await checkAndAwardWeeklyBadge(tier, currentWeekNum);
            if (badge) {
              console.log("Badge awarded for current week:", badge);
              setNewBadge(badge);
            }
          } catch (error) {
            console.error("Error awarding badge for current week:", error);
          }
        };
        checkAndAwardCurrent();
      }
    }
  }, [isLoading, weeklyChallenge, getCurrentWeek, getWeeklyPrompts, checkForBadge, checkAndAwardWeeklyBadge, selectedWeek]);

  // If user is not logged in, redirect to login page
  if (!user && !isLoading) {
    return <Redirect to="/auth" />;
  }

  // If user hasn't started a weekly challenge, redirect to the selection page
  if (weeklyChallenge?.status === 'not_started' && !isLoading) {
    return <Redirect to="/weekly-challenge-select" />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Get progress data
  const tier = weeklyChallenge?.progress?.selectedTier as WeeklyChallengeTier || 'shy_starter';
  const startDate = weeklyChallenge?.progress?.startDate ? new Date(weeklyChallenge.progress.startDate) : new Date();
  const completedPrompts = weeklyChallenge?.progress?.completedPrompts || [];
  const currentWeek = getCurrentWeek();
  const progress = getProgressPercentage(tier, completedPrompts);

  // Generate array of all weeks (1-15)
  const allWeeks = Array.from({ length: 15 }, (_, i) => i + 1);
  
  // Get prompts for the selected week
  const weekPrompts = getWeeklyPrompts(selectedWeek, tier);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Weekly Challenge</h1>
          <p className="text-lg text-muted-foreground">
            {tier === 'shy_starter' && 'Shy Starter'}
            {tier === 'growing_speaker' && 'Growing Speaker'}
            {tier === 'confident_creator' && 'Confident Creator'}
            {' - Week '}{selectedWeek} of 15
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Progress value={progress} className="w-full md:w-64 h-2 mb-1" />
          <p className="text-sm text-right text-muted-foreground">{progress}% complete</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Weeks navigation sidebar */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Weeks</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2 pb-6">
            {allWeeks.map(week => {
              const weekUnlocked = isWeekUnlocked(startDate, week, completedPrompts);
              const isCurrentWeek = week === currentWeek;
              const weekPrompts = getWeeklyPrompts(week, tier);
              const weekCompletedPrompts = weekPrompts.filter(prompt => 
                completedPrompts.includes(prompt.id)
              ).length;
              const weekCompletionPercent = Math.round((weekCompletedPrompts / 3) * 100);
              
              return (
                <Button
                  key={week}
                  variant={selectedWeek === week ? "default" : "outline"}
                  className="justify-between font-normal"
                  disabled={!weekUnlocked}
                  onClick={() => {
                    setSelectedWeek(week);
                    // Update URL with the selected week
                    window.history.pushState({}, "", `/weekly-challenge?week=${week}`);
                  }}
                >
                  <div className="flex items-center">
                    {!weekUnlocked ? (
                      <LockIcon className="h-4 w-4 mr-2" />
                    ) : weekCompletionPercent === 100 ? (
                      <CheckIcon className="h-4 w-4 mr-2 text-green-500" />
                    ) : null}
                    Week {week}
                  </div>
                  {weekUnlocked && (
                    <Badge variant="outline">{weekCompletedPrompts}/3</Badge>
                  )}
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Week content */}
        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Week {selectedWeek} Prompts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {weekPrompts.map((prompt: WeeklyPrompt) => {
                const completed = isPromptCompleted(prompt.id);
                // If the week is unlocked (which it must be to be selected), then the prompts should be available
                const isLocked = false;
                
                return (
                  <Card key={prompt.id} className={`border ${completed ? 'bg-muted' : 'bg-card'}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {prompt.title || `Prompt ${prompt.order}`}
                        </CardTitle>
                        {completed && <Badge className="bg-green-500">Completed</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p>{prompt.text}</p>
                    </CardContent>
                    <CardFooter>
                      <Link to={`/recording?prompt=${prompt.id}`}>
                        <Button 
                          disabled={isLocked} 
                          className="w-full md:w-auto"
                        >
                          {completed ? 'Practice Again' : 'Record Response'}
                          <ArrowRightIcon className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </CardContent>
          </Card>

          {/* Week guidelines based on tier */}
          <Card>
            <CardHeader>
              <CardTitle>Guidelines for {tier === 'shy_starter' ? 'Shy Starter' : tier === 'growing_speaker' ? 'Growing Speaker' : 'Confident Creator'}</CardTitle>
            </CardHeader>
            <CardContent>
              {tier === 'shy_starter' && (
                <ul className="list-disc pl-6 space-y-2">
                  <li>Aim for 30-45 seconds per prompt</li>
                  <li>Focus on clarity rather than complexity</li>
                  <li>Use simple language and stick to the main points</li>
                  <li>It's okay to restart if you need to</li>
                  <li>Practice looking at the camera for brief periods</li>
                </ul>
              )}
              {tier === 'growing_speaker' && (
                <ul className="list-disc pl-6 space-y-2">
                  <li>Aim for 1-2 minutes per prompt</li>
                  <li>Include specific examples or stories</li>
                  <li>Vary your pace and tone</li>
                  <li>Practice maintaining eye contact with the camera</li>
                  <li>Try to minimize filler words (um, uh, like)</li>
                </ul>
              )}
              {tier === 'confident_creator' && (
                <ul className="list-disc pl-6 space-y-2">
                  <li>Aim for 2-3 minutes per prompt</li>
                  <li>Structure your response with a clear beginning, middle, and end</li>
                  <li>Incorporate persuasive elements and thoughtful analysis</li>
                  <li>Use hand gestures and facial expressions to enhance delivery</li>
                  <li>Challenge yourself to speak without notes or preparation</li>
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Badge modal */}
      {newBadge && (
        <BadgeModal
          badge={newBadge}
          badgeType="weekly"
          isOpen={!!newBadge}
          onClose={() => setNewBadge(null)}
        />
      )}
    </div>
  );
};

export default WeeklyChallenge;