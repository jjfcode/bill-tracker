import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  resetInactivityTimer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const INACTIVITY_TIMEOUT = 60000; // 1 minute in milliseconds

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
  }, [inactivityTimer]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    if (user) {
      const timer = setTimeout(() => {
        logout();
      }, INACTIVITY_TIMEOUT);
      setInactivityTimer(timer);
    }
  }, [user, inactivityTimer, logout]);

  useEffect(() => {
    if (user) {
      // Set up event listeners for user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => {
        window.addEventListener(event, resetInactivityTimer);
      });

      // Initial timer setup
      resetInactivityTimer();

      // Cleanup
      return () => {
        events.forEach(event => {
          window.removeEventListener(event, resetInactivityTimer);
        });
        if (inactivityTimer) {
          clearTimeout(inactivityTimer);
        }
      };
    }
  }, [user, resetInactivityTimer, inactivityTimer]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    // In a real app, this would call an API
    // For now, we'll simulate a successful login
    if (email && password) {
      setUser({
        id: '1',
        email,
        name: email.split('@')[0],
      });
    } else {
      throw new Error('Invalid credentials');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        resetInactivityTimer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 