import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Card,
  CardContent,
  Avatar,
  Typography,
  List,
  ListItem,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
  Grid
} from '@mui/material';
import { Search as SearchIcon, Person } from '@mui/icons-material';
import { userService } from '../services/userService';
import FollowButton from './FollowButton';
import { useAuth } from '../contexts/AuthContext';

const UserSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const { user: currentUser } = useAuth();

  // Load all users initially
  const loadAllUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await userService.getAllUsers();
      // Filter out current user and get users with follow status
      const filteredUsers = response.filter(user => user.id !== currentUser?.id);
      
      // Get follow status for each user
      const usersWithFollowStatus = await Promise.all(
        filteredUsers.map(async (user) => {
          try {
            const isFollowing = await userService.isFollowing(user.id);
            return { ...user, isFollowing };
          } catch (err) {
            console.error(`Error checking follow status for user ${user.id}:`, err);
            return { ...user, isFollowing: false };
          }
        })
      );
      
      setUsers(usersWithFollowStatus);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error('Load users error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  const searchUsers = useCallback(async (query) => {
    if (!query.trim()) {
      // If search is empty, reload all users
      loadAllUsers();
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await userService.searchUsers(query, 0, 20);
      const filteredUsers = (response.content || []).filter(user => user.id !== currentUser?.id);
      
      // Get follow status for each user
      const usersWithFollowStatus = await Promise.all(
        filteredUsers.map(async (user) => {
          try {
            const isFollowing = await userService.isFollowing(user.id);
            return { ...user, isFollowing };
          } catch (err) {
            console.error(`Error checking follow status for user ${user.id}:`, err);
            return { ...user, isFollowing: false };
          }
        })
      );
      
      setUsers(usersWithFollowStatus);
    } catch (err) {
      setError('Failed to search users. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, loadAllUsers]);

  // Load all users on component mount
  useEffect(() => {
    if (currentUser) {
      loadAllUsers();
    }
  }, [currentUser, loadAllUsers]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchUsers]);

  const handleFollowChange = async (userId, isNowFollowing) => {
    // Update UI immediately for better UX
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId
          ? {
              ...user,
              isFollowing: isNowFollowing,
              followersCount: isNowFollowing 
                ? user.followersCount + 1 
                : user.followersCount - 1
            }
          : user
      )
    );

    // Optionally refresh the user data from server to ensure consistency
    try {
      const updatedUser = await userService.getUserWithFollowStatus(userId);
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? updatedUser : user
        )
      );
    } catch (err) {
      console.error('Error refreshing user data:', err);
    }
  };

  if (!currentUser) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, textAlign: 'center' }}>
        <Alert severity="info">
          Please log in to discover users
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Discover Users
      </Typography>
      
      <TextField
        fullWidth
        placeholder="Search for users by username or email..."
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: loading && (
            <InputAdornment position="end">
              <CircularProgress size={20} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && users.length === 0 ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Card>
          <CardContent>
            <Box display="flex" flexDirection="column" alignItems="center" py={4}>
              <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {hasSearched ? 'No users found' : 'No users available'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {hasSearched ? 'Try searching with different keywords' : 'Be the first to connect!'}
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
                        sx={{ width: 56, height: 56 }}
                      >
                        {user.username?.charAt(0).toUpperCase()}
                      </Avatar>
                    </Grid>
                    <Grid item xs>
                      <Typography variant="h6" component="div">
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

export default UserSearch; 