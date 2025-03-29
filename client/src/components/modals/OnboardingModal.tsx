import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  VideoIcon, 
  PenIcon, 
  BarChart3Icon, 
  Settings2Icon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2Icon,
  MessageCircle
} from 'lucide-react';

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: "Welcome to CringeShield",
      description: "Overcome camera shyness and practice speaking with confidence. Let's get you started!",
      icon: VideoIcon,
      color: "bg-accent-lavender text-primary"
    },
    {
      title: "Pick Prompts or Create Your Own",
      description: "Choose from our library of prompts or write custom scripts for your practice sessions.",
      icon: PenIcon,
      color: "bg-accent-lavender text-primary"
    },
    {
      title: "Record and Reflect",
      description: "Practice with face filters and get personalized feedback on your performance.",
      icon: VideoIcon,
      color: "bg-accent-lavender text-primary"
    },
    {
      title: "Track Your Confidence",
      description: "Watch your speaking confidence grow over time with detailed analytics.",
      icon: BarChart3Icon, 
      color: "bg-accent-lavender text-primary"
    }
  ];
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSkip = () => {
    onComplete();
  };
  
  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) onComplete();
    }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border border-accent-lavender shadow-md">
        <div className="relative">
          {/* Progress indicators */}
          <div className="absolute top-4 left-0 right-0 flex justify-center gap-1 z-10">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'w-6 bg-primary' 
                    : index < currentStep 
                      ? 'w-6 bg-primary/40' 
                      : 'w-2 bg-lightGray'
                }`}
              />
            ))}
          </div>
          
          {/* Content */}
          <div className="pt-10 px-6 pb-6">
            <div className="flex flex-col items-center text-center">
              <div className={`p-4 mb-4 rounded-full ${currentStepData.color}`}>
                <Icon className="h-8 w-8" />
              </div>
              
              <h3 className="text-xl font-semibold mb-2 text-textDarkGray animate-slide-down">
                {currentStepData.title}
              </h3>
              
              <p className="text-textDarkGray mb-8 animate-slide-up">
                {currentStepData.description}
              </p>
              
              {/* Illustration with brand-safe colors */}
              <div className="h-48 w-full bg-accent-lavender rounded-lg mb-6 flex items-center justify-center animate-scale-up">
                {currentStep === 0 && (
                  <div className="text-center p-4">
                    <div className="mb-4 flex justify-center">
                      <div className="relative">
                        <div className="h-20 w-20 rounded-full bg-white shadow-md flex items-center justify-center border-2 border-primary">
                          <span className="text-2xl">😊</span>
                        </div>
                        <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-md">
                          <VideoIcon className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                    <h4 className="font-medium mb-2 text-textDarkGray">Build your confidence on camera</h4>
                    <p className="text-sm text-primary">Practice makes perfect!</p>
                  </div>
                )}
                {currentStep === 1 && (
                  <div className="text-center p-4">
                    <div className="flex justify-center mb-4 gap-3">
                      <div className="h-16 w-28 bg-white shadow-md rounded-lg p-2 flex items-center justify-center border border-primary hover:shadow-lg transition-all">
                        <MessageCircle className="h-5 w-5 text-primary mr-2" />
                        <span className="text-sm text-textDarkGray">Prompts</span>
                      </div>
                      <div className="h-16 w-28 bg-white shadow-md rounded-lg p-2 flex items-center justify-center border border-primary hover:shadow-lg transition-all">
                        <PenIcon className="h-5 w-5 text-primary mr-2" />
                        <span className="text-sm text-textDarkGray">My Script</span>
                      </div>
                    </div>
                    <p className="text-sm text-textDarkGray">Choose from our library or write your own</p>
                  </div>
                )}
                {currentStep === 2 && (
                  <div className="text-center p-4">
                    <div className="flex justify-center space-x-3 mb-4">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full bg-success-mint flex items-center justify-center">
                          <span className="text-xl">😄</span>
                        </div>
                        <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                          <VideoIcon className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <div className="flex flex-col items-start space-y-1 justify-center">
                        <div className="h-2 w-16 bg-success-mint rounded-full"></div>
                        <div className="h-2 w-12 bg-primary rounded-full"></div>
                        <div className="h-2 w-14 bg-accent-lavender rounded-full"></div>
                      </div>
                    </div>
                    <p className="text-sm text-textDarkGray">Record with filters & get AI feedback</p>
                  </div>
                )}
                {currentStep === 3 && (
                  <div className="text-center p-4">
                    <div className="flex justify-center mb-4">
                      <div className="h-20 w-44 flex flex-col items-center justify-center bg-white rounded-lg shadow-md p-3 hover:shadow-lg transition-shadow">
                        <div className="flex h-12 w-full justify-center">
                          <div className="h-4/5 w-3 bg-lightGray rounded-sm mr-1"></div>
                          <div className="h-3/5 w-3 bg-warning-peach rounded-sm mr-1"></div>
                          <div className="h-1/2 w-3 bg-warning-peach rounded-sm mr-1"></div>
                          <div className="h-full w-3 bg-success-mint rounded-sm mr-1"></div>
                          <div className="h-4/5 w-3 bg-success-mint rounded-sm mr-1"></div>
                          <div className="h-3/4 w-3 bg-success-mint rounded-sm"></div>
                        </div>
                        <div className="w-full h-px bg-accent-lavender mt-2"></div>
                        <div className="text-xs text-primary mt-1 font-medium">Your confidence is growing!</div>
                      </div>
                    </div>
                    <p className="text-sm text-textDarkGray">Track your progress over time</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Navigation buttons with brand-safe colors */}
            <div className="flex items-center justify-between">
              {currentStep === 0 ? (
                <Button 
                  variant="ghost" 
                  onClick={handleSkip}
                  className="text-textDarkGray hover:text-primary hover:bg-accent-lavender transition-colors"
                >
                  Skip tour
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  className="border-accent-lavender text-textDarkGray hover:bg-accent-lavender hover:text-primary transition-all"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              
              <Button 
                onClick={handleNext}
                className="bg-primary hover:bg-primary/90 transition-all"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    Get Started
                    <CheckCircle2Icon className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;