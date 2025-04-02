import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import VideoRecorder from "@/components/VideoRecorder";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function RecorderTest() {
  const [, navigate] = useLocation();
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Handle when a recording is completed
  const handleRecordingComplete = (blob: Blob) => {
    setRecordedVideo(blob);
    
    // Create URL for video playback
    const url = URL.createObjectURL(blob);
    setVideoUrl(url);
    
    // Set the video source
    if (videoRef.current) {
      videoRef.current.src = url;
    }
  };
  
  // Handle downloading the recorded video
  const handleDownload = () => {
    if (!recordedVideo) return;
    
    const url = URL.createObjectURL(recordedVideo);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const a = document.createElement("a");
    a.href = url;
    a.download = `cringeshield-test-${timestamp}.webm`;
    a.click();
    
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="container py-6 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Video Recorder Test</h1>
      </div>

      <Tabs defaultValue="record" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="record">Record</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="record">
          <Card>
            <CardHeader>
              <CardTitle>Recorder Component</CardTitle>
              <CardDescription>
                Test the video recorder component with enhanced error handling and resource management.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VideoRecorder onRecordingComplete={handleRecordingComplete} />
              
              <div className="mt-4 text-sm text-gray-500">
                <h3 className="font-medium text-gray-700">Features being tested:</h3>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Camera/microphone resources properly released</li>
                  <li>Recording timer and visual indicators</li>
                  <li>Error handling with helpful messages</li>
                  <li>Proper cleanup on unmount</li>
                  <li>Recording callback with blob data</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Recording Preview</CardTitle>
              <CardDescription>
                Watch and download your test recording.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {videoUrl ? (
                <div className="flex flex-col items-center">
                  <div className="w-full max-w-lg overflow-hidden rounded-lg bg-gray-100 aspect-video">
                    <video 
                      ref={videoRef} 
                      controls 
                      className="w-full h-full" 
                    />
                  </div>
                  
                  <Button 
                    onClick={handleDownload} 
                    className="mt-4 bg-primary text-white"
                  >
                    Download Recording
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No recording available yet.</p>
                  <p className="mt-2 text-sm">Record a video in the "Record" tab first.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}