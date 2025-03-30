import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ConfidenceTier } from '@/lib/types';

interface ConfidenceQuizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (tier: ConfidenceTier) => void;
}

interface QuizQuestion {
  question: string;
  options: {
    text: string;
    points: number;
  }[];
}

const quizQuestions: QuizQuestion[] = [
  {
    question: "How often do you record yourself speaking on camera?",
    options: [
      { text: "Never", points: 1 },
      { text: "A few times a year", points: 2 },
      { text: "A few times a month", points: 3 },
      { text: "Weekly or more", points: 4 }
    ]
  },
  {
    question: "How do you feel right before hitting record?",
    options: [
      { text: "Extremely nervous or avoid it altogether", points: 1 },
      { text: "A bit anxious, but I do it anyway", points: 2 },
      { text: "Mostly comfortable", points: 3 },
      { text: "Totally confident and energized", points: 4 }
    ]
  },
  {
    question: "What best describes your experience with speaking on camera?",
    options: [
      { text: "I avoid it whenever possible", points: 1 },
      { text: "I've tried but often feel awkward or freeze", points: 2 },
      { text: "I do okay with some prep", points: 3 },
      { text: "I enjoy it and do it regularly", points: 4 }
    ]
  },
  {
    question: "When you watch yourself back on camera, how do you usually feel?",
    options: [
      { text: "I cringe and turn it off", points: 1 },
      { text: "I notice a lot I want to fix", points: 2 },
      { text: "I'm okay with it", points: 3 },
      { text: "I like how I come across", points: 4 }
    ]
  },
  {
    question: "What's your main goal for using this app?",
    options: [
      { text: "To get over my fear of speaking on camera", points: 1 },
      { text: "To become more natural and confident", points: 2 },
      { text: "To refine and polish my delivery", points: 3 },
      { text: "To master on-camera presence", points: 4 }
    ]
  }
];

const ConfidenceQuizModal: React.FC<ConfidenceQuizModalProps> = ({ 
  open, 
  onOpenChange,
  onComplete
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleNext = () => {
    if (selectedOption !== null) {
      const newAnswers = [...answers, selectedOption];
      setAnswers(newAnswers);
      
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
      } else {
        // Quiz complete, calculate tier
        const totalScore = newAnswers.reduce((sum, points) => sum + points, 0);
        let tier: ConfidenceTier;
        
        if (totalScore <= 10) {
          tier = 'shy_starter';
        } else if (totalScore <= 15) {
          tier = 'growing_speaker';
        } else {
          tier = 'confident_creator';
        }
        
        onComplete(tier);
      }
    }
  };

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (isOpen === false && currentQuestion < quizQuestions.length - 1) {
        // Prevent closing if quiz is not complete
        return;
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Confidence Assessment</DialogTitle>
          <DialogDescription className="text-center">
            Answer 5 quick questions to personalize your experience
          </DialogDescription>
        </DialogHeader>
        
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="py-2">
          <h3 className="text-lg font-medium mb-4">
            Question {currentQuestion + 1} of {quizQuestions.length}
          </h3>
          
          <p className="mb-4">{quizQuestions[currentQuestion].question}</p>
          
          <RadioGroup 
            value={selectedOption?.toString() || ''} 
            onValueChange={(value) => setSelectedOption(parseInt(value))}
            className="space-y-3"
          >
            {quizQuestions[currentQuestion].options.map((option, idx) => (
              <Card 
                key={idx}
                className={`cursor-pointer border transition-all ${
                  selectedOption === option.points ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectedOption(option.points)}
              >
                <CardContent className="py-3 px-4 flex items-center space-x-2">
                  <RadioGroupItem value={option.points.toString()} id={`option-${idx}`} />
                  <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                    {option.text}
                  </Label>
                </CardContent>
              </Card>
            ))}
          </RadioGroup>
        </div>
        
        <DialogFooter className="flex justify-end">
          <Button 
            onClick={handleNext}
            disabled={selectedOption === null}
          >
            {currentQuestion < quizQuestions.length - 1 ? 'Next' : 'Finish'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfidenceQuizModal;