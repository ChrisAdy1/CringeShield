import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Play, Repeat, Home } from 'lucide-react';
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
  
  const { badges, checkSessionForBadges } = useBadges();
  const { addReflection } = useSelfReflections();
  const [earnedBadge, setEarnedBadge] = useState<string | null>(null);
  
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
  
  // Handle watching the recording
  const handleWatchRecording = () => {
    // In a real app, this would open the recording playback
    if (session && session.recordingUrl) {
      window.open(session.recordingUrl, '_blank');
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
        
        {/* Action buttons */}
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex-1 flex items-center justify-center"
            onClick={handleWatchRecording}
            disabled={!session?.recordingUrl}
          >
            <Play className="mr-2 h-4 w-4" />
            Watch
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 flex items-center justify-center"
            onClick={handleRetry}
          >
            <Repeat className="mr-2 h-4 w-4" />
            Retry
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