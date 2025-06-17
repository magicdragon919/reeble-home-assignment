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
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Link component={RouterLink} to="/" sx={{ flexGrow: 1, textDecoration: 'none' }}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                Reeble
              </Typography>
            </Link>

            {isAuthenticated && user && (
              <Box>
                <Button onClick={handleLogout} variant="outlined" sx={{ ml: 2 }}>
                  Logout
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      <Container component="main" sx={{ py: 4, flexGrow: 1 }}>
        <Outlet />
      </Container>
    </Box>
  );
};