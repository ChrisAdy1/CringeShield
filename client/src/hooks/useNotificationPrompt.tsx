import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function useNotificationPrompt() {
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Only show the notification prompt if:
    // 1. User is logged in
    // 2. User has not been asked for notifications yet
    // 3. User account is at least 24 hours old
    if (user && !user.askedForNotifications) {
      const createdAt = new Date(user.createdAt);
      const now = new Date();
      const dayInMilliseconds = 24 * 60 * 60 * 1000;
      
      // Check if account is at least 24 hours old
      if (now.getTime() - createdAt.getTime() >= dayInMilliseconds) {
        setShowPrompt(true);
      }
    }
  }, [user]);

  return {
    showPrompt,
    setShowPrompt
  };
}