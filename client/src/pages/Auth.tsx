import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

export default function Auth() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('login');
  const [message, setMessage] = useState<string | null>(null);
  
  // Check if there's a message in localStorage from prompt redirection
  useEffect(() => {
    const authMessage = localStorage.getItem('auth-message');
    if (authMessage) {
      setMessage(authMessage);
      // Set active tab to register if redirected from prompt
      setActiveTab('register');
      // Clear the message after reading it
      localStorage.removeItem('auth-message');
    }
    
    // Check URL parameter for mode
    const searchParams = new URLSearchParams(window.location.search);
    const mode = searchParams.get('mode');
    if (mode === 'register') {
      setActiveTab('register');
    }
  }, []);
  
  // Check if user is already logged in
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/current-user'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // If user is logged in, redirect to home
  if (user) {
    setLocation('/');
    return null;
  }

  return (
    <div className="container flex items-center justify-center min-h-screen mx-auto py-6 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">CringeShield</h1>
          <p className="text-muted-foreground mt-2">Overcome camera anxiety and speak confidently</p>
        </div>

        {message && (
          <Alert className="mb-4 border-primary/20 bg-primary/10 text-primary">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Create Account</TabsTrigger>
              </TabsList>
          
              <CardContent>
                <TabsContent value="login">
                  <div className="mt-2">
                    <LoginForm />
                  </div>
                </TabsContent>
                
                <TabsContent value="register">
                  <div className="mt-2">
                    <RegisterForm />
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </CardHeader>
          
          <CardFooter className="flex justify-center border-t pt-6">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/')}
              className="text-muted-foreground"
            >
              ← Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}