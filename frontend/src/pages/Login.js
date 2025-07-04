import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Container,
  Alert,
  CircularProgress,
  Fade,
  Slide
} from '@mui/material';
import { MusicNote as MusicIcon, Login as LoginIcon } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #121212 0%, #1e1e1e 50%, #282828 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 80%, rgba(29, 185, 84, 0.1) 0%, transparent 50%),
                       radial-gradient(circle at 80% 20%, rgba(29, 185, 84, 0.05) 0%, transparent 50%)`,
          zIndex: 1
        }
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 450,
          mx: 2
        }}
      >
        <Fade in={true} timeout={800}>
          <Paper
            elevation={24}
            sx={{
              padding: { xs: 3, sm: 5 },
              backgroundColor: 'rgba(28, 28, 28, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(29, 185, 84, 0.2)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 60px rgba(29, 185, 84, 0.1)',
              width: '100%'
            }}
          >
            {/* Logo and Title */}
            <Slide direction="down" in={true} timeout={600}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #1db954 30%, #1ed760 90%)',
                    mb: 3,
                    boxShadow: '0 8px 32px rgba(29, 185, 84, 0.3)'
                  }}
                >
                  <MusicIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: 'white', 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: '1.75rem', sm: '2.125rem' }
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#b3b3b3',
                    fontSize: '1.1rem'
                  }}
                >
                  Sign in to your MusicSocial account
                </Typography>
              </Box>
            </Slide>

            {/* Error Alert */}
            {error && (
              <Fade in={true}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    border: '1px solid rgba(244, 67, 54, 0.3)',
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      color: '#ffcdd2'
                    }
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Login Form */}
            <Slide direction="up" in={true} timeout={800}>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  name="username"
                  label="Username"
                  variant="outlined"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#1db954',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1db954',
                        borderWidth: 2,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#b3b3b3',
                      '&.Mui-focused': {
                        color: '#1db954',
                      },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  variant="outlined"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  sx={{
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#1db954',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1db954',
                        borderWidth: 2,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#b3b3b3',
                      '&.Mui-focused': {
                        color: '#1db954',
                      },
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  startIcon={!loading && <LoginIcon />}
                  sx={{
                    py: 1.5,
                    background: 'linear-gradient(45deg, #1db954 30%, #1ed760 90%)',
                    boxShadow: '0 8px 32px rgba(29, 185, 84, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1ed760 30%, #1db954 90%)',
                      boxShadow: '0 12px 40px rgba(29, 185, 84, 0.4)',
                      transform: 'translateY(-2px)',
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(29, 185, 84, 0.3)',
                    },
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    borderRadius: 3,
                    mb: 3,
                    textTransform: 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </Slide>

            {/* Sign Up Link */}
            <Fade in={true} timeout={1000}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                  Don't have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/register"
                    sx={{
                      color: '#1db954',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      '&:hover': {
                        textDecoration: 'underline',
                        color: '#1ed760',
                      },
                      transition: 'color 0.3s ease'
                    }}
                  >
                    Create one here
                  </Link>
                </Typography>
              </Box>
            </Fade>
          </Paper>
        </Fade>
      </Box>
    </Box>
  );
};

export default Login; 