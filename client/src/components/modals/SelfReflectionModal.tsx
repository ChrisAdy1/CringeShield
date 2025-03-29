import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SelfReflectionRating } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';

// Icons for ratings
import { 
  Frown, 
  Meh, 
  Smile, 
  ThumbsUp, 
  Flame 
} from 'lucide-react';

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
  const [selectedRating, setSelectedRating] = useState<SelfReflectionRating | null>(null);
  const [note, setNote] = useState('');

  // Reset state when modal opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen === false && selectedRating) {
      // If closing with a selected rating, complete the reflection
      onComplete(selectedRating, note.trim() || undefined);
    }
    
    if (newOpen === true) {
      // Reset when opening
      setSelectedRating(null);
      setNote('');
    }
    
    onOpenChange(newOpen);
  };

  // Rating options with mood and labels using our brand-safe palette colors
  const ratings = [
    { value: 1, icon: Frown, label: 'Uncomfortable', bgColor: 'bg-[#E0E0E0]', textColor: 'text-[#444444]' },
    { value: 2, icon: Meh, label: 'Nervous', bgColor: 'bg-[#E0E0E0]', textColor: 'text-[#444444]' },
    { value: 3, icon: Smile, label: 'Okay', bgColor: 'bg-[#FFD6A5]', textColor: 'text-[#444444]' }, // Warning Peach
    { value: 4, icon: ThumbsUp, label: 'Good', bgColor: 'bg-[#C7F9CC]', textColor: 'text-[#444444]' }, // Success Mint
    { value: 5, icon: Flame, label: 'Confident!', bgColor: 'bg-[#C7F9CC]', textColor: 'text-[#444444]' } // Success Mint
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={`${isMobile ? 'max-w-[95%] p-4' : 'sm:max-w-md'} bg-white border border-[#EDE9FE] shadow-md`}>
        <DialogHeader>
          <DialogTitle className="text-center text-[#444444]">How did that feel?</DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          <div className="flex justify-center mb-6">
            <div className="flex gap-2 sm:gap-4">
              {ratings.map((rating) => {
                const Icon = rating.icon;
                return (
                  <Button
                    key={rating.value}
                    type="button"
                    variant="outline"
                    className={`
                      rounded-full flex flex-col p-0 h-auto w-auto
                      ${isMobile ? 'min-w-14 min-h-14' : 'min-w-16 min-h-16'}
                      ${selectedRating === rating.value 
                        ? `${rating.bgColor} border-2 border-[#9A7DFF] shadow-md` 
                        : 'bg-white border border-[#EDE9FE]'}
                      transition-all duration-200 hover:border-[#9A7DFF]
                    `}
                    onClick={() => setSelectedRating(rating.value as SelfReflectionRating)}
                  >
                    <div className={`
                      flex flex-col items-center justify-center 
                      ${isMobile ? 'p-3' : 'p-4'}
                    `}>
                      <Icon 
                        className={`
                          mb-1 
                          ${isMobile ? 'h-5 w-5' : 'h-6 w-6'}
                          ${selectedRating === rating.value 
                            ? 'text-[#444444]' 
                            : 'text-[#9A7DFF]'}
                        `} 
                      />
                      <span className={`
                        text-xs font-medium 
                        ${selectedRating === rating.value 
                          ? rating.textColor 
                          : 'text-[#9A7DFF]'}
                      `}>
                        {rating.label}
                      </span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm">Notes (optional)</Label>
            <Textarea
              id="note"
              placeholder="Add any thoughts about your performance..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>
        
        <DialogFooter className="flex justify-end">
          <Button 
            onClick={() => {
              if (selectedRating) {
                onComplete(selectedRating, note.trim() || undefined);
              }
            }}
            disabled={!selectedRating}
            className="bg-[#9A7DFF] hover:bg-[#9A7DFF]/90 transition-all disabled:bg-[#E0E0E0]"
          >
            Save Reflection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelfReflectionModal;