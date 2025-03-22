import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateStreak, getLastSevenDays, formatDate } from '@/lib/utils';
import useLocalStorage from '@/hooks/useLocalStorage';
import { PracticeSession } from '@/lib/types';
import { TrendingUp, Calendar, Clock, Award } from 'lucide-react';

const Progress: React.FC = () => {
  const [sessions] = useLocalStorage<PracticeSession[]>('practice-sessions', []);
  const [activeTab, setActiveTab] = useState('daily');
  
  // Calculate daily data
  const dailyData = getLastSevenDays().map(day => {
    const sessionsOnDay = sessions.filter(s => 
      new Date(s.date).toDateString() === day.date.toDateString()
    );
    
    const avgScore = sessionsOnDay.length > 0
      ? sessionsOnDay.reduce((sum, s) => sum + s.confidenceScore, 0) / sessionsOnDay.length
      : 0;
      
    return {
      name: day.label,
      score: Math.round(avgScore)
    };
  });
  
  // Calculate weekly data (last 4 weeks)
  const weeklyData = Array.from({ length: 4 }).map((_, i) => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - (i * 7));
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);
    
    const weekSessions = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
    
    const avgScore = weekSessions.length > 0
      ? weekSessions.reduce((sum, s) => sum + s.confidenceScore, 0) / weekSessions.length
      : 0;
      
    return {
      name: `Week ${4-i}`,
      score: Math.round(avgScore)
    };
  }).reverse();
  
  // Calculate statistics
  const streak = calculateStreak(sessions);
  const totalPracticeTime = sessions.reduce((sum, s) => sum + s.duration, 0);
  const averageScore = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.confidenceScore, 0) / sessions.length)
    : 0;
  const latestScore = sessions.length > 0
    ? Math.round(sessions[sessions.length - 1].confidenceScore)
    : 0;
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Your Progress</h1>
        <p className="text-gray-600">
          Track your speaking confidence and practice history over time.
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Streak</p>
                <p className="text-2xl font-semibold">{streak} day{streak !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Sessions</p>
                <p className="text-2xl font-semibold">{sessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Practice Time</p>
                <p className="text-2xl font-semibold">{Math.round(totalPracticeTime / 60)} min</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Confidence</p>
                <p className="text-2xl font-semibold">{averageScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Confidence Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
            </TabsList>
            <TabsContent value="daily">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailyData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} tickCount={6} />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Confidence']}
                      contentStyle={{ 
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0' 
                      }}
                    />
                    <Bar 
                      dataKey="score" 
                      fill="hsl(263 59% 50%)" 
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="weekly">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} tickCount={6} />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Confidence']}
                      contentStyle={{ 
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0' 
                      }}
                    />
                    <Bar 
                      dataKey="score" 
                      fill="hsl(263 59% 50%)" 
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Session History */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Session History</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No practice sessions recorded yet.</p>
              <p className="text-sm text-gray-400 mt-1">Complete your first practice to see your history!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {[...sessions].reverse().map(session => (
                <div key={session.id} className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <p className="font-medium">{formatDate(new Date(session.date))}</p>
                    <p className="text-sm text-gray-500">
                      {session.promptCategory.charAt(0).toUpperCase() + session.promptCategory.slice(1)} • 
                      {Math.round(session.duration)}s
                    </p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                      "{session.prompt}"
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary-100 text-primary-800 mb-1">
                      {Math.round(session.confidenceScore)}%
                    </span>
                    {session.userRating && (
                      <span className="text-xs text-gray-500">
                        Felt: {session.userRating === 'nervous' ? '😰' : session.userRating === 'okay' ? '😐' : '😊'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default Progress;
