import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Snackbar,
  Alert,
} from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BillsProvider } from './context/BillsContext';
import AddBill from './components/AddBill';
import BillList from './components/BillList';
import Login from './components/Login';

const WARNING_TIMEOUT = 45000; // 45 seconds (15 seconds before logout)

const AppContent: React.FC = () => {
  const { user, logout, isAuthenticated, resetInactivityTimer } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [warningTimer, setWarningTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      // Set up warning timer
      const timer = setTimeout(() => {
        setShowWarning(true);
      }, WARNING_TIMEOUT);
      setWarningTimer(timer);

      return () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
    }
  }, [isAuthenticated]);

  const handleUserActivity = () => {
    resetInactivityTimer();
    setShowWarning(false);
    if (warningTimer) {
      clearTimeout(warningTimer);
    }
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Container onMouseMove={handleUserActivity} onKeyDown={handleUserActivity}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Bill Tracker
          </Typography>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Welcome, {user?.name}
          </Typography>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ my: 4 }}>
        <AddBill />
        <BillList />
      </Box>
      <Snackbar
        open={showWarning}
        autoHideDuration={15000}
        onClose={() => setShowWarning(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="warning"
          sx={{ width: '100%' }}
          action={
            <Button color="inherit" size="small" onClick={handleUserActivity}>
              Stay Logged In
            </Button>
          }
        >
          Your session will expire in 15 seconds due to inactivity.
        </Alert>
      </Snackbar>
    </Container>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BillsProvider>
        <AppContent />
      </BillsProvider>
    </AuthProvider>
  );
};

export default App;
