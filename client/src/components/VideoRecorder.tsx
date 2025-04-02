import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Video, StopCircle, Camera, MicIcon, RefreshCw, Computer } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function VideoRecorder({ 
  onRecordingComplete,
  autoDownload = false,
  showMockModeToggle = false  // Default to hide mock mode UI
}: {
  onRecordingComplete?: (blob: Blob) => void;
  autoDownload?: boolean;
  showMockModeToggle?: boolean;  // Control whether to show the mock mode toggle
}) {
  // Setting for mock mode (for testing in environments where camera access consistently fails)
  const [mockMode, setMockMode] = useState(false);
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

  // Mock recording (when camera access is restricted in environment)
  const startMockRecording = () => {
    setCameraError(null);
    setLoading(true);
    recordedChunks.current = [];
    
    // Simulate loading
    setTimeout(() => {
      setLoading(false);

      // Create a canvas for generating a visual mock video
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        
        // Create a mock stream for the video element
        if (ctx) {
          // Draw a simple placeholder
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.font = '24px Arial';
          ctx.fillStyle = '#333';
          ctx.textAlign = 'center';
          ctx.fillText('Mock Recording Mode', canvas.width / 2, canvas.height / 2 - 20);
          ctx.fillText('No actual camera access', canvas.width / 2, canvas.height / 2 + 20);
          
          // Try to use the captureStream API to create a mock video stream
          try {
            const mockStream = canvas.captureStream(30);
            
            if (videoRef.current) {
              videoRef.current.srcObject = mockStream;
            }
            
            setStream(mockStream);
            setRecording(true);
          } catch (err) {
            console.warn('Canvas.captureStream not supported, falling back to audio-only mode', err);
            setAudioOnly(true);
            setStream({} as MediaStream);
            setRecording(true);
          }
        } else {
          // Fallback if canvas context fails
          setAudioOnly(true);
          setStream({} as MediaStream);
          setRecording(true);
        }
      } catch (err) {
        // Final fallback
        console.warn('Canvas operations failed, using basic mock mode', err);
        setAudioOnly(true);
        setStream({} as MediaStream);
        setRecording(true);
      }

      // Start recording timer in all cases
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }, 1000);
  }
  
  const stopMockRecording = () => {
    // Clear timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    // Clean up any mock streams
    if (videoRef.current && videoRef.current.srcObject) {
      try {
        const mockStream = videoRef.current.srcObject as MediaStream;
        if (mockStream && mockStream.getTracks) {
          mockStream.getTracks().forEach(track => {
            if (track && track.stop) track.stop();
          });
        }
        videoRef.current.srcObject = null;
      } catch (err) {
        console.warn('Error cleaning up mock stream', err);
      }
    }
    
    // Create a mock video blob that's more realistic than plain text
    // We generate a small WebM file with a minimal header
    try {
      // WebM minimal header (20 bytes)
      const webmHeader = new Uint8Array([
        0x1a, 0x45, 0xdf, 0xa3, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
      ]);
      
      // Create a blob that's a valid WebM file (minimal but valid)
      const blob = new Blob([webmHeader], { type: 'video/webm' });
      
      // Call the callback with the mock blob
      if (onRecordingComplete) {
        onRecordingComplete(blob);
      }
      
      // Auto-download if enabled
      if (autoDownload) {
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        
        const a = document.createElement("a");
        a.href = url;
        a.download = `cringeshield-mock-${timestamp}.webm`;
        a.click();
        
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.warn('Error creating mock WebM blob, falling back to text blob', err);
      
      // Fallback to a simple text blob if the binary approach fails
      const textBlob = new Blob(['mock recording data'], { type: 'text/plain' });
      
      if (onRecordingComplete) {
        onRecordingComplete(textBlob);
      }
      
      if (autoDownload) {
        const url = URL.createObjectURL(textBlob);
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        
        const a = document.createElement("a");
        a.href = url;
        a.download = `cringeshield-mock-${timestamp}.txt`;
        a.click();
        
        URL.revokeObjectURL(url);
      }
    }
    
    setRecording(false);
    setStream(null);
    setAudioOnly(false);
  }
  
  const startRecording = async () => {
    // If mock mode is enabled, use the mock implementation
    if (mockMode) {
      startMockRecording();
      return;
    }
  
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
    // If in mock mode, use the mock stop implementation
    if (mockMode) {
      stopMockRecording();
      return;
    }
    
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
      
      {/* Mock mode switch for development/testing - only shown when explicitly enabled */}
      {showMockModeToggle && (
        <>
          <div className="mt-6 flex items-center gap-2">
            <div className="flex items-center space-x-2">
              <Switch 
                id="mock-mode" 
                checked={mockMode}
                onCheckedChange={setMockMode} 
              />
              <Label htmlFor="mock-mode" className="flex items-center gap-1">
                <Computer className="h-4 w-4" /> 
                <span>Mock Mode</span>
              </Label>
            </div>
            <p className="text-xs text-gray-500 ml-2">
              (Use when camera access is restricted)
            </p>
          </div>
          
          {/* Mock mode UI indicator */}
          {mockMode && (
            <div className="mt-2 w-full">
              <Alert variant="default" className="bg-blue-50 border-blue-200">
                <Computer className="h-4 w-4 mr-2 text-blue-500" />
                <AlertTitle className="text-blue-700">Mock Mode Enabled</AlertTitle>
                <AlertDescription className="text-blue-600">
                  Camera access is simulated. No real camera or microphone will be used.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </>
      )}
    </div>
  );
}