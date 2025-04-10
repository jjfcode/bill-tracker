import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useAuth } from './context/AuthContext';
import theme from './theme';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { BillsProvider } from './context/BillsContext';

const AppContent: React.FC = () => {
  const { currentUser, logout } = useAuth();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <BillsProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </BillsProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
