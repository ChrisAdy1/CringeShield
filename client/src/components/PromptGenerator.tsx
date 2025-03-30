import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { Prompt, ConfidenceTier } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { exercisePrompts } from '@/lib/exercisePrompts';

interface PromptGeneratorProps {
  category: string;
  onPromptGenerated: (prompt: Prompt) => void;
}

const PromptGenerator: React.FC<PromptGeneratorProps> = ({ category, onPromptGenerated }) => {
  const isMobile = useIsMobile();
  const { preferences } = useUserPreferences();
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate a new prompt when the category changes or on first load
  useEffect(() => {
    if (category) {
      generateNewPrompt();
    }
  }, [category]);

  const generateNewPrompt = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // If the category is 'exercise', use confidence-based exercise prompts
      if (category === 'exercise') {
        const confidenceTier: ConfidenceTier = preferences.confidenceTier || 'shy_starter';
        const tierExercises = exercisePrompts[confidenceTier];
        
        // Select a random exercise from the appropriate tier
        const randomIndex = Math.floor(Math.random() * tierExercises.length);
        const exercise = tierExercises[randomIndex];
        
        const exercisePrompt: Prompt = {
          id: -100 - randomIndex, // Use negative IDs for exercises to distinguish from database prompts
          category: 'exercise',
          text: exercise.prompt
        };
        
        setCurrentPrompt(exercisePrompt);
        onPromptGenerated(exercisePrompt);
      } else {
        // For other categories, fetch from the server
        const response = await apiRequest('GET', `/api/prompts/generate?category=${category}`, undefined);
        const promptData = await response.json();
        
        setCurrentPrompt(promptData);
        onPromptGenerated(promptData);
      }
    } catch (err) {
      console.error('Error generating prompt:', err);
      setError('Unable to generate a prompt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${isMobile ? 'my-3' : 'my-4'}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-700`}>
          Practice Topic
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={generateNewPrompt}
          disabled={isLoading}
          className={`${isMobile ? 'h-7 py-0' : 'h-6'} px-2 touch-target`}
        >
          <RefreshCw className={`${isMobile ? 'h-3.5 w-3.5' : 'h-3 w-3'} mr-1`} />
          <span className="text-xs">New prompt</span>
        </Button>
      </div>
      
      <Card className={`${isMobile ? 'shadow-sm' : 'shadow'}`}>
        <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
          {isLoading ? (
            <div className="flex items-center justify-center h-16">
              <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : error ? (
            <div className="text-sm text-red-500 py-2 flex items-center justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generateNewPrompt} 
                className="text-xs flex items-center"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Try Again
              </Button>
            </div>
          ) : currentPrompt ? (
            <div className={`${isMobile ? 'text-sm leading-tight' : 'text-sm'} text-gray-700 ${isMobile ? 'min-h-[60px]' : 'min-h-[80px]'} flex items-center`}>
              {currentPrompt.text}
            </div>
          ) : (
            <div className="text-gray-400 text-sm italic flex items-center justify-center h-16">
              Select a category to generate a prompt
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PromptGenerator;
