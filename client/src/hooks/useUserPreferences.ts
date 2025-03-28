import { useState, useEffect } from 'react';
import { UserPreferences } from '@/lib/types';

const STORAGE_KEY = 'cringe-shield-user-preferences';

// Default preferences for new users
const defaultPreferences: UserPreferences = {
  hasSeenOnboarding: false,
  showTimer: true,
  enableFaceFilters: true,
  favoritePrompts: []
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  
  // Load preferences from localStorage on mount
  useEffect(() => {
    const storedPreferences = localStorage.getItem(STORAGE_KEY);
    if (storedPreferences) {
      try {
        setPreferences(prev => ({
          ...prev,
          ...JSON.parse(storedPreferences)
        }));
      } catch (error) {
        console.error('Failed to parse user preferences from localStorage', error);
      }
    }
  }, []);
  
  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);
  
  // Update a specific preference
  const updatePreference = <K extends keyof UserPreferences>(
    key: K, 
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Mark onboarding as completed
  const completeOnboarding = () => {
    updatePreference('hasSeenOnboarding', true);
  };
  
  // Toggle a prompt in favorites
  const toggleFavoritePrompt = (promptId: number) => {
    setPreferences(prev => {
      const isFavorite = prev.favoritePrompts.includes(promptId);
      
      if (isFavorite) {
        // Remove from favorites
        return {
          ...prev,
          favoritePrompts: prev.favoritePrompts.filter(id => id !== promptId)
        };
      } else {
        // Add to favorites
        return {
          ...prev,
          favoritePrompts: [...prev.favoritePrompts, promptId]
        };
      }
    });
  };
  
  return {
    preferences,
    updatePreference,
    completeOnboarding,
    toggleFavoritePrompt
  };
}