import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { SmilePlus, Home, Video, BarChart2, Settings } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
  currentPath: string;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPath }) => {
  const isMobile = useIsMobile();
  
  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/practice", label: "Practice", icon: Video },
    { path: "/progress", label: "Progress", icon: BarChart2 },
    { path: "/settings", label: "Settings", icon: Settings },
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
          {!isMobile && (
            <div className="flex space-x-6">
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
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-5xl px-4 py-6 pb-20 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10 pb-safe">
          <div className="flex justify-around items-center">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={cn(
                  "flex flex-col items-center justify-center pt-3 pb-2 px-2 w-full min-h-[60px] relative",
                  currentPath === item.path
                    ? "text-primary"
                    : "text-gray-500"
                )}
              >
                <item.icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
                {currentPath === item.path && (
                  <span className="absolute bottom-0 w-1/2 h-1 bg-primary rounded-t-full"></span>
                )}
              </Link>
            ))}
          </div>
        </nav>
      )}

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
