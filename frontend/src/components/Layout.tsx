import { Outlet, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AppBar, Toolbar, Typography, Button, Container, Box, Link } from '@mui/material';

export const Layout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Link component={RouterLink} to="/" sx={{ flexGrow: 1, textDecoration: 'none' }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
              Reeble
            </Typography>
          </Link>
          
          {isAuthenticated && user && (
            <Box>
              {user.role === 'Agent' && <Button component={RouterLink} to="/agent" color="primary">Agent Dashboard</Button>}
              {user.role === 'Buyer' && <Button component={RouterLink} to="/buyer" color="primary">Buyer Dashboard</Button>}
              {user.role === 'Admin' && <Button component={RouterLink} to="/admin" color="primary">Admin Dashboard</Button>}
              <Button onClick={handleLogout} variant="outlined" sx={{ ml: 2 }}>
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ py: 4, flexGrow: 1 }}>
        <Outlet />
      </Container>
    </Box>
  );
};