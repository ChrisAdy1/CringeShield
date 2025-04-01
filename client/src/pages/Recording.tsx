import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Circle, Square, FastForward, CheckCircle } from 'lucide-react';
import { challengeDays } from '@/lib/challengeDays';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define BlobEvent type if not available
interface BlobEvent extends Event {
  data: Blob;
  timecode?: number;
}

const Recording: React.FC = () => {
  const [, navigate] = useLocation();
  const queryParams = new URLSearchParams(window.location.search);
  const challengeParam = queryParams.get('challenge');
  const challengeDay = challengeParam ? parseInt(challengeParam, 10) : null;
  
  // Get challenge information
  const challenge = challengeDay 
    ? challengeDays.find(c => c.day === challengeDay) 
    : null;
  
  // Get challenge progress
  const { completeChallenge, isDayCompleted, isCompleting } = useChallengeProgress();
  const isCurrentChallengeCompleted = challengeDay ? isDayCompleted(challengeDay) : false;
  
  // Get parameters from URL
  const recordingType = challenge ? 'challenge' : 'free';
  
  // Camera ref
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [cameraOn, setCameraOn] = useState(true);
  
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
        } else {
          console.warn('No chunks available when recording stopped');
        }
      } catch (err) {
        console.error('Error creating blob from chunks:', err);
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
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Save session data in a simplistic way for MVP
      let recordingBlob;
      // Generate ID once for use in both the recording key and session data
      const sessionId = Date.now();
      
      try {
        // Store the actual blob for access in the post-session screen
        if (chunksRef.current && chunksRef.current.length > 0) {
          recordingBlob = new Blob(chunksRef.current, { type: 'video/webm' });
          setRecordedBlob(recordingBlob);
          
          // Store blob in a session-specific localStorage item
          // This is not ideal for large files, but works for demo purposes
          const reader = new FileReader();
          reader.readAsDataURL(recordingBlob);
          reader.onloadend = function() {
            const base64data = reader.result;
            // Store separately from session data to avoid localStorage size limits
            localStorage.setItem(`recording-${sessionId}`, base64data as string);
          };
        }
      } catch (err) {
        console.error('Error creating blob from recording:', err);
      }
      
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
      } = {
        id: sessionId,
        date: new Date().toISOString(),
        duration: recordingTime,
        type: recordingType,
        cameraOn: cameraOn,
        recordingKey: `recording-${sessionId}`, // Key to look up the recording in localStorage
        hasRecording: !!recordingBlob, // Flag to indicate if recording exists
      };
      
      // Add challenge info if applicable
      if (challenge) {
        sessionData.challengeDay = challenge.day;
        sessionData.challengeTitle = challenge.title;
      }
      
      // Store in local storage
      const sessions = JSON.parse(localStorage.getItem('practice-sessions') || '[]');
      sessions.push(sessionData);
      localStorage.setItem('practice-sessions', JSON.stringify(sessions));
      
      // If this is a challenge and auto-complete is desired, mark it as completed
      if (challenge && !isCurrentChallengeCompleted) {
        // Uncomment the line below to auto-complete challenges after recording
        // completeChallenge(challenge.day);
      }
      
      // Navigate to post-session screen
      navigate(`/post-session?sessionId=${sessionData.id}`);
    }
  };
  
  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  // Skip recording (for demo purposes)
  const skipToPostSession = () => {
    // Generate an ID for the session
    const sessionId = Date.now();
    
    // Create a simple mock session for demo with challenge support
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
    } = {
      id: sessionId,
      date: new Date().toISOString(),
      duration: 30, // Mock 30 seconds
      type: recordingType,
      cameraOn: cameraOn,
      recordingKey: `recording-${sessionId}`, // Include key for consistency
      hasRecording: false // Indicate there's no actual recording data
    };
    
    // Add challenge info if applicable
    if (challenge) {
      sessionData.challengeDay = challenge.day;
      sessionData.challengeTitle = challenge.title;
      
      // Mark challenge as completed for demo purposes if desired
      // if (!isCurrentChallengeCompleted) {
      //   completeChallenge(challenge.day);
      // }
    }
    
    // Store in local storage
    const sessions = JSON.parse(localStorage.getItem('practice-sessions') || '[]');
    sessions.push(sessionData);
    localStorage.setItem('practice-sessions', JSON.stringify(sessions));
    
    navigate(`/post-session?sessionId=${sessionData.id}`);
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
              <Button variant="outline" onClick={skipToPostSession}>
                Skip to Feedback (Demo)
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
        
        {/* Demo-only shortcut */}
        <div className="text-center mt-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-muted-foreground"
            onClick={skipToPostSession}
          >
            <FastForward className="h-3 w-3 mr-1" />
            Skip to feedback (demo)
          </Button>
        </div>
        
        {/* Challenge info or free mode info */}
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
              
              {!isCurrentChallengeCompleted && !isRecording && recordedBlob && (
                <Button 
                  onClick={() => challengeDay && completeChallenge(challengeDay)}
                  className="w-full mt-2 bg-green-500 hover:bg-green-600"
                  disabled={isCompleting}
                >
                  {isCompleting ? 'Marking as Complete...' : 'Mark Challenge as Complete'}
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center mb-2 text-muted-foreground">Free talking mode</div>
          )}
          
          <div className="text-xs bg-gray-100 p-2 rounded-md text-center">
            After recording, you'll be taken to a review screen where you can download your video. 
            Your video stays on your device and is not uploaded anywhere.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recording;