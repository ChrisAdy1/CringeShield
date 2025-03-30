import React, { useEffect, useRef } from 'react';

interface TeleprompterProps {
  text: string;
  isVisible: boolean;
  isRecording: boolean;
}

const Teleprompter: React.FC<TeleprompterProps> = ({ 
  text, 
  isVisible, 
  isRecording 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<number | null>(null);
  
  // Auto-scroll when recording
  useEffect(() => {
    // Clear any existing scroll interval
    if (scrollRef.current) {
      clearInterval(scrollRef.current);
      scrollRef.current = null;
    }
    
    // Start auto-scroll if recording and visible
    if (isRecording && isVisible && containerRef.current) {
      // Calculate scroll speed based on text length
      // Adjust the divisor to control scroll speed
      const textLength = text.length;
      const scrollSpeed = Math.max(40, Math.min(70, 60 - (textLength / 500)));
      
      scrollRef.current = window.setInterval(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop += 1;
        }
      }, scrollSpeed);
    }
    
    // Cleanup
    return () => {
      if (scrollRef.current) {
        clearInterval(scrollRef.current);
      }
    };
  }, [isRecording, isVisible, text]);
  
  // Reset scroll position when visibility changes
  useEffect(() => {
    if (containerRef.current && !isVisible) {
      containerRef.current.scrollTop = 0;
    }
  }, [isVisible]);
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <div 
      ref={containerRef}
      className="absolute bottom-0 left-0 right-0 bg-black/70 p-4 text-white max-h-[30%] overflow-y-auto"
      style={{
        scrollBehavior: 'smooth'
      }}
    >
      <p className="text-lg leading-relaxed whitespace-pre-line">
        {text}
      </p>
      
      {/* Add extra space at the bottom to allow complete scrolling */}
      <div className="h-32"></div>
    </div>
  );
};

export default Teleprompter;