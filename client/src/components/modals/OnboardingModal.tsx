import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, VideoIcon, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const isMobile = useIsMobile();
  
  const slides = [
    {
      title: "Welcome to CringeShield!",
      description: "Practice speaking on camera with less pressure and build your confidence over time.",
      icon: <Camera size={isMobile ? 48 : 64} className="text-primary" />
    },
    {
      title: "Practice with Prompts",
      description: "Use our built-in prompts or create your own custom scripts to practice.",
      icon: <VideoIcon size={isMobile ? 48 : 64} className="text-primary" />
    },
    {
      title: "Track Your Progress",
      description: "Record, reflect, and grow your confidence over time with our easy tracking.",
      icon: <Award size={isMobile ? 48 : 64} className="text-primary" />
    }
  ];
  
  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };
  
  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };
  
  const handleSkip = () => {
    onComplete();
  };
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onComplete()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-background">
        <div className="p-6 pt-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="rounded-full bg-primary/10 p-6 mb-2">
              {slides[currentSlide].icon}
            </div>
            
            <h2 className="text-2xl font-bold tracking-tight">
              {slides[currentSlide].title}
            </h2>
            
            <p className="text-muted-foreground">
              {slides[currentSlide].description}
            </p>
          </div>
          
          {/* Progress dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {slides.map((_, index) => (
              <div 
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentSlide ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        
        <DialogFooter className="p-6 pt-0 flex sm:flex-row justify-between">
          <div className="flex space-x-2">
            {currentSlide > 0 ? (
              <Button variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            ) : (
              <Button variant="outline" onClick={handleSkip}>
                Skip
              </Button>
            )}
          </div>
          
          <Button onClick={handleNext}>
            {currentSlide < slides.length - 1 ? (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            ) : (
              "Get Started"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;