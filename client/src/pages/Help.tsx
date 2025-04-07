import React from 'react';
import Layout from '@/components/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  UserCircle, 
  Video, 
  Calendar, 
  Award, 
  Settings,
  Mic,
  Camera,
  HelpCircle
} from 'lucide-react';
import { useTitle } from '@/hooks/useTitle';

const Help: React.FC = () => {
  // Set the page title
  useTitle('Help & Information');
  
  return (
    <Layout currentPath="/help">
      <div className="container max-w-4xl py-8">
        <h1 className="text-2xl font-bold mb-2">Help & Information</h1>
        <p className="text-muted-foreground mb-8">
          Learn how to use CringeShield to improve your speaking confidence
        </p>

        {/* App Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-primary" />
              Welcome to CringeShield
            </CardTitle>
            <CardDescription>
              Your personal camera confidence builder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              CringeShield helps you overcome camera anxiety through regular practice and structured challenges. 
              Our app provides two main ways to improve your speaking confidence:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li><strong>30-Day Challenge:</strong> Complete daily speaking exercises to build a consistent practice habit</li>
              <li><strong>Weekly Challenge:</strong> Choose your comfort level and tackle new prompts each week</li>
            </ul>
            <p>
              Track your progress, earn badges, and watch yourself transform into a confident speaker!
            </p>
          </CardContent>
        </Card>

        {/* Features Guide */}
        <h2 className="text-xl font-semibold mb-4">Features Guide</h2>
        <Accordion type="single" collapsible className="mb-8">
          <AccordionItem value="dashboard">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-primary" />
                <span>Dashboard Overview</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                Your personal dashboard displays your progress and achievements at a glance.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>See your completion stats for both challenge types</li>
                <li>View your recently earned badges</li>
                <li>Access quick links to start practicing</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="30day">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>30-Day Challenge</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                Build your speaking confidence with structured daily practice:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>30 unique speaking prompts to complete at your own pace</li>
                <li>Track your progress with a visual completion indicator</li>
                <li>Earn milestone badges at 7, 15, and 30 days</li>
                <li>Days are only marked complete when you actually record a practice video</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="weekly">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-500" />
                <span>Weekly Challenge</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                Choose your comfort level with three tiers of weekly challenges:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Shy Starter:</strong> Simple prompts for beginners</li>
                <li><strong>Growing Speaker:</strong> Moderate difficulty for those with some experience</li>
                <li><strong>Confident Creator:</strong> Advanced prompts for those ready to push their limits</li>
                <li>New prompts unlock each week for a total of 15 weeks of content</li>
                <li>Earn badges for completing each week's challenges</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="practice">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-red-500" />
                <span>Recording Videos</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                The recording feature lets you practice speaking on camera:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Camera access required for recording (permissions will be requested)</li>
                <li>Practice your speaking skills with video recording</li>
                <li>Recordings are stored locally on your device for privacy</li>
                <li>After recording, you can download your video or continue to feedback</li>
                <li>Reflect on your performance to track your progress over time</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="badges">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <span>Earning Badges</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                Badges track your progress and celebrate your achievements:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>30-Day Challenge Badges:</strong> Earned at 7, 15, and 30 days</li>
                <li><strong>Weekly Challenge Badges:</strong> Earned for completing each week's prompts</li>
                <li>View all your badges in the Badges section</li>
                <li>Badges are permanently tied to your account</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="settings">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-500" />
                <span>Settings & Preferences</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                Customize your experience in the Settings section:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Update your account information</li>
                <li>Change your password</li>
                <li>Adjust application preferences</li>
                <li>Manage your account</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Troubleshooting */}
        <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-orange-500" />
              Common Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="camera">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    <span>Camera not working</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Make sure you've granted camera permissions in your browser</li>
                    <li>Check if another application is using your camera</li>
                    <li>Try refreshing the page</li>
                    <li>Ensure your camera is properly connected and working</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="audio">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    <span>Microphone not working</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Check if you've granted microphone permissions in your browser</li>
                    <li>Make sure your microphone isn't muted</li>
                    <li>Try a different microphone if available</li>
                    <li>Restart the browser if problems persist</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="challenges">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Challenge progress not updating</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Make sure you've completed a recording session</li>
                    <li>Check your internet connection</li>
                    <li>Try logging out and back in</li>
                    <li>Contact support if the issue persists</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Tips for Success */}
        <h2 className="text-xl font-semibold mb-4">Tips for Success</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Overcoming Camera Anxiety</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Consistency is key:</strong> Practice regularly, even if just for a few minutes each day</li>
              <li><strong>Start small:</strong> Begin with the Shy Starter challenges if you're feeling nervous</li>
              <li><strong>Watch your recordings:</strong> Review your videos to see your improvement over time</li>
              <li><strong>Be kind to yourself:</strong> Everyone feels awkward on camera at first</li>
              <li><strong>Focus on progress:</strong> Don't aim for perfection, celebrate small improvements</li>
              <li><strong>Practice in private:</strong> Find a quiet space where you won't be interrupted</li>
              <li><strong>Keep it brief:</strong> Start with short practice sessions and gradually increase your time as you get more comfortable</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Help;