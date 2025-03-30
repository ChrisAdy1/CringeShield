import { useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { badges, Badge, checkEarnedBadges } from '@/lib/badgeLogic';
import { PracticeSession } from '@/lib/types';

interface BadgeState {
  earned: string[];
  lastSeen: string[];
}

export function useBadges() {
  const [badgeState, setBadgeState] = useLocalStorage<BadgeState>('badge-state', {
    earned: [],
    lastSeen: []
  });

  // Get new badges (earned but not seen)
  const newBadges = badgeState.earned.filter(
    badge => !badgeState.lastSeen.includes(badge)
  );

  // Mark badges as seen
  const markBadgesAsSeen = useCallback(() => {
    setBadgeState(prev => ({
      ...prev,
      lastSeen: [...prev.earned]
    }));
  }, [setBadgeState]);

  // Check for new badges after a session
  const checkSession = useCallback((
    session: PracticeSession,
    userData: { totalSessions: number; [key: string]: any }
  ) => {
    // Get badge IDs earned from this session
    const newlyEarnedBadges = checkEarnedBadges(session, userData);
    
    // Only add badges not already earned
    const badgesToAdd = newlyEarnedBadges.filter(
      badge => !badgeState.earned.includes(badge)
    );
    
    if (badgesToAdd.length > 0) {
      // Update badge state with newly earned badges
      setBadgeState(prev => ({
        ...prev,
        earned: [...prev.earned, ...badgesToAdd]
      }));
    }
    
    return badgesToAdd;
  }, [badgeState.earned, setBadgeState]);

  // Helper to get full badge details for earned badges
  const getEarnedBadgeDetails = useCallback(() => {
    return badges
      .filter(badge => badgeState.earned.includes(badge.name))
      .map(badge => ({
        id: badge.id,
        name: badge.name,
        icon: badge.icon,
        description: getBadgeDescription(badge.name)
      }));
  }, [badgeState.earned]);

  // Check if there are any new badges to show
  const hasNewBadges = newBadges.length > 0;

  // For compatibility with existing components
  const earnedBadges = badgeState.earned;
  
  // For compatibility with existing checkSessionForBadges references
  const checkSessionForBadges = (
    sessionDetails: any,
    userData: any
  ): string | null => {
    const newBadges = checkSession(sessionDetails, userData);
    return newBadges.length > 0 ? newBadges[0] : null;
  };

  return {
    badgeState,
    newBadges,
    markBadgesAsSeen,
    checkSession,
    getEarnedBadgeDetails,
    hasNewBadges,
    // For compatibility with existing code
    earnedBadges,
    badges,
    checkSessionForBadges
  };
}

// Helper function to get badge descriptions
function getBadgeDescription(badgeName: string): string {
  const descriptions: Record<string, string> = {
    'First Step': 'Completed your first practice session!',
    'Smooth Reader': 'Successfully used a script in your practice.',
    'Free Spirit': 'Practiced without a script or prompt.',
    'Bounce Back': 'Retried a session - showing real dedication!',
    'Reflector': 'Added thoughtful self-reflection to your practice.',
    'Regular': 'Completed 5 practice sessions.',
    'Dedicated': 'Completed 10 practice sessions.',
    'Master': 'Completed 25 practice sessions.',
  };
  
  return descriptions[badgeName] || 'Achievement unlocked!';
}