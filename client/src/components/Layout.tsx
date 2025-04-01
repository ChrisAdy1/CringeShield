import React, { useEffect } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { SmilePlus, Home, Video, Award, Calendar, Settings, HelpCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { useTutorial } from "@/hooks/useTutorial";
import TutorialWalkthrough from "@/components/TutorialWalkthrough";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
  currentPath: string;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPath }) => {
  const isMobile = useIsMobile();
  
  // Get user from auth context
  const { user } = useAuth();
  
  // Get tutorial state
  const { hasSeenTutorial, isOpen, showTutorial, closeTutorial, completeTutorial } = useTutorial();
  
  // Show tutorial automatically for new users on the home page
  useEffect(() => {
    if (user && !hasSeenTutorial && currentPath === '/') {
      // Small delay to ensure the page is fully loaded
      const timer = setTimeout(() => {
        showTutorial();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user, hasSeenTutorial, currentPath, showTutorial]);
  
  // Navigation items
  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/recording", label: "Practice", icon: Video },
    { path: "/challenge", label: "30-Day", icon: Award },
    { path: "/weekly-challenge", label: "Weekly", icon: Calendar },
    { path: "/badges", label: "Badges", icon: Award },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Tutorial Walkthrough */}
      <TutorialWalkthrough 
        isOpen={isOpen} 
        onClose={closeTutorial} 
        onComplete={completeTutorial} 
      />
      
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="container mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <SmilePlus className="w-8 h-8 text-primary" />
              <h1 className="text-xl font-semibold text-gray-900">CringeShield</h1>
            </div>
          </Link>
          
          {/* Desktop Navigation in Header */}
          {!isMobile && (
            <div className="flex space-x-6 items-center">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={cn(
                    "text-sm font-medium flex items-center gap-1",
                    currentPath === item.path
                      ? "text-primary"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* Help Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 text-gray-500 hover:text-primary hover:bg-gray-50"
                onClick={showTutorial}
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                <span>Help</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-5xl px-4 py-6 pb-20">
        {children}
      </main>

      {/* Desktop Footer */}
      {!isMobile && (
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center">
                  <SmilePlus className="w-6 h-6 text-primary" />
                  <p className="ml-2 text-sm text-gray-600">CringeShield</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">Your safe space to practice speaking</p>
              </div>
              <div className="flex space-x-6">
                <button 
                  onClick={showTutorial} 
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  Help
                </button>
                <a href="#" className="text-sm text-gray-600 hover:text-primary">Privacy</a>
                <a href="#" className="text-sm text-gray-600 hover:text-primary">Terms</a>
              </div>
            </div>
          </div>
        </footer>
      )}
      
      {/* Mobile Navigation Bar */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
          <div className="flex justify-around items-center py-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex flex-col items-center p-2 text-xs",
                  currentPath === item.path
                    ? "text-primary"
                    : "text-gray-500"
                )}
              >
                <item.icon className="w-6 h-6 mb-1" />
                <span>{item.label}</span>
              </Link>
            ))}
            {/* Mobile Help Button */}
            <button
              className="flex flex-col items-center p-2 text-xs text-gray-500"
              onClick={showTutorial}
            >
              <HelpCircle className="w-6 h-6 mb-1" />
              <span>Help</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default Layout;
