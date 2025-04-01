import { useQuery, useMutation } from '@tanstack/react-query';
import { WeeklyBadge } from '@shared/schema';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface UseWeeklyBadgesReturn {
  badges: WeeklyBadge[];
  isLoading: boolean;
  error: Error | null;
  totalBadges: number;
  countBadgesByTier: (tier: string) => number;
  checkForBadge: (tier: string, weekNumber: number) => WeeklyBadge | undefined;
  awardBadgeMutation: {
    mutate: (params: { tier: string; weekNumber: number }) => void;
    isLoading: boolean;
    error: Error | null;
  };
}

export function useWeeklyBadges(): UseWeeklyBadgesReturn {
  const { toast } = useToast();
  
  // Fetch all badges for the current user
  const {
    data: badges = [],
    isLoading,
    error,
  } = useQuery<WeeklyBadge[], Error>({
    queryKey: ['/api/weekly-badges'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Calculate total number of badges
  const totalBadges = badges.length;
  
  // Count badges by tier
  const countBadgesByTier = (tier: string): number => {
    return badges.filter(badge => badge.tier === tier).length;
  };
  
  // Check if a specific badge exists
  const checkForBadge = (tier: string, weekNumber: number): WeeklyBadge | undefined => {
    return badges.find(badge => badge.tier === tier && badge.weekNumber === weekNumber);
  };
  
  // Mutation to award a new badge - using v5 of TanStack Query
  const awardBadgeMutation = useMutation({
    mutationFn: async (params: { tier: string; weekNumber: number }) => {
      const response = await fetch('/api/weekly-badges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to award badge');
      }
      
      return await response.json();
    },
    onSuccess: (newBadge: WeeklyBadge) => {
      // Update the badges cache with the new badge
      queryClient.setQueryData<WeeklyBadge[]>(['/api/weekly-badges'], (oldBadges = []) => {
        // Check if the badge already exists to prevent duplicates
        const exists = oldBadges.some(
          badge => badge.tier === newBadge.tier && badge.weekNumber === newBadge.weekNumber
        );
        
        if (exists) {
          return oldBadges;
        }
        
        return [...oldBadges, newBadge];
      });
      
      toast({
        title: 'Badge Earned!',
        description: `You earned a new badge for your progress!`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to award badge: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  return {
    badges,
    isLoading,
    error: error || null,
    totalBadges,
    countBadgesByTier,
    checkForBadge,
    awardBadgeMutation: {
      mutate: awardBadgeMutation.mutate,
      isLoading: awardBadgeMutation.isPending,
      error: awardBadgeMutation.error,
    },
  };
}