import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { BellRing, Clock } from 'lucide-react';

type NotificationTime = {
  hours: string;
  minutes: string;
  period: 'AM' | 'PM';
};

interface NotificationPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotificationPrompt: React.FC<NotificationPromptProps> = ({
  open,
  onOpenChange
}) => {
  const { toast } = useToast();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notificationTime, setNotificationTime] = useState<NotificationTime>({
    hours: '9',
    minutes: '00',
    period: 'AM'
  });

  const saveNotificationPreferencesMutation = useMutation({
    mutationFn: async (data: { 
      notificationOptIn: boolean; 
      notificationTime?: string;
      askedForNotifications: boolean;
    }) => {
      const response = await fetch('/api/notification-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save notification preferences');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: 'Notification preferences saved',
        description: notificationTime ? 
          `You'll receive reminders at ${formatTimeForDisplay()}` : 
          'You can change your preferences later in settings',
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Could not save preferences',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleOptIn = () => {
    setShowTimePicker(true);
  };

  const handleOptOut = () => {
    saveNotificationPreferencesMutation.mutate({
      notificationOptIn: false,
      askedForNotifications: true
    });
  };

  const handleSaveTime = () => {
    // Convert to 24-hour format for storage
    let hours = parseInt(notificationTime.hours);
    if (notificationTime.period === 'PM' && hours < 12) {
      hours += 12;
    } else if (notificationTime.period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    const timeString = `${hours.toString().padStart(2, '0')}:${notificationTime.minutes}`;
    
    saveNotificationPreferencesMutation.mutate({
      notificationOptIn: true,
      notificationTime: timeString,
      askedForNotifications: true
    });
  };

  const formatTimeForDisplay = () => {
    return `${notificationTime.hours}:${notificationTime.minutes} ${notificationTime.period}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <BellRing className="h-5 w-5 mr-2 text-primary" />
            Want a gentle reminder to practice?
          </DialogTitle>
          <DialogDescription>
            {!showTimePicker ? (
              "We can send you friendly reminders to help you stay consistent with your practice."
            ) : (
              "Choose a time that works best for your practice schedule."
            )}
          </DialogDescription>
        </DialogHeader>

        {!showTimePicker ? (
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col items-center gap-6 py-4">
              <BellRing className="h-16 w-16 text-primary opacity-80" />
              <div className="text-center text-sm text-muted-foreground">
                Regular practice is the key to overcoming camera anxiety. 
                Would you like to receive gentle reminders to help you stay on track?
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={handleOptOut}
                className="w-full sm:w-auto"
              >
                No thanks
              </Button>
              <Button 
                onClick={handleOptIn}
                className="w-full sm:w-auto"
              >
                Yes, I'd love that
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="py-4">
            <div className="flex items-center justify-center mb-6">
              <Clock className="h-12 w-12 text-primary opacity-80" />
            </div>
            
            <div className="grid gap-4 py-2">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="time" className="text-center font-medium mb-2">
                  What time would you like to be reminded?
                </Label>
                
                <div className="flex items-center justify-center gap-1">
                  <select
                    className="inline-flex h-10 w-20 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium"
                    value={notificationTime.hours}
                    onChange={(e) => setNotificationTime({
                      ...notificationTime,
                      hours: e.target.value
                    })}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                      <option key={hour} value={hour.toString()}>
                        {hour}
                      </option>
                    ))}
                  </select>
                  
                  <span className="text-xl">:</span>
                  
                  <select
                    className="inline-flex h-10 w-20 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium"
                    value={notificationTime.minutes}
                    onChange={(e) => setNotificationTime({
                      ...notificationTime,
                      minutes: e.target.value
                    })}
                  >
                    {['00', '15', '30', '45'].map(minute => (
                      <option key={minute} value={minute}>
                        {minute}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    className="inline-flex h-10 w-20 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium"
                    value={notificationTime.period}
                    onChange={(e) => setNotificationTime({
                      ...notificationTime,
                      period: e.target.value as 'AM' | 'PM'
                    })}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowTimePicker(false)}
              >
                Back
              </Button>
              <Button 
                onClick={handleSaveTime}
                disabled={saveNotificationPreferencesMutation.isPending}
              >
                {saveNotificationPreferencesMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NotificationPrompt;