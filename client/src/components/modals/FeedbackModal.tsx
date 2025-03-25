import React, { useState } from 'react';
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
  const isMobile = useIsMobile();
  const [selectedRating, setSelectedRating] = useState<FeedbackRating | null>(null);
  
  const handleRatingClick = (rating: FeedbackRating) => {
    setSelectedRating(rating);
  };
  
  const handleSave = () => {
    if (selectedRating) {
      onSave(selectedRating);
    } else {
      // Default to 'okay' if no rating selected
      onSave('okay');
    }
  };

  if (!feedback) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? 'max-w-[95%] p-4' : 'sm:max-w-md'} overflow-y-auto max-h-[90vh]`}>
        <DialogHeader>
          <DialogTitle className="text-center">Practice Feedback</DialogTitle>
        </DialogHeader>
        
        <div className={`${isMobile ? 'space-y-4' : 'space-y-6'} py-2`}>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="font-medium ml-2 text-green-800">Strengths</h3>
            </div>
            <ul className={`${isMobile ? 'pl-6' : 'pl-10'} space-y-2 text-sm text-gray-700`}>
              {feedback.strengths.map((strength, index) => (
                <li key={index} className="leading-tight">{strength}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <div className="w-7 h-7 rounded-full bg-primary bg-opacity-20 flex items-center justify-center">
                <Eye className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-medium ml-2 text-primary">Areas to Improve</h3>
            </div>
            <ul className={`${isMobile ? 'pl-6' : 'pl-10'} space-y-2 text-sm text-gray-700`}>
              {feedback.improvements.map((improvement, index) => (
                <li key={index} className="leading-tight">{improvement}</li>
              ))}
            </ul>
          </div>
          
          <div className="pt-2">
            <label className="text-sm font-medium text-gray-700 mb-2 block text-center">
              How did you feel during this practice?
            </label>
            <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'space-x-2'} mt-2`}>
              <Button 
                variant={selectedRating === 'nervous' ? 'default' : 'outline'} 
                className={`${isMobile ? 'py-6' : 'flex-1'} touch-target`} 
                onClick={() => handleRatingClick('nervous')}
              >
                <span className="text-lg mr-2">😰</span> Nervous
              </Button>
              <Button 
                variant={selectedRating === 'okay' ? 'default' : 'outline'} 
                className={`${isMobile ? 'py-6' : 'flex-1'} touch-target`} 
                onClick={() => handleRatingClick('okay')}
              >
                <span className="text-lg mr-2">😐</span> Okay
              </Button>
              <Button 
                variant={selectedRating === 'confident' ? 'default' : 'outline'} 
                className={`${isMobile ? 'py-6' : 'flex-1'} touch-target`} 
                onClick={() => handleRatingClick('confident')}
              >
                <span className="text-lg mr-2">😊</span> Confident
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className={`${isMobile ? 'flex-col space-y-2' : 'flex space-x-3'} mt-4`}>
          <Button 
            variant="default" 
            className={`${isMobile ? 'w-full py-6' : 'flex-1'} touch-target`} 
            onClick={handleSave}
          >
            Save Feedback
          </Button>
          <Button 
            variant="outline" 
            className={`${isMobile ? 'w-full py-6' : ''} touch-target`} 
            onClick={onTryAgain}
          >
            Try Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
