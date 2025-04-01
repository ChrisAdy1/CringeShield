import { useQuery, useMutation } from '@tanstack/react-query';
import { WeeklyChallengeTier, WeeklyProgress } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { getPrompts } from '@/lib/weeklyPrompts';

export type WeeklyChallengeStatus = 'not_started' | 'in_progress';

interface WeeklyChallengeResponse {
  status: WeeklyChallengeStatus;
  progress?: WeeklyProgress;
}

export function useWeeklyChallenge() {
  const { toast } = useToast();
  
  // Fetch the user's weekly challenge status
  const { 
    data: weeklyChallenge,
    isLoading,
    error
  } = useQuery<WeeklyChallengeResponse>({
    queryKey: ['/api/weekly-challenge'],
    retry: false,
  });
  
  // Start a weekly challenge with the selected tier
  const startWeeklyChallenge = useMutation({
    mutationFn: async (tier: WeeklyChallengeTier) => {
      return await apiRequest({
        url: '/api/weekly-challenge',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/weekly-challenge'] });
      toast({
        title: 'Weekly Challenge Started!',
        description: 'Your 15-week speaking journey has begun. Complete each week\'s prompts to track your progress.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to start challenge',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Mark a prompt as completed
  const completePrompt = useMutation({
    mutationFn: async (promptId: string) => {
      return await apiRequest({
        url: '/api/weekly-challenge/complete',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/weekly-challenge'] });
      toast({
        title: 'Prompt Completed!',
        description: 'Great job! Your progress has been saved.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to save progress',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Check if a prompt is completed
  const isPromptCompleted = (promptId: string): boolean => {
    if (!weeklyChallenge?.progress?.completedPrompts) return false;
    return weeklyChallenge.progress.completedPrompts.includes(promptId);
  };
  
  // Get current week based on start date
  const getCurrentWeek = (): number => {
    if (!weeklyChallenge?.progress?.startDate) return 1;
    
    const startDate = new Date(weeklyChallenge.progress.startDate);
    const now = new Date();
    const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate the current week (1-based)
    const currentWeek = Math.floor(daysSinceStart / 7) + 1;
    
    // Limit to 15 weeks maximum
    return Math.min(currentWeek, 15);
  };
  
  // Get prompts for the current week
  const getWeeklyPrompts = (week: number, tier: WeeklyChallengeTier) => {
    // Import from our prompts data file
    return getPrompts(week, tier);
  };

  return {
    weeklyChallenge,
    isLoading,
    error,
    startWeeklyChallenge,
    completePrompt,
    isPromptCompleted,
    getCurrentWeek,
    getWeeklyPrompts,
  };
}