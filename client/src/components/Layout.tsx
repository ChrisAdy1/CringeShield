import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { SmilePlus } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  currentPath: string;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPath }) => {
  const navItems = [
    { path: "/", label: "Home" },
    { path: "/practice", label: "Practice" },
    { path: "/progress", label: "Progress" },
    { path: "/settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <SmilePlus className="w-8 h-8 text-primary" />
              <h1 className="text-xl font-semibold text-gray-900">CringeShield</h1>
            </div>
          </Link>
          <div className="md:hidden">
            <button className="p-2 text-gray-500" aria-label="Open menu">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="flex space-x-6 overflow-x-auto">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a
                  className={cn(
                    "border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap",
                    currentPath === item.path
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  )}
                >
                  {item.label}
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-5xl px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
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
    </div>
  );
};

export default Layout;
