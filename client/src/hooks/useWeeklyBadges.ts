import { useQuery, useMutation } from '@tanstack/react-query';
import { WeeklyBadge } from '@shared/schema';
import { queryClient } from '../lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface UseWeeklyBadgesReturn {
  badges: WeeklyBadge[];
  isLoading: boolean;
  error: Error | null;
  totalBadges: number;
  countBadgesByTier: (tier: string) => number;
  checkForBadge: (tier: string, weekNumber: number) => WeeklyBadge | undefined;
  checkAndAwardWeeklyBadge: (tier: string, weekNumber: number) => Promise<WeeklyBadge | null>;
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
  
  // Combined function to check if all prompts are completed and award a badge if needed
  const checkAndAwardWeeklyBadge = async (tier: string, weekNumber: number): Promise<WeeklyBadge | null> => {
    // First check if badge already exists
    const existingBadge = checkForBadge(tier, weekNumber);
    if (existingBadge) {
      return existingBadge;
    }
    
    try {
      // Call the backend to check if all prompts are completed and award badge if needed
      const response = await fetch('/api/weekly-badges/check-and-award', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier, weekNumber }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        // If response is not a server error but rather "not eligible", return null
        if (response.status === 400) {
          return null;
        }
        throw new Error('Failed to check badge eligibility');
      }
      
      const newBadge = await response.json();
      
      // If a new badge was awarded, update the cache and show a toast
      if (newBadge) {
        // Update the badges cache
        queryClient.setQueryData<WeeklyBadge[]>(['/api/weekly-badges'], (oldBadges = []) => {
          return [...oldBadges, newBadge];
        });
        
        toast({
          title: 'Badge Earned!',
          description: `You earned a new badge for completing Week ${weekNumber}!`,
          variant: 'default',
        });
        
        return newBadge;
      }
      
      return null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Error',
        description: `Error checking badge eligibility: ${errorMessage}`,
        variant: 'destructive',
      });
      return null;
    }
  };
  
  return {
    badges,
    isLoading,
    error: error || null,
    totalBadges,
    countBadgesByTier,
    checkForBadge,
    checkAndAwardWeeklyBadge,
  };
}