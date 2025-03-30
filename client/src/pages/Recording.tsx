import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Circle, Square, FastForward } from 'lucide-react';
import { useCustomScripts } from '@/hooks/useCustomScripts';
import { useUserPreferences } from '@/hooks/useUserPreferences';

const Recording: React.FC = () => {
  const [, navigate] = useLocation();
  const [, params] = useRoute('/recording');
  const queryParams = new URLSearchParams(window.location.search);
  
  // Get parameters from URL
  const recordingType = queryParams.get('type') || 'free';
  const promptId = queryParams.get('id');
  const promptText = queryParams.get('text') || '';
  
  // Camera ref
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  
  // Timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get custom script if needed
  const { getScriptById } = useCustomScripts();
  const script = recordingType === 'script' && promptId 
    ? getScriptById(promptId) 
    : null;
  
  // Teleprompter state
  const [showTeleprompter, setShowTeleprompter] = useState(true);
  const { preferences } = useUserPreferences();
  
  // Set up camera
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
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
    if (!videoRef.current || !videoRef.current.srcObject) return;
    
    chunksRef.current = [];
    const stream = videoRef.current.srcObject as MediaStream;
    
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
    };
    
    // Start the recorder
    mediaRecorder.start();
    setIsRecording(true);
    
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
      const sessionData = {
        id: Date.now(),
        date: new Date().toISOString(),
        duration: recordingTime,
        type: recordingType,
        promptId: promptId || undefined,
        promptText: promptText || (script ? script.text : ''),
        recordingUrl: URL.createObjectURL(chunksRef.current[0]), // This is temporary and won't persist
      };
      
      // Store in local storage
      const sessions = JSON.parse(localStorage.getItem('practice-sessions') || '[]');
      sessions.push(sessionData);
      localStorage.setItem('practice-sessions', JSON.stringify(sessions));
      
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
    // Create a simple mock session for demo
    const sessionData = {
      id: Date.now(),
      date: new Date().toISOString(),
      duration: 30, // Mock 30 seconds
      type: recordingType,
      promptId: promptId || undefined,
      promptText: promptText || (script ? script.text : ''),
    };
    
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/prompts')}>
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
          onClick={() => setShowTeleprompter(!showTeleprompter)}
          className={recordingType === 'free' ? 'invisible' : ''}
        >
          {showTeleprompter ? 'Hide Text' : 'Show Text'}
        </Button>
      </div>
      
      {/* Camera view */}
      <div className="flex-1 relative">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover"
        />
        
        {/* Teleprompter overlay */}
        {showTeleprompter && recordingType !== 'free' && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4 text-white max-h-[30%] overflow-y-auto">
            <p className="text-lg leading-relaxed">
              {recordingType === 'script' && script 
                ? script.text 
                : promptText}
            </p>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="p-4 bg-background">
        <div className="flex justify-center items-center space-x-4">
          {isRecording ? (
            <Button
              variant="destructive"
              size="lg"
              className="rounded-full h-14 w-14 flex items-center justify-center"
              onClick={stopRecording}
            >
              <Square className="h-6 w-6" />
            </Button>
          ) : (
            <Button
              size="lg"
              className="rounded-full h-14 w-14 flex items-center justify-center bg-red-500 hover:bg-red-600"
              onClick={startRecording}
            >
              <Circle className="h-6 w-6" fill="currentColor" />
            </Button>
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
        
        {/* Info on bottom */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {recordingType === 'prompt' && "Speaking from prompt"}
          {recordingType === 'script' && "Reading from script"}
          {recordingType === 'free' && "Free talking mode"}
        </div>
      </div>
    </div>
  );
};

export default Recording;