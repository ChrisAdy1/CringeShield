import { useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TeleprompterProps {
  text: string;
  isVisible: boolean;
  isRecording: boolean;
}

const Teleprompter: React.FC<TeleprompterProps> = ({ text, isVisible, isRecording }) => {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll effect when recording is active
  useEffect(() => {
    if (!isVisible || !isRecording || !containerRef.current || !contentRef.current) return;
    
    // Get the height of the content and container
    const containerHeight = containerRef.current.clientHeight;
    const contentHeight = contentRef.current.scrollHeight;
    const scrollDistance = contentHeight - containerHeight;
    
    if (scrollDistance <= 0) return; // No need to scroll
    
    // Calculate scroll duration based on content length (roughly 3s per 100 chars)
    const baseDuration = 3000; // Base duration in milliseconds
    const durationPerChar = 30; // Additional ms per character
    const scrollDuration = Math.max(
      baseDuration,
      Math.min(60000, baseDuration + (text.length * durationPerChar))
    );
    
    // Smooth scroll animation
    const startTime = Date.now();
    const scroll = () => {
      if (!containerRef.current || !isRecording || !isVisible) return;
      
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(1, elapsedTime / scrollDuration);
      const scrollTop = scrollDistance * progress;
      
      containerRef.current.scrollTop = scrollTop;
      
      if (progress < 1 && isRecording && isVisible) {
        requestAnimationFrame(scroll);
      }
    };
    
    // Start scrolling
    const animationId = requestAnimationFrame(scroll);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    };
  }, [text, isVisible, isRecording]);
  
  if (!isVisible) return null;
  
  return (
    <div 
      className={`
        absolute inset-x-0 bottom-0 bg-black/70 text-white overflow-y-auto
        ${isMobile ? 'max-h-24 p-2 mb-16' : 'max-h-28 p-3 mb-20'}
        rounded-md backdrop-blur-sm
        border-t border-white/20
      `}
      style={{ zIndex: 20 }}
      ref={containerRef}
    >
      <div ref={contentRef} className={`${isMobile ? 'text-sm' : 'text-base'} leading-relaxed`}>
        {text}
      </div>
    </div>
  );
};

export default Teleprompter;