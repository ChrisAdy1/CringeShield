import { useQuery, useMutation } from '@tanstack/react-query';
import { ChallengeBadge } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Define milestone types
export type BadgeMilestone = 7 | 15 | 30;

// Badge info structure
interface BadgeInfo {
  name: string;
  description: string;
  emoji: string;
}

export function useChallengeBadges() {
  // Get all user's challenge badges
  const {
    data: badges = [],
    isLoading,
    error,
    refetch
  } = useQuery<ChallengeBadge[]>({
    queryKey: ['/api/challenge-badges'],
  });

  // Check if a user has a specific milestone badge
  const hasBadge = (milestone: BadgeMilestone): boolean => {
    return badges.some(badge => badge.milestone === milestone);
  };

  // Check for badge eligibility and award if criteria met
  const checkAndAwardBadgeMutation = useMutation({
    mutationFn: async (milestone: BadgeMilestone) => {
      // First check if the user already has this badge
      if (hasBadge(milestone)) {
        return null; // User already has this badge
      }

      // Try to award the badge (API will validate if criteria are met)
      const response = await apiRequest('/api/challenge-badges/award', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ milestone })
      });
      return await response.json();
    },
    onSuccess: (data) => {
      if (data) {
        // Only invalidate queries if a new badge was awarded
        queryClient.invalidateQueries({ queryKey: ['/api/challenge-badges'] });
      }
    }
  });

  // Get badge info by milestone
  const getBadgeInfo = (milestone: BadgeMilestone): BadgeInfo => {
    switch(milestone) {
      case 7:
        return {
          name: "Week One Warrior",
          description: "Completed 7 days of the 30-day challenge",
          emoji: "🗓️"
        };
      case 15:
        return {
          name: "Halfway Hero",
          description: "Completed 15 days of the 30-day challenge",
          emoji: "🧱"
        };
      case 30:
        return {
          name: "Challenge Conqueror",
          description: "Completed all 30 days of the challenge",
          emoji: "🏆"
        };
      default:
        return {
          name: "Unknown Badge",
          description: "Badge details not available",
          emoji: "❓"
        };
    }
  };

  return {
    badges,
    isLoading,
    error,
    hasBadge,
    checkAndAwardBadgeMutation,
    getBadgeInfo,
    refetch
  };
}