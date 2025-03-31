import { useState, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { UserPreferences } from '@/lib/types';

const defaultPreferences: UserPreferences = {
  showTimer: true,
  enableFaceFilters: true,
  favoritePrompts: [],
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
    'user-preferences',
    defaultPreferences
  );

  // Generic update function for any preference
  const updatePreference = useCallback(<K extends keyof UserPreferences>(
    key: K, 
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  }, [setPreferences]);

  // Specific preference updates
  const toggleTimer = useCallback(() => {
    updatePreference('showTimer', !preferences.showTimer);
  }, [preferences.showTimer, updatePreference]);

  const toggleFaceFilters = useCallback(() => {
    updatePreference('enableFaceFilters', !preferences.enableFaceFilters);
  }, [preferences.enableFaceFilters, updatePreference]);

  const addFavoritePrompt = useCallback((promptId: number) => {
    if (!preferences.favoritePrompts.includes(promptId)) {
      updatePreference('favoritePrompts', [...preferences.favoritePrompts, promptId]);
    }
  }, [preferences.favoritePrompts, updatePreference]);

  const removeFavoritePrompt = useCallback((promptId: number) => {
    updatePreference(
      'favoritePrompts', 
      preferences.favoritePrompts.filter(id => id !== promptId)
    );
  }, [preferences.favoritePrompts, updatePreference]);

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
  }, [setPreferences]);

  return {
    preferences,
    updatePreference,
    toggleTimer,
    toggleFaceFilters,
    addFavoritePrompt,
    removeFavoritePrompt,
    resetPreferences
  };
}