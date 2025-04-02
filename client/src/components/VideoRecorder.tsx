import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Video, StopCircle } from "lucide-react";

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
  };

  // Effect to clean up resources when component unmounts
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, []);

  const startRecording = async () => {
    // Reset recorded chunks
    recordedChunks.current = [];
    setLoading(true);
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setStream(mediaStream);

      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: "video/webm",
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (recordedChunks.current.length === 0) return;
        
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
      };

      // Start recording and timer
      mediaRecorder.start(1000); // Collect data every second
      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);
      setLoading(false);
      
      // Start the timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error("Camera access error:", err);
      setLoading(false);
      // Could add UI error notification here
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
    <div className="flex flex-col items-center">
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
          <div className="absolute inset-0 flex items-center justify-center">
            <Video className="w-16 h-16 text-gray-400" />
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