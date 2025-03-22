import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, X } from 'lucide-react';
import VideoRecorder from '@/components/VideoRecorder';
import PromptGenerator from '@/components/PromptGenerator';
import { faceFilterOptions, promptCategories } from '@/lib/utils';
import { Prompt } from '@/lib/types';

interface PracticeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: {
    recordingBlob: Blob,
    filterType: string,
    duration: number,
    promptCategory: string,
    promptText: string
  }) => void;
}

const PracticeModal: React.FC<PracticeModalProps> = ({ open, onOpenChange, onComplete }) => {
  const [selectedFilter, setSelectedFilter] = useState('blur');
  const [selectedCategory, setSelectedCategory] = useState('casual');
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setIsRecording(false);
      setRecordingStartTime(null);
      setRecordedBlob(null);
    }
  }, [open]);

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handlePromptGenerated = (prompt: Prompt) => {
    setCurrentPrompt(prompt);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingStartTime(Date.now());
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleRecordingComplete = (blob: Blob) => {
    setRecordedBlob(blob);
    
    if (recordingStartTime && currentPrompt) {
      const duration = (Date.now() - recordingStartTime) / 1000; // in seconds
      
      onComplete({
        recordingBlob: blob,
        filterType: selectedFilter,
        duration,
        promptCategory: selectedCategory,
        promptText: currentPrompt.text
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Video Practice</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="filter">Choose a filter</Label>
            <Select value={selectedFilter} onValueChange={handleFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a filter" />
              </SelectTrigger>
              <SelectContent>
                {faceFilterOptions.map(filter => (
                  <SelectItem key={filter.id} value={filter.id}>
                    {filter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="category">Choose a category</Label>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a prompt category" />
              </SelectTrigger>
              <SelectContent>
                {promptCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <PromptGenerator 
            category={selectedCategory} 
            onPromptGenerated={handlePromptGenerated} 
          />
          
          <VideoRecorder 
            filterType={selectedFilter}
            isRecording={isRecording}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onRecordingComplete={handleRecordingComplete}
          />
        </div>
        
        <DialogFooter className="flex justify-between">
          <DialogClose asChild>
            <Button variant="outline" className="gap-1">
              <X size={16} />
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PracticeModal;
