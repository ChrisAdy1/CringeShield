import { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { MicIcon, VideoIcon, StopCircleIcon, RefreshCwIcon } from 'lucide-react';
import { FaceFilter } from './FaceFilter';

interface VideoRecorderProps {
  filterType: string;
  onRecordingComplete: (blob: Blob) => void;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({
  filterType,
  onRecordingComplete,
  isRecording,
  onStartRecording,
  onStopRecording
}) => {
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [error, setError] = useState<string | null>(null);

  // Request camera permission
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(() => setCameraPermission('granted'))
      .catch((err) => {
        console.error('Error accessing camera:', err);
        setCameraPermission('denied');
        setError('Camera access denied. Please enable camera permissions to use this feature.');
      });
  }, []);

  // Handle capturing video
  const handleDataAvailable = useCallback(
    ({ data }: BlobEvent) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => [...prev, data]);
      }
    },
    []
  );

  // Complete recording and pass the blob
  useEffect(() => {
    if (recordedChunks.length > 0 && !isRecording) {
      const blob = new Blob(recordedChunks, {
        type: 'video/webm'
      });
      onRecordingComplete(blob);
      setRecordedChunks([]);
    }
  }, [recordedChunks, isRecording, onRecordingComplete]);

  const handleStartRecording = useCallback(() => {
    setRecordedChunks([]);
    
    if (webcamRef.current && webcamRef.current.stream) {
      mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
        mimeType: 'video/webm'
      });
      mediaRecorderRef.current.addEventListener('dataavailable', handleDataAvailable);
      mediaRecorderRef.current.start();
      onStartRecording();
    } else {
      setError('Camera not available. Please check your camera permissions.');
    }
  }, [handleDataAvailable, onStartRecording]);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      onStopRecording();
    }
  }, [onStopRecording]);

  if (cameraPermission === 'denied') {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-6 text-center">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">Camera Access Required</h3>
        <p className="text-gray-600 mb-4">
          Please enable camera access in your browser settings to use the video recording feature.
        </p>
        <Button
          onClick={() => navigator.mediaDevices.getUserMedia({video: true, audio: true})
            .then(() => setCameraPermission('granted'))
            .catch(() => setError('Camera permission is still denied.'))
          }
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-500">
        {error}
        <Button variant="outline" size="sm" className="mt-2" onClick={() => setError(null)}>
          <RefreshCwIcon className="h-4 w-4 mr-1" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg">
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <Webcam
          audio={true}
          ref={webcamRef}
          muted={true}
          className="w-full h-full object-cover"
        />
        <FaceFilter filterType={filterType} webcamRef={webcamRef} />
      </div>
      
      <div className="flex justify-center mt-4 space-x-3">
        {!isRecording ? (
          <Button onClick={handleStartRecording} className="flex items-center">
            <VideoIcon className="mr-2 h-4 w-4" />
            Start Recording
          </Button>
        ) : (
          <Button variant="destructive" onClick={handleStopRecording} className="flex items-center">
            <StopCircleIcon className="mr-2 h-4 w-4" />
            Stop Recording
          </Button>
        )}
      </div>
    </div>
  );
};

export default VideoRecorder;
