import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Theme type definitions
export type MoodTheme = 'calm' | 'energetic' | 'focused' | 'creative' | 'professional';
export type ColorMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mood: MoodTheme;
  colorMode: ColorMode;
  setMood: (mood: MoodTheme) => void;
  setColorMode: (mode: ColorMode) => void;
  applyTheme: (mood: MoodTheme, colorMode: ColorMode) => void;
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

// Provider component
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mood, setMoodState] = useState<MoodTheme>('focused');
  const [colorMode, setColorModeState] = useState<ColorMode>('light');

  // Apply theme function
  const applyTheme = (mood: MoodTheme, colorMode: ColorMode) => {
    // Get the primary color based on mood and color mode
    const primaryColor = colorMode === 'dark' 
      ? moodPalettes[mood].dark 
      : moodPalettes[mood].light;

    // Update theme.json via an API call
    updateThemeFile(mood, primaryColor, colorMode);
  };

  // Set mood and apply theme
  const setMood = (newMood: MoodTheme) => {
    setMoodState(newMood);
    applyTheme(newMood, colorMode);
    // Save to localStorage
    localStorage.setItem('cringe-shield-mood', newMood);
  };

  // Set color mode and apply theme
  const setColorMode = (newMode: ColorMode) => {
    setColorModeState(newMode);
    applyTheme(mood, newMode);
    // Save to localStorage
    localStorage.setItem('cringe-shield-color-mode', newMode);
  };

  // API function to update theme.json
  const updateThemeFile = async (mood: MoodTheme, primaryColor: string, colorMode: ColorMode) => {
    try {
      const response = await fetch('/api/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variant: 'professional', // Keep using professional variant
          primary: primaryColor,
          appearance: colorMode === 'system' ? 'system' : colorMode,
          radius: 0.75, // Keep default radius
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to update theme');
      }
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

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
    
    // Apply the loaded or default theme
    applyTheme(savedMood || mood, savedColorMode || colorMode);
  }, []);

  return (
    <ThemeContext.Provider value={{ mood, colorMode, setMood, setColorMode, applyTheme }}>
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