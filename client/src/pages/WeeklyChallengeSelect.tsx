import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWeeklyChallenge } from '@/hooks/useWeeklyChallenge';
import { Redirect } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { WeeklyChallengeTier } from '@shared/schema';

const WeeklyChallengeSelect = () => {
  const { user } = useAuth();
  const { weeklyChallenge, isLoading, startWeeklyChallenge } = useWeeklyChallenge();
  const startingChallenge = startWeeklyChallenge.isPending;

  // If user is not logged in, redirect to login page
  if (!user && !isLoading) {
    return <Redirect to="/auth" />;
  }

  // If user already has a weekly challenge in progress, redirect to the challenge page
  if (weeklyChallenge?.status === 'in_progress' && !isLoading) {
    return <Redirect to="/weekly-challenge" />;
  }

  const handleSelectTier = (tier: WeeklyChallengeTier) => {
    startWeeklyChallenge.mutate(tier);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Choose Your Weekly Challenge Tier</h1>
      <p className="text-lg text-center mb-8">
        Select a challenge tier that matches your current comfort level with speaking on camera.
        Each tier includes 15 weeks of prompts, with 3 prompts per week.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Shy Starter Tier */}
        <Card className="border-2 hover:border-primary/50 transition-all">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Shy Starter</CardTitle>
            <CardDescription className="text-center">
              For beginners who feel nervous speaking on camera
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>30-second simple prompts</li>
              <li>Basic introductions</li>
              <li>Everyday topics</li>
              <li>Gentle progression</li>
            </ul>
            <Button 
              className="w-full" 
              onClick={() => handleSelectTier('shy_starter')}
              disabled={startingChallenge}
            >
              {startingChallenge ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting...</>
              ) : (
                'Select Shy Starter'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Growing Speaker Tier */}
        <Card className="border-2 hover:border-primary/50 transition-all">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Growing Speaker</CardTitle>
            <CardDescription className="text-center">
              For those with some speaking experience looking to grow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>1-2 minute prompts</li>
              <li>Personal stories</li>
              <li>Reflective topics</li>
              <li>Moderate complexity</li>
            </ul>
            <Button 
              className="w-full" 
              onClick={() => handleSelectTier('growing_speaker')}
              disabled={startingChallenge}
            >
              {startingChallenge ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting...</>
              ) : (
                'Select Growing Speaker'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Confident Creator Tier */}
        <Card className="border-2 hover:border-primary/50 transition-all">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Confident Creator</CardTitle>
            <CardDescription className="text-center">
              For those ready to take on advanced speaking challenges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>2-3 minute complex prompts</li>
              <li>Persuasive topics</li>
              <li>Analytical discussions</li>
              <li>Thought leadership content</li>
            </ul>
            <Button 
              className="w-full" 
              onClick={() => handleSelectTier('confident_creator')}
              disabled={startingChallenge}
            >
              {startingChallenge ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting...</>
              ) : (
                'Select Confident Creator'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 text-center max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">How the Weekly Challenge Works</h2>
        <ul className="text-left list-decimal pl-6 space-y-2">
          <li>Each tier has 45 prompts total (3 prompts per week for 15 weeks)</li>
          <li>New prompts unlock every 7 days based on when you start</li>
          <li>Complete prompts by recording videos using the prompts as speaking topics</li>
          <li>Track your progress through all 15 weeks</li>
          <li>You can only choose one tier at a time - choose wisely!</li>
        </ul>
      </div>
    </div>
  );
};

export default WeeklyChallengeSelect;