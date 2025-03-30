import { useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { CustomScript } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export function useCustomScripts() {
  const [scripts, setScripts] = useLocalStorage<CustomScript[]>('custom-scripts', []);

  // Add a new script
  const addScript = useCallback((title: string, text: string): CustomScript => {
    const newScript: CustomScript = {
      id: uuidv4(),
      title,
      text,
      createdAt: new Date().toISOString(),
    };
    
    setScripts(prevScripts => [...prevScripts, newScript]);
    return newScript;
  }, [setScripts]);

  // Delete a script
  const deleteScript = useCallback((id: string): void => {
    setScripts(scripts.filter((script: CustomScript) => script.id !== id));
  }, [scripts, setScripts]);

  // Update a script
  const updateScript = useCallback((
    id: string, 
    updates: Partial<Omit<CustomScript, 'id' | 'createdAt'>>
  ): void => {
    setScripts(
      scripts.map((script: CustomScript) => 
        script.id === id ? { ...script, ...updates } : script
      )
    );
  }, [scripts, setScripts]);

  // Get a script by id
  const getScriptById = useCallback((id: string): CustomScript | undefined => {
    return scripts.find((script: CustomScript) => script.id === id);
  }, [scripts]);

  return {
    scripts,
    addScript,
    deleteScript,
    updateScript,
    getScriptById
  };
}