import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { challengeDays } from '@/lib/challengeDays';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
import { useWeeklyChallenge } from '@/hooks/useWeeklyChallenge';
import { getPromptById } from '@/lib/weeklyPrompts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import VideoRecorder from '@/components/VideoRecorder';

const Recording: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryParams = new URLSearchParams(window.location.search);
  const challengeParam = queryParams.get('challenge');
  const challengeDay = challengeParam ? parseInt(challengeParam, 10) : null;
  const promptParam = queryParams.get('prompt');
  
  // Get challenge information
  const challenge = challengeDay 
    ? challengeDays.find(c => c.day === challengeDay) 
    : null;
  
  // Get weekly challenge prompt information
  const weeklyPrompt = promptParam ? getPromptById(promptParam) : null;
  
  // Get challenge progress
  const { completeDayMutation, completedDays } = useChallengeProgress();
  const { completePrompt, isPromptCompleted } = useWeeklyChallenge();
  
  const isCurrentChallengeCompleted = challengeDay ? completedDays.some((day) => day.dayNumber === challengeDay) : false;
  const isCurrentPromptCompleted = promptParam ? isPromptCompleted(promptParam) : false;
  
  // Get parameters from URL
  const recordingType = challenge ? 'challenge' : 'weekly';
  
  // Recording states
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [showDownloadOption, setShowDownloadOption] = useState(false);
  
  // Handle recording completed
  const handleRecordingComplete = (blob: Blob) => {
    setRecordedBlob(blob);
    setShowDownloadOption(true);
    
    // Mark challenge/prompt as completed
    if (blob && blob.size > 0) {
      // If this is a challenge, mark it as completed
      if (challenge && !isCurrentChallengeCompleted) {
        completeDayMutation.mutate(challenge.day);
      }
      
      // If this is a weekly challenge prompt, mark it as completed
      if (weeklyPrompt && promptParam && !isCurrentPromptCompleted) {
        completePrompt.mutate(promptParam);
      }
    }
    
    // Store recording in localStorage for the post-session screen
    const sessionId = Date.now();
    
    // Create recording session data
    const sessionData = {
      id: sessionId,
      date: new Date().toISOString(),
      duration: 0, // We don't track this anymore
      type: recordingType,
      cameraOn: true,
      recordingKey: `recording-${sessionId}`,
      hasRecording: true,
      ...(challenge ? {
        challengeDay: challenge.day,
        challengeTitle: challenge.title,
      } : {}),
      ...(weeklyPrompt ? {
        weeklyPromptId: weeklyPrompt.id,
        weeklyPromptText: weeklyPrompt.text,
        weeklyPromptTier: weeklyPrompt.tier,
        weeklyPromptTitle: weeklyPrompt.title,
      } : {})
    };
    
    // Store session data
    try {
      const sessions = JSON.parse(localStorage.getItem('practice-sessions') || '[]');
      sessions.push(sessionData);
      localStorage.setItem('practice-sessions', JSON.stringify(sessions));
      
      // Only try to store the recording in localStorage if it's smaller than 5MB
      if (blob.size < 5 * 1024 * 1024) {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function() {
          try {
            const base64data = reader.result;
            localStorage.setItem(`recording-${sessionId}`, base64data as string);
          } catch (err) {
            console.error('Error saving recording to localStorage:', err);
            toast({
              title: "Storage issue",
              description: "Your recording is ready but couldn't be saved locally. Please download it now.",
              variant: "default",
              duration: 5000
            });
          }
        };
      } else {
        toast({
          title: "Recording ready for download",
          description: "Your video is ready! Please download it now as it's too large to save locally.",
          variant: "default",
          duration: 5000
        });
      }
    } catch (err) {
      console.error('Error saving session data:', err);
    }
    
    toast({
      title: "Recording completed",
      description: "Your recording has finished successfully!",
      duration: 3000
    });
  };
  
  // Handle direct download of the recording
  const handleDownloadRecording = () => {
    if (!recordedBlob) {
      toast({
        title: "Download failed",
        description: "No recording available to download. Please try recording again.",
        variant: "destructive"
      });
      return;
    }
    
    const date = new Date().toISOString().slice(0, 10);
    const filename = `cringeshield-recording-${date}.webm`;
    
    try {
      // Create download link
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: "Your recording is being downloaded to your device.",
        duration: 3000
      });
      
      // Revoke object URL
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Error downloading recording:', err);
      toast({
        title: "Download failed",
        description: "There was an error downloading your recording. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const navigateToFeedback = () => {
    // Find the latest session in localStorage to navigate to it
    const sessions = JSON.parse(localStorage.getItem('practice-sessions') || '[]');
    if (sessions.length > 0) {
      // Get the most recent session
      const latestSession = sessions[sessions.length - 1];
      navigate(`/post-session?sessionId=${latestSession.id}`);
    } else {
      // Fallback to home
      navigate('/');
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b p-4">
        <div className="container flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="ml-4 text-xl font-semibold">Talk to the Camera</h1>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow container py-6">
        {/* Challenge/Prompt info */}
        {(challenge || weeklyPrompt) && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>
                {challenge ? `Day ${challenge.day}: ${challenge.title}` : 
                 weeklyPrompt ? weeklyPrompt.title : 'Practice Session'}
              </CardTitle>
              <CardDescription>
                {challenge?.description || weeklyPrompt?.text || 'Record yourself speaking to practice your skills'}
              </CardDescription>
            </CardHeader>
          </Card>
        )}
        
        {/* Recorder component */}
        {!showDownloadOption ? (
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-center text-primary">Talk to the Camera</CardTitle>
            </CardHeader>
            <CardContent>
              <VideoRecorder 
                onRecordingComplete={handleRecordingComplete}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Recording Complete!</CardTitle>
              <CardDescription className="text-green-700">
                Your practice session has been successfully recorded
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 items-center">
                <p className="text-center text-gray-700">
                  You can download your recording or continue to the feedback screen.
                </p>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleDownloadRecording}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Recording
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={navigateToFeedback}
                  >
                    Continue to Feedback
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Recording;