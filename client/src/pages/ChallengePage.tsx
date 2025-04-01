import React from 'react';
import { Loader2, Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { challengeDays } from '@/lib/challengeDays';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
import { ChallengeDayCard } from '@/components/challenge/ChallengeDayCard';

export default function ChallengePage() {
  const { 
    progress, 
    isLoading, 
    isDayCompleted, 
    progressPercentage,
    isCompleting
  } = useChallengeProgress();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">30-Day Speaking Challenge</h1>
          <p className="text-muted-foreground">
            Complete these speaking exercises in any order to improve your confidence.
          </p>
        </div>
      </div>

      {/* Progress section */}
      <div className="bg-primary/5 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold">Your Progress</h2>
          <div className="flex items-center gap-1 text-sm font-medium">
            <span>{progress.length}/30 Completed</span>
            {progress.length === 30 && (
              <Trophy className="h-4 w-4 text-yellow-500" />
            )}
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <p className="text-sm text-muted-foreground">
          {progressPercentage}% complete
        </p>
      </div>

      {/* Challenge cards grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {challengeDays.map((challenge) => (
          <ChallengeDayCard
            key={challenge.day}
            challenge={challenge}
            isCompleted={isDayCompleted(challenge.day)}
            isCompleting={isCompleting}
          />
        ))}
      </div>
    </div>
  );
}