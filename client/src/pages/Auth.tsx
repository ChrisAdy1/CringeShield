import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function Auth() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('login');
  
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

        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Create Account</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
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
          
          <CardFooter className="flex justify-center border-t pt-6">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/onboarding')}
            >
              Continue without account
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}