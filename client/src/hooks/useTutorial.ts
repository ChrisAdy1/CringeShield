import { useState, useEffect } from 'react';

interface TutorialState {
  hasSeenTutorial: boolean;
  isOpen: boolean;
}

// Custom hook to manage tutorial state
export function useTutorial() {
  const [state, setState] = useState<TutorialState>({
    hasSeenTutorial: false,
    isOpen: false,
  });

  // Check if tutorial has been seen before
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial') === 'true';
    setState(prev => ({ ...prev, hasSeenTutorial }));
  }, []);

  // Function to open the tutorial
  const showTutorial = () => {
    setState(prev => ({ ...prev, isOpen: true }));
  };

  // Function to close the tutorial
  const closeTutorial = () => {
    setState(prev => ({ ...prev, isOpen: false }));
  };

  // Function to mark tutorial as completed
  const completeTutorial = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setState({ hasSeenTutorial: true, isOpen: false });
  };

  // Function to reset tutorial (for testing)
  const resetTutorial = () => {
    localStorage.removeItem('hasSeenTutorial');
    setState({ hasSeenTutorial: false, isOpen: false });
  };

  return {
    hasSeenTutorial: state.hasSeenTutorial,
    isOpen: state.isOpen,
    showTutorial,
    closeTutorial,
    completeTutorial,
    resetTutorial,
  };
}

export default useTutorial;