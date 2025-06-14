import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Menu, 
  MenuItem, 
  Avatar, 
  Box,
  InputBase,
  alpha,
  Typography,
  Badge,
  Tooltip,
  Slide
} from '@mui/material';
import { 
  Search as SearchIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Notifications as NotificationIcon,
  Favorite as FavoriteIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationCenter from '../NotificationCenter';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  const handleSearch = (event) => {
    if (event.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleAdminDashboard = () => {
    navigate('/admin');
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.9) 50%, rgba(15, 52, 96, 0.85) 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          opacity: 0.5,
        }
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        {/* Search Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, maxWidth: 600 }}>
          {/* Search Bar */}
          <Box
            sx={{
              position: 'relative',
              borderRadius: 25,
              background: 'rgba(20, 20, 30, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              marginLeft: 2,
              width: '100%',
              maxWidth: 500,
              '&:hover': {
                background: 'rgba(30, 30, 40, 0.9)',
                border: '1px solid rgba(255,255,255,0.3)',
                transform: 'translateY(-1px)',
                boxShadow: '0 8px 25px rgba(139, 92, 246, 0.2)',
              },
              '&:focus-within': {
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.5)',
                boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)',
              }
            }}
          >
            <Box
              sx={{
                padding: (theme) => theme.spacing(0, 2),
                height: '100%',
                position: 'absolute',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}
            >
              <SearchIcon sx={{ 
                color: '#e0e0e0',
                transition: 'color 0.3s ease',
                '.MuiBox-root:focus-within &': {
                  color: '#8b5cf6'
                }
              }} />
            </Box>
            <InputBase
              placeholder="Search songs, artists, playlists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearch}
              sx={{
                color: 'inherit',
                width: '100%',
                '& .MuiInputBase-input': {
                  padding: (theme) => theme.spacing(1.5, 1.5, 1.5, 0),
                  paddingLeft: `calc(1em + ${48}px)`,
                  transition: (theme) => theme.transitions.create('width'),
                  width: '100%',
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: 500,
                  '&::placeholder': {
                    color: '#b3b3b3',
                    opacity: 1,
                  }
                },
              }}
            />
          </Box>
        </Box>

        {/* Right Side Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notification Center */}
          {user && <NotificationCenter />}

          {/* Admin Dashboard Button - Only show for admin users */}
          {user && user.role === 'ADMIN' && (
            <Tooltip title="Admin Dashboard" arrow>
              <IconButton
                onClick={handleAdminDashboard}
                sx={{
                  background: 'rgba(255, 152, 0, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 152, 0, 0.4)',
                  color: '#ff9800',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'rgba(255, 152, 0, 0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(255, 152, 0, 0.4)',
                  }
                }}
              >
                <DashboardIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* User Menu */}
          <Box sx={{ position: 'relative' }}>
            {/* Backdrop */}
            {Boolean(anchorEl) && (
              <Box
                sx={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  backdropFilter: 'blur(4px)',
                  zIndex: 1200,
                  animation: 'fadeIn 0.3s ease-out',
                  '@keyframes fadeIn': {
                    from: { opacity: 0 },
                    to: { opacity: 1 }
                  }
                }}
                onClick={handleMenuClose}
              />
            )}
            
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="user-menu"
              aria-haspopup="true"
              onClick={handleMenuClick}
              sx={{
                background: 'rgba(139, 92, 246, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                padding: 0.5,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 1300,
                position: 'relative',
                '&:hover': {
                  background: 'rgba(139, 92, 246, 0.3)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
                }
              }}
            >
              {user?.avatarUrl ? (
                <Avatar 
                  src={user.avatarUrl} 
                  alt={user.username}
                  sx={{ 
                    width: 40, 
                    height: 40,
                    border: '2px solid rgba(255,255,255,0.3)',
                    transition: 'all 0.3s ease',
                  }}
                />
              ) : (
                <Avatar sx={{ 
                  width: 40, 
                  height: 40, 
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  fontWeight: 'bold',
                  border: '2px solid rgba(255,255,255,0.3)',
                }}>
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              )}
            </IconButton>
            
            <Menu
              id="user-menu"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              TransitionComponent={Slide}
              TransitionProps={{
                direction: 'down',
                timeout: 300
              }}
              sx={{
                zIndex: 1301,
                '& .MuiPaper-root': {
                  background: 'rgba(20, 20, 30, 0.95)',
                  backdropFilter: 'blur(30px)',
                  color: 'white',
                  minWidth: 220,
                  borderRadius: 3,
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  mt: 1,
                  transformOrigin: 'top right !important',
                  animation: 'slideDown 0.3s ease-out',
                  '@keyframes slideDown': {
                    from: { 
                      opacity: 0,
                      transform: 'translateY(-20px) scale(0.95)'
                    },
                    to: { 
                      opacity: 1,
                      transform: 'translateY(0) scale(1)'
                    }
                  }
                },
                '& .MuiMenuItem-root': {
                  borderRadius: 2,
                  margin: '4px 8px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(139, 92, 246, 0.2)',
                    transform: 'translateX(4px)',
                  }
                }
              }}
            >
              <Box sx={{ px: 2, py: 1, borderBottom: '1px solid rgba(255,255,255,0.2)', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#8b5cf6' }}>
                  {user?.username || 'User'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#b3b3b3' }}>
                  {user?.email || 'user@example.com'}
                </Typography>
              </Box>
              
              <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                <AccountIcon sx={{ mr: 2, color: '#8b5cf6' }} />
                <Typography sx={{ fontWeight: 500 }}>Profile</Typography>
              </MenuItem>
              
              <MenuItem onClick={handleMenuClose}>
                <SettingsIcon sx={{ mr: 2, color: '#f59e0b' }} />
                <Typography sx={{ fontWeight: 500 }}>Settings</Typography>
              </MenuItem>
              
              <MenuItem 
                onClick={handleLogout}
                sx={{
                  mt: 1,
                  borderTop: '1px solid rgba(255,255,255,0.2)',
                  color: '#f87171 !important',
                  '&:hover': {
                    background: 'rgba(248, 113, 113, 0.2) !important',
                  }
                }}
              >
                <LogoutIcon sx={{ mr: 2 }} />
                <Typography sx={{ fontWeight: 500 }}>Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 