import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

export interface ChallengeProgress {
  id: number;
  userId: number;
  dayNumber: number;
  completedAt: string;
}

export function useChallengeProgress() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get all challenge progress for the current user
  const { data: progress = [], isLoading } = useQuery<ChallengeProgress[], Error>({
    queryKey: ["/api/challenge-progress"],
    enabled: !!user, // Only run query if user is logged in
  });
  
  // Check if a specific day is completed
  const isDayCompleted = (dayNumber: number): boolean => {
    return progress.some(p => p.dayNumber === dayNumber);
  };
  
  // Calculate overall progress percentage
  const progressPercentage = progress.length > 0 ? Math.round((progress.length / 30) * 100) : 0;
  
  // Complete a challenge day
  const completeChallengeMutation = useMutation({
    mutationFn: async (dayNumber: number) => {
      const response = await apiRequest({
        url: "/api/challenge-progress",
        method: "POST",
        body: JSON.stringify({ dayNumber }),
        headers: {
          "Content-Type": "application/json"
        }
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenge-progress"] });
      toast({
        title: "Challenge day completed!",
        description: "Great job on completing this challenge.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error completing challenge",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  return {
    progress,
    isLoading,
    isDayCompleted,
    progressPercentage,
    completeChallenge: completeChallengeMutation.mutate,
    isCompleting: completeChallengeMutation.isPending,
  };
}