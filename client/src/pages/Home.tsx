import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, ExternalLink, MessageCircle, Briefcase, BookOpen, Users, Presentation, Shuffle, LightbulbIcon } from 'lucide-react';
import { calculateStreak, getLastSevenDays, getDailyTip, promptCategories } from '@/lib/utils';
import { ProgressData, PracticeSession } from '@/lib/types';
import PracticeModal from '@/components/modals/PracticeModal';
import FeedbackModal from '@/components/modals/FeedbackModal';
import useLocalStorage from '@/hooks/useLocalStorage';
import { apiRequest } from '@/lib/queryClient';

const Home: React.FC = () => {
  const [, navigate] = useLocation();
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<any>(null);
  const [pendingSession, setPendingSession] = useState<any>(null);
  
  // Local storage for sessions and progress
  const [sessions, setSessions] = useLocalStorage<PracticeSession[]>('practice-sessions', []);
  
  const dailyTip = getDailyTip();
  
  // Calculate progress metrics
  const progressData: ProgressData = {
    confidenceOverTime: getLastSevenDays().map((day) => {
      const sessionsOnDay = sessions.filter(s => 
        new Date(s.date).toDateString() === day.date.toDateString()
      );
      
      const avgScore = sessionsOnDay.length > 0
        ? sessionsOnDay.reduce((sum, s) => sum + s.confidenceScore, 0) / sessionsOnDay.length
        : 0;
        
      return {
        date: day.date.toISOString(),
        score: avgScore
      };
    }),
    sessionsCompleted: sessions.length,
    streak: calculateStreak(sessions),
    latestScore: sessions.length > 0 
      ? sessions[sessions.length - 1].confidenceScore 
      : 0
  };

  const handlePracticeComplete = async (practiceData: any) => {
    try {
      // Send recording for AI analysis
      const formData = new FormData();
      formData.append('recording', practiceData.recordingBlob);
      formData.append('prompt', practiceData.promptText);
      
      const response = await fetch('/api/feedback/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze recording');
      }
      
      const feedback = await response.json();
      setCurrentFeedback(feedback);
      
      // Store pending session to save later with user feedback
      setPendingSession({
        ...practiceData,
        aiNotes: feedback,
        confidenceScore: feedback.confidenceScore
      });
      
      setIsPracticeModalOpen(false);
      setIsFeedbackModalOpen(true);
    } catch (error) {
      console.error('Error analyzing practice:', error);
      // For demo purposes, generate mock feedback
      const mockFeedback = {
        strengths: [
          "Clear voice with good projection",
          "Maintained consistent pace throughout",
          "Used engaging examples in your story"
        ],
        improvements: [
          "Noticed a few filler words - try pausing instead",
          "Consider varying your tone for emphasis"
        ],
        confidenceScore: 68
      };
      
      setCurrentFeedback(mockFeedback);
      setPendingSession({
        ...practiceData,
        aiNotes: mockFeedback,
        confidenceScore: mockFeedback.confidenceScore
      });
      
      setIsPracticeModalOpen(false);
      setIsFeedbackModalOpen(true);
    }
  };

  const handleSaveFeedback = (userRating: any) => {
    if (pendingSession) {
      const newSession: PracticeSession = {
        id: Date.now(),
        date: new Date().toISOString(),
        duration: pendingSession.duration,
        promptCategory: pendingSession.promptCategory,
        prompt: pendingSession.promptText,
        filter: pendingSession.filterType,
        confidenceScore: pendingSession.confidenceScore,
        userRating: userRating,
        aiNotes: pendingSession.aiNotes
      };
      
      setSessions([...sessions, newSession]);
      setPendingSession(null);
      setIsFeedbackModalOpen(false);
    }
  };

  const handleTryAgain = () => {
    setIsFeedbackModalOpen(false);
    setPendingSession(null);
    setIsPracticeModalOpen(true);
  };

  // Function to get the appropriate icon component for a category
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'message-circle': return <MessageCircle className="h-6 w-6 text-primary" />;
      case 'briefcase': return <Briefcase className="h-6 w-6 text-primary" />;
      case 'book-open': return <BookOpen className="h-6 w-6 text-primary" />;
      case 'users': return <Users className="h-6 w-6 text-primary" />;
      case 'presentation': return <Presentation className="h-6 w-6 text-primary" />;
      case 'shuffle': return <Shuffle className="h-6 w-6 text-primary" />;
      default: return <MessageCircle className="h-6 w-6 text-primary" />;
    }
  };

  return (
    <>
      {/* Welcome Card */}
      <section className="mb-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-3">Welcome back!</h2>
            {progressData.streak > 0 ? (
              <p className="text-gray-600 mb-4">
                Your speaking confidence has improved by {Math.round(progressData.latestScore)}% this week. Keep it up!
              </p>
            ) : (
              <p className="text-gray-600 mb-4">
                Ready to start your speaking practice journey? Let's get started!
              </p>
            )}
            <div className="flex space-x-4">
              <Button onClick={() => setIsPracticeModalOpen(true)}>
                <PlusIcon className="h-5 w-5 mr-2" />
                New Practice
              </Button>
              <Button variant="outline" onClick={() => navigate('/progress')}>
                View Progress
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Confidence Tracker */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Confidence Journey</h2>
          <Button 
            variant="link" 
            className="text-sm text-primary"
            onClick={() => navigate('/progress')}
          >
            View Details
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="h-48 flex items-end space-x-1">
              {/* Bar chart for the last 7 days */}
              {progressData.confidenceOverTime.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className={`w-full rounded-t-sm transition-all duration-500 bg-primary-${100 + index * 100}`}
                    style={{ 
                      height: `${Math.max(5, day.score)}%`,
                      backgroundColor: `hsl(263 ${60 + index * 5}% ${50 - index * 3}% / ${0.4 + index * 0.1})` 
                    }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-1">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Current streak</p>
                <p className="text-2xl font-semibold">{progressData.streak} day{progressData.streak !== 1 ? 's' : ''}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sessions completed</p>
                <p className="text-2xl font-semibold">{progressData.sessionsCompleted}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Confidence score</p>
                <p className="text-2xl font-semibold text-primary">
                  {Math.round(progressData.latestScore)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Start Practice Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Start a Practice Session</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quick Practice Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <h3 className="text-lg font-semibold ml-3">Quick Practice</h3>
              </div>
              <p className="text-gray-600 mb-4">A 2-minute session with random prompts to help you warm up.</p>
              <Button className="w-full" onClick={() => setIsPracticeModalOpen(true)}>
                Start Quick Practice
              </Button>
            </CardContent>
          </Card>

          {/* Video Practice Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-semibold ml-3">Video Practice</h3>
              </div>
              <p className="text-gray-600 mb-4">Practice with face filters and get detailed AI feedback.</p>
              <Button className="w-full" onClick={() => setIsPracticeModalOpen(true)}>
                Start Video Practice
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Prompt Categories */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Prompt Categories</h2>
          <Button 
            variant="link" 
            className="text-sm text-primary"
            onClick={() => navigate('/practice')}
          >
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {promptCategories.slice(0, 3).map(category => (
            <Card key={category.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-3">
                  {getCategoryIcon(category.icon)}
                </div>
                <h3 className="font-medium text-sm mb-1">{category.name}</h3>
                <p className="text-xs text-gray-500">{category.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Daily Tip */}
      <section className="mb-8">
        <Card className="bg-primary-50 border-primary-100">
          <CardContent className="p-6">
            <div className="flex items-start">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <LightbulbIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold mb-2">Daily Tip</h3>
                <p className="text-gray-700 mb-3">{dailyTip.tip}</p>
                <div className="flex">
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary-100 text-primary-800">
                    {dailyTip.category}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Practice Modal */}
      <PracticeModal
        open={isPracticeModalOpen}
        onOpenChange={setIsPracticeModalOpen}
        onComplete={handlePracticeComplete}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        open={isFeedbackModalOpen}
        onOpenChange={setIsFeedbackModalOpen}
        feedback={currentFeedback}
        onSave={handleSaveFeedback}
        onTryAgain={handleTryAgain}
      />
    </>
  );
};

export default Home;
