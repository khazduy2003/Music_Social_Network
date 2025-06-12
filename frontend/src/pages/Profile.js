import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  Avatar, 
  Button, 
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  TextField,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Badge,
  Tooltip,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import { 
  Edit as EditIcon, 
  MusicNote as MusicIcon,
  Favorite as FavoriteIcon,
  QueueMusic as PlaylistIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  PhotoCamera as PhotoCameraIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { trackService } from '../services/trackService';
import { playlistService } from '../services/playlistService';
import { listeningHistoryService } from '../services/listeningHistoryService';
import { userService } from '../services/userService';
import { useNavigate, useParams } from 'react-router-dom';
import FollowButton from '../components/FollowButton';

const Profile = () => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const { id: profileUserId } = useParams();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileUser, setProfileUser] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [stats, setStats] = useState({
    likedTracks: 0,
    playlists: 0,
    listenedTracks: 0
  });
  const [userProfile, setUserProfile] = useState({
    username: '',
    name: '',
    email: '',
    bio: '',
    avatarUrl: ''
  });
  const [likedTracks, setLikedTracks] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [listeningHistory, setListeningHistory] = useState([]);
  const [error, setError] = useState(null);

  // Load the profile on component mount
  useEffect(() => {
    // Determine whose profile to show
    const targetUserId = profileUserId || (currentUser ? currentUser.id : null);
    
    if (targetUserId) {
      // Set whether this is the current user's profile
      setIsOwnProfile(currentUser && targetUserId == currentUser.id);
      
      // Load the profile data
      loadProfileData(targetUserId);
    }
  }, [profileUserId, currentUser, isAuthenticated]);
  
  // Refresh counts whenever the component gains focus (switching back to the tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && profileUser) {
        refreshProfileCounts(profileUser.id);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [profileUser]);
  
  // Main function to load all profile data
  const loadProfileData = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      // Load the user profile with follow status if needed
      let userData;
      if (currentUser && userId != currentUser.id) {
        userData = await userService.getUserWithFollowStatus(userId);
      } else {
        userData = await userService.getUserById(userId);
      }
      
      setProfileUser(userData);
      
      // Set user profile data for display
      setUserProfile({
        username: userData.username,
        email: userData.email,
        name: userData.fullName || '',
        bio: userData.bio || '',
        avatarUrl: userData.avatarUrl
      });
      
      // Load additional data in parallel
      await Promise.all([
        loadLikedTracks(userData),
        loadUserPlaylists(userData),
        loadListeningHistory(userData)
      ]);
      
    } catch (error) {
      console.error('Error loading profile data:', error);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to specifically refresh follow counts
  const refreshProfileCounts = async (userId) => {
    try {
      // Silently refresh profile without showing loading indicator
      const userData = await userService.getUserById(userId);
      
      // Update only count-related fields
      setProfileUser(prev => ({
        ...prev,
        followersCount: userData.followersCount,
        followingCount: userData.followingCount
      }));
      
      // If this is someone else's profile, also refresh current user data
      if (!isOwnProfile && currentUser) {
        const currentUserData = await userService.getUserById(currentUser.id);
        // Update localStorage to maintain consistency
        localStorage.setItem('user', JSON.stringify({
          ...currentUser,
          followingCount: currentUserData.followingCount
        }));
      }
    } catch (error) {
      console.error('Error refreshing profile counts:', error);
      // Don't show error for background refresh
    }
  };
  
  const loadLikedTracks = async (user) => {
    try {
      const tracks = await trackService.getLikedTracks(user.id);
      setLikedTracks(tracks || []);
      
      // Update stats with correct count
      setStats(prev => ({
        ...prev,
        likedTracks: tracks ? tracks.length : 0
      }));
    } catch (error) {
      console.error('Error loading liked tracks:', error);
    }
  };
  
  const loadUserPlaylists = async (user) => {
    try {
      console.log('Loading playlists for user:', user.username);
      const playlists = await playlistService.getUserPlaylists(user.username);
      console.log('Received playlists:', playlists);
      
      // Set the playlists in state
      setUserPlaylists(playlists || []);
      
      // Log the updated count
      console.log(`Loaded ${playlists?.length || 0} playlists for user ${user.username}`);
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  };
  
  const loadListeningHistory = async (user) => {
    try {
      const history = await listeningHistoryService.getUserHistory(user.id, 0, 20);
      setListeningHistory(history.content || []);
      
      // Update stats with total count from pagination info
      setStats(prev => ({
        ...prev,
        listenedTracks: history.totalElements || 0
      }));
    } catch (error) {
      console.error('Error loading listening history:', error);
    }
  };
  
  // Handle follow/unfollow actions
  const handleFollowChange = async (userId, isNowFollowing) => {
    // First update UI optimistically
    setProfileUser(prev => ({
      ...prev,
      isFollowing: isNowFollowing,
      followersCount: isNowFollowing 
        ? (prev.followersCount || 0) + 1 
        : Math.max((prev.followersCount || 0) - 1, 0)
    }));
    
    // Then refresh actual counts from backend
    await refreshProfileCounts(profileUser.id);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleEditProfile = () => {
    setEditMode(true);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      // Prepare data for update
      const updateData = {
        username: userProfile.username,
        email: userProfile.email,
        fullName: userProfile.name,
        bio: userProfile.bio
      };
      
      // Update user in backend
      const updatedUser = await userService.updateUser(profileUser.id, updateData);
      
      // Update local state with new data
      setProfileUser(updatedUser);
      setUserProfile({
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.fullName || '',
        bio: updatedUser.bio || '',
        avatarUrl: updatedUser.avatarUrl
      });
      
      // If this is the current user, update localStorage
      if (isOwnProfile && currentUser) {
        const updatedCurrentUser = {
          ...currentUser,
          username: updatedUser.username,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          bio: updatedUser.bio,
          avatarUrl: updatedUser.avatarUrl
        };
        localStorage.setItem('user', JSON.stringify(updatedCurrentUser));
      }
      
      showSnackbar('Profile updated successfully!', 'success');
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      showSnackbar('Failed to update profile. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile({
      ...userProfile,
      [name]: value
    });
  };

  const handleAvatarChange = (e) => {
    // This would typically upload the file to your server
    // For now, we'll just show a success message
    if (e.target.files && e.target.files[0]) {
      showSnackbar('Avatar upload functionality will be implemented soon!', 'info');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Render profile overview
  const renderOverview = () => (
    <Grid container spacing={4}>
      <Grid item xs={12} md={4}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            borderRadius: 3,
            background: 'linear-gradient(145deg, #1e1e2e, #2a2a40)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                editMode ? (
                  <label htmlFor="avatar-upload">
                    <input
                      accept="image/*"
                      id="avatar-upload"
                      type="file"
                      style={{ display: 'none' }}
                      onChange={handleAvatarChange}
                    />
                    <IconButton 
                      component="span"
                      sx={{ 
                        bgcolor: '#8b5cf6', 
                        '&:hover': { bgcolor: '#7c3aed' } 
                      }}
                    >
                      <PhotoCameraIcon sx={{ color: 'white' }} />
                    </IconButton>
                  </label>
                ) : null
              }
            >
              <Avatar 
                src={userProfile.avatarUrl || '/default-avatar.png'} 
                alt={userProfile.username}
                sx={{ 
                  width: 120, 
                  height: 120,
                  border: '3px solid #8b5cf6',
                  boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)',
                }}
              />
            </Badge>
            
            {!editMode ? (
              <>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mt: 2 }}>
                  {userProfile.name || userProfile.username}
                </Typography>
                <Typography variant="body2" sx={{ color: '#b3b3b3', mb: 1 }}>
                  @{userProfile.username}
                </Typography>
                {isOwnProfile && (
                  <Typography variant="body2" sx={{ color: '#b3b3b3', mb: 2 }}>
                    {userProfile.email}
                  </Typography>
                )}
                {userProfile.bio && (
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#e2e8f0',
                      textAlign: 'center',
                      fontStyle: 'italic',
                      mb: 2
                    }}
                  >
                    "{userProfile.bio}"
                  </Typography>
                )}
                
                {/* Follow stats for all users */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'center' }}>
                  <Chip
                    icon={<PeopleIcon />}
                    label={`${profileUser?.followersCount || 0} followers`}
                    variant="outlined"
                    onClick={() => navigate(`/users/${profileUser?.username}/followers`)}
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(139, 92, 246, 0.5)',
                      fontSize: '0.75rem',
                      '&:hover': {
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      }
                    }}
                  />
                  <Chip
                    icon={<PeopleIcon />}
                    label={`${profileUser?.followingCount || 0} following`}
                    variant="outlined"
                    onClick={() => navigate(`/users/${profileUser?.username}/following`)}
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(139, 92, 246, 0.5)',
                      fontSize: '0.75rem',
                      '&:hover': {
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      }
                    }}
                  />
                </Box>

                {isOwnProfile ? (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleEditProfile}
                    sx={{
                      mt: 2,
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
                    Edit Profile
                  </Button>
                ) : (
                  <FollowButton
                    targetUser={profileUser}
                    onFollowChange={handleFollowChange}
                    size="large"
                  />
                )}
              </>
            ) : (
              <Box sx={{ width: '100%', mt: 3 }}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={userProfile.username}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                  InputLabelProps={{ style: { color: '#b3b3b3' } }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={userProfile.name}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                  InputLabelProps={{ style: { color: '#b3b3b3' } }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={userProfile.email}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                  InputLabelProps={{ style: { color: '#b3b3b3' } }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Bio"
                  name="bio"
                  value={userProfile.bio}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                  multiline
                  rows={3}
                  InputLabelProps={{ style: { color: '#b3b3b3' } }}
                  sx={{ mb: 3 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveProfile}
                  sx={{
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
                  Save Changes
                </Button>
              </Box>
            )}
          </Box>
          
          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
          
          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            Music Stats
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <FavoriteIcon sx={{ color: '#ec4899', fontSize: 32, mb: 1 }} />
                <Typography variant="h6" sx={{ color: 'white' }}>
                  {isOwnProfile ? likedTracks.length : '•••'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                  Liked
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <PlaylistIcon sx={{ color: '#8b5cf6', fontSize: 32, mb: 1 }} />
                <Typography variant="h6" sx={{ color: 'white' }}>
                  {userPlaylists.length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                  Playlists
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <HistoryIcon sx={{ color: '#10b981', fontSize: 32, mb: 1 }} />
                <Typography variant="h6" sx={{ color: 'white' }}>
                  {isOwnProfile ? listeningHistory.length : '•••'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                  Listened
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={8}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            borderRadius: 3,
            background: 'linear-gradient(145deg, #1e1e2e, #2a2a40)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            height: '100%'
          }}
        >
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 3 }}>
            Activity Overview
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress sx={{ color: '#8b5cf6' }} />
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <MusicIcon sx={{ fontSize: 60, color: '#8b5cf6', mb: 2 }} />
              <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                Your Music Journey
              </Typography>
              <Typography variant="body1" sx={{ color: '#b3b3b3', maxWidth: 500, mx: 'auto', mb: 3 }}>
                Track your listening habits, favorite genres, and music preferences.
                More detailed statistics coming soon!
              </Typography>
              <Button
                variant="contained"
                startIcon={<PeopleIcon />}
                onClick={() => navigate('/discover-users')}
                sx={{
                  background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  py: 1.5,
                  px: 3,
                  boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0891b2, #0e7490)',
                    boxShadow: '0 6px 20px rgba(6, 182, 212, 0.6)',
                  }
                }}
              >
                Discover Users
              </Button>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );

  // Render favorites tab
  const renderFavorites = () => {
    if (!isOwnProfile) {
      return (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <FavoriteIcon sx={{ fontSize: 60, color: '#ec4899', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
            Liked tracks are private
          </Typography>
          <Typography variant="body1" sx={{ color: '#b3b3b3' }}>
            Only {userProfile.username} can see their liked tracks
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 3 }}>
          My Favorite Tracks
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress sx={{ color: '#8b5cf6' }} />
          </Box>
        ) : likedTracks.length > 0 ? (
          <Grid container spacing={3}>
            {likedTracks.map((track) => (
              <Grid item xs={12} sm={6} md={4} key={track.id}>
                <Card sx={{ 
                  borderRadius: 2,
                  background: 'linear-gradient(145deg, #1e1e2e, #2a2a40)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)'
                  }
                }}>
                  <Box sx={{ position: 'relative' }}>
                    <img 
                      src={track.imageUrl || '/default-track.jpg'} 
                      alt={track.title}
                      style={{ width: '100%', height: 180, objectFit: 'cover' }}
                    />
                  </Box>
                  <CardContent>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: 'white',
                        fontWeight: 'bold',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                      onClick={() => navigate(`/track/${track.id}`)}
                    >
                      {track.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#b3b3b3',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {track.artist}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <FavoriteIcon sx={{ fontSize: 60, color: '#ec4899', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
              No favorites yet
            </Typography>
            <Typography variant="body1" sx={{ color: '#b3b3b3' }}>
              Start exploring and liking tracks to see them here!
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  // Render playlists tab
  const renderPlaylists = () => (
    <Box>
      <Typography 
        variant="h5" 
        sx={{ 
          color: 'white', 
          fontWeight: 'bold', 
          mb: 3 
        }}
      >
        My Playlists
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress sx={{ color: '#8b5cf6' }} />
        </Box>
      ) : userPlaylists.length > 0 ? (
        <Grid container spacing={3}>
          {userPlaylists.map((playlist) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={playlist.id}>
              <Card sx={{ 
                borderRadius: 2,
                background: 'linear-gradient(145deg, #1e1e2e, #2a2a40)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                transition: 'transform 0.3s ease',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)'
                }
              }}
              >
                <Box sx={{ position: 'relative', height: 160 }}>
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      background: playlist.coverImageUrl 
                        ? `url(${playlist.coverImageUrl})` 
                        : 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {!playlist.coverImageUrl && (
                      <PlaylistIcon sx={{ fontSize: 40, color: 'white', opacity: 0.7 }} />
                    )}
                  </Box>
                  
                  {/* Privacy indicator */}
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    {playlist.isPublic ? (
                      <Tooltip title="Public Playlist">
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          backgroundColor: '#10b981' 
                        }} />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Private Playlist">
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          backgroundColor: '#9ca3af' 
                        }} />
                      </Tooltip>
                    )}
                  </Box>
                </Box>
                
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'white',
                      fontWeight: 'bold',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      mb: 1,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                    onClick={() => navigate(`/playlist/${playlist.id}`)}
                  >
                    {playlist.name}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#8b5cf6',
                      fontWeight: 500,
                      mb: 1
                    }}
                  >
                    {playlist.tracks?.length || 0} tracks
                  </Typography>
                  
                  {playlist.description && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#b3b3b3',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.3
                      }}
                    >
                      {playlist.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <PlaylistIcon sx={{ fontSize: 60, color: '#8b5cf6', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
            No playlists yet
          </Typography>
          <Typography variant="body1" sx={{ color: '#b3b3b3', mb: 3 }}>
            Create your first playlist to organize your favorite tracks!
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/playlists')}
            sx={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold',
              py: 1.5,
              px: 3,
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                boxShadow: '0 6px 20px rgba(139, 92, 246, 0.6)',
              }
            }}
          >
            Go to Playlists
          </Button>
        </Box>
      )}
    </Box>
  );

  // Render history tab
  const renderHistory = () => {
    if (!isOwnProfile) {
      return (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <HistoryIcon sx={{ fontSize: 60, color: '#10b981', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
            Listening history is private
          </Typography>
          <Typography variant="body1" sx={{ color: '#b3b3b3' }}>
            Only {userProfile.username} can see their listening history
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        <Typography 
          variant="h5" 
          sx={{ 
            color: 'white', 
            fontWeight: 'bold', 
            mb: 3 
          }}
        >
          Listening History
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress sx={{ color: '#8b5cf6' }} />
          </Box>
        ) : listeningHistory.length > 0 ? (
          <Grid container spacing={3}>
            {listeningHistory.map((historyItem, index) => (
              <Grid item xs={12} sm={6} md={4} key={`${historyItem.id}-${index}`}>
                <Card sx={{ 
                  borderRadius: 2,
                  background: 'linear-gradient(145deg, #1e1e2e, #2a2a40)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  transition: 'transform 0.3s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)'
                  }
                }}>
                  <Box sx={{ position: 'relative', height: 160 }}>
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        background: historyItem.track?.imageUrl 
                          ? `url(${historyItem.track.imageUrl})` 
                          : 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {!historyItem.track?.imageUrl && (
                        <MusicIcon sx={{ fontSize: 40, color: 'white', opacity: 0.7 }} />
                      )}
                    </Box>
                    
                    {/* Listen duration indicator */}
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8,
                      background: 'rgba(0,0,0,0.8)',
                      borderRadius: 1,
                      px: 1,
                      py: 0.5
                    }}>
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {Math.floor(historyItem.duration / 60)}:{(historyItem.duration % 60).toString().padStart(2, '0')}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: 'white',
                        fontWeight: 'bold',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        mb: 1,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                      onClick={() => historyItem.track?.id && navigate(`/track/${historyItem.track.id}`)}
                    >
                      {historyItem.track?.title || 'Unknown Track'}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#8b5cf6',
                        fontWeight: 500,
                        mb: 1,
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {historyItem.track?.artist || 'Unknown Artist'}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#b3b3b3',
                        fontSize: '0.8rem'
                      }}
                    >
                      Listened {new Date(historyItem.playedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <HistoryIcon sx={{ fontSize: 60, color: '#10b981', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
              No listening history yet
            </Typography>
            <Typography variant="body1" sx={{ color: '#b3b3b3', mb: 3 }}>
              Start listening to music to see your history here!
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/discover')}
              sx={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'bold',
                py: 1.5,
                px: 3,
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.6)',
                }
              }}
            >
              Discover Music
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
          {isOwnProfile ? 'My Profile' : `${userProfile.username}'s Profile`}
        </Typography>
        <Typography variant="h6" sx={{ color: '#b3b3b3' }}>
          {isOwnProfile ? 'Manage your account and preferences' : 'View user profile and activity'}
        </Typography>
      </Box>
      
      {!isAuthenticated ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <PersonIcon sx={{ fontSize: 60, color: '#8b5cf6', mb: 2 }} />
          <Typography variant="h4" sx={{ color: 'white', mb: 2 }}>
            Please log in to view your profile
          </Typography>
          <Typography variant="body1" sx={{ color: '#b3b3b3', maxWidth: 600, mx: 'auto' }}>
            Sign in to access your music profile, view your listening history,
            manage playlists, and see your music statistics.
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.href = '/login'}
            sx={{
              mt: 4,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold',
              py: 1.5,
              px: 4,
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                boxShadow: '0 6px 20px rgba(139, 92, 246, 0.6)',
              }
            }}
          >
            Sign In
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 4 }}>
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: '#8b5cf6',
                  height: 3,
                  borderRadius: 3
                },
                '& .MuiTab-root': {
                  color: '#b3b3b3',
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  '&.Mui-selected': {
                    color: '#8b5cf6',
                  }
                }
              }}
            >
              <Tab label="Overview" />
              <Tab label="Favorites" />
              <Tab label="Playlists" />
              <Tab label="History" />
            </Tabs>
          </Box>
          
          <Box sx={{ mt: 3 }}>
            {currentTab === 0 && renderOverview()}
            {currentTab === 1 && renderFavorites()}
            {currentTab === 2 && renderPlaylists()}
            {currentTab === 3 && renderHistory()}
          </Box>
        </>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile; 