import React, { createContext, useContext, useState } from 'react';

interface VoiceAssistantContextType {
  isOpen: boolean;
  openVoiceAssistant: () => void;
  closeVoiceAssistant: () => void;
  toggleVoiceAssistant: () => void;
}

const VoiceAssistantContext = createContext<VoiceAssistantContextType | undefined>(undefined);

export const VoiceAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openVoiceAssistant = () => setIsOpen(true);
  const closeVoiceAssistant = () => setIsOpen(false);
  const toggleVoiceAssistant = () => setIsOpen((prev) => !prev);

  return (
    <VoiceAssistantContext.Provider
      value={{
        isOpen,
        openVoiceAssistant,
        closeVoiceAssistant,
        toggleVoiceAssistant,
      }}
    >
      {children}
    </VoiceAssistantContext.Provider>
  );
};

export const useVoiceAssistant = () => {
  const context = useContext(VoiceAssistantContext);
  if (!context) {
    throw new Error('useVoiceAssistant must be used within a VoiceAssistantProvider');
  }
  return context;
};
