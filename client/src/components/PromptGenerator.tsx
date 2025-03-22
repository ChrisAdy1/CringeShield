import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { Prompt } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';

interface PromptGeneratorProps {
  category: string;
  onPromptGenerated: (prompt: Prompt) => void;
}

const PromptGenerator: React.FC<PromptGeneratorProps> = ({ category, onPromptGenerated }) => {
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
      
      const response = await apiRequest('GET', `/api/prompts/generate?category=${category}`, undefined);
      const promptData = await response.json();
      
      setCurrentPrompt(promptData);
      onPromptGenerated(promptData);
    } catch (err) {
      console.error('Error generating prompt:', err);
      setError('Unable to generate a prompt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="my-4">
      <div className="flex justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">Topic prompt</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={generateNewPrompt}
          disabled={isLoading}
          className="h-6 px-2"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          <span className="text-xs">New prompt</span>
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-16">
              <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : error ? (
            <div className="text-sm text-red-500 py-2">
              {error}
            </div>
          ) : currentPrompt ? (
            <div className="text-gray-700 text-sm">
              {currentPrompt.text}
            </div>
          ) : (
            <div className="text-gray-400 text-sm italic">
              Select a category to generate a prompt
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PromptGenerator;
