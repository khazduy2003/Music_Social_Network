import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Tabs,
  Tab,
  Button
} from '@mui/material';
import { Person, ArrowBack } from '@mui/icons-material';
import { userService } from '../services/userService';
import FollowButton from './FollowButton';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

const FollowList = ({ type = 'followers' }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(type === 'followers' ? 0 : 1);
  const { user: currentUser } = useAuth();
  const { username } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (username) {
      loadUsers(tabValue === 0 ? 'followers' : 'following');
    }
  }, [username, tabValue]);

  const loadUsers = async (listType) => {
    setLoading(true);
    setError(null);

    try {
      let response;
      if (listType === 'followers') {
        response = await userService.getFollowersByUsername(username);
      } else {
        response = await userService.getFollowingByUsername(username);
      }

      console.log(`Loaded ${listType}:`, response);

      // Get follow status for each user if current user is viewing
      if (currentUser && Array.isArray(response)) {
        const usersWithFollowStatus = await Promise.all(
          response.map(async (user) => {
            try {
              if (user.id === currentUser.id) {
                return { ...user, isFollowing: false }; // Can't follow yourself
              }
              const isFollowing = await userService.isFollowing(user.id);
              return { ...user, isFollowing };
            } catch (err) {
              console.error(`Error checking follow status for user ${user.id}:`, err);
              return { ...user, isFollowing: false };
            }
          })
        );
        setUsers(usersWithFollowStatus);
      } else {
        setUsers(Array.isArray(response) ? response : []);
      }
    } catch (err) {
      setError(`Failed to load ${listType}. Please try again.`);
      console.error(`Load ${listType} error:`, err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFollowChange = async (userId, isNowFollowing) => {
    // Update UI immediately for better UX
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId
          ? {
              ...user,
              isFollowing: isNowFollowing,
              followersCount: isNowFollowing 
                ? (user.followersCount || 0) + 1 
                : Math.max((user.followersCount || 0) - 1, 0)
            }
          : user
      )
    );

    // Optionally refresh the user data from server to ensure consistency
    try {
      const updatedUser = await userService.getUserWithFollowStatus(userId);
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...updatedUser, isFollowing: isNowFollowing } : user
        )
      );
    } catch (err) {
      console.error('Error refreshing user data:', err);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!currentUser) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, textAlign: 'center' }}>
        <Alert severity="info">
          Please log in to view follow lists
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          @{username}'s Connections
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': { 
              color: '#b3b3b3',
              '&.Mui-selected': { color: '#6366f1' }
            },
            '& .MuiTabs-indicator': { backgroundColor: '#6366f1' }
          }}
        >
          <Tab label="Followers" />
          <Tab label="Following" />
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Card>
          <CardContent>
            <Box display="flex" flexDirection="column" alignItems="center" py={4}>
              <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No {tabValue === 0 ? 'followers' : 'following'} yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tabValue === 0 
                  ? `${username} doesn't have any followers yet` 
                  : `${username} isn't following anyone yet`
                }
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <List sx={{ p: 0 }}>
          {users.map((user) => (
            <ListItem key={user.id} sx={{ p: 0, mb: 2 }}>
              <Card sx={{ width: '100%' }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Avatar
                        src={user.avatarUrl}
                        sx={{ 
                          width: 56, 
                          height: 56,
                          cursor: 'pointer'
                        }}
                        onClick={() => handleUserClick(user.id)}
                      >
                        {user.username?.charAt(0).toUpperCase()}
                      </Avatar>
                    </Grid>
                    <Grid item xs>
                      <Typography 
                        variant="h6" 
                        component="div"
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { color: '#6366f1' }
                        }}
                        onClick={() => handleUserClick(user.id)}
                      >
                        {user.username}
                      </Typography>
                      {user.fullName && (
                        <Typography variant="body2" color="text.secondary">
                          {user.fullName}
                        </Typography>
                      )}
                      {user.bio && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {user.bio}
                        </Typography>
                      )}
                      <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                        <Chip
                          label={`${user.followersCount || 0} followers`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`${user.followingCount || 0} following`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Grid>
                    <Grid item>
                      <FollowButton
                        targetUser={user}
                        onFollowChange={handleFollowChange}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default FollowList; 