import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Grid, Card, CardMedia, CardContent, 
  CardActions, IconButton, Skeleton, Button, CircularProgress, Tabs, Tab, Chip, Avatar } from '@mui/material';
import { PlayArrow, Pause, Favorite, FavoriteBorder, Add, Share, PlaylistAdd, PlaylistPlay, QueueMusic as QueueMusicIcon, Public as PublicIcon } from '@mui/icons-material';
import { trackService } from '../services/trackService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePlayerContext } from '../contexts/PlayerContext';
import toast from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';
import ShareModal from '../components/ShareModal';
import { playlistService } from '../services/playlistService';

const Home = () => {
  const [trendingTracks, setTrendingTracks] = useState([]);
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [artistRecommendations, setArtistRecommendations] = useState([]);
  const [genreRecommendations, setGenreRecommendations] = useState([]);
  const [followingLikedTracks, setFollowingLikedTracks] = useState([]);
  const [publicPlaylists, setPublicPlaylists] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const [loadingArtistRecs, setLoadingArtistRecs] = useState(true);
  const [loadingGenreRecs, setLoadingGenreRecs] = useState(true);
  const [loadingFollowingLiked, setLoadingFollowingLiked] = useState(true);
  const [loadingPublicPlaylists, setLoadingPublicPlaylists] = useState(true);
  const [error, setError] = useState(null);
  const [recommendationTab, setRecommendationTab] = useState(0);
  
  // Debug states for recommendation system
  const [debugInfo, setDebugInfo] = useState({
    hasValidHistory: false,
    userPreferences: null,
    debugMode: false
  });
  
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [trackToShare, setTrackToShare] = useState(null);
  
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { 
    currentTrack, 
    isPlaying, 
    playTrack,
    pauseTrack,
    resumeTrack,
    addToQueue,
    playAllTracks
  } = usePlayerContext();
  
  useEffect(() => {
    // Fetch trending tracks (most played)
    const fetchTrendingTracks = async () => {
      try {
        setLoadingTrending(true);
        const response = await trackService.getTopTracks();
        setTrendingTracks(response || []);
        setLoadingTrending(false);
      } catch (err) {
        console.error('Error fetching trending tracks:', err);
        setError('Failed to load trending tracks');
        setLoadingTrending(false);
      }
    };

    // Fetch general recommended tracks
    const fetchRecommendedTracks = async () => {
      try {
        setLoadingRecommended(true);
        const response = await trackService.getRecommendedTracks();
        setRecommendedTracks(response || []);
        setLoadingRecommended(false);
      } catch (err) {
        console.error('Error fetching recommended tracks:', err);
        setError('Failed to load recommended tracks');
        setLoadingRecommended(false);
      }
    };

    // Fetch artist-based recommendations
    const fetchArtistRecommendations = async () => {
      if (!isAuthenticated) {
        setLoadingArtistRecs(false);
        return;
      }
      
      try {
        setLoadingArtistRecs(true);
        const response = await trackService.getRecommendationsByArtist(8);
        setArtistRecommendations(response || []);
        setLoadingArtistRecs(false);
      } catch (err) {
        console.error('Error fetching artist recommendations:', err);
        setLoadingArtistRecs(false);
      }
    };

    // Fetch genre-based recommendations
    const fetchGenreRecommendations = async () => {
      if (!isAuthenticated) {
        setLoadingGenreRecs(false);
        return;
      }
      
      try {
        setLoadingGenreRecs(true);
        const response = await trackService.getRecommendationsByGenre(8);
        setGenreRecommendations(response || []);
        setLoadingGenreRecs(false);
      } catch (err) {
        console.error('Error fetching genre recommendations:', err);
        setLoadingGenreRecs(false);
      }
    };
    
    // Fetch tracks liked by users the current user is following
    const fetchFollowingLikedTracks = async () => {
      if (!isAuthenticated) {
        setLoadingFollowingLiked(false);
        return;
      }
      
      try {
        setLoadingFollowingLiked(true);
        const response = await trackService.getTracksLikedByFollowing(8);
        setFollowingLikedTracks(response || []);
        setLoadingFollowingLiked(false);
      } catch (err) {
        console.error('Error fetching tracks liked by following users:', err);
        setLoadingFollowingLiked(false);
      }
    };

    // Fetch public playlists created by users
    const fetchPublicPlaylists = async () => {
      try {
        setLoadingPublicPlaylists(true);
        const playlists = await playlistService.getPublicPlaylists();
        setPublicPlaylists(playlists);
      } catch (error) {
        console.error('Error fetching public playlists:', error);
      } finally {
        setLoadingPublicPlaylists(false);
      }
    };

    fetchTrendingTracks();
    fetchRecommendedTracks();
    fetchArtistRecommendations();
    fetchGenreRecommendations();
    fetchFollowingLikedTracks();
    fetchPublicPlaylists();
  }, [isAuthenticated]);

  // Thêm useEffect mới để lắng nghe sự kiện refresh-public-playlists
  useEffect(() => {
    // Handler cho sự kiện refresh public playlists
    const handleRefreshPublicPlaylists = () => {
      console.log('Received refresh-public-playlists event, refreshing public playlists');
      // Gọi lại API để lấy danh sách public playlists mới nhất
      playlistService.getPublicPlaylists().then(playlists => {
        console.log('Home - refreshed public playlists:', playlists.length, 'items');
        setPublicPlaylists(playlists);
      }).catch(error => {
        console.error('Error refreshing public playlists:', error);
      });
    };

    // Đăng ký event listener
    window.addEventListener('refresh-public-playlists', handleRefreshPublicPlaylists);

    // Cleanup function để tránh memory leak
    return () => {
      window.removeEventListener('refresh-public-playlists', handleRefreshPublicPlaylists);
    };
  }, []); // Empty dependency array means this runs once on mount and cleanup on unmount

  const handlePlayTrack = (track) => {
    if (currentTrack && currentTrack.id === track.id) {
      if (isPlaying) {
        pauseTrack();
      } else {
        resumeTrack();
      }
    } else {
      playTrack(track);
    }
  };

  const handleLikeTrack = async (trackId) => {
    if (!isAuthenticated) {
      toast.error('Please log in to like tracks');
      return;
    }
    
    try {
      await trackService.toggleLike(trackId);
      
      // Update all track lists to reflect the like status change
      const updateTracks = (tracks) => tracks.map(track => 
        track.id === trackId 
          ? { ...track, isLiked: !track.isLiked }
          : track
      );
      
      setTrendingTracks(updateTracks);
      setRecommendedTracks(updateTracks);
      setArtistRecommendations(updateTracks);
      setGenreRecommendations(updateTracks);
      
      toast.success('Favourites updated');
    } catch (err) {
      console.error('Error toggling like status:', err);
      toast.error('Failed to update favourites');
    }
  };

  const handleAddToPlaylist = (track) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add tracks to playlists');
      return;
    }
    
    // Here you would typically open a modal to select a playlist
    toast.success('Add to playlist feature coming soon!');
  };

  const handleShareTrack = (track) => {
    setTrackToShare(track);
    setShareModalOpen(true);
  };

  const handleAddToQueue = (track) => {
    const success = addToQueue(track);
    if (success) {
      toast.success(`Added "${track.title}" to queue`);
    }
  };

  const handlePlayAll = (tracks) => {
    if (tracks && tracks.length > 0) {
      playAllTracks(tracks);
      toast.success('Playing all tracks');
    } else {
      toast.error('No tracks available to play');
    }
  };

  const handleRecommendationTabChange = (event, newValue) => {
    setRecommendationTab(newValue);
  };

  // Debug function for testing recommendations
  const handleDebugRecommendations = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in first');
      return;
    }

    console.log('🔍 DEBUG: Starting recommendation system test...');
    
    try {
      // 1. Check listening history
      const hasHistory = await trackService.hasValidListeningHistory();
      console.log('📊 Has valid listening history (>30s):', hasHistory);
      
      // 2. Get current preferences
      const currentPrefs = await trackService.getUserPreferences();
      console.log('⚙️ Current user preferences:', currentPrefs);
      
      // 3. Update preferences from history
      const updatedPrefs = await trackService.updatePreferencesFromHistory();
      console.log('🔄 Updated preferences from history:', updatedPrefs);
      
      // 4. Debug database content - Temporarily disabled due to backend issue
      // const debugInfo = await trackService.debugRecommendations();
      // console.log('🔧 Database Debug Info:', debugInfo);
      
      // 5. Test individual recommendation APIs
      const [artistRecs, genreRecs, mixedRecs] = await Promise.all([
        trackService.getRecommendationsByArtist(5),
        trackService.getRecommendationsByGenre(5),
        trackService.getRecommendedTracks()
      ]);
      
      console.log('🎵 Artist-based recommendations:', artistRecs);
      console.log('🎸 Genre-based recommendations:', genreRecs);
      console.log('🔀 Mixed recommendations:', mixedRecs);
      
      // 5. Refresh UI after delay
      let countdown = 10;
      const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          toast.success(`Debug completed! Reloading in ${countdown}s... (Check Console F12)`, {
            duration: 1000,
            id: 'countdown'
          });
        } else {
          clearInterval(countdownInterval);
          window.location.reload();
        }
      }, 1000);
      
      toast.success('Debug info logged to console! Check F12 → Console');
      
    } catch (error) {
      console.error('❌ Debug error:', error);
      toast.error('Debug failed: ' + error.message);
    }
  };

  const handlePlayPlaylist = (playlist) => {
    if (playlist && playlist.id) {
      playlistService.incrementPlayCount(playlist.id);
      navigate(`/playlists/${playlist.id}`);
    }
  };

  const handleSharePlaylist = (playlist) => {
    setTrackToShare(playlist);
    setShareModalOpen(true);
  };

  const getCurrentRecommendations = () => {
    switch (recommendationTab) {
      case 0:
        return { tracks: recommendedTracks, loading: loadingRecommended };
      case 1:
        return { tracks: artistRecommendations, loading: loadingArtistRecs };
      case 2:
        return { tracks: genreRecommendations, loading: loadingGenreRecs };
      case 3:
        return { tracks: followingLikedTracks, loading: loadingFollowingLiked };
      default:
        return { tracks: recommendedTracks, loading: loadingRecommended };
    }
  };

  const renderTrackCard = (track, index) => {
    const isCurrentlyPlaying = currentTrack && currentTrack.id === track.id && isPlaying;
    
    return (
      <Grid item xs={12} sm={6} md={4} lg={3} key={track.id || index}>
        <Card sx={{ 
          borderRadius: 2,
          background: 'linear-gradient(145deg, #1e1e2e, #2a2a40)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)'
          }
        }}>
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height="180"
              image={track.imageUrl || track.coverImageUrl || 'https://source.unsplash.com/random/300x300/?music'}
              alt={track.title}
              sx={{ objectFit: 'cover' }}
            />
            <IconButton 
              sx={{ 
                position: 'absolute', 
                bottom: 8, 
                right: 8,
                background: 'rgba(0,0,0,0.6)',
                '&:hover': { background: 'rgba(29, 185, 84, 0.8)' }
              }}
              onClick={() => handlePlayTrack(track)}
            >
              {isCurrentlyPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
          </Box>
          
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h6" 
              component="div" 
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
              color="text.secondary"
              sx={{ 
                color: '#b3b3b3',
                mb: 1,
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}
            >
              {track.artist}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'inline-block',
                background: 'rgba(29, 185, 84, 0.2)',
                color: '#1db954',
                padding: '3px 8px',
                borderRadius: 10,
                fontSize: '0.7rem'
              }}
            >
              {track.genre}
            </Typography>
          </CardContent>
          
          <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
            <Box>
              <IconButton 
                size="small" 
                onClick={() => handleLikeTrack(track.id)}
                sx={{ color: track.isLiked ? '#ec4899' : 'white' }}
              >
                {track.isLiked ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => handleAddToPlaylist(track)}
                sx={{ color: 'white' }}
              >
                <Add />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => handleAddToQueue(track)}
                sx={{ color: 'white' }}
                title="Add to queue"
              >
                <PlaylistAdd />
              </IconButton>
            </Box>
            <IconButton 
              size="small" 
              onClick={() => handleShareTrack(track)}
              sx={{ color: 'white' }}
            >
              <Share />
            </IconButton>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  // Render playlist card
  const renderPlaylistCard = (playlist, index) => {
    return (
      <Grid item xs={12} sm={6} md={4} lg={3} key={playlist.id || index}>
        <Card sx={{ 
          borderRadius: 2,
          background: 'linear-gradient(145deg, #1e1e2e, #2a2a40)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)'
          },
          cursor: 'pointer'
        }}
        onClick={() => navigate(`/playlists/${playlist.id}`)}
        >
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="div"
              height="180"
              sx={{
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
                <QueueMusicIcon sx={{ fontSize: 60, color: 'white', opacity: 0.7 }} />
              )}
            </CardMedia>
            
            <IconButton 
              sx={{ 
                position: 'absolute', 
                bottom: 8, 
                right: 8,
                background: 'rgba(0,0,0,0.6)',
                '&:hover': { background: 'rgba(29, 185, 84, 0.8)' }
              }}
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPlaylist(playlist);
              }}
            >
              <PlayArrow />
            </IconButton>

            <Chip 
              icon={<PublicIcon sx={{ fontSize: 14 }} />} 
              label="Public" 
              size="small"
              sx={{ 
                position: 'absolute',
                top: 8,
                left: 8,
                background: 'rgba(16, 185, 129, 0.8)',
                color: 'white',
                border: '1px solid rgba(16, 185, 129, 0.9)',
                fontSize: '0.7rem',
                height: 24
              }}
            />
          </Box>
          
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h6" 
              component="div" 
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
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/playlists/${playlist.id}`);
              }}
            >
              {playlist.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
              <Avatar 
                src={playlist.user?.avatarUrl} 
                alt={playlist.user?.username || 'User'}
                sx={{ width: 24, height: 24, mr: 1 }}
              />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#b3b3b3',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}
              >
                {playlist.user?.username || 'User'}
              </Typography>
            </Box>

            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block',
                color: '#1db954',
                mb: 1
              }}
            >
              {playlist.tracks?.length || 0} tracks
            </Typography>
          </CardContent>
          
          <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleSharePlaylist(playlist);
              }}
              sx={{ color: 'white' }}
            >
              <Share />
            </IconButton>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  // Render skeleton loaders
  const renderSkeletons = (count) => {
    return Array(count).fill(0).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={`skeleton-${index}`}>
        <Card sx={{ 
          borderRadius: 2,
          background: 'linear-gradient(145deg, #1e1e2e, #2a2a40)',
          height: '100%',
        }}>
          <Skeleton variant="rectangular" height={180} animation="wave" />
          <CardContent>
            <Skeleton variant="text" width="80%" height={28} animation="wave" />
            <Skeleton variant="text" width="60%" height={20} animation="wave" />
            <Skeleton variant="text" width="40%" height={20} animation="wave" />
          </CardContent>
          <CardActions sx={{ px: 2, pb: 2 }}>
            <Skeleton variant="circular" width={30} height={30} animation="wave" />
            <Skeleton variant="circular" width={30} height={30} animation="wave" />
            <Box sx={{ flexGrow: 1 }} />
            <Skeleton variant="circular" width={30} height={30} animation="wave" />
          </CardActions>
        </Card>
      </Grid>
    ));
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
          Welcome to MusicSocial! 🎵
        </Typography>
        <Typography variant="h6" sx={{ color: '#b3b3b3' }}>
          Discover new music and enjoy your favorites
        </Typography>
      </Box>

      {/* Connect with Music Lovers Section */}
      {isAuthenticated && (
        <Box sx={{ mb: 6 }}>
          <Card sx={{
            background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            borderRadius: 3,
            p: 3,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url(data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="7" cy="7" r="7"/%3E%3Ccircle cx="53" cy="7" r="7"/%3E%3Ccircle cx="7" cy="53" r="7"/%3E%3Ccircle cx="53" cy="53" r="7"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E)',
              zIndex: 0
            }} />
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
                Connect with Music Lovers 🎧
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3, maxWidth: 600, mx: 'auto' }}>
                Find other music enthusiasts, see what they're listening to, and discover new tracks through their playlists
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/discover-users')}
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                  }
                }}
              >
                Discover Users
              </Button>
            </Box>
          </Card>
        </Box>
      )}
      
      {/* Trending Tracks Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
            Trending Now
          </Typography>
          <Box>
            <Button 
              variant="text" 
              sx={{ 
                color: '#1db954', 
                '&:hover': { backgroundColor: 'rgba(29, 185, 84, 0.1)' },
                mr: 1
              }}
              onClick={() => navigate('/discover')}
            >
              See All
            </Button>
            <Button
              variant="contained"
              startIcon={<PlaylistPlay />}
              sx={{
                bgcolor: '#1db954',
                '&:hover': { bgcolor: '#0f9d58' }
              }}
              onClick={() => handlePlayAll(trendingTracks)}
              disabled={loadingTrending || trendingTracks.length === 0}
            >
              Play All
            </Button>
          </Box>
        </Box>
        
        {error && (
          <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: 'rgba(255, 87, 87, 0.1)', color: '#ff5757' }}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 'bold' }}>
              {error}
            </Typography>
            <Button 
              variant="contained" 
              sx={{ mt: 2, bgcolor: '#1db954', '&:hover': { bgcolor: '#0f9d58' } }}
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </Box>
        )}
        
        <Grid container spacing={3}>
          {loadingTrending ? 
            renderSkeletons(4) : 
            trendingTracks.length > 0 ? 
              trendingTracks.slice(0, 4).map(renderTrackCard) : 
              <Box sx={{ p: 4, width: '100%', textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#b3b3b3' }}>No trending tracks found</Typography>
              </Box>
          }
        </Grid>
      </Box>
      
      {/* Public Playlists Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
            Public Playlists
          </Typography>
          <Box>
            <Button 
              variant="text" 
              sx={{ 
                color: '#1db954', 
                '&:hover': { backgroundColor: 'rgba(29, 185, 84, 0.1)' },
                mr: 1
              }}
              onClick={() => navigate('/public-playlists')}
            >
              See All
            </Button>
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          {loadingPublicPlaylists ? 
            renderSkeletons(6) : 
            publicPlaylists.length > 0 ? 
              publicPlaylists.slice(0, 6).map(renderPlaylistCard) : 
              <Box sx={{ p: 4, width: '100%', textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#b3b3b3' }}>
                  No public playlists found
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                  Create and share your playlists with the community!
                </Typography>
              </Box>
          }
        </Grid>
      </Box>
      
      {/* Personalized Recommendations Section */}
      {isAuthenticated && (
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
              Recommended For You
            </Typography>
            <Box>
              <Button 
                variant="text" 
                sx={{ 
                  color: '#1db954', 
                  '&:hover': { backgroundColor: 'rgba(29, 185, 84, 0.1)' },
                  mr: 1
                }}
                onClick={() => navigate('/recommended')}
              >
                See All
              </Button>
              <Button
                variant="contained"
                startIcon={<PlaylistPlay />}
                sx={{
                  bgcolor: '#1db954',
                  '&:hover': { bgcolor: '#0f9d58' }
                }}
                onClick={() => handlePlayAll(getCurrentRecommendations().tracks)}
                disabled={getCurrentRecommendations().loading || getCurrentRecommendations().tracks.length === 0}
              >
                Play All
              </Button>
            </Box>
          </Box>

          {/* Recommendation Tabs */}
          <Box sx={{ mb: 3 }}>
            <Tabs 
              value={recommendationTab} 
              onChange={handleRecommendationTabChange}
              sx={{
                '& .MuiTab-root': { 
                  color: '#b3b3b3',
                  '&.Mui-selected': { color: '#1db954' }
                },
                '& .MuiTabs-indicator': { backgroundColor: '#1db954' }
              }}
            >
              <Tab label="Mixed Recommendations" />
              <Tab label="Similar Artists" />
              <Tab label="Similar Genres" />
              <Tab label="Following Liked Tracks" />
            </Tabs>
          </Box>
          
          <Grid container spacing={3}>
            {getCurrentRecommendations().loading ? 
              renderSkeletons(4) : 
              getCurrentRecommendations().tracks.length > 0 ? 
                getCurrentRecommendations().tracks.slice(0, 4).map(renderTrackCard) : 
                <Box sx={{ p: 4, width: '100%', textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#b3b3b3' }}>
                    {recommendationTab === 1 ? 'No artist-based recommendations found' :
                     recommendationTab === 2 ? 'No genre-based recommendations found' :
                     recommendationTab === 3 ? 'No following liked tracks found' :
                     'No recommendations found'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                    Listen to more tracks to get personalized recommendations!
                  </Typography>
                </Box>
            }
          </Grid>
        </Box>
      )}

      {/* General Recommended Tracks Section for Non-authenticated Users */}
      {!isAuthenticated && (
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
              Popular Tracks
            </Typography>
            <Box>
              <Button 
                variant="text" 
                sx={{ 
                  color: '#1db954', 
                  '&:hover': { backgroundColor: 'rgba(29, 185, 84, 0.1)' },
                  mr: 1
                }}
                onClick={() => navigate('/discover')}
              >
                See All
              </Button>
              <Button
                variant="contained"
                startIcon={<PlaylistPlay />}
                sx={{
                  bgcolor: '#1db954',
                  '&:hover': { bgcolor: '#0f9d58' }
                }}
                onClick={() => handlePlayAll(recommendedTracks)}
                disabled={loadingRecommended || recommendedTracks.length === 0}
              >
                Play All
              </Button>
            </Box>
          </Box>
          
          <Grid container spacing={3}>
            {loadingRecommended ? 
              renderSkeletons(4) : 
              recommendedTracks.length > 0 ? 
                recommendedTracks.slice(0, 4).map(renderTrackCard) : 
                <Box sx={{ p: 4, width: '100%', textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#b3b3b3' }}>No popular tracks found</Typography>
                </Box>
            }
          </Grid>
        </Box>
      )}

      {/* Share Modal */}
      <ShareModal 
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        item={trackToShare}
        type={trackToShare && trackToShare.tracks ? 'playlist' : 'track'}
      />
    </Container>
  );
};

export default Home; 