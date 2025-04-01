import React from 'react';
import { useTheme, MoodTheme, moodPalettes, ColorMode } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ThemeSelector: React.FC = () => {
  const { mood, colorMode, setMood, setColorMode, isUpdating } = useTheme();
  const { toast } = useToast();

  // Handle mood selection with animation
  const handleMoodChange = (selectedMood: MoodTheme) => {
    if (isUpdating || selectedMood === mood) return;
    
    setMood(selectedMood);
    triggerConfetti(moodPalettes[selectedMood].light);
    
    toast({
      title: `${moodPalettes[selectedMood].emoji} ${moodPalettes[selectedMood].name} theme activated!`,
      description: "Your app theme has been updated to match your mood.",
      duration: 3000,
    });
  };

  // Handle color mode change
  const handleColorModeChange = (value: string) => {
    if (isUpdating || value === colorMode) return;
    setColorMode(value as ColorMode);
  };

  // Trigger confetti with theme colors
  const triggerConfetti = (color: string) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: [color, '#ffffff'],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">UI Theme</h2>
        <p className="text-muted-foreground mb-4">
          Choose a theme that matches your current mood and practice goals.
        </p>

        {isUpdating && (
          <Alert className="mb-4">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <AlertDescription>
              Updating theme, please wait...
            </AlertDescription>
          </Alert>
        )}

        {/* Color Mode Selector */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Color Mode</h3>
          <Tabs 
            value={colorMode} 
            onValueChange={isUpdating ? () => {} : handleColorModeChange} 
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger 
                value="light" 
                className={cn(
                  "flex items-center justify-center",
                  isUpdating && "opacity-50 pointer-events-none"
                )}
              >
                <Sun className="h-4 w-4 mr-2" />
                Light
              </TabsTrigger>
              <TabsTrigger 
                value="dark" 
                className={cn(
                  "flex items-center justify-center",
                  isUpdating && "opacity-50 pointer-events-none"
                )}
              >
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </TabsTrigger>
              <TabsTrigger 
                value="system" 
                className={cn(
                  "flex items-center justify-center",
                  isUpdating && "opacity-50 pointer-events-none"
                )}
              >
                <Monitor className="h-4 w-4 mr-2" />
                System
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Mood Theme Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(moodPalettes) as MoodTheme[]).map((themeKey) => {
            const themeInfo = moodPalettes[themeKey];
            const isSelected = mood === themeKey;
            
            return (
              <Card 
                key={themeKey} 
                className={cn(
                  "transition-all", 
                  isSelected ? "ring-2 ring-primary ring-offset-2" : "hover:shadow-md",
                  isUpdating ? "opacity-50" : "cursor-pointer"
                )}
                onClick={() => !isUpdating && handleMoodChange(themeKey)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center">
                      <span className="mr-2">{themeInfo.emoji}</span>
                      {themeInfo.name}
                    </CardTitle>
                    {isSelected && (
                      <div className="bg-primary text-primary-foreground text-xs py-1 px-2 rounded-full">
                        Active
                      </div>
                    )}
                  </div>
                  <CardDescription>{themeInfo.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2">
                    <div 
                      className="w-full h-8 rounded-md" 
                      style={{ backgroundColor: themeInfo.light }}
                    />
                    <div 
                      className="w-full h-8 rounded-md" 
                      style={{ backgroundColor: themeInfo.dark }}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant={isSelected ? "default" : "outline"} 
                    className="w-full"
                    disabled={isUpdating}
                    onClick={(e) => {
                      if (isUpdating) return;
                      e.stopPropagation();
                      handleMoodChange(themeKey);
                    }}
                  >
                    {isSelected ? (
                      isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Applying...
                        </>
                      ) : "Selected"
                    ) : "Select Theme"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;