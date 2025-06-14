import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Avatar,
  Button
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home as HomeIcon,
  Search as SearchIcon,
  LibraryMusic as LibraryIcon,
  QueueMusic as PlaylistIcon,
  Explore as ExploreIcon,
  Person as PersonIcon,
  MusicNote as MusicIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Favorite as FavoriteIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { adminService } from '../../services/adminService';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated, logout } = useAuth();
  const { isCollapsed, sidebarWidth, toggleSidebar } = useSidebar();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin access
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (isAuthenticated && user) {
        try {
          const adminAccess = await adminService.checkAdminAccess(user.id);
          setIsAdmin(adminAccess);
        } catch (error) {
          console.error('Error checking admin access:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminAccess();
  }, [user, isAuthenticated]);

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/', color: '#6366f1' },
    { text: 'Discover', icon: <ExploreIcon />, path: '/discover', color: '#8b5cf6' },
    { text: 'Search', icon: <SearchIcon />, path: '/search', color: '#10b981' },
    { text: 'Favourites', icon: <FavoriteIcon />, path: '/favourites', color: '#ec4899' },
  ];

  const libraryItems = [
    { text: 'Your Library', icon: <LibraryIcon />, path: '/library', color: '#f59e0b' },
    { text: 'Playlists', icon: <PlaylistIcon />, path: '/playlists', color: '#ec4899' },
  ];

  const socialItems = [
    { text: 'Discover Users', icon: <PersonAddIcon />, path: '/discover-users', color: '#06b6d4' },
  ];

  // Admin items - only show if user is admin
  const adminItems = isAdmin ? [
    { text: 'Admin Dashboard', icon: <DashboardIcon />, path: '/admin', color: '#ef4444' },
  ] : [];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleToggle = () => {
    toggleSidebar();
  };

  const MenuItem = ({ item, isLibraryItem = false }) => {
    const active = isActive(item.path);
    
    return (
      <ListItem disablePadding sx={{ mb: 0.5 }}>
        <Tooltip 
          title={isCollapsed ? item.text : ''} 
          placement="right"
          arrow
          sx={{
            '& .MuiTooltip-tooltip': {
              backgroundColor: 'rgba(20, 20, 30, 0.95)',
              color: 'white',
              border: `1px solid ${item.color}60`,
              fontSize: '0.875rem',
              fontWeight: 500,
            },
            '& .MuiTooltip-arrow': {
              color: 'rgba(20, 20, 30, 0.95)',
            }
          }}
        >
          <ListItemButton
            onClick={() => navigate(item.path)}
            sx={{
              borderRadius: 3,
              mx: 1,
              minHeight: 56,
              px: isCollapsed ? 1.5 : 2,
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              background: active 
                ? `linear-gradient(135deg, ${item.color}20, ${item.color}40)`
                : 'transparent',
              border: active ? `2px solid ${item.color}60` : '2px solid transparent',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                background: active 
                  ? `linear-gradient(135deg, ${item.color}30, ${item.color}50)`
                  : `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.1))`,
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${item.color}30`,
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(135deg, ${item.color}10, transparent)`,
                opacity: active ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }
            }}
          >
            <ListItemIcon 
              sx={{ 
                color: active ? item.color : '#b3b3b3',
                minWidth: isCollapsed ? 0 : 56,
                margin: isCollapsed ? 0 : 'inherit',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                width: isCollapsed ? '100%' : 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '& .MuiSvgIcon-root': {
                  fontSize: isCollapsed ? '1.75rem' : '1.5rem',
                  filter: active ? `drop-shadow(0 0 8px ${item.color}60)` : 'none',
                  transition: 'all 0.3s ease',
                }
              }}
            >
              {item.icon}
            </ListItemIcon>
            {!isCollapsed && (
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  '& .MuiTypography-root': {
                    color: active ? item.color : '#ffffff',
                    fontWeight: active ? 700 : 500,
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    textShadow: active ? `0 0 10px ${item.color}60` : 'none',
                  }
                }} 
              />
            )}
          </ListItemButton>
        </Tooltip>
      </ListItem>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '& .MuiDrawer-paper': {
          width: sidebarWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box sx={{ 
        padding: 2, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Header with Logo and Toggle */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: isCollapsed ? 'center' : 'space-between',
          mb: 3,
          pb: 2,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          position: 'relative',
          minHeight: 64,
          overflow: 'visible'
        }}>
          {!isCollapsed && (
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
              onClick={() => navigate('/')}
            >
            <Box sx={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              <MusicIcon sx={{ 
                color: 'white', 
                fontSize: 24,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }} />
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace: 'nowrap'
              }}
            >
              MusicSocial
            </Typography>
            </Box>
          )}

          
          {!isCollapsed && (
            <IconButton
              onClick={handleToggle}
              sx={{
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(255,255,255,0.2)',
                  transform: 'scale(1.1)',
                }
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
          )}
          
          {isCollapsed && (
            <IconButton
              onClick={handleToggle}
              sx={{
                position: 'absolute',
                top: 6,
                right: -2,
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                width: 36,
                height: 36,
                zIndex: 10,
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(255,255,255,0.2)',
                  transform: 'scale(1.1)',
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>

        
        
        {/* Login Button if not authenticated */}
        {!isAuthenticated && !isCollapsed && (
          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={() => navigate('/login')}
            sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                boxShadow: '0 6px 20px rgba(139, 92, 246, 0.6)',
              }
            }}
          >
            Sign In
          </Button>
        )}
        
        {/* Login Icon if collapsed and not authenticated */}
        {!isAuthenticated && isCollapsed && (
          <IconButton
            onClick={() => navigate('/login')}
            sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                boxShadow: '0 6px 20px rgba(139, 92, 246, 0.6)',
              }
            }}
          >
            <LoginIcon />
          </IconButton>
        )}

        {/* Main Menu */}
        <List sx={{ width: '100%', mb: 2 }}>
          <MenuItem item={menuItems[0]} />
          <MenuItem item={menuItems[1]} />
          <MenuItem item={menuItems[2]} />
          <MenuItem item={menuItems[3]} />
        </List>

        {/* Library Section */}
        {!isCollapsed && (
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: '#b3b3b3', 
              textTransform: 'uppercase', 
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              fontWeight: 700,
              ml: 3,
              mt: 2,
              mb: 1
            }}
          >
            Your Library
          </Typography>
        )}

        <List sx={{ width: '100%' }}>
          {libraryItems.map((item) => (
            <MenuItem key={item.text} item={item} isLibraryItem />
          ))}
        </List>

        {/* Social Section */}
        {!isCollapsed && (
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: '#b3b3b3', 
              textTransform: 'uppercase', 
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              fontWeight: 700,
              ml: 3,
              mt: 2,
              mb: 1
            }}
          >
            Social
          </Typography>
        )}

        <List sx={{ width: '100%', mb: 2 }}>
          <MenuItem item={{ text: 'Discover Users', icon: <PersonAddIcon />, path: '/discover-users', color: '#06b6d4' }} />
        </List>

        {/* Admin Section - Only show if user is admin */}
        {isAdmin && (
          <>
            {!isCollapsed && (
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: '#b3b3b3', 
                  textTransform: 'uppercase', 
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                  ml: 3,
                  mt: 2,
                  mb: 1
                }}
              >
                Administration
              </Typography>
            )}

            <List sx={{ width: '100%', mb: 2 }}>
              {adminItems.map((item) => (
                <MenuItem key={item.text} item={item} />
              ))}
            </List>
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default Sidebar; 