import { useState } from 'react';
import { cn } from '@/lib/utils';

type SocialMediaPlatform = 'tiktok' | 'youtube' | 'instagram' | 'none';

interface SocialMediaFrameProps {
  platform: SocialMediaPlatform;
  children: React.ReactNode;
}

const SocialMediaFrame: React.FC<SocialMediaFrameProps> = ({ platform, children }) => {
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState(0);
  const [shares, setShares] = useState(0);
  
  // Show placeholder engagement stats that simulate the platform
  const handleSimulateEngagement = () => {
    setLikes(prev => prev + Math.floor(Math.random() * 5) + 1);
    if (Math.random() > 0.7) setComments(prev => prev + 1);
    if (Math.random() > 0.8) setShares(prev => prev + 1);
  };
  
  if (platform === 'none') {
    return <>{children}</>;
  }
  
  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Frame container with platform-specific styling */}
      <div
        className={cn(
          "relative w-full h-full overflow-hidden rounded-lg border",
          {
            "border-red-500 bg-black": platform === 'tiktok',
            "border-red-600 bg-white": platform === 'youtube',
            "border-purple-600 bg-white": platform === 'instagram',
          }
        )}
      >
        {/* Video content */}
        <div className="w-full h-full">
          {children}
        </div>
        
        {/* Platform-specific UI overlays */}
        {platform === 'tiktok' && (
          <div className="absolute bottom-0 right-0 flex flex-col items-center p-4 gap-4">
            <button 
              onClick={handleSimulateEngagement}
              className="rounded-full bg-black/30 p-2 text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-xs block">{likes}</span>
            </button>
            <button className="rounded-full bg-black/30 p-2 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-xs block">{comments}</span>
            </button>
            <button className="rounded-full bg-black/30 p-2 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="text-xs block">{shares}</span>
            </button>
          </div>
        )}
        
        {platform === 'youtube' && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <div className="flex justify-between items-center text-white">
              <div>
                <h3 className="text-sm font-medium">Your YouTube Video</h3>
                <p className="text-xs opacity-80">Practice Channel • {Math.floor(Math.random() * 999) + 1} views</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleSimulateEngagement}
                  className="flex items-center gap-1 text-xs"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  {likes}
                </button>
                <button className="flex items-center gap-1 text-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2" />
                  </svg>
                  0
                </button>
              </div>
            </div>
          </div>
        )}
        
        {platform === 'instagram' && (
          <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500"></div>
              <span className="text-white text-sm font-medium">your_username</span>
            </div>
            <button
              onClick={handleSimulateEngagement}
              className="text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {/* Platform indicator */}
      <div className="mt-2 text-center text-xs text-gray-500">
        Practicing for {platform === 'tiktok' ? 'TikTok' : platform === 'youtube' ? 'YouTube' : 'Instagram'} 
      </div>
    </div>
  );
};

export default SocialMediaFrame;