import { useState, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { UserPreferences, ConfidenceTier } from '@/lib/types';

const defaultPreferences: UserPreferences = {
  hasSeenOnboarding: false,
  showTimer: true,
  enableFaceFilters: true,
  favoritePrompts: [],
  hasCompletedAssessment: false,
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
  const markOnboardingComplete = useCallback(() => {
    updatePreference('hasSeenOnboarding', true);
  }, [updatePreference]);

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

  const saveConfidenceAssessment = useCallback((tier: ConfidenceTier) => {
    setPreferences(prev => ({
      ...prev,
      confidenceTier: tier,
      hasCompletedAssessment: true
    }));
  }, [setPreferences]);

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
  }, [setPreferences]);

  return {
    preferences,
    updatePreference,
    markOnboardingComplete,
    toggleTimer,
    toggleFaceFilters,
    addFavoritePrompt,
    removeFavoritePrompt,
    saveConfidenceAssessment,
    resetPreferences
  };
}