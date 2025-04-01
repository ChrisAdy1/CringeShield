import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';

// Theme type definitions
export type MoodTheme = 'calm' | 'energetic' | 'focused' | 'creative' | 'professional';
export type ColorMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mood: MoodTheme;
  colorMode: ColorMode;
  setMood: (mood: MoodTheme) => void;
  setColorMode: (mode: ColorMode) => void;
  applyTheme: (mood: MoodTheme, colorMode: ColorMode) => void;
  isUpdating: boolean;
}

// Theme color palettes based on mood
export const moodPalettes: Record<MoodTheme, { light: string, dark: string, name: string, description: string, emoji: string }> = {
  calm: { 
    light: '#7CB9E8', 
    dark: '#0047AB',
    name: 'Calm & Relaxed',
    description: 'A soothing blue palette designed to reduce anxiety and create a peaceful practice environment.',
    emoji: '😌'
  },
  energetic: { 
    light: '#FF7F50', 
    dark: '#E25822',
    name: 'Energetic & Bold',
    description: 'A vibrant coral palette that boosts energy and confidence for high-energy practice sessions.',
    emoji: '🔥'
  },
  focused: { 
    light: '#9A7DFF', 
    dark: '#6C4BF6',
    name: 'Focused & Clear',
    description: 'A balanced purple palette that enhances concentration and helps you stay on track.',
    emoji: '🧠'
  },
  creative: { 
    light: '#7ED957', 
    dark: '#38B000',
    name: 'Creative & Free',
    description: 'A fresh green palette to inspire creativity and spontaneity in your speaking.',
    emoji: '✨'
  },
  professional: { 
    light: '#4A5568', 
    dark: '#2D3748',
    name: 'Professional & Polished',
    description: 'A refined slate palette that creates a serious, business-like environment for formal practice.',
    emoji: '👔'
  }
};

// Create the theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to debounce function calls
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Provider component
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mood, setMoodState] = useState<MoodTheme>('focused');
  const [colorMode, setColorModeState] = useState<ColorMode>('light');
  const [isUpdating, setIsUpdating] = useState(false);
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced theme update function to prevent rapid server requests
  const debouncedUpdateTheme = useCallback(
    debounce(async (mood: MoodTheme, primaryColor: string, colorMode: ColorMode) => {
      setIsUpdating(true);
      try {
        const response = await fetch('/api/theme', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            variant: 'professional',
            primary: primaryColor,
            appearance: colorMode === 'system' ? 'system' : colorMode,
            radius: 0.75,
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to update theme');
        }
      } catch (error) {
        console.error('Error updating theme:', error);
      } finally {
        setIsUpdating(false);
      }
    }, 1000),
    []
  );

  // Apply theme function
  const applyTheme = useCallback((newMood: MoodTheme, newColorMode: ColorMode) => {
    // Get the primary color based on mood and color mode
    const primaryColor = newColorMode === 'dark' 
      ? moodPalettes[newMood].dark 
      : moodPalettes[newMood].light;

    // Update theme via debounced function to prevent constant refreshes
    debouncedUpdateTheme(newMood, primaryColor, newColorMode);
  }, [debouncedUpdateTheme]);

  // Set mood and save to localStorage (don't apply theme immediately)
  const setMood = useCallback((newMood: MoodTheme) => {
    setMoodState(newMood);
    localStorage.setItem('cringe-shield-mood', newMood);
    applyTheme(newMood, colorMode);
  }, [colorMode, applyTheme]);

  // Set color mode and save to localStorage (don't apply theme immediately)
  const setColorMode = useCallback((newMode: ColorMode) => {
    setColorModeState(newMode);
    localStorage.setItem('cringe-shield-color-mode', newMode);
    applyTheme(mood, newMode);
  }, [mood, applyTheme]);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedMood = localStorage.getItem('cringe-shield-mood') as MoodTheme;
    const savedColorMode = localStorage.getItem('cringe-shield-color-mode') as ColorMode;
    
    if (savedMood) {
      setMoodState(savedMood);
    }
    
    if (savedColorMode) {
      setColorModeState(savedColorMode);
    }
    
    // Apply the loaded or default theme (only on initial mount)
    if (savedMood || savedColorMode) {
      applyTheme(savedMood || mood, savedColorMode || colorMode);
    }
    
    // Clean up any pending timeouts
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ 
      mood, 
      colorMode, 
      setMood, 
      setColorMode, 
      applyTheme,
      isUpdating
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}