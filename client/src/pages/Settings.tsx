import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Trash2, User, Shield, Bell, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings: React.FC = () => {
  const [defaultFilter, setDefaultFilter] = useState('blur');
  const [defaultCategory, setDefaultCategory] = useState('casual');
  const [autoSaveFeedback, setAutoSaveFeedback] = useState(false);
  const [sessions, setSessions] = useLocalStorage('practice-sessions', []);
  const { toast } = useToast();

  const handleClearData = () => {
    setSessions([]);
    toast({
      title: "Data cleared",
      description: "All your practice sessions have been deleted.",
    });
  };

  const handleExportData = () => {
    try {
      const dataStr = JSON.stringify(sessions, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `cringeshield-data-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Data exported",
        description: "Your data has been downloaded as a JSON file.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "An error occurred while exporting your data.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Settings</h1>
        <p className="text-gray-600">
          Configure your CringeShield experience
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Practice Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-primary" />
              Practice Preferences
            </CardTitle>
            <CardDescription>
              Configure your default practice settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-filter">Default Face Filter</Label>
              <Select 
                value={defaultFilter} 
                onValueChange={setDefaultFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blur">Blur filter</SelectItem>
                  <SelectItem value="cartoon">Cartoon filter</SelectItem>
                  <SelectItem value="silhouette">Silhouette</SelectItem>
                  <SelectItem value="none">No filter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="default-category">Default Prompt Category</Label>
              <Select 
                value={defaultCategory} 
                onValueChange={setDefaultCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual Conversation</SelectItem>
                  <SelectItem value="interview">Job Interviews</SelectItem>
                  <SelectItem value="storytelling">Storytelling</SelectItem>
                  <SelectItem value="presentation">Presentations</SelectItem>
                  <SelectItem value="introduction">Introductions</SelectItem>
                  <SelectItem value="random">Random Topics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-save">Auto-save feedback</Label>
                <p className="text-sm text-gray-500">Save feedback without asking for your rating</p>
              </div>
              <Switch 
                id="auto-save" 
                checked={autoSaveFeedback}
                onCheckedChange={setAutoSaveFeedback}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Privacy & Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-primary" />
              Privacy & Data
            </CardTitle>
            <CardDescription>
              Manage your data and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Store data locally</Label>
                <p className="text-sm text-gray-500">Your data never leaves your device</p>
              </div>
              <Switch checked={true} disabled />
            </div>
            
            <div className="pt-2 flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="flex items-center"
                onClick={handleExportData}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Your Data
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive"
                    className="flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your practice sessions and progress data.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearData}>
                      Yes, delete all data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
        
        {/* App Information */}
        <Card>
          <CardHeader>
            <CardTitle>About CringeShield</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-600">
              Version: 1.0.0
            </p>
            <p className="text-sm text-gray-600">
              CringeShield is designed to help you overcome camera shyness and build confidence in speaking on video.
            </p>
            <div className="pt-2">
              <Button variant="link" className="p-0 h-auto text-primary">
                Privacy Policy
              </Button>
              <span className="text-gray-300 mx-2">|</span>
              <Button variant="link" className="p-0 h-auto text-primary">
                Terms of Service
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Settings;
