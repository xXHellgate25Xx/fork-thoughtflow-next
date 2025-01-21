import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

interface GlobalContextType {
  jwtToken: string;
  setJwtToken: React.Dispatch<React.SetStateAction<string>>;
  userId: string;
  setUserId: React.Dispatch<React.SetStateAction<string>>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [jwtToken, setJwtToken] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  const contextValue = useMemo(() => ({ jwtToken, setJwtToken, setUserId, userId }), [userId,jwtToken]);

  return <GlobalContext.Provider value={contextValue}>{children}</GlobalContext.Provider>;
};

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};
