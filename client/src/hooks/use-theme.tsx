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

// Function to convert hex color to RGB values
function hexToRgb(hex: string): string {
  // Remove the # symbol if present
  hex = hex.replace(/^#/, '');
  
  // Parse the hex values
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  
  // Return space-separated RGB values as required by CSS custom properties
  return `${r} ${g} ${b}`;
}

// Function to apply CSS variables to the document root
function applyThemeToDOM(primaryColor: string, colorMode: ColorMode) {
  const root = document.documentElement;
  // Convert hex color to RGB values for CSS variables
  const rgbValues = hexToRgb(primaryColor);
  root.style.setProperty('--theme-primary', rgbValues);
  
  // Set color mode class on the html element
  if (colorMode === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else if (colorMode === 'light') {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  } else {
    // Handle system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }
}

// Provider component
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mood, setMoodState] = useState<MoodTheme>('focused');
  const [colorMode, setColorModeState] = useState<ColorMode>('light');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Function to save themes to the server (without requiring immediate refresh)
  const saveThemeToServer = useCallback(async (primaryColor: string, colorAppearance: ColorMode) => {
    try {
      await fetch('/api/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variant: 'professional',
          primary: primaryColor,
          appearance: colorAppearance === 'system' ? 'system' : colorAppearance,
          radius: 0.75,
          useLocalOnly: true, // Flag to tell server not to modify theme.json
        }),
      });
    } catch (error) {
      console.error('Error saving theme to server:', error);
    }
  }, []);

  // Apply theme function
  const applyTheme = useCallback((newMood: MoodTheme, newColorMode: ColorMode) => {
    setIsUpdating(true);
    
    // Get the primary color based on mood and color mode
    const effectiveColorMode = newColorMode === 'system' 
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : newColorMode;
      
    const primaryColor = effectiveColorMode === 'dark' 
      ? moodPalettes[newMood].dark 
      : moodPalettes[newMood].light;

    // Apply theme directly to DOM
    applyThemeToDOM(primaryColor, newColorMode);
    
    // Save theme to server (background process)
    saveThemeToServer(primaryColor, newColorMode);
    
    // Use a short timeout just for UI feedback
    setTimeout(() => {
      setIsUpdating(false);
    }, 300);
  }, [saveThemeToServer]);

  // Set mood and save to localStorage 
  const setMood = useCallback((newMood: MoodTheme) => {
    setMoodState(newMood);
    localStorage.setItem('cringe-shield-mood', newMood);
    applyTheme(newMood, colorMode);
  }, [colorMode, applyTheme]);

  // Set color mode and save to localStorage
  const setColorMode = useCallback((newMode: ColorMode) => {
    setColorModeState(newMode);
    localStorage.setItem('cringe-shield-color-mode', newMode);
    applyTheme(mood, newMode);
  }, [mood, applyTheme]);

  // Listen for system color theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (colorMode === 'system') {
        applyTheme(mood, 'system');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [colorMode, mood, applyTheme]);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedMood = localStorage.getItem('cringe-shield-mood') as MoodTheme;
    const savedColorMode = localStorage.getItem('cringe-shield-color-mode') as ColorMode;
    
    const moodToUse = savedMood || 'focused';
    const colorModeToUse = savedColorMode || 'light';
    
    setMoodState(moodToUse);
    setColorModeState(colorModeToUse);
    
    // Apply the theme directly
    applyTheme(moodToUse, colorModeToUse);
  }, [applyTheme]);

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