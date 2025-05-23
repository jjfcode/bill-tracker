import React from 'react';
import {
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Grid,
  Paper,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import AddBill from './AddBill';
import BillList from './BillList';
import BillCalendar from './BillCalendar';

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'grey.100' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Bill Tracker
          </Typography>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Welcome, {currentUser?.email}
          </Typography>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1, mt: 3, mb: 3, px: 3 }}>
        <Grid container spacing={3}>
          {/* Left Column - Calendar */}
          <Grid item xs={12} md={2}>
            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
              <BillCalendar />
            </Paper>
          </Grid>
          {/* Center Column - Main Content */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ mb: 3 }}>
                <AddBill />
              </Box>
              <Box>
                <BillList />
              </Box>
            </Paper>
          </Grid>
          {/* Right Column - Placeholder for Future Features */}
          <Grid item xs={12} md={2}>
            <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Future Features
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard; 