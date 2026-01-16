import React, { useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme/theme';
import { AppRouter } from './app/AppRouter';
import { useAuthStore } from './store/authStore';

import { BrowserRouter } from 'react-router-dom';

const App: React.FC = () => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
