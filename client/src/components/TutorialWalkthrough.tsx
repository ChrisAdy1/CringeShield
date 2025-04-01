import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  ChevronLeft, 
  Video, 
  Calendar, 
  Award, 
  UserCircle,
  Settings,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';

// Tutorial step interface
interface TutorialStep {
  title: string;
  description: string;
  target: string; // CSS selector or route path
  placement: 'top' | 'right' | 'bottom' | 'left' | 'center';
  action?: 'navigate' | 'highlight';
  route?: string;
  icon: React.ReactNode;
}

// Component props
interface TutorialWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const TutorialWalkthrough: React.FC<TutorialWalkthroughProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [, navigate] = useLocation();
  
  // Define tutorial steps
  const tutorialSteps: TutorialStep[] = [
    {
      title: "Welcome to CringeShield",
      description: "Let's walk through the app and show you how to overcome camera anxiety! This quick tour will help you get started.",
      target: "body",
      placement: "center",
      icon: <UserCircle className="h-8 w-8 text-primary" />
    },
    {
      title: "Dashboard Overview",
      description: "This is your personal dashboard. Here you can see your progress and achievements at a glance.",
      target: "/",
      placement: "top",
      action: "navigate",
      route: "/",
      icon: <UserCircle className="h-8 w-8 text-primary" />
    },
    {
      title: "30-Day Challenge",
      description: "Complete the 30-Day Challenge to gradually build your confidence. Each day offers a new speaking exercise.",
      target: "a[href='/challenge']",
      placement: "bottom",
      action: "highlight",
      icon: <Calendar className="h-8 w-8 text-primary" />
    },
    {
      title: "Weekly Challenge",
      description: "Try Weekly Challenges at your comfort level: Shy Starter, Growing Speaker, or Confident Creator.",
      target: "a[href='/weekly-challenge']",
      placement: "bottom",
      action: "highlight",
      icon: <Calendar className="h-8 w-8 text-indigo-500" />
    },
    {
      title: "Record Videos",
      description: "Practice makes perfect! Record videos to complete challenges and track your improvement over time.",
      target: ".recording-button",
      placement: "right",
      action: "highlight",
      icon: <Video className="h-8 w-8 text-red-500" />
    },
    {
      title: "Earn Badges",
      description: "Earn badges as you complete challenges. These track your progress and celebrate your achievements!",
      target: ".badge-display",
      placement: "left",
      action: "highlight",
      icon: <Award className="h-8 w-8 text-amber-500" />
    },
    {
      title: "Settings & Preferences",
      description: "Customize your experience in Settings. You can update your profile and manage your account.",
      target: "a[href='/settings']",
      placement: "bottom",
      action: "highlight",
      icon: <Settings className="h-8 w-8 text-gray-500" />
    },
    {
      title: "You're All Set!",
      description: "Congratulations! You're ready to start using CringeShield. Pick a challenge and begin your journey to confident speaking!",
      target: "body",
      placement: "center",
      icon: <Check className="h-8 w-8 text-green-500" />
    }
  ];

  const totalSteps = tutorialSteps.length;
  const currentStepData = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  // Handle navigation between tutorial steps
  useEffect(() => {
    if (!isOpen) return;
    
    const step = tutorialSteps[currentStep];
    
    // If step requires navigation, navigate to the route
    if (step.action === 'navigate' && step.route) {
      navigate(step.route);
    }
    
    // If step requires highlighting an element, add highlight class
    if (step.action === 'highlight') {
      const element = document.querySelector(step.target);
      if (element) {
        element.classList.add('tutorial-highlight');
      }
      
      // Remove highlight when changing steps
      return () => {
        if (element) {
          element.classList.remove('tutorial-highlight');
        }
      };
    }
  }, [currentStep, isOpen, navigate, tutorialSteps]);

  // Handle next step
  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  // Handle tutorial completion
  const handleComplete = () => {
    onComplete();
    onClose();
  };

  // Handle tutorial skip
  const handleSkip = () => {
    onClose();
  };

  // Render highlight overlay or centered dialog based on placement
  const renderTutorialContent = () => {
    if (currentStepData.placement === 'center') {
      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3">
                {currentStepData.icon}
                <DialogTitle>{currentStepData.title}</DialogTitle>
              </div>
              <DialogDescription>
                {currentStepData.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {totalSteps}
              </div>
              <div className="space-x-2">
                {!isFirstStep && (
                  <Button variant="outline" onClick={handlePrevious}>
                    <ChevronLeft className="mr-1 h-4 w-4" /> Back
                  </Button>
                )}
                <Button onClick={handleNext}>
                  {isLastStep ? 'Get Started' : 'Next'} {!isLastStep && <ChevronRight className="ml-1 h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            {isFirstStep && (
              <DialogFooter>
                <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
                  Skip Tutorial
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      );
    }

    // For non-centered steps, we'll use a floating tooltip
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
        <div 
          className={cn(
            "absolute bg-white p-4 rounded-lg shadow-lg max-w-sm",
            {
              "top-20": currentStepData.placement === 'top',
              "bottom-20": currentStepData.placement === 'bottom',
              "left-20": currentStepData.placement === 'left',
              "right-20": currentStepData.placement === 'right',
            }
          )}
        >
          <div className="flex items-center gap-3 mb-2">
            {currentStepData.icon}
            <h3 className="font-medium text-lg">{currentStepData.title}</h3>
          </div>
          <p className="text-muted-foreground mb-4">{currentStepData.description}</p>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </div>
            <div className="space-x-2">
              {!isFirstStep && (
                <Button variant="outline" size="sm" onClick={handlePrevious}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back
                </Button>
              )}
              <Button size="sm" onClick={handleNext}>
                {isLastStep ? 'Finish' : 'Next'} {!isLastStep && <ChevronRight className="ml-1 h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return isOpen ? renderTutorialContent() : null;
};

export default TutorialWalkthrough;