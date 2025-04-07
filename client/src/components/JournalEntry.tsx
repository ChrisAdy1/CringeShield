import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Pencil, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JournalEntryProps {
  sessionId: string | number;
  onSave: (text: string) => void;
  onSkip: () => void;
  initialText?: string;
}

const JournalEntry: React.FC<JournalEntryProps> = ({
  sessionId,
  onSave,
  onSkip,
  initialText = '',
}) => {
  const [text, setText] = useState(initialText);
  const [isOpen, setIsOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!text.trim()) {
      // Don't save empty entries
      handleSkip();
      return;
    }

    setIsSaving(true);
    
    try {
      // For now we'll just update the local storage session with the journal
      // This could be extended to save to the server as well
      const sessions = JSON.parse(localStorage.getItem('practice-sessions') || '[]');
      const updatedSessions = sessions.map((s: any) => {
        if (s.id.toString() === sessionId.toString()) {
          return {
            ...s,
            journalEntry: text,
            journalDate: new Date().toISOString(),
          };
        }
        return s;
      });
      
      localStorage.setItem('practice-sessions', JSON.stringify(updatedSessions));
      
      toast({
        title: "Journal Saved",
        description: "Your reflection has been saved successfully.",
        duration: 3000,
      });

      // Call the parent save handler
      onSave(text);
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving journal entry:', error);
      toast({
        title: "Save Failed",
        description: "There was a problem saving your journal entry.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    setIsOpen(false);
    onSkip();
  };

  const handleClose = () => {
    if (text.trim()) {
      // If there's text, confirm before closing
      if (confirm("You have unsaved content. Do you want to save it before closing?")) {
        handleSave();
      } else {
        setIsOpen(false);
        onSkip();
      }
    } else {
      // If no text, just close
      setIsOpen(false);
      onSkip();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Journal Your Thoughts
          </DialogTitle>
          <DialogDescription>
            Reflect on your practice session. What went well? What would you improve?
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-2">
          <Textarea
            placeholder="Write your thoughts about this session..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[150px]"
            autoFocus
          />
          
          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={handleSkip}
              disabled={isSaving}
            >
              <X className="mr-2 h-4 w-4" />
              Skip
            </Button>
            
            <Button 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JournalEntry;