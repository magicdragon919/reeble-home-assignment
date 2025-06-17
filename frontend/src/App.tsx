import { CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import theme from './theme';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import Login from './pages/Login';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path='/login' element={<Login />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;