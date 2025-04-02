import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Video, StopCircle, Camera, MicIcon, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function VideoRecorder({ 
  onRecordingComplete,
  autoDownload = false
}: {
  onRecordingComplete?: (blob: Blob) => void;
  autoDownload?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [audioOnly, setAudioOnly] = useState(false);
  const recordedChunks = useRef<BlobPart[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function to properly release all resources
  const cleanupResources = () => {
    // Stop any ongoing recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    // Stop and release all media tracks
    if (stream) {
      stream.getTracks().forEach(track => {
        if (track.readyState === 'live') {
          track.stop();
        }
      });
    }
    
    // Clear video element source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    // Stop the timer if it's running
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Reset state
    setStream(null);
    setRecording(false);
    setRecordingTime(0);
    setAudioOnly(false);
  };

  // Effect to clean up resources when component unmounts
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, []);

  const requestPermissions = async () => {
    // Reset state first
    setCameraError(null);
    setLoading(true);
    recordedChunks.current = [];
    
    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Your browser doesn't support camera access. Try using Chrome, Firefox, or Safari.");
        setLoading(false);
        return false;
      }
      
      // Check if we're in a secure context (https or localhost)
      if (!window.isSecureContext) {
        setCameraError("Camera access requires a secure connection (HTTPS). Try opening this site with https:// at the beginning.");
        setLoading(false);
        return false;
      }
      
      // First try to just get permission with low constraints for maximum compatibility
      await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        },
        audio: true,
      });
      
      // If we got here, permissions were granted
      setLoading(false);
      return true;
    } catch (err: any) {
      console.error("Permission error:", err);
      
      // Set appropriate error message
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera or microphone access was denied. Please check your browser permissions and try again.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera or microphone found. Please check your device connections.');
      } else if (err.name === 'NotReadableError') {
        setCameraError('Camera or microphone is already in use by another application. Please close other applications and try again.');
      } else if (err.name === 'AbortError') {
        setCameraError('Camera initialization was aborted. Please try again or reload the page.');
      } else if (err.name === 'NotSupportedError') {
        setCameraError('Your browser doesn\'t support the requested camera features. Try using Chrome or Firefox.');
      } else if (err.name === 'OverconstrainedError') {
        setCameraError('Camera constraints cannot be satisfied. Try on a device with a different camera.');
      } else if (err.name === 'SecurityError') {
        setCameraError('Camera access blocked due to security restrictions. Try using HTTPS or check site permissions.');
      } else {
        setCameraError('Unable to access camera or microphone. Please make sure permissions are granted and try again.');
      }
      
      setLoading(false);
      return false;
    }
  };

  const startRecording = async () => {
    // Reset error state
    setCameraError(null);
    // Reset recorded chunks
    recordedChunks.current = [];
    setLoading(true);
    
    try {
      // Try to get permissions first
      const permissionsGranted = await requestPermissions();
      if (!permissionsGranted) {
        return;
      }
      
      // Now actually get the stream - use the same constraints that worked during permission check
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        },
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setStream(mediaStream);

      // Try to initialize MediaRecorder with different options
      try {
        const mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/webm;codecs=vp8,opus'
        });
        mediaRecorderRef.current = mediaRecorder;
      } catch (e) {
        console.warn('MediaRecorder with specified options not supported, trying fallback', e);
        try {
          // Try a simpler configuration as fallback
          const mediaRecorder = new MediaRecorder(mediaStream);
          mediaRecorderRef.current = mediaRecorder;
        } catch (fallbackErr) {
          console.error('MediaRecorder not supported in this browser', fallbackErr);
          setCameraError('Recording is not supported in this browser. Try a different browser or device.');
          // Make sure to stop all tracks if there's an error
          mediaStream.getTracks().forEach(track => track.stop());
          setLoading(false);
          return;
        }
      }

      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder) {
        setCameraError('Failed to initialize recorder. Please try again.');
        mediaStream.getTracks().forEach(track => track.stop());
        setLoading(false);
        return;
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (recordedChunks.current.length === 0) {
          setCameraError('No video data was captured. Please try again.');
          return;
        }
        
        try {
          const blob = new Blob(recordedChunks.current, {
            type: "video/webm",
          });

          // Call the callback if provided
          if (onRecordingComplete) {
            onRecordingComplete(blob);
          }

          // Auto-download if enabled
          if (autoDownload) {
            const url = URL.createObjectURL(blob);
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            
            const a = document.createElement("a");
            a.href = url;
            a.download = `cringeshield-recording-${timestamp}.webm`;
            a.click();

            URL.revokeObjectURL(url);
          }
        } catch (err) {
          console.error('Error creating blob:', err);
          setCameraError('Failed to process recording. Please try again.');
        }
      };

      // Start recording and timer
      mediaRecorder.start(1000); // Collect data every second
      setRecording(true);
      setLoading(false);
      
      // Start the timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error("Camera access error:", err);
      setLoading(false);
      setCameraError('Unable to access camera or microphone. Please make sure permissions are granted and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    
    // Stop tracks individually
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    // Clear the timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    setRecording(false);
    setStream(null);
  };

  // Format seconds into MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center w-full">
      {cameraError ? (
        <div className="w-full mb-4">
          <Alert variant="destructive">
            <Camera className="h-4 w-4 mr-2" />
            <AlertTitle>Camera Access Error</AlertTitle>
            <AlertDescription>{cameraError}</AlertDescription>
          </Alert>
          <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
            <Button 
              onClick={() => {
                setCameraError(null);
                startRecording();
              }}
              className="bg-primary text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
            
            {/* Allow audio-only fallback */}
            <Button 
              onClick={async () => {
                setCameraError(null);
                setLoading(true);
                
                try {
                  // Try audio-only mode
                  const audioStream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false
                  });
                  
                  if (videoRef.current) {
                    videoRef.current.srcObject = null;
                  }
                  
                  setStream(audioStream);
                  setAudioOnly(true);
                  
                  // Initialize recorder with audio only
                  const mediaRecorder = new MediaRecorder(audioStream);
                  mediaRecorderRef.current = mediaRecorder;
                  
                  // Setup data handlers
                  recordedChunks.current = [];
                  
                  mediaRecorder.ondataavailable = (event) => {
                    if (event.data && event.data.size > 0) {
                      recordedChunks.current.push(event.data);
                    }
                  };
                  
                  mediaRecorder.onstop = () => {
                    if (recordedChunks.current.length === 0) {
                      setCameraError('No audio data was captured. Please try again.');
                      return;
                    }
                    
                    try {
                      const blob = new Blob(recordedChunks.current, { type: "audio/webm" });
                      
                      // Call the callback if provided
                      if (onRecordingComplete) {
                        onRecordingComplete(blob);
                      }
                      
                      // Auto-download if enabled
                      if (autoDownload) {
                        const url = URL.createObjectURL(blob);
                        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
                        
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `cringeshield-audio-${timestamp}.webm`;
                        a.click();
                        
                        URL.revokeObjectURL(url);
                      }
                    } catch (err) {
                      console.error('Error creating blob:', err);
                      setCameraError('Failed to process recording. Please try again.');
                    }
                  };
                  
                  // Start recording
                  mediaRecorder.start(1000);
                  setRecording(true);
                  setLoading(false);
                  
                  // Start the timer
                  timerIntervalRef.current = setInterval(() => {
                    setRecordingTime(prev => prev + 1);
                  }, 1000);
                  
                } catch (err) {
                  console.error("Audio-only access error:", err);
                  setLoading(false);
                  setCameraError('Unable to access microphone. Please check your browser permissions.');
                }
              }}
              variant="outline"
            >
              <MicIcon className="mr-2 h-4 w-4" /> Audio Only Mode
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative w-full max-w-lg rounded-lg overflow-hidden bg-gray-100 aspect-video">
          {/* Video element */}
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline
            className={`w-full h-full object-cover ${!stream ? 'hidden' : ''}`} 
          />
          
          {/* Placeholder when no stream */}
          {!stream && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="mb-2 text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <MicIcon className="w-8 h-8 text-gray-400 mx-auto" />
              </div>
              <p className="text-sm text-gray-500 text-center max-w-xs">
                Click "Start Recording" to activate your camera and microphone
              </p>
            </div>
          )}
          
          {/* Audio-only mode indicator */}
          {audioOnly && stream && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
              <div className="p-4 bg-gray-200 rounded-full mb-4">
                <MicIcon className="w-16 h-16 text-primary" />
              </div>
              <p className="text-center font-medium">Audio Only Mode</p>
              <p className="text-sm text-gray-500 mt-2">Your microphone is active, but camera is disabled</p>
              {recording && (
                <div className="mt-4 flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2 animate-pulse" />
                  <span className="text-sm font-medium">Recording in progress</span>
                </div>
              )}
            </div>
          )}
          
          {/* Loading indicator */}
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="mt-2 text-gray-700">Accessing camera...</p>
            </div>
          )}
          
          {/* Recording indicator and timer */}
          {recording && (
            <div className="absolute top-4 right-4 flex items-center bg-black/40 text-white px-3 py-1 rounded-full">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2 animate-pulse" />
              <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4">
        {!recording ? (
          <Button 
            onClick={startRecording} 
            disabled={loading}
            className="bg-primary text-white"
            size="lg"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting Camera</>
            ) : (
              <><Video className="mr-2 h-4 w-4" /> Start Recording</>
            )}
          </Button>
        ) : (
          <Button 
            onClick={stopRecording} 
            variant="destructive"
            size="lg"
          >
            <StopCircle className="mr-2 h-4 w-4" /> Stop Recording
          </Button>
        )}
      </div>
    </div>
  );
}