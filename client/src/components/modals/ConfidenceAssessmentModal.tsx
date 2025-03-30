import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, CheckCircle2, Star } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  confidenceQuestions, 
  getConfidenceTier, 
  confidenceTierDescriptions,
  saveAssessmentResults
} from '@/lib/confidenceAssessment';

interface ConfidenceAssessmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (tier: "shy_starter" | "growing_speaker" | "confident_creator") => void;
}

const ConfidenceAssessmentModal: React.FC<ConfidenceAssessmentModalProps> = ({ 
  open, 
  onOpenChange,
  onComplete
}) => {
  const isMobile = useIsMobile();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [confidenceTier, setConfidenceTier] = useState<"shy_starter" | "growing_speaker" | "confident_creator" | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setShowResults(false);
      setConfidenceTier(null);
    }
  }, [open]);

  const handleAnswer = (value: string) => {
    const answerValue = parseInt(value);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerValue;
    setAnswers(newAnswers);
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < confidenceQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate results
      const tier = getConfidenceTier(answers);
      setConfidenceTier(tier);
      setShowResults(true);
      saveAssessmentResults(answers, tier);
    }
  };

  const handleComplete = () => {
    if (confidenceTier) {
      onComplete(confidenceTier);
      onOpenChange(false);
    }
  };

  const currentQuestion = confidenceQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / confidenceQuestions.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? 'max-w-[95%] p-4' : 'sm:max-w-md'} overflow-y-auto max-h-[90vh]`}>
        <DialogHeader>
          <DialogTitle className="text-center">
            {showResults ? "Your Confidence Assessment" : "Camera Confidence Assessment"}
          </DialogTitle>
          {!showResults && (
            <DialogDescription className="text-center">
              Answer these questions to help us personalize your experience
            </DialogDescription>
          )}
        </DialogHeader>
        
        {!showResults ? (
          <div className="space-y-4 py-4">
            <Progress value={progress} className="h-2" />
            <span className="text-sm text-gray-500 block text-right">
              Question {currentQuestionIndex + 1} of {confidenceQuestions.length}
            </span>
            
            <div className="py-2">
              <h3 className="font-medium text-lg mb-4">{currentQuestion.question}</h3>
              
              <RadioGroup 
                onValueChange={handleAnswer}
                value={answers[currentQuestionIndex]?.toString()}
                className="space-y-3"
              >
                {currentQuestion.options.map((option, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <RadioGroupItem value={idx.toString()} id={`option-${idx}`} className="mt-1" />
                    <Label htmlFor={`option-${idx}`} className="font-normal cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <DialogFooter className="pt-4">
              <Button 
                onClick={moveToNextQuestion} 
                disabled={answers[currentQuestionIndex] === undefined}
                className="w-full"
              >
                {currentQuestionIndex === confidenceQuestions.length - 1 ? 'See Results' : 'Next Question'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </div>
        ) : (
          confidenceTier && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <h2 className="font-bold text-xl text-primary mb-1">
                  {confidenceTierDescriptions[confidenceTier].title}
                </h2>
                <div className="flex justify-center my-3">
                  {confidenceTier === 'shy_starter' && (
                    <Star className="h-8 w-8 text-primary" />
                  )}
                  {confidenceTier === 'growing_speaker' && (
                    <>
                      <Star className="h-8 w-8 text-primary" />
                      <Star className="h-8 w-8 text-primary" />
                    </>
                  )}
                  {confidenceTier === 'confident_creator' && (
                    <>
                      <Star className="h-8 w-8 text-primary" />
                      <Star className="h-8 w-8 text-primary" />
                      <Star className="h-8 w-8 text-primary" />
                    </>
                  )}
                </div>
                <p className="text-sm">{confidenceTierDescriptions[confidenceTier].description}</p>
              </div>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Recommended For You:</h3>
                  <ul className="space-y-2">
                    {confidenceTierDescriptions[confidenceTier].tips.map((tip, index) => (
                      <li key={index} className="flex">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <DialogFooter className="pt-2">
                <Button onClick={handleComplete} className="w-full">
                  Get Started
                </Button>
              </DialogFooter>
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConfidenceAssessmentModal;