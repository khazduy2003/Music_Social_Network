import React, { useState, useEffect, useCallback } from 'react';
import {
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  IconButton,
  Divider,
  Button,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  Person as PersonIcon,
  Comment as CommentIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

const NotificationCenter = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async (pageNum = 0, refresh = false) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await notificationService.getUserNotifications(user.id, pageNum, 5);
      
      if (refresh) {
        setNotifications(response.content || []);
      } else {
        setNotifications(prev => [...prev, ...(response.content || [])]);
      }
      
      setHasMore((response.content || []).length === 5);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    
    try {
      const count = await notificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user, fetchUnreadCount]);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications(0, true);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLoadMore = () => {
    fetchNotifications(page + 1);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      await fetchUnreadCount();
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    // Navigate based on notification type and item type
    if (notification.itemId && notification.itemType) {
      navigate(`/${notification.itemType}s/${notification.itemId}`);
    }
    
    handleClose();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'SHARE':
        return <ShareIcon color="primary" />;
      case 'LIKE':
        return <FavoriteIcon color="error" />;
      case 'FOLLOW':
        return <PersonIcon color="info" />;
      case 'COMMENT':
        return <CommentIcon color="success" />;
      default:
        return <InfoIcon color="action" />;
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <>
      <Tooltip title="Notifications" arrow>
        <IconButton
          onClick={handleOpen}
          sx={{
            position: 'relative',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
            }
          }}
        >
          <Badge 
            badgeContent={unreadCount} 
            color="error"
            max={99}
            overlap="circular"
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 350,
            maxHeight: 500,
            borderRadius: 2,
            background: 'linear-gradient(145deg, #1e1e2e, #2a2a40)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
            Notifications
          </Typography>
          <Typography variant="caption" sx={{ color: '#b3b3b3' }}>
            {unreadCount} unread
          </Typography>
        </Box>
        
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        
        {notifications.length === 0 && !loading ? (
          <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.2)', mb: 2 }} />
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              No notifications yet
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', mt: 1 }}>
              When you receive notifications, they'll appear here
            </Typography>
          </Box>
        ) : (
          <>
            <List sx={{ maxHeight: 350, overflow: 'auto', p: 0 }}>
              {notifications.map((notification) => (
                <ListItem 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  sx={{ 
                    p: 2, 
                    cursor: 'pointer', 
                    bgcolor: notification.read ? 'transparent' : 'rgba(29, 185, 84, 0.05)',
                    borderLeft: notification.read ? 'none' : '3px solid #1db954',
                    '&:hover': { 
                      bgcolor: 'rgba(255, 255, 255, 0.05)' 
                    }
                  }}
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.5)',
                        '&:hover': { color: '#f44336' }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      src={notification.sender?.avatarUrl}
                      sx={{ 
                        bgcolor: notification.sender ? 'primary.main' : 'rgba(255, 255, 255, 0.2)',
                        width: 40, 
                        height: 40 
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'white',
                          fontWeight: notification.read ? 'normal' : 'medium' 
                        }}
                      >
                        {notification.message}
                      </Typography>
                    }
                    secondary={
                      <Typography 
                        variant="caption" 
                        sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                      >
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
            
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} sx={{ color: '#1db954' }} />
              </Box>
            )}
            
            {hasMore && !loading && (
              <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'center' }}>
                <Button 
                  onClick={handleLoadMore} 
                  sx={{ 
                    color: '#1db954',
                    '&:hover': { 
                      bgcolor: 'rgba(29, 185, 84, 0.1)' 
                    }
                  }}
                >
                  Load more
                </Button>
              </Box>
            )}
          </>
        )}
      </Popover>
    </>
  );
};

export default NotificationCenter; 