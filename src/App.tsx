import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, Typography } from '@mui/material';
import BillList from './components/BillList';
import AddBill from './components/AddBill';
import { BillsProvider } from './context/BillsContext';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BillsProvider>
        <Container maxWidth="lg">
          <Box sx={{ my: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom>
              Bill Tracker
            </Typography>
            <AddBill />
            <BillList />
          </Box>
        </Container>
      </BillsProvider>
    </ThemeProvider>
  );
}

export default App;
