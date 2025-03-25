import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, X } from 'lucide-react';
import VideoRecorder from '@/components/VideoRecorder';
import PromptGenerator from '@/components/PromptGenerator';
import SocialMediaFrame from '@/components/SocialMediaFrame';
import { faceFilterOptions, promptCategories } from '@/lib/utils';
import { Prompt } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  const [selectedFilter, setSelectedFilter] = useState('blur');
  const [selectedCategory, setSelectedCategory] = useState('casual');
  const [selectedPlatform, setSelectedPlatform] = useState<'tiktok' | 'youtube' | 'instagram' | 'none'>('none');
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [settingsExpanded, setSettingsExpanded] = useState(!isMobile);

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
    // Reset platform selection when changing categories
    if (value !== 'social_media') {
      setSelectedPlatform('none');
    } else if (selectedPlatform === 'none') {
      setSelectedPlatform('tiktok');
    }
  };
  
  const handlePlatformChange = (value: string) => {
    setSelectedPlatform(value as 'tiktok' | 'youtube' | 'instagram' | 'none');
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
      <DialogContent className={`${isMobile ? 'max-w-[95%] p-4' : 'sm:max-w-md'} overflow-y-auto max-h-[90vh]`}>
        <DialogHeader>
          <DialogTitle>Video Practice</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {isMobile && (
            <div className="pb-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSettingsExpanded(!settingsExpanded)}
                className="w-full flex justify-between items-center"
              >
                {settingsExpanded ? 'Hide Settings' : 'Show Settings'}
                <span className="inline-block transition-transform duration-200" style={{ transform: settingsExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  ▼
                </span>
              </Button>
            </div>
          )}
          
          {(!isMobile || settingsExpanded) && (
            <div className={`space-y-3 ${isMobile ? 'pb-3' : ''}`}>
              <div>
                <Label htmlFor="filter" className="text-sm">Choose a filter</Label>
                <Select value={selectedFilter} onValueChange={handleFilterChange}>
                  <SelectTrigger className="mt-1">
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
                <Label htmlFor="category" className="text-sm">Choose a category</Label>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="mt-1">
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
              
              {selectedCategory === 'social_media' && (
                <div>
                  <Label htmlFor="platform" className="text-sm">Choose a platform</Label>
                  <Select value={selectedPlatform} onValueChange={handlePlatformChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a social media platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <PromptGenerator 
                category={selectedCategory} 
                onPromptGenerated={handlePromptGenerated} 
              />
            </div>
          )}
          
          {selectedCategory === 'social_media' && selectedPlatform !== 'none' ? (
            <SocialMediaFrame platform={selectedPlatform as 'tiktok' | 'youtube' | 'instagram'}>
              <VideoRecorder 
                filterType={selectedFilter}
                isRecording={isRecording}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                onRecordingComplete={handleRecordingComplete}
              />
            </SocialMediaFrame>
          ) : (
            <VideoRecorder 
              filterType={selectedFilter}
              isRecording={isRecording}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              onRecordingComplete={handleRecordingComplete}
            />
          )}
        </div>
        
        <DialogFooter className={`${isMobile ? 'mt-2' : 'mt-4'} flex justify-between`}>
          <DialogClose asChild>
            <Button variant="outline" className="gap-1" size={isMobile ? "sm" : "default"}>
              <X size={isMobile ? 14 : 16} />
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PracticeModal;
