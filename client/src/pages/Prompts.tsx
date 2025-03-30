import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Mic, Send, ArrowLeft } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { exercisePrompts } from '@/lib/exercisePrompts';
import { useCustomScripts } from '@/hooks/useCustomScripts';
import { Prompt } from '@/lib/types';

const Prompts: React.FC = () => {
  const [, navigate] = useLocation();
  const { preferences } = useUserPreferences();
  const { scripts, addScript } = useCustomScripts();
  const [isAddingScript, setIsAddingScript] = useState(false);
  const [scriptTitle, setScriptTitle] = useState('');
  const [scriptText, setScriptText] = useState('');

  // Get prompts based on user's confidence tier
  const confidenceTier = preferences.confidenceTier || 'shy_starter';
  const tierPrompts = exercisePrompts[confidenceTier] || [];
  
  // Show only 2-3 prompts for MVP
  const displayPrompts = tierPrompts.slice(0, 3);

  const handleSelectPrompt = (prompt: Prompt) => {
    // Navigate to recording with selected prompt
    navigate(`/recording?type=prompt&id=${prompt.id}&text=${encodeURIComponent(prompt.text)}`);
  };

  const handleFreeTalk = () => {
    navigate('/recording?type=free');
  };

  const handleScriptUpload = () => {
    setIsAddingScript(true);
  };

  const handleSubmitScript = () => {
    if (scriptTitle.trim() && scriptText.trim()) {
      const newScript = addScript(scriptTitle, scriptText);
      setIsAddingScript(false);
      setScriptTitle('');
      setScriptText('');
      navigate(`/recording?type=script&id=${newScript.id}`);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="h-8 w-8 mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Practice Prompts</h1>
        </div>
        
        {isAddingScript ? (
          <Card className="mb-6">
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-3">Add Your Script</h2>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Title</label>
                <input 
                  type="text"
                  value={scriptTitle}
                  onChange={(e) => setScriptTitle(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Give your script a title"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Script Text</label>
                <textarea
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  className="w-full p-2 border rounded-md min-h-[150px]"
                  placeholder="Paste or type your script here..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingScript(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitScript}>
                  Continue <Send className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-2 text-muted-foreground">
              {confidenceTier === 'shy_starter' && "Let's start with some easy prompts"}
              {confidenceTier === 'growing_speaker' && "Ready for these intermediate challenges"}
              {confidenceTier === 'confident_creator' && "Let's push your skills further"}
            </div>
            
            {/* Prompt Cards */}
            <div className="space-y-4 mb-6">
              {displayPrompts.map((prompt) => (
                <Card 
                  key={prompt.id}
                  className="overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer"
                  onClick={() => handleSelectPrompt(prompt)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-1">
                      {prompt.category === 'shy_starter' && 'Shy Starter'}
                      {prompt.category === 'growing_speaker' && 'Growing Speaker'}
                      {prompt.category === 'confident_creator' && 'Confident Creator'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {prompt.text}
                    </p>
                    <Button size="sm" className="w-full">
                      Use This Prompt
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Alternative Options */}
            <div className="flex space-x-2 mb-6">
              <Button 
                variant="outline" 
                className="flex-1 flex items-center justify-center"
                onClick={handleFreeTalk}
              >
                <Mic className="mr-2 h-4 w-4" />
                Free Talk
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 flex items-center justify-center"
                onClick={handleScriptUpload}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Script
              </Button>
            </div>
            
            {/* Recent Scripts (if any) */}
            {scripts.length > 0 && (
              <div>
                <h2 className="text-lg font-medium mb-2">Your Scripts</h2>
                <div className="space-y-2">
                  {scripts.slice(0, 2).map(script => (
                    <Card 
                      key={script.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/recording?type=script&id=${script.id}`)}
                    >
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="truncate">
                          <p className="font-medium">{script.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(script.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost">Use</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Prompts;