import { useQuery, useMutation } from '@tanstack/react-query';
import { ChallengeProgress } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';

export function useChallengeProgress() {
  // Get all completed challenge days
  const { 
    data: completedDays = [],
    isLoading,
    error,
    refetch 
  } = useQuery<ChallengeProgress[]>({
    queryKey: ['/api/challenge-progress'],
  });

  // Check if a specific day is completed
  const isDayCompleted = async (dayNumber: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/challenge-progress/${dayNumber}`);
      const data = await response.json();
      return data.isCompleted;
    } catch (error) {
      console.error("Error checking day completion:", error);
      return false;
    }
  };

  // Complete a challenge day
  const completeDayMutation = useMutation({
    mutationFn: async (dayNumber: number) => {
      const body = JSON.stringify({ dayNumber });
      const response = await apiRequest('/api/challenge-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/challenge-progress'] });
    },
  });

  // Calculate completed days count and percentage
  const completedCount = completedDays.length;
  const totalDays = 30; // There are 30 days in the challenge
  const progressPercentage = Math.round((completedCount / totalDays) * 100);

  return {
    completedDays,
    isLoading,
    error,
    isDayCompleted,
    completeDayMutation,
    completedCount,
    totalDays,
    progressPercentage,
    refetch
  };
}