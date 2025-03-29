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
  CheckCircle2Icon
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
      color: "bg-blue-100 text-blue-700"
    },
    {
      title: "Create Practice Sessions",
      description: "Record yourself speaking with our face filters to reduce self-consciousness.",
      icon: VideoIcon,
      color: "bg-purple-100 text-purple-700"
    },
    {
      title: "Use Custom Scripts",
      description: "Practice with our prompts or create your own custom scripts.",
      icon: PenIcon,
      color: "bg-green-100 text-green-700"
    },
    {
      title: "Track Your Progress",
      description: "See your confidence grow over time with detailed analytics.",
      icon: BarChart3Icon,
      color: "bg-amber-100 text-amber-700"
    },
    {
      title: "Customize Your Experience",
      description: "Adjust settings to match your preferences and comfort level.",
      icon: Settings2Icon,
      color: "bg-red-100 text-red-700"
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
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
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
                      : 'w-2 bg-gray-300'
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
              
              <h3 className="text-xl font-semibold mb-2">
                {currentStepData.title}
              </h3>
              
              <p className="text-muted-foreground mb-8">
                {currentStepData.description}
              </p>
              
              {/* Illustration or image could go here */}
              <div className="h-48 w-full bg-slate-100 rounded-lg mb-6 flex items-center justify-center">
                {currentStep === 0 && (
                  <div className="text-center p-4">
                    <h4 className="font-medium mb-2">Build your confidence on camera</h4>
                    <p className="text-sm text-muted-foreground">Practice makes perfect!</p>
                  </div>
                )}
                {currentStep === 1 && (
                  <div className="text-center p-4">
                    <div className="flex justify-center mb-2">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full bg-slate-300 flex items-center justify-center">
                          <span className="text-slate-600">🙂</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center">
                          <VideoIcon className="h-3 w-3 text-slate-600" />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Different filters hide your real face</p>
                  </div>
                )}
                {currentStep === 2 && (
                  <div className="text-center p-4">
                    <div className="flex justify-center mb-2">
                      <div className="h-16 w-32 bg-slate-200 rounded p-2 flex items-center justify-center">
                        <PenIcon className="h-4 w-4 text-slate-600 mr-2" />
                        <span className="text-sm text-slate-600">My Script</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Create and save your own practice content</p>
                  </div>
                )}
                {currentStep === 3 && (
                  <div className="text-center p-4">
                    <div className="flex justify-center mb-2">
                      <div className="h-16 w-32 flex flex-col items-center justify-center">
                        <div className="flex h-10 w-full">
                          <div className="h-full w-2 bg-slate-300 rounded-sm mr-1"></div>
                          <div className="h-8 w-2 bg-slate-300 rounded-sm mr-1"></div>
                          <div className="h-6 w-2 bg-slate-300 rounded-sm mr-1"></div>
                          <div className="h-full w-2 bg-primary rounded-sm mr-1"></div>
                          <div className="h-7 w-2 bg-slate-300 rounded-sm mr-1"></div>
                          <div className="h-9 w-2 bg-slate-300 rounded-sm"></div>
                        </div>
                        <div className="w-full h-px bg-slate-300 mt-1"></div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">See your confidence grow over time</p>
                  </div>
                )}
                {currentStep === 4 && (
                  <div className="text-center p-4">
                    <div className="flex justify-center mb-2">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center">
                          <div className="h-4 w-8 bg-primary rounded-full mr-2"></div>
                          <span className="text-sm text-slate-600">Face filters</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-4 w-8 bg-slate-300 rounded-full mr-2"></div>
                          <span className="text-sm text-slate-600">Timer display</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Adjust the app to your needs</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Navigation buttons */}
            <div className="flex items-center justify-between">
              {currentStep === 0 ? (
                <Button variant="ghost" onClick={handleSkip}>
                  Skip tour
                </Button>
              ) : (
                <Button variant="outline" onClick={handlePrevious}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              
              <Button onClick={handleNext}>
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