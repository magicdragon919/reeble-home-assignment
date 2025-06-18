import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant='h6' sx={{ flexGrow: 1 }}>
          Real Estate App
        </Typography>
        <Button color="inherit" component={Link} to="/">
          Home
        </Button>
        <Button color="inherit" component={Link} to="/login">
          Login
        </Button>
        <Button color="inherit" component={Link} to="/admin">
          Admin Dashboard
        </Button>
        <Button color="inherit" component={Link} to="/buyer">
          Buyer Dashboard
        </Button>
      </Toolbar>
    </AppBar>      
  )
}