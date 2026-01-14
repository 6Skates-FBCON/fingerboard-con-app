import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BrowsingContextType {
  isBrowsingMode: boolean;
  setBrowsingMode: (mode: boolean) => Promise<void>;
  showLoginPrompt: boolean;
  setShowLoginPrompt: (show: boolean) => void;
  pendingAction: (() => void) | null;
  setPendingAction: (action: (() => void) | null) => void;
}

const BrowsingContext = createContext<BrowsingContextType | undefined>(undefined);

export function BrowsingProvider({ children }: { children: React.ReactNode }) {
  const [isBrowsingMode, setIsBrowsingModeState] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    const loadBrowsingMode = async () => {
      try {
        const mode = await AsyncStorage.getItem('browsing_mode');
        setIsBrowsingModeState(mode === 'true');
      } catch (error) {
        console.error('Error loading browsing mode:', error);
      }
    };
    loadBrowsingMode();
  }, []);

  const setBrowsingMode = async (mode: boolean) => {
    try {
      await AsyncStorage.setItem('browsing_mode', mode.toString());
      setIsBrowsingModeState(mode);
    } catch (error) {
      console.error('Error saving browsing mode:', error);
    }
  };

  return (
    <BrowsingContext.Provider
      value={{
        isBrowsingMode,
        setBrowsingMode,
        showLoginPrompt,
        setShowLoginPrompt,
        pendingAction,
        setPendingAction,
      }}
    >
      {children}
    </BrowsingContext.Provider>
  );
}

export function useBrowsing() {
  const context = useContext(BrowsingContext);
  if (context === undefined) {
    throw new Error('useBrowsing must be used within a BrowsingProvider');
  }
  return context;
}
