import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Download, FileJson, FileType, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Session } from '@shared/schema';

interface DataExportProps {
  sessions: Session[];
  isLoading: boolean;
}

export default function DataExport({ sessions, isLoading }: DataExportProps) {
  const [exportFormat, setExportFormat] = useState<string>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  
  const handleExport = () => {
    if (sessions.length === 0) {
      toast({
        title: "No data to export",
        description: "You need to have completed some sessions first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsExporting(true);
    
    try {
      // Process the data for export
      const formattedData = sessions.map(session => {
        const formattedSession = {
          id: session.id,
          date: new Date(session.date).toISOString(),
          duration: session.duration,
          confidence_score: session.confidenceScore,
          filter: session.filter,
          user_rating: session.userRating,
          prompt_category: session.promptCategory,
          prompt: session.prompt,
        };
        
        // Return a flat structure for CSV, keep nested for JSON
        return exportFormat === 'csv' 
          ? formattedSession 
          : {
              ...formattedSession,
              ai_notes: session.aiNotes
            };
      });
      
      // Convert data to the selected format
      let output = '';
      let filename = '';
      let mimeType = '';
      
      if (exportFormat === 'csv') {
        // CSV format
        const headers = Object.keys(formattedData[0]).join(',');
        const rows = formattedData.map(row => 
          Object.values(row).map(value => 
            typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
          ).join(',')
        );
        
        output = [headers, ...rows].join('\\n');
        filename = `cringeshield_sessions_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      } else {
        // JSON format
        output = JSON.stringify(formattedData, null, 2);
        filename = `cringeshield_sessions_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      }
      
      // Create and trigger download
      const blob = new Blob([output], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: `Your data has been exported as ${filename}`,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          <span>Export Your Data</span>
        </CardTitle>
        <CardDescription>Download your practice session history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="space-y-2">
            <p className="text-sm">Choose a format for your data export:</p>
            <Select 
              value={exportFormat} 
              onValueChange={setExportFormat}
              disabled={isLoading || isExporting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center">
                    <FileType className="mr-2 h-4 w-4" />
                    <span>CSV (Excel compatible)</span>
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center">
                    <FileJson className="mr-2 h-4 w-4" />
                    <span>JSON (Complete data)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleExport} 
          disabled={isLoading || isExporting || sessions.length === 0} 
          className="w-full"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export {sessions.length} Sessions
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}