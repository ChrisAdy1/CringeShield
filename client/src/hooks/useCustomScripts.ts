import { v4 as uuidv4 } from 'uuid';
import { CustomScript } from '@/lib/types';
import useLocalStorage from './useLocalStorage';
import { defaultScripts } from '@/lib/defaultScripts';
import { useEffect } from 'react';

export function useCustomScripts() {
  const [scripts, setScripts] = useLocalStorage<CustomScript[]>('custom-scripts', []);

  // Initialize with default scripts if scripts array is empty
  useEffect(() => {
    if (scripts.length === 0) {
      const initialScripts = defaultScripts.map(script => ({
        id: uuidv4(),
        title: script.title,
        text: script.text,
        createdAt: new Date().toISOString()
      }));
      
      setScripts(initialScripts);
    }
  }, []);
  
  const addScript = (title: string, text: string): CustomScript => {
    const newScript: CustomScript = {
      id: uuidv4(),
      title,
      text,
      createdAt: new Date().toISOString()
    };
    
    setScripts([...scripts, newScript]);
    return newScript;
  };

  const deleteScript = (id: string) => {
    setScripts(scripts.filter((script: CustomScript) => script.id !== id));
  };

  const updateScript = (id: string, updates: Partial<Omit<CustomScript, 'id' | 'createdAt'>>) => {
    setScripts(
      scripts.map((script: CustomScript) => 
        script.id === id 
          ? { ...script, ...updates } 
          : script
      )
    );
  };

  const getScript = (id: string): CustomScript | undefined => {
    return scripts.find((script: CustomScript) => script.id === id);
  };

  return {
    scripts,
    addScript,
    deleteScript,
    updateScript,
    getScript
  };
}