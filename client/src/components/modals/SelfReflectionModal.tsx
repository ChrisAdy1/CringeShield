import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SelfReflectionRating } from '@/lib/types';
import { useSelfReflections } from '@/hooks/useSelfReflections';
import { useIsMobile } from '@/hooks/use-mobile';

interface SelfReflectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (rating: SelfReflectionRating, note?: string) => void;
}

const SelfReflectionModal: React.FC<SelfReflectionModalProps> = ({ 
  open, 
  onOpenChange,
  onComplete 
}) => {
  const isMobile = useIsMobile();
  const [rating, setRating] = useState<SelfReflectionRating | null>(null);
  const [note, setNote] = useState('');
  const { addReflection } = useSelfReflections();
  
  const handleSubmit = () => {
    if (rating) {
      addReflection(rating, note.trim() || undefined);
      onComplete(rating, note.trim() || undefined);
      setRating(null);
      setNote('');
    }
  };
  
  const ratingEmojis = [
    { rating: 1, emoji: '😣', label: 'Very Nervous' },
    { rating: 2, emoji: '😟', label: 'Nervous' },
    { rating: 3, emoji: '😐', label: 'Neutral' },
    { rating: 4, emoji: '😊', label: 'Confident' },
    { rating: 5, emoji: '😃', label: 'Very Confident' },
  ];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`sm:max-w-md ${isMobile ? 'p-4' : 'p-6'}`}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <DialogTitle className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold`}>
            How did that feel?
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex justify-center items-center gap-2 mb-6">
            {ratingEmojis.map(item => (
              <Button
                key={item.rating}
                variant={rating === item.rating ? "default" : "outline"}
                onClick={() => setRating(item.rating as SelfReflectionRating)}
                className={`
                  flex flex-col items-center ${isMobile ? 'p-2' : 'p-3'}
                  ${rating === item.rating ? 'bg-primary text-primary-foreground' : ''}
                  transition-all
                `}
              >
                <span className={`text-${isMobile ? 'xl' : '2xl'} mb-1`}>{item.emoji}</span>
                <span className={`text-${isMobile ? 'xs' : 'sm'}`}>{item.label}</span>
              </Button>
            ))}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="reflection-note" className="text-sm font-medium">
              Additional notes (optional)
            </label>
            <Textarea
              id="reflection-note"
              placeholder="Share any thoughts about your performance..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>
        
        <DialogFooter className="flex justify-end">
          <Button 
            onClick={handleSubmit} 
            disabled={!rating}
            className={isMobile ? 'w-full' : ''}
          >
            Save Reflection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelfReflectionModal;