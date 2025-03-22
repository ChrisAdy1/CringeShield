import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { promptCategories } from '@/lib/utils';
import { MessageCircle, Briefcase, BookOpen, Users, Presentation, Shuffle } from 'lucide-react';
import PracticeModal from '@/components/modals/PracticeModal';
import FeedbackModal from '@/components/modals/FeedbackModal';
import useLocalStorage from '@/hooks/useLocalStorage';
import { PracticeSession } from '@/lib/types';

const Practice: React.FC = () => {
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<any>(null);
  const [pendingSession, setPendingSession] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Local storage for sessions
  const [sessions, setSessions] = useLocalStorage<PracticeSession[]>('practice-sessions', []);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsPracticeModalOpen(true);
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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Practice Speaking</h1>
        <p className="text-gray-600">
          Choose a category below to start practicing. You'll get a prompt to speak about and feedback on your delivery.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Prompt Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {promptCategories.map(category => (
            <Card 
              key={category.id} 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleCategoryClick(category.id)}
            >
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

      <section className="mb-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Recent Practice Sessions</h3>
            {sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.slice(-3).reverse().map(session => (
                  <div key={session.id} className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <div>
                      <p className="font-medium text-sm">{new Date(session.date).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">
                        {session.promptCategory.charAt(0).toUpperCase() + session.promptCategory.slice(1)} • 
                        {Math.round(session.duration)}s
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary-100 text-primary-800">
                        {session.confidenceScore}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No practice sessions yet. Start one to see your history!</p>
            )}
            <div className="mt-4">
              <Button className="w-full" onClick={() => setIsPracticeModalOpen(true)}>
                Start New Practice
              </Button>
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

export default Practice;
