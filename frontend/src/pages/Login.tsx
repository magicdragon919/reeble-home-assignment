import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import { Email as EmailIcon, Lock as LockIcon, Visibility, VisibilityOff, Language as LanguageIcon, Cookie as CookieIcon, Lock, LockOutline, EmailOutlined, } from '@mui/icons-material'
import { ErrorFeedback } from '../components/ErrorFeedback';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: any) => event.preventDefault();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h1" component="h1" align="center" gutterBottom>
          Login
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            InputProps={{ disableUnderline: true, sx: { borderRadius: '8px', bgcolor: '#fff6f5' }, 
              startAdornment: (<InputAdornment position='start'><EmailOutlined></EmailOutlined></InputAdornment>)
            }}
            onChange={e => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            required
            margin="normal"
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            variant="outlined"
            InputProps={{ disableUnderline: true, sx: { borderRadius: '8px', bgcolor: '#fff6f5' }, 
              endAdornment: (<InputAdornment position="end"><IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>), 
              startAdornment: (<InputAdornment position='start'><LockOutline></LockOutline></InputAdornment>)
            }}
            sx={{ mb: 1 }}
            onChange={e => setPassword(e.target.value)} 
          />
          <ErrorFeedback error={error} title="Login Failed" />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{ 
              mt: 3, 
              mb: 2, 
              py: 1.5, 
              backgroundColor: "#f73b20",
              '&:disabled': {
                backgroundColor: "#f73b20",
                opacity: 0.7
              },
              '&:hover': {
                backgroundColor: "#f73b20"
              }
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};