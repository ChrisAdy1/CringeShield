import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';

import { ArrowLeft, Circle, Square, CheckCircle, Download } from 'lucide-react';
import { challengeDays } from '@/lib/challengeDays';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
import { useWeeklyChallenge } from '@/hooks/useWeeklyChallenge';
import { getPromptById } from '@/lib/weeklyPrompts';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';

// Define BlobEvent type if not available
interface BlobEvent extends Event {
  data: Blob;
  timecode?: number;
}

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
  const { completeDayMutation, completedDays, isDayCompleted } = useChallengeProgress();
  const { completePrompt, isPromptCompleted } = useWeeklyChallenge();
  
  const isCurrentChallengeCompleted = challengeDay ? completedDays.some((day) => day.dayNumber === challengeDay) : false;
  const isCurrentPromptCompleted = promptParam ? isPromptCompleted(promptParam) : false;
  
  // Get parameters from URL
  const recordingType = challenge ? 'challenge' : weeklyPrompt ? 'weekly' : 'free';
  
  // Camera ref
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [showDownloadOption, setShowDownloadOption] = useState(false);
  
  // Timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Camera error state
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Set up camera
  useEffect(() => {
    async function setupCamera() {
      try {
        // First try just video without audio in case audio is causing issues
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user" }, 
          audio: false 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        // After video succeeds, try to add audio separately
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const videoTracks = stream.getVideoTracks();
          const audioTracks = audioStream.getAudioTracks();
          
          // Combine tracks if available
          if (videoTracks.length > 0 && audioTracks.length > 0) {
            const combinedStream = new MediaStream([...videoTracks, ...audioTracks]);
            if (videoRef.current) {
              videoRef.current.srcObject = combinedStream;
            }
          }
        } catch (audioErr) {
          console.warn('Could not access microphone, continuing with video only');
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setCameraError('Unable to access camera. Please make sure camera permissions are granted and try again.');
      }
    }
    
    setupCamera();
    
    // Cleanup
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);
  
  // Start recording
  const startRecording = () => {
    if (!videoRef.current || !videoRef.current.srcObject) {
      console.error('No video source found for recording');
      return;
    }
    
    chunksRef.current = [];
    const stream = videoRef.current.srcObject as MediaStream;
    
    try {
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8,opus' });
      mediaRecorderRef.current = mediaRecorder;
    } catch (err) {
      console.warn('MediaRecorder with specified options not supported, trying fallback', err);
      try {
        // Try a simpler configuration as fallback
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
      } catch (fallbackErr) {
        console.error('MediaRecorder not supported in this browser', fallbackErr);
        setCameraError('Recording is not supported in this browser. Try a different browser or device.');
        return;
      }
    }
    
    if (!mediaRecorderRef.current) {
      console.error('MediaRecorder not initialized');
      return;
    }
    
    mediaRecorderRef.current.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };
    
    mediaRecorderRef.current.onstop = () => {
      try {
        if (chunksRef.current && chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          setRecordedBlob(blob);
          
          // Create object URL for direct download
          const blobUrl = URL.createObjectURL(blob);
          setRecordingUrl(blobUrl);
          
          // Show download option immediately
          setShowDownloadOption(true);
          
          console.log('Recording stopped, blob created successfully');
          
          // Only mark challenges/prompts as complete if we actually have a recording
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
          
          // Store blob in localStorage for the post-session screen
          const sessionId = Date.now();
          
          // Only try to store the recording in localStorage if it's smaller than 5MB
          // This prevents quota exceeded errors for large recordings
          if (blob.size < 5 * 1024 * 1024) {
            try {
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onloadend = function() {
                try {
                  const base64data = reader.result;
                  localStorage.setItem(`recording-${sessionId}`, base64data as string);
                  localStorage.setItem(`recording-url-${sessionId}`, blobUrl);
                } catch (storageErr) {
                  console.error('Error saving to localStorage:', storageErr);
                  // Still continue but warn user
                  toast({
                    title: "Recording ready for download",
                    description: "Your video is ready! Download now to save it to your device.",
                    variant: "default",
                    duration: 5000
                  });
                }
              };
            } catch (readerErr) {
              console.error('Error reading blob:', readerErr);
            }
          } else {
            // For large recordings, only save the URL and inform the user
            try {
              localStorage.setItem(`recording-url-${sessionId}`, blobUrl);
              toast({
                title: "Recording ready for download",
                description: "Your video is ready! Download now to save it to your device.",
                variant: "default",
                duration: 5000
              });
            } catch (err) {
              console.error('Error saving URL to localStorage:', err);
            }
          }
        } else {
          console.warn('No chunks available when recording stopped');
          toast({
            title: "Recording issue",
            description: "No video data was captured during recording. Please try again.",
            variant: "destructive"
          });
        }
      } catch (err) {
        console.error('Error creating blob from chunks:', err);
        toast({
          title: "Recording failed",
          description: "There was an error processing your video. Please try again.",
          variant: "destructive"
        });
      }
    };
    
    // Start the recorder
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } else {
      console.error('MediaRecorder not initialized');
    }
    
    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };
  
  // Handle direct download of the recording
  const handleDownloadRecording = () => {
    if (!recordedBlob) {
      console.error('No recording blob available for download');
      toast({
        title: "Download failed",
        description: "No recording available to download. Please try recording again.",
        variant: "destructive"
      });
      return;
    }
    
    const date = new Date().toISOString().slice(0, 10);
    const filename = `cringe-shield-recording-${date}.webm`;
    
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
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks to release camera and microphone resources
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Generate ID once for use in both the recording key and session data
      const sessionId = Date.now();
      
      // We'll let the mediaRecorderRef.current.onstop event handler 
      // do the actual blob creation and UI updates for better stability
      
      // Session metadata gets created here, but the actual recording will be handled
      // by the onstop event handler already defined in startRecording()
      
      // Enhanced sessionData to include challenge information
      const sessionData: {
        id: number;
        date: string;
        duration: number;
        type: string;
        cameraOn: boolean;
        recordingKey: string;
        hasRecording: boolean;
        challengeDay?: number;
        challengeTitle?: string;
        weeklyPromptId?: string;
        weeklyPromptText?: string;
        weeklyPromptTier?: string;
        weeklyPromptTitle?: string;
      } = {
        id: sessionId,
        date: new Date().toISOString(),
        duration: recordingTime,
        type: recordingType,
        cameraOn: cameraOn,
        recordingKey: `recording-${sessionId}`, // Key to look up the recording in localStorage
        hasRecording: true, // We assume we'll have a recording since the stop event will create it
      };
      
      // Add challenge info if applicable
      if (challenge) {
        sessionData.challengeDay = challenge.day;
        sessionData.challengeTitle = challenge.title;
      }
      
      // Add weekly challenge prompt info if applicable
      if (weeklyPrompt) {
        sessionData.weeklyPromptId = weeklyPrompt.id;
        sessionData.weeklyPromptText = weeklyPrompt.text;
        sessionData.weeklyPromptTier = weeklyPrompt.tier;
        sessionData.weeklyPromptTitle = weeklyPrompt.title;
      }
      
      // Store in local storage
      const sessions = JSON.parse(localStorage.getItem('practice-sessions') || '[]');
      sessions.push(sessionData);
      localStorage.setItem('practice-sessions', JSON.stringify(sessions));
      
      // Don't navigate automatically - let the user choose to download or continue
      // The mediaRecorder.onstop handler will show the download UI
      
      toast({
        title: "Recording completed",
        description: "Your recording has finished. You can download it now.",
        duration: 3000
      });
    }
  };
  
  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="p-3 flex items-center justify-between border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="font-medium">
          {isRecording ? (
            <span className="flex items-center text-red-500">
              <Circle className="h-3 w-3 mr-2 animate-pulse" fill="currentColor" />
              Recording {formatTime(recordingTime)}
            </span>
          ) : (
            <span>Ready to Record</span>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setCameraOn(!cameraOn)}
        >
          {cameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
        </Button>
      </div>
      
      {/* Camera view */}
      <div className="flex-1 relative">
        {cameraError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gray-100">
            <div className="text-red-500 mb-4 text-5xl">📷</div>
            <h3 className="text-lg font-medium mb-2">Camera Access Error</h3>
            <p className="text-center text-muted-foreground mb-4">{cameraError}</p>
            <div className="flex flex-col space-y-2">
              <Button onClick={() => navigate('/')}>
                Go Back to Home
              </Button>
            </div>
          </div>
        ) : (
          <>
            {cameraOn ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center p-6">
                  <div className="mb-4 text-4xl">🎙️</div>
                  <h3 className="text-lg font-medium mb-2">Audio Only Mode</h3>
                  <p className="text-muted-foreground">
                    Camera is turned off. Your audio will still be recorded.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Controls */}
      <div className="p-4 bg-background">
        {showDownloadOption && recordedBlob ? (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <h3 className="font-medium text-green-800 mb-2">Recording Complete!</h3>
            <p className="text-sm text-gray-700 mb-3">Your video has been saved. You can download it now or continue to the feedback screen.</p>
            <div className="flex gap-2 justify-center">
              <Button 
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={handleDownloadRecording}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Now
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  // We need to find the latest session in localStorage to navigate to it
                  const sessions = JSON.parse(localStorage.getItem('practice-sessions') || '[]');
                  if (sessions.length > 0) {
                    // Get the most recent session
                    const latestSession = sessions[sessions.length - 1];
                    navigate(`/post-session?sessionId=${latestSession.id}`);
                  } else {
                    // Fallback - should never happen
                    navigate('/');
                  }
                }}
              >
                Continue to Feedback
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center space-x-4">
            {isRecording ? (
              <div className="flex flex-col items-center">
                <Button
                  variant="destructive"
                  size="lg"
                  className="rounded-full h-14 w-14 flex items-center justify-center mb-2"
                  onClick={stopRecording}
                >
                  <Square className="h-6 w-6" />
                </Button>
                <span className="text-sm font-medium">Stop</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Button
                  size="lg"
                  className="rounded-full h-14 w-14 flex items-center justify-center bg-red-500 hover:bg-red-600 mb-2"
                  onClick={startRecording}
                >
                  <Circle className="h-6 w-6" fill="currentColor" />
                </Button>
                <span className="text-sm font-medium">Start</span>
              </div>
            )}
          </div>
        )}
        
        {/* Challenge/prompt info or free mode info */}
        <div className="mt-4 text-sm">
          {challenge ? (
            <div className="mb-3">
              <Alert variant="default" className="bg-primary/10 border-primary/20">
                <AlertTitle className="text-sm font-semibold flex items-center">
                  Day {challenge.day}: {challenge.title}
                  {isCurrentChallengeCompleted && 
                    <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
                  }
                </AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  {challenge.description}
                </AlertDescription>
              </Alert>
              
              {!isCurrentChallengeCompleted && (
                <div className="text-xs mt-2 text-primary/80 bg-primary/5 p-2 rounded">
                  <span className="font-medium">Note:</span> This challenge will be automatically marked as complete once you finish recording.
                </div>
              )}
            </div>
          ) : weeklyPrompt ? (
            <div className="mb-3">
              <Alert variant="default" className="bg-primary/10 border-primary/20">
                <AlertTitle className="text-sm font-semibold flex items-center">
                  {weeklyPrompt.title ? (
                    <>Weekly Challenge: {weeklyPrompt.title}</>
                  ) : (
                    <>Weekly Challenge: Week {weeklyPrompt.week}, Prompt {weeklyPrompt.order}</>
                  )}
                  {isCurrentPromptCompleted && 
                    <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
                  }
                </AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  {weeklyPrompt.text}
                </AlertDescription>
              </Alert>
              
              {!isCurrentPromptCompleted && (
                <div className="text-xs mt-2 text-primary/80 bg-primary/5 p-2 rounded">
                  <span className="font-medium">Note:</span> This prompt will be marked as complete when you finish recording.
                </div>
              )}
              
              <div className="text-xs mt-2 text-muted-foreground bg-muted/30 p-2 rounded">
                <Link href="/weekly-challenge" className="text-primary underline">Return to Weekly Challenge Dashboard</Link> after recording to continue your progress.
              </div>
            </div>
          ) : (
            <div className="text-center mb-2 text-muted-foreground">Free talking mode</div>
          )}
          

        </div>
      </div>
    </div>
  );
};

export default Recording;