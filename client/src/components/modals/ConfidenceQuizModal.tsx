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
    question: "How do you feel before speaking in front of others?",
    options: [
      { text: "Extremely nervous and anxious", points: 1 },
      { text: "Somewhat nervous but can manage", points: 2 },
      { text: "Slightly nervous but generally fine", points: 3 },
      { text: "Confident and comfortable", points: 4 }
    ]
  },
  {
    question: "When recording yourself on video, you typically:",
    options: [
      { text: "Avoid it at all costs", points: 1 },
      { text: "Feel very self-conscious watching yourself", points: 2 },
      { text: "Feel a bit awkward but it's OK", points: 3 },
      { text: "Feel comfortable and natural", points: 4 }
    ]
  },
  {
    question: "How often do you speak up in group settings?",
    options: [
      { text: "Rarely or never", points: 1 },
      { text: "Only when directly asked", points: 2 },
      { text: "Sometimes, when I feel strongly about something", points: 3 },
      { text: "Regularly, I enjoy contributing", points: 4 }
    ]
  },
  {
    question: "When giving a prepared talk or presentation:",
    options: [
      { text: "I struggle to get through it", points: 1 },
      { text: "I can do it, but it's stressful", points: 2 },
      { text: "I'm mostly comfortable with preparation", points: 3 },
      { text: "I enjoy the opportunity", points: 4 }
    ]
  },
  {
    question: "How would you rate your overall speaking confidence?",
    options: [
      { text: "Very low - speaking is difficult for me", points: 1 },
      { text: "Below average - I get by when needed", points: 2 },
      { text: "Average - I'm comfortable in most situations", points: 3 },
      { text: "Above average - I'm generally confident speaking", points: 4 }
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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