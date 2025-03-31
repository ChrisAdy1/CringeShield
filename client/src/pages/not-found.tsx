import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  const [_, setLocation] = useLocation();
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center mb-6">
            <AlertCircle className="h-20 w-20 text-destructive mb-4" />
            <h1 className="text-2xl font-bold">Page Not Found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          <Button onClick={() => setLocation("/")} className="gap-2">
            <Home size={18} />
            Back to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
