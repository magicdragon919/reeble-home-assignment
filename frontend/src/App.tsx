// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Import Pages
import { Login } from './pages/Login';
import { Box, Typography } from '@mui/material';
import { Dashboard } from './pages/Dashboard';

// A placeholder for the home/redirect page
const Home = () => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" />;
  return <Box><Typography>Loading...</Typography></Box>;
}

// A simple unauthorized page
const Unauthorized = () => (
  <Box>
    <Typography variant="h2">Unauthorized</Typography>
    <Typography>You do not have permission to view this page.</Typography>
  </Box>
)


const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  // Redirect authenticated users from login page to home
  if (isAuthenticated && window.location.pathname === '/login') {
    return <Navigate to="/dashboard" replace />;
  }

  // Redirect unauthenticated users from home to login
  if (!isAuthenticated && window.location.pathname === '/') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<Login />} />

        <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;