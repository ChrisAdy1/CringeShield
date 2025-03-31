import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Play, Repeat, Home, Download, CheckCircle, Loader2 } from 'lucide-react';
import { useBadges } from '@/hooks/useBadges';
import { useSelfReflections } from '@/hooks/useSelfReflections';
import { SelfReflectionRating } from '@/lib/types';

const PostSession: React.FC = () => {
  const [, navigate] = useLocation();
  const queryParams = new URLSearchParams(window.location.search);
  const sessionId = queryParams.get('sessionId');
  
  const [session, setSession] = useState<any>(null);
  const [note, setNote] = useState('');
  const [rating, setRating] = useState<SelfReflectionRating | null>(null);
  const [isSavingCompletion, setIsSavingCompletion] = useState(false);
  const [completionSaved, setCompletionSaved] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const { badges, checkSessionForBadges } = useBadges();
  const { addReflection } = useSelfReflections();
  const [earnedBadge, setEarnedBadge] = useState<string | null>(null);
  
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
      } else {
        navigate('/'); // Session not found, go back home
      }
    }
  }, [sessionId, navigate, checkSessionForBadges]);
  
  // Save prompt completion to database
  const savePromptCompletion = async () => {
    // Only attempt to save if user is logged in and prompt has an ID
    if (user && session && session.promptId) {
      // Don't save for free-talking mode (no prompt)
      if (session.type !== 'prompt') {
        return;
      }
      
      try {
        setIsSavingCompletion(true);
        const response = await fetch('/api/prompt-completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            promptId: parseInt(session.promptId),
            cameraOn: true // We could make this dynamic later
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
  
  // Get recording data from localStorage when session loads
  useEffect(() => {
    if (session && session.recordingKey) {
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
  
  // Handle downloading the recording
  const handleDownloadRecording = () => {
    if (recordingUrl) {
      const date = new Date().toISOString().slice(0, 10);
      const filename = `cringe-shield-recording-${date}.webm`;
      
      // Create temporary anchor element for download
      const a = document.createElement('a');
      a.href = recordingUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };
  
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
        
        {/* Badge earned */}
        {earnedBadge && (
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
        
        {/* Prompt completion status for logged-in users */}
        {user && session && session.type === 'prompt' && session.promptId && (
          <Card className="mb-6">
            <CardContent className="p-4">
              {isSavingCompletion ? (
                <div className="flex items-center justify-center py-2">
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
                Your recording is ready! You can download it to your device.
              </p>
              <Button 
                variant="default" 
                onClick={handleDownloadRecording}
                className="mt-2 bg-green-600 hover:bg-green-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Recording
              </Button>
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

// Helper functions
function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
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

export default PostSession;