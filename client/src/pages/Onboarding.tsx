import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ConfidenceQuizModal from '@/components/modals/ConfidenceQuizModal';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { ConfidenceTier } from '@/lib/types';

const Onboarding: React.FC = () => {
  const [, navigate] = useLocation();
  const { preferences, saveConfidenceAssessment, markOnboardingComplete } = useUserPreferences();
  const [isQuizOpen, setIsQuizOpen] = useState(true);
  const [completed, setCompleted] = useState(false);

  // Handle quiz completion
  const handleQuizComplete = (tier: ConfidenceTier) => {
    saveConfidenceAssessment(tier);
    setIsQuizOpen(false);
    setCompleted(true);
  };

  // Open the quiz immediately when component mounts
  useEffect(() => {
    setIsQuizOpen(true);
  }, []);

  // After completion animation finishes, navigate to prompts
  useEffect(() => {
    if (completed) {
      const timer = setTimeout(() => {
        markOnboardingComplete();
        navigate('/prompts');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [completed, navigate, markOnboardingComplete]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-primary-50 to-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to CringeShield</h1>
          <p className="text-muted-foreground">
            Your personal tool to practice speaking with confidence
          </p>
        </div>

        {completed ? (
          <Card className="mb-6 overflow-hidden transition-all duration-500 transform translate-y-0 opacity-100">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-xl font-semibold mb-2">All Set!</h2>
              <p className="text-muted-foreground mb-4">
                We've personalized your experience based on your answers.
              </p>
              <p className="text-sm text-muted-foreground">Taking you to practice prompts...</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardContent className="p-6 text-center">
              <p className="mb-4">
                Take a quick 5-question quiz to help us personalize your experience.
              </p>
              <Button onClick={() => setIsQuizOpen(true)}>
                Start Confidence Quiz
              </Button>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-sm text-muted-foreground">
          CringeShield helps you overcome camera anxiety through simple, guided practice sessions.
        </p>
      </div>

      <ConfidenceQuizModal 
        open={isQuizOpen}
        onOpenChange={setIsQuizOpen}
        onComplete={handleQuizComplete}
      />
    </div>
  );
};

export default Onboarding;