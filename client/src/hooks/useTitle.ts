import { useEffect } from 'react';

/**
 * A hook to set the document title with a consistent format
 * @param pageTitle The specific page title to display
 */
export function useTitle(pageTitle: string | undefined | null) {
  useEffect(() => {
    // Set the document title with the app name at the end
    const appName = 'CringeShield';
    const fullTitle = pageTitle ? `${pageTitle} | ${appName}` : appName;
    document.title = fullTitle;
    
    // Cleanup - restore the original title when component unmounts
    return () => {
      document.title = appName;
    };
  }, [pageTitle]);
}