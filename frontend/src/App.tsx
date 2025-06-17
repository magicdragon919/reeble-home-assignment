// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Import Pages
import { Login } from './pages/Login';
import { AgentDashboard } from './pages/AgentDashboard';
import { BuyerDashboard } from './pages/BuyerDashboard';
import { AdminDashboard } from './pages/AdminDashboard'; // Import new page
import { Box, Typography } from '@mui/material';

// A placeholder for the home/redirect page
const Home = () => {
  const { user } = useAuth();
  if (user?.role === 'Agent') return <Navigate to="/agent" />;
  if (user?.role === 'Buyer') return <Navigate to="/buyer" />;
  if (user?.role === 'Admin') return <Navigate to="/admin" />;
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
    const { user } = useAuth();
    if (user?.role === 'Agent') return <Navigate to="/agent" />;
    if (user?.role === 'Buyer') return <Navigate to="/buyer" />;
    if (user?.role === 'Admin') return <Navigate to="/admin" />;
    return <Navigate to="/" />;
  }

  // Redirect unauthenticated users from home to login
  if (!isAuthenticated && window.location.pathname === '/') {
    return <Navigate to="/login" />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<Login />} />

        <Route path="/agent" element={<ProtectedRoute allowedRoles={['Agent']}><AgentDashboard /></ProtectedRoute>} />
        <Route path="/buyer" element={<ProtectedRoute allowedRoles={['Buyer']}><BuyerDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />

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