import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { ThemeProvider } from '@mui/material';
import theme from './theme';
import Dashboard from './components/Dashboard';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

describe('Responsive Design', () => {
  it('renders correctly on small screens', () => {
    global.innerWidth = 375; // Simulate a small screen width
    global.dispatchEvent(new Event('resize'));

    const { container } = render(
      <ThemeProvider theme={theme}>
        <Dashboard />
      </ThemeProvider>
    );

    expect(container).toMatchSnapshot(); // Ensure the layout matches the expected snapshot
  });

  it('renders correctly on large screens', () => {
    global.innerWidth = 1440; // Simulate a large screen width
    global.dispatchEvent(new Event('resize'));

    const { container } = render(
      <ThemeProvider theme={theme}>
        <Dashboard />
      </ThemeProvider>
    );

    expect(container).toMatchSnapshot(); // Ensure the layout matches the expected snapshot
  });
});
