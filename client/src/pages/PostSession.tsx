import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Play, Repeat, Home, Download, CheckCircle, Loader2, Save, Smartphone } from 'lucide-react';
import { useBadges } from '@/hooks/useBadges';
import { useSelfReflections } from '@/hooks/useSelfReflections';
import { SelfReflectionRating } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getBadgeByPromptId } from '@/lib/promptBadges';

// Helper functions
function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function formatTierName(tierName: string): string {
  return tierName.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getBadgeDescription(badgeName: string) {
  const descriptions: Record<string, string> = {
    'First Step': 'Completed your first practice session!',
    'Smooth Reader': 'Successfully used a script in your practice.',
    'Free Spirit': 'Practiced without a script or prompt.',
    'Bounce Back': 'Retried a session - showing real dedication!',
    'Reflector': 'Added thoughtful self-reflection to your practice.',
    'Regular': 'Completed 5 practice sessions.',
    'Dedicated': 'Completed 10 practice sessions.',
    'Master': 'Completed 25 practice sessions.',
  };
  
  return descriptions[badgeName] || 'You earned a special achievement!';
}

const PostSession: React.FC = () => {
  const [, navigate] = useLocation();
  const queryParams = new URLSearchParams(window.location.search);
  const sessionId = queryParams.get('sessionId');
  const { toast } = useToast();
  
  const [session, setSession] = useState<any>(null);
  const [note, setNote] = useState('');
  const [rating, setRating] = useState<SelfReflectionRating | null>(null);
  const [isSavingCompletion, setIsSavingCompletion] = useState(false);
  const [completionSaved, setCompletionSaved] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const { addReflection } = useSelfReflections();
  const [earnedBadge, setEarnedBadge] = useState<string | null>(null);
  // Only use badges if user is logged in
  const { checkSessionForBadges } = useBadges();
  
  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/current-user');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error checking current user:', error);
      }
    };
    
    fetchCurrentUser();
  }, []);
  
  // Load session data
  useEffect(() => {
    if (sessionId) {
      const sessions = JSON.parse(localStorage.getItem('practice-sessions') || '[]');
      const foundSession = sessions.find((s: any) => s.id.toString() === sessionId);
      
      if (foundSession) {
        setSession(foundSession);
        
        // Only check for badges if user is logged in
        if (user) {
          // Check if this session earned any badges
          const userData = {
            totalSessions: sessions.length,
          };
          
          const sessionDetails = {
            scriptUsed: foundSession.type === 'script',
            mode: foundSession.type,
          };
          
          // Check for any newly earned badges
          const newBadge = checkSessionForBadges(sessionDetails, userData);
          if (newBadge) {
            setEarnedBadge(newBadge);
          }
        }
      } else {
        navigate('/'); // Session not found, go back home
      }
    }
  }, [sessionId, navigate, checkSessionForBadges, user]);
  
  // Save prompt completion to database
  const savePromptCompletion = async () => {
    // Only attempt to save if user is logged in 
    if (user && session) {
      // Handle regular prompts
      if (session.type === 'prompt' && session.promptId) {
        try {
          setIsSavingCompletion(true);
          const response = await fetch('/api/prompt-completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              promptId: parseInt(session.promptId),
              cameraOn: session.cameraOn ?? true
            }),
          });
          
          if (response.ok) {
            setCompletionSaved(true);
          } else {
            console.error('Failed to save prompt completion');
          }
        } catch (error) {
          console.error('Error saving prompt completion:', error);
        } finally {
          setIsSavingCompletion(false);
        }
        return;
      }
      
      // Handle weekly challenge prompts
      if (session.weeklyPromptId) {
        try {
          setIsSavingCompletion(true);
          const response = await fetch('/api/weekly-challenge/complete-prompt', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              promptId: session.weeklyPromptId
            }),
          });
          
          if (response.ok) {
            setCompletionSaved(true);
          } else {
            console.error('Failed to save weekly challenge completion');
          }
        } catch (error) {
          console.error('Error saving weekly challenge completion:', error);
        } finally {
          setIsSavingCompletion(false);
        }
      }
    }
  };
  
  // When session and user data are both loaded, save the completion
  useEffect(() => {
    if (session && user && session.type === 'prompt' && !completionSaved) {
      savePromptCompletion();
    }
  }, [session, user]);
  
  // Handle saving reflection
  const handleSaveReflection = () => {
    if (rating) {
      addReflection(rating, note);
      
      // Update session with reflection
      if (session) {
        const sessions = JSON.parse(localStorage.getItem('practice-sessions') || '[]');
        const updatedSessions = sessions.map((s: any) => {
          if (s.id.toString() === sessionId) {
            return {
              ...s,
              selfReflectionRating: rating,
              note: note,
            };
          }
          return s;
        });
        
        localStorage.setItem('practice-sessions', JSON.stringify(updatedSessions));
      }
      
      navigate('/');
    }
  };
  
  // Create URL from base64 data
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isAutoDownloadAttempted, setIsAutoDownloadAttempted] = useState(false);
  
  // Get recording data from localStorage when session loads
  useEffect(() => {
    if (session && session.recordingKey) {
      // First try to get the Blob URL for better performance
      const savedBlobUrl = localStorage.getItem(`recording-url-${session.id}`);
      if (savedBlobUrl) {
        setBlobUrl(savedBlobUrl);
      }
      
      // Also get base64 data as a fallback
      const recordingData = localStorage.getItem(session.recordingKey);
      if (recordingData) {
        // For data URLs, we can just use them directly
        try {
          setRecordingUrl(recordingData);
        } catch (err) {
          console.error('Error setting recording URL:', err);
        }
      }
    }
  }, [session]);
  
  // Handle downloading the recording - prioritize Blob URL for better performance
  const handleDownloadRecording = () => {
    if (blobUrl) {
      downloadWithUrl(blobUrl);
    } else if (recordingUrl) {
      downloadWithUrl(recordingUrl);
    } else {
      toast({
        title: "Download Failed",
        description: "Unable to download the recording. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Helper function to download with URL
  const downloadWithUrl = (url: string) => {
    const date = new Date().toISOString().slice(0, 10);
    const filename = `cringe-shield-recording-${date}.webm`;
    
    try {
      // Handle potentially large files by using browser-native fetch when possible
      // For Blob URLs this works more reliably than direct download for large files
      if (url.startsWith('blob:')) {
        toast({
          title: "Preparing Download",
          description: "Your recording is being prepared for download...",
          duration: 3000
        });
        
        // Create temporary anchor element for download
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // For data URLs, make sure we use the best method to handle large files
        fetch(url)
          .then(res => res.blob())
          .then(blob => {
            const objectUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Revoke the URL to free memory
            setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
          })
          .catch(err => {
            console.error('Error downloading via fetch:', err);
            // Fallback to direct download
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          });
      }
      
      toast({
        title: "Download Started",
        description: "Your recording is being saved to your device.",
        duration: 3000
      });
    } catch (err) {
      console.error('Error in download function:', err);
      toast({
        title: "Download Error",
        description: "There was a problem downloading your recording. Try using your browser's download button on the video.",
        variant: "destructive",
        duration: 5000
      });
    }
  };
  
  // Function to detect if the user is on a mobile device
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };
  
  // Handle saving to camera roll for mobile devices
  const handleSaveToCameraRoll = async () => {
    try {
      // Use blobUrl as the preferred source, with recordingUrl as fallback
      const url = blobUrl || recordingUrl;
      if (!url) return;
      
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isAndroid = /Android/i.test(navigator.userAgent);
      
      if (isIOS || isAndroid) {
        // For devices that support the Web Share API
        if (navigator.share) {
          try {
            const blob = await fetch(url).then(r => r.blob());
            const file = new File([blob], "cringe-shield-recording.webm", { type: "video/webm" });
            
            await navigator.share({
              files: [file],
              title: 'CringeShield Recording',
              text: 'My speaking practice recording'
            });
            
            toast({
              title: "Success!",
              description: "Your recording has been shared. You can save it to your device from there.",
              duration: 3000
            });
            
            return;
          } catch (shareError) {
            console.error('Share API failed:', shareError);
            // Fall back to download if share fails
          }
        }
        
        // For Android and iOS, fall back to download
        handleDownloadRecording();
        
        // Show instructions for mobile users
        toast({
          title: "Download Complete",
          description: isIOS ? 
            "Find your recording in your Downloads folder. You can save it to your Camera Roll from there." :
            "Find your recording in your Downloads folder. You can move it to your Gallery from there.",
          duration: 6000
        });
      } else {
        // Non-mobile device - just use regular download
        handleDownloadRecording();
      }
    } catch (error) {
      console.error('Error saving to camera roll:', error);
      // Fall back to regular download
      handleDownloadRecording();
      
      toast({
        title: "Download Started",
        description: "Your recording is downloading. You may need to manually save it to your device.",
        duration: 4000
      });
    }
  };
  
  // Auto-save prompt for mobile devices
  useEffect(() => {
    if (!isAutoDownloadAttempted && (blobUrl || recordingUrl) && session && session.hasRecording) {
      setIsAutoDownloadAttempted(true);
      
      // For mobile users, show a toast with download instructions
      if (isMobileDevice()) {
        toast({
          title: "Recording Ready",
          description: "Your video is ready! Use the 'Save to Device' button to download it.",
          duration: 6000
        });
      }
    }
  }, [blobUrl, recordingUrl, session, isAutoDownloadAttempted]);
  
  // Handle retry
  const handleRetry = () => {
    if (session) {
      let url = '/recording?type=';
      
      if (session.type === 'prompt') {
        url += `prompt&id=${session.promptId || ''}&text=${encodeURIComponent(session.promptText || '')}`;
      } else if (session.type === 'script') {
        url += `script&id=${session.promptId || ''}`;
      } else {
        url += 'free';
      }
      
      navigate(url);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Nice work!</h1>
          <p className="text-muted-foreground">
            You completed a {session?.duration ? formatDuration(session.duration) : '0:00'} practice session
          </p>
        </div>
        
        {/* Badge earned - only show for logged in users */}
        {user && session && session.type === 'prompt' && session.promptId && completionSaved && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="p-4 text-center">
              {(() => {
                const badgeInfo = getBadgeByPromptId(parseInt(session.promptId));
                return badgeInfo ? (
                  <>
                    <div className="mb-2 text-3xl">{badgeInfo.icon}</div>
                    <h2 className="font-semibold text-lg mb-1">Badge Unlocked!</h2>
                    <Badge 
                      variant="outline"
                      className="bg-primary/20 border-primary/30 mb-2"
                    >
                      {badgeInfo.title}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {badgeInfo.description}
                    </p>
                  </>
                ) : null;
              })()}
            </CardContent>
          </Card>
        )}
        
        {/* Legacy achievement badge - only show for logged in users */}
        {user && earnedBadge && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="p-4 text-center">
              <div className="mb-2 text-xl">🏆</div>
              <h2 className="font-semibold text-lg mb-1">Achievement Unlocked!</h2>
              <Badge 
                variant="outline"
                className="bg-primary/20 border-primary/30 mb-2"
              >
                {earnedBadge}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {getBadgeDescription(earnedBadge)}
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Prompt display and completion status */}
        {session && (session.type === 'prompt' || session.weeklyPromptId) && (
          <Card className="mb-6">
            <CardContent className="p-4">
              {/* For regular prompts */}
              {session.type === 'prompt' && session.promptId && (
                <div className="mb-2">
                  <h3 className="font-medium">Prompt</h3>
                  <p className="text-sm text-muted-foreground">{session.promptText}</p>
                </div>
              )}
              
              {/* For weekly challenge prompts */}
              {session.weeklyPromptId && (
                <div className="mb-2">
                  <h3 className="font-medium">Weekly Challenge</h3>
                  {session.weeklyPromptTitle && (
                    <p className="text-sm font-medium">{session.weeklyPromptTitle}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{session.weeklyPromptText}</p>
                  {session.weeklyPromptTier && (
                    <Badge variant="outline" className="mt-1">
                      {formatTierName(session.weeklyPromptTier)}
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Progress indicator */}
              {user && (session.promptId || session.weeklyPromptId) && (
                <div className="mt-3 pt-3 border-t">
                  {isSavingCompletion ? (
                    <div className="flex items-center py-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                      <span>Saving progress...</span>
                    </div>
                  ) : completionSaved ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <div>
                        <p className="font-medium">Progress saved!</p>
                        <p className="text-sm text-muted-foreground">This prompt is now marked as completed</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <p className="text-sm">
                        {user ? 'Saving your progress...' : 'Log in to track your progress'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Self reflection */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h2 className="font-medium mb-3">How did that feel?</h2>
            
            {/* Rating buttons */}
            <div className="flex justify-between mb-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={rating === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRating(value as SelfReflectionRating)}
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                >
                  {value}
                </Button>
              ))}
            </div>
            
            {/* Rating labels */}
            <div className="flex justify-between text-xs text-muted-foreground mb-4">
              <span>Very nervous</span>
              <span>Confident</span>
            </div>
            
            {/* Optional note */}
            <Textarea
              placeholder="Add optional notes about this session..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mb-4"
              rows={3}
            />
            
            <Button
              className="w-full"
              disabled={!rating}
              onClick={handleSaveReflection}
            >
              Save & Continue
            </Button>
          </CardContent>
        </Card>
        
        {/* Recording preview and download */}
        {recordingUrl && (
          <Card className="mb-4 border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              {/* Video preview embedded */}
              <div className="mb-3 bg-black rounded-md overflow-hidden">
                <video 
                  src={recordingUrl} 
                  controls 
                  className="max-w-full mx-auto"
                />
              </div>
              <p className="text-sm mb-1">
                Your recording is ready! {isMobileDevice() ? 'Save it to your camera roll:' : 'Download it to your device:'}
              </p>
              {isMobileDevice() ? (
                <div className="flex flex-col gap-2 mt-2">
                  <Button 
                    variant="default" 
                    onClick={handleSaveToCameraRoll}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Smartphone className="mr-2 h-4 w-4" />
                    Save to Camera Roll
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleDownloadRecording}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Instead
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="default" 
                  onClick={handleDownloadRecording}
                  className="mt-2 bg-green-600 hover:bg-green-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Recording
                </Button>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Action buttons */}
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex-1 flex items-center justify-center"
            onClick={handleRetry}
          >
            <Repeat className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 flex items-center justify-center"
            onClick={() => navigate('/')}
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostSession;