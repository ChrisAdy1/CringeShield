import { UserPreferences, ConfidenceTier } from '@/lib/types';
import useLocalStorage from './useLocalStorage';

const defaultPreferences: UserPreferences = {
  hasSeenOnboarding: false,
  showTimer: true,
  enableFaceFilters: true,
  favoritePrompts: [],
  hasCompletedAssessment: false
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
    'user-preferences', 
    defaultPreferences
  );

  const updatePreference = <K extends keyof UserPreferences>(
    key: K, 
    value: UserPreferences[K]
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const markOnboardingComplete = () => {
    updatePreference('hasSeenOnboarding', true);
  };

  const toggleSetting = (key: 'showTimer' | 'enableFaceFilters') => {
    updatePreference(key, !preferences[key]);
  };

  const toggleFavoritePrompt = (promptId: number) => {
    const currentFavorites = [...preferences.favoritePrompts];
    const index = currentFavorites.indexOf(promptId);
    
    if (index >= 0) {
      // Remove from favorites
      currentFavorites.splice(index, 1);
    } else {
      // Add to favorites
      currentFavorites.push(promptId);
    }
    
    updatePreference('favoritePrompts', currentFavorites);
  };

  const saveConfidenceAssessment = (tier: ConfidenceTier) => {
    setPreferences((prev) => ({
      ...prev,
      confidenceTier: tier,
      hasCompletedAssessment: true
    }));
  };

  return {
    preferences,
    updatePreference,
    markOnboardingComplete,
    toggleSetting,
    toggleFavoritePrompt,
    saveConfidenceAssessment
  };
}