import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, Medal, Mic, Clock, Search, BarChart, Filter } from 'lucide-react';
import { useBadges } from '@/hooks/useBadges';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Prompt } from '@/lib/types';

const Home: React.FC = () => {
  const [, navigate] = useLocation();
  const { getEarnedBadgeDetails } = useBadges();
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get sessions from local storage
  const sessions = JSON.parse(localStorage.getItem('practice-sessions') || '[]');
  
  // Calculate progress data (simplified for MVP)
  const totalSessions = sessions.length;
  const lastSessionDate = totalSessions > 0 
    ? new Date(sessions[sessions.length - 1].date).toLocaleDateString()
    : 'No sessions yet';
  
  // Fetch prompts when component mounts
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await fetch('/api/prompts');
        if (response.ok) {
          const data = await response.json();
          setPrompts(data);
        } else {
          console.error('Failed to fetch prompts');
        }
      } catch (error) {
        console.error('Error fetching prompts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrompts();
  }, []);
  
  // Get badges
  const earnedBadgeDetails = getEarnedBadgeDetails();
  const displayBadges = showAllBadges 
    ? earnedBadgeDetails 
    : earnedBadgeDetails.slice(0, 3);
  
  // Filter prompts based on search
  const filteredPrompts = prompts.filter(prompt => 
    prompt.text.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get a random prompt to practice
  const getRandomPrompt = () => {
    if (prompts.length === 0) return;
    const randomIndex = Math.floor(Math.random() * prompts.length);
    const randomPrompt = prompts[randomIndex];
    startRecording(randomPrompt);
  };
  
  // Start recording with the selected prompt
  const startRecording = (prompt: Prompt) => {
    // Store the selected prompt in localStorage to use in recording
    localStorage.setItem('selected-prompt', JSON.stringify(prompt));
    navigate('/recording');
  };
  
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-1">CringeShield</h1>
          <p className="text-muted-foreground">
            Practice your speaking skills without the cringe
          </p>
        </div>
        
        {/* Main call to action */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Ready to Practice?</h2>
                <p className="text-sm text-muted-foreground">
                  Choose a prompt or try a random one
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mic className="h-6 w-6 text-primary" />
              </div>
            </div>
            
            <Button 
              className="w-full mb-4"
              onClick={getRandomPrompt}
            >
              Random Prompt
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prompts..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Prompts list */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Practice Prompts</h2>
            {searchTerm && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSearchTerm('')}
              >
                Clear
              </Button>
            )}
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {filteredPrompts.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Filter className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p>No prompts match your search</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPrompts.map((prompt) => (
                    <Card key={prompt.id} className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => startRecording(prompt)}>
                      <CardContent className="p-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{prompt.text.split(' - ')[0]}</p>
                          {prompt.text.includes(' - ') && (
                            <p className="text-sm text-muted-foreground">{prompt.text.split(' - ')[1]}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="icon">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Progress summary */}
        {totalSessions > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-muted-foreground text-xs mb-1 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Sessions Completed
                  </div>
                  <div className="text-2xl font-semibold">{totalSessions}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-muted-foreground text-xs mb-1">Last Session</div>
                  <div className="text-sm font-medium">{lastSessionDate}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Badges section */}
        {earnedBadgeDetails.length > 0 && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center">
                  <Medal className="h-5 w-5 mr-2" />
                  Your Achievements
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/badges')}
                  className="text-xs h-8"
                >
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-3 gap-2 mb-3">
                {displayBadges.map((badge, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col items-center p-2 rounded-lg bg-gray-50"
                  >
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <div className="text-xs text-center font-medium truncate w-full">
                      {badge.name}
                    </div>
                  </div>
                ))}
              </div>
              {!showAllBadges && earnedBadgeDetails.length > 3 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs w-full" 
                  onClick={() => setShowAllBadges(true)}
                >
                  Show All ({earnedBadgeDetails.length})
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Home;