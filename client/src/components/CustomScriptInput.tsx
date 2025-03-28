import { useState } from 'react';
import { Pencil, Save, FilePlus, Trash, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CustomScript } from '@/lib/types';
import { useCustomScripts } from '@/hooks/useCustomScripts';
import { useIsMobile } from '@/hooks/use-mobile';

interface CustomScriptInputProps {
  onScriptSelected: (script: CustomScript) => void;
  onCancel: () => void;
}

const CustomScriptInput: React.FC<CustomScriptInputProps> = ({ onScriptSelected, onCancel }) => {
  const isMobile = useIsMobile();
  const { scripts, addScript, deleteScript } = useCustomScripts();
  const [showNewScriptForm, setShowNewScriptForm] = useState(false);
  const [newScriptTitle, setNewScriptTitle] = useState('');
  const [newScriptText, setNewScriptText] = useState('');
  
  const handleCreateNewScript = () => {
    if (newScriptTitle.trim() && newScriptText.trim()) {
      const newScript = addScript(newScriptTitle, newScriptText);
      
      // Reset form
      setNewScriptTitle('');
      setNewScriptText('');
      setShowNewScriptForm(false);
      
      // Select the newly created script
      onScriptSelected(newScript);
    }
  };
  
  const handleSelectExisting = (script: CustomScript) => {
    onScriptSelected(script);
  };
  
  const handleDeleteScript = (e: React.MouseEvent, scriptId: string) => {
    e.stopPropagation(); // Prevent selecting when deleting
    deleteScript(scriptId);
  };
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-medium">Custom Scripts</h3>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNewScriptForm(!showNewScriptForm)}
          className="gap-1"
        >
          {showNewScriptForm ? (
            <span>Cancel New</span>
          ) : (
            <>
              <FilePlus size={16} />
              <span>New Script</span>
            </>
          )}
        </Button>
      </div>
      
      {showNewScriptForm && (
        <div className="space-y-3 p-3 border rounded-lg">
          <div>
            <Label htmlFor="scriptTitle" className="text-sm">Title</Label>
            <Input
              id="scriptTitle"
              value={newScriptTitle}
              onChange={(e) => setNewScriptTitle(e.target.value)}
              placeholder="Enter script title..."
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="scriptText" className="text-sm">Script Text</Label>
            <Textarea
              id="scriptText"
              value={newScriptText}
              onChange={(e) => setNewScriptText(e.target.value)}
              placeholder="Enter your script here..."
              className="mt-1 min-h-[100px]"
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleCreateNewScript}
              disabled={!newScriptTitle.trim() || !newScriptText.trim()}
              size="sm"
              className="gap-1"
            >
              <Save size={16} />
              Save Script
            </Button>
          </div>
        </div>
      )}
      
      {!showNewScriptForm && (
        <>
          <ScrollArea className={`${isMobile ? 'h-[180px]' : 'h-[220px]'} p-1`}>
            {scripts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                <Pencil className="mb-2" />
                <p>No custom scripts yet.</p>
                <p className="text-sm">Create your first script to get started!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {scripts.map((script: CustomScript) => (
                  <div 
                    key={script.id}
                    onClick={() => handleSelectExisting(script)}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                  >
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-medium truncate">{script.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {script.text.substring(0, 50)}{script.text.length > 50 ? '...' : ''}
                      </p>
                    </div>
                    
                    <div className="flex space-x-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteScript(e, script.id)}
                        className="h-7 w-7 p-0 text-destructive"
                      >
                        <Trash size={isMobile ? 14 : 16} />
                      </Button>
                      <ChevronRight size={16} className="text-muted-foreground my-auto" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomScriptInput;