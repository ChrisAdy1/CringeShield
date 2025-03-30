import { useState, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { badges, checkEarnedBadges, Badge } from '@/lib/badgeLogic';
import { useToast } from '@/hooks/use-toast';
import { PracticeSession } from '@/lib/types';

interface BadgeState {
  earned: string[];
  lastSeen: string[];
}

export function useBadges() {
  const [badgeState, setBadgeState] = useLocalStorage<BadgeState>('user-badges', {
    earned: [],
    lastSeen: []
  });
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const { toast } = useToast();

  // Calculate new, unseen badges
  useEffect(() => {
    const unseenBadges = badgeState.earned.filter(
      id => !badgeState.lastSeen.includes(id)
    );
    setNewBadges(unseenBadges);
  }, [badgeState]);

  // Mark badges as seen
  const markBadgesAsSeen = () => {
    setBadgeState({
      ...badgeState,
      lastSeen: [...badgeState.earned]
    });
    setNewBadges([]);
  };

  // Check a session for new badges
  const checkSession = (session: PracticeSession, userData: { totalSessions: number; [key: string]: any }) => {
    const newEarnedBadges = checkEarnedBadges(session, userData, badgeState.earned);
    
    if (newEarnedBadges.length > 0) {
      // Update earned badges
      const updatedEarned = [...badgeState.earned, ...newEarnedBadges];
      setBadgeState({
        ...badgeState,
        earned: updatedEarned
      });
      
      // Show toast notifications for new badges
      newEarnedBadges.forEach(badgeId => {
        const badge = badges.find(b => b.id === badgeId);
        if (badge) {
          toast({
            title: `Badge Earned: ${badge.name}`,
            description: `${badge.icon} You've unlocked a new achievement!`,
            duration: 5000
          });
        }
      });
      
      return newEarnedBadges;
    }
    
    return [];
  };

  // Get badge details for the earned badges
  const getEarnedBadgeDetails = (): Badge[] => {
    return badgeState.earned.map(id => {
      const badge = badges.find(b => b.id === id);
      return badge || { id, name: "Unknown Badge", icon: "❓", check: () => false };
    });
  };

  return {
    badgeState,
    newBadges,
    markBadgesAsSeen,
    checkSession,
    getEarnedBadgeDetails,
    hasNewBadges: newBadges.length > 0
  };
}