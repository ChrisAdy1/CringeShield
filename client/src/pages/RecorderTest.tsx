import { useState } from "react";
import VideoRecorder from "@/components/VideoRecorder";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileVideo } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RecorderTest() {
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRecordingComplete = (blob: Blob) => {
    setRecordedBlob(blob);
    
    // Create URL for preview
    const url = URL.createObjectURL(blob);
    setRecordedUrl(url);
    
    toast({
      title: "Recording complete",
      description: `Video recorded (${(blob.size / (1024 * 1024)).toFixed(2)} MB)`,
    });
  };

  const handleDownload = () => {
    if (!recordedBlob) return;
    
    const url = recordedUrl || URL.createObjectURL(recordedBlob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `cringeshield-recording-${timestamp}.webm`;
    a.click();
    
    if (!recordedUrl) {
      URL.revokeObjectURL(url);
    }
    
    toast({
      title: "Download started",
      description: "Your recording is being downloaded",
    });
  };

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <h1 className="text-2xl font-bold mb-6">Video Recorder Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Record Video</CardTitle>
            <CardDescription>
              Click Start Recording to begin. Camera and microphone access will be requested.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VideoRecorder onRecordingComplete={handleRecordingComplete} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              {recordedBlob 
                ? `Recording complete (${(recordedBlob.size / (1024 * 1024)).toFixed(2)} MB)` 
                : "No recording available yet. Record a video first."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recordedUrl ? (
              <div className="space-y-4">
                <video 
                  src={recordedUrl} 
                  controls 
                  className="w-full rounded-lg"
                />
                <Button 
                  onClick={handleDownload}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" /> Download Recording
                </Button>
              </div>
            ) : (
              <div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center">
                <FileVideo className="h-16 w-16 text-gray-300" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}