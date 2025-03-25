import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Eye, X } from 'lucide-react';
import { AIFeedback, FeedbackRating } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedback: AIFeedback | null;
  onSave: (userRating: FeedbackRating) => void;
  onTryAgain: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  open,
  onOpenChange,
  feedback,
  onSave,
  onTryAgain
}) => {
  const handleRatingClick = (rating: FeedbackRating) => {
    onSave(rating);
  };

  if (!feedback) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Practice Feedback</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-2">
          <div>
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-medium ml-2">Strengths</h3>
            </div>
            <ul className="pl-10 space-y-2 text-sm text-gray-700">
              {feedback.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full bg-primary bg-opacity-20 flex items-center justify-center">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium ml-2">Things to Improve</h3>
            </div>
            <ul className="pl-10 space-y-2 text-sm text-gray-700">
              {feedback.improvements.map((improvement, index) => (
                <li key={index}>{improvement}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              How did you feel during this session?
            </label>
            <div className="flex space-x-2 mt-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => handleRatingClick('nervous')}
              >
                😰 Nervous
              </Button>
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => handleRatingClick('okay')}
              >
                😐 Okay
              </Button>
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => handleRatingClick('confident')}
              >
                😊 Confident
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex space-x-3">
          <Button variant="default" className="flex-1" onClick={() => onSave('okay')}>
            Save Feedback
          </Button>
          <Button variant="outline" onClick={onTryAgain}>
            Try Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
