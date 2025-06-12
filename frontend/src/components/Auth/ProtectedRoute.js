import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';
import { MusicNote as MusicIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #121212 0%, #1e1e1e 50%, #282828 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 50% 50%, rgba(29, 185, 84, 0.1) 0%, transparent 50%)`,
            zIndex: 1
          }
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          {/* Animated Logo */}
          <Fade in={true} timeout={800}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #1db954 30%, #1ed760 90%)',
                mb: 4,
                boxShadow: '0 20px 40px rgba(29, 185, 84, 0.3)',
                '@keyframes pulse': {
                  '0%': {
                    transform: 'scale(1)',
                    boxShadow: '0 20px 40px rgba(29, 185, 84, 0.3)'
                  },
                  '100%': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 25px 50px rgba(29, 185, 84, 0.4)'
                  }
                },
                animation: 'pulse 2s ease-in-out infinite alternate'
              }}
            >
              <MusicIcon sx={{ fontSize: 50, color: 'white' }} />
            </Box>
          </Fade>

          {/* Loading Spinner */}
          <Box sx={{ position: 'relative', mb: 3 }}>
            <CircularProgress
              size={80}
              thickness={4}
              sx={{
                color: '#1db954',
                opacity: 0.3,
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 1,
              }}
              variant="determinate"
              value={100}
            />
            <CircularProgress
              size={80}
              thickness={4}
              sx={{
                color: '#1db954',
                position: 'relative',
                zIndex: 2,
                filter: 'drop-shadow(0 0 20px rgba(29, 185, 84, 0.5))'
              }}
            />
          </Box>

          {/* Loading Text */}
          <Fade in={true} timeout={1200}>
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: 600,
                mb: 1,
                '@keyframes fadeInOut': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.7 }
                },
                animation: 'fadeInOut 2s ease-in-out infinite'
              }}
            >
              Loading MusicSocial
            </Typography>
          </Fade>

          <Fade in={true} timeout={1600}>
            <Typography
              variant="body2"
              sx={{
                color: '#b3b3b3',
                fontSize: '0.95rem'
              }}
            >
              Preparing your music experience...
            </Typography>
          </Fade>
        </Box>
      </Box>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute; 