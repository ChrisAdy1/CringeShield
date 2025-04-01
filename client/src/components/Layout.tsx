import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { SmilePlus, Home, Video, BarChart2, Settings } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";

interface LayoutProps {
  children: React.ReactNode;
  currentPath: string;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPath }) => {
  const isMobile = useIsMobile();
  
  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ['/api/auth/current-user'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Navigation items
  const navItems = [
    { path: "/", label: "Home", icon: Home },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="container mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <SmilePlus className="w-8 h-8 text-primary" />
              <h1 className="text-xl font-semibold text-gray-900">CringeShield</h1>
            </div>
          </Link>
          <div className="flex space-x-6">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={cn(
                  "text-sm font-medium flex items-center gap-1",
                  isMobile ? "p-2" : "", // Add padding on mobile for easier tapping
                  currentPath === item.path
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <item.icon className={isMobile ? "w-6 h-6" : "w-4 h-4"} />
                {!isMobile && (
                  <span>{item.label}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-5xl px-4 py-6 pb-8">
        {children}
      </main>

      {/* Footer - only show on desktop */}
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
                <a href="#" className="text-sm text-gray-600 hover:text-primary">Help</a>
                <a href="#" className="text-sm text-gray-600 hover:text-primary">Privacy</a>
                <a href="#" className="text-sm text-gray-600 hover:text-primary">Terms</a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
