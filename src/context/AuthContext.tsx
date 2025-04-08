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
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error loading user:', error);
      return null;
    }
  });
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
  }, [inactivityTimer]);

  const resetInactivityTimer = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityTime > 1000) {
      setLastActivityTime(now);
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      if (user) {
        const timer = setTimeout(() => {
          logout();
        }, INACTIVITY_TIMEOUT);
        setInactivityTimer(timer);
      }
    }
  }, [user, inactivityTimer, logout, lastActivityTime]);

  useEffect(() => {
    if (user) {
      const events = [
        'mousedown',
        'mousemove',
        'keypress',
        'scroll',
        'touchstart',
        'click',
        'input',
        'change',
        'focus',
        'blur'
      ];

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          resetInactivityTimer();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      events.forEach(event => {
        window.addEventListener(event, resetInactivityTimer, { passive: true });
      });

      resetInactivityTimer();

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
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
      try {
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('Error saving user:', error);
      }
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      // For demo purposes, accept any non-empty email and password
      if (email && password) {
        const newUser: User = {
          id: crypto.randomUUID(),
          email,
          name: email.split('@')[0],
        };
        setUser(newUser);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
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