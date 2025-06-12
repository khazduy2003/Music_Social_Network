import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Grid, Card, CardMedia, CardContent, 
  CardActions, IconButton, Skeleton, Button, CircularProgress, Tabs, Tab, Chip, Avatar, Tooltip } from '@mui/material';
import { PlayArrow, Pause, Favorite, FavoriteBorder, Add, Share, PlaylistAdd, PlaylistPlay, QueueMusic as QueueMusicIcon, Public as PublicIcon, Lock as LockIcon } from '@mui/icons-material';
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
  
  // Default image for tracks and playlists
  const defaultCoverImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMUUxRTJFIi8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzE3Mi4wOTEgMTAwIDE5MCA4Mi4wOTE0IDE5MCA2MEMxOTAgMzcuOTA4NiAxNzIuMDkxIDIwIDE1MCAyMEMxMjcuOTA5IDIwIDExMCAzNy45MDg2IDExMCA2MEMxMTAgODIuMDkxNCAxMjcuOTA5IDEwMCAxNTAgMTAwWiIgZmlsbD0iIzFEQjk1NCIvPgo8cGF0aCBkPSJNMjEwIDI4MEgyMDBDMjAwIDI1My40NzggMTg5LjQ2NCAyMjggMTcwLjcxMSAyMDkuMjg5QzE1MS45NTcgMTkwLjUzNiAxMjYuNTIyIDE4MCAxMDAgMThIODBDODAuMDAwMSAyMTkuMzMgOTEuMDcxNCAyNTcuNDg4IDExMS43MTcgMjg5SDgwVjI5MEg5MEg5NS44Mjg5QzEwNi41IDI5My4zMzMgMTE4LjUgMjk1IDEzMCAyOTVIMTcwQzE4MS41IDI5NSAxOTMuNSAyOTMuMzMzIDIwNC4xNzEgMjkwSDIxMFYyODBaIiBmaWxsPSIjMURCOTU0Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjQjNCM0IzIiBmb250LXNpemU9IjE2IiBmb250LWZhbWlseT0iQXJpYWwiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=';

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
        console.log('DEBUG - Public playlists:', playlists);
        
        // Đảm bảo tất cả playlist đều có isPublic = true và lấy thêm thông tin chi tiết
        const playlistsWithDetails = await Promise.all(
          playlists.map(async (playlist) => {
            try {
              // Lấy thông tin chi tiết của playlist (bao gồm danh sách tracks)
              const playlistDetail = await playlistService.getPlaylistById(playlist.id);
              
              // Tính toán tổng thời gian dựa trên các bài hát
              let totalDuration = 0;
              if (playlistDetail?.tracks?.length > 0) {
                totalDuration = playlistDetail.tracks.reduce(
                  (total, track) => total + (track.duration || 0), 
                  0
                );
              }
              
              return {
                ...playlist,
                ...playlistDetail,
                isPublic: true, // Đảm bảo isPublic = true cho tất cả playlist công khai
                totalDuration: totalDuration, // Thêm tổng thời gian
                trackCount: playlistDetail?.tracks?.length || playlist.trackCount || 0 // Đảm bảo có trackCount
              };
            } catch (error) {
              console.error(`Error fetching details for playlist ${playlist.id}:`, error);
              return {
                ...playlist,
                isPublic: true,
                totalDuration: 0
              };
            }
          })
        );
        
        console.log('DEBUG - Playlists with details:', playlistsWithDetails);
        setPublicPlaylists(playlistsWithDetails);
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
    if (!track) return;
    addToQueue(track);
    toast.success(`Added "${track.title}" to queue`);
  };

  const formatDuration = (totalSeconds) => {
    if (!totalSeconds) return '0 min';
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  const handlePlayAll = (tracks) => {
    if (!tracks || tracks.length === 0) return;
    
    playAllTracks(tracks);
    toast.success(`Playing ${tracks.length} tracks`);
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

  const handleLikePlaylist = async (playlist) => {
    if (!isAuthenticated) {
      toast.error('Please log in to like playlists');
      return;
    }
    
    try {
      await playlistService.toggleLike(playlist.id);
      
      // Update the playlists state to reflect the change
      setPublicPlaylists(prevPlaylists => 
        prevPlaylists.map(p => 
          p.id === playlist.id ? { ...p, isLiked: !p.isLiked } : p
        )
      );
      
      toast.success(playlist.isLiked ? 'Removed from favorites' : 'Added to favorites');
    } catch (err) {
      console.error('Error toggling playlist like:', err);
      toast.error('Failed to update favorites');
    }
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
      <Grid item xs={6} sm={4} md={3} lg={2} key={track.id || index}>
        <Card sx={{ 
          borderRadius: 2,
          background: 'linear-gradient(145deg, #1e1e2e, #2a2a40)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          height: '100%',
          width: '100%',
          maxWidth: '240px',
          minWidth: '240px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)'
          }
        }}>
          <Box sx={{ position: 'relative', paddingTop: '100%', width: '100%', overflow: 'hidden' }}>
            <CardMedia
              component="img"
              image={track.imageUrl || track.coverImageUrl || defaultCoverImage}
              alt={track.title}
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = defaultCoverImage;
              }}
              sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center'
              }}
            />
            <IconButton 
              sx={{ 
                position: 'absolute', 
                bottom: 8, 
                right: 8,
                background: 'rgba(0,0,0,0.6)',
                width: 36,
                height: 36,
                '&:hover': { background: 'rgba(29, 185, 84, 0.8)' }
              }}
              onClick={() => handlePlayTrack(track)}
            >
              {isCurrentlyPlaying ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
            </IconButton>
          </Box>
          
          <CardContent sx={{ flexGrow: 1, height: '100px', maxHeight: '100px', p: 1.5 }}>
            <Typography 
              variant="subtitle1"
              component="div" 
              sx={{ 
                color: 'white',
                fontWeight: 'bold',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
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
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                fontSize: '0.8rem'
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
                padding: '2px 6px',
                borderRadius: 10,
                fontSize: '0.7rem'
              }}
            >
              {track.genre}
            </Typography>
          </CardContent>
          
          <CardActions sx={{ justifyContent: 'space-between', px: 1.5, pb: 1.5, pt: 0 }}>
            <Box>
              <IconButton 
                size="small" 
                onClick={() => handleLikeTrack(track.id)}
                sx={{ color: track.isLiked ? '#ec4899' : 'white', padding: 0.5 }}
              >
                {track.isLiked ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => handleAddToPlaylist(track)}
                sx={{ color: 'white', padding: 0.5 }}
              >
                <Add fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => handleAddToQueue(track)}
                sx={{ color: 'white', padding: 0.5 }}
                title="Add to queue"
              >
                <QueueMusicIcon fontSize="small" />
              </IconButton>
            </Box>
            <IconButton 
              size="small" 
              onClick={() => handleShareTrack(track)}
              sx={{ color: 'white', padding: 0.5 }}
            >
              <Share fontSize="small" />
            </IconButton>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  // Render playlist card
  const renderPlaylistCard = (playlist) => {
    return (
      <Grid item xs={6} sm={4} md={3} lg={2} key={playlist.id}>
        <Card 
          sx={{ 
            height: '100%', 
            width: '100%',
            maxWidth: '240px',
            minWidth: '240px',
            margin: '0 auto',
            backgroundColor: 'rgba(20, 20, 30, 0.8)',
            borderRadius: 2,
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 20px rgba(0,0,0,0.3)',
              '& .MuiCardMedia-root': {
                transform: 'scale(1.05)'
              }
            },
            cursor: 'pointer'
          }}
          onClick={() => navigate(`/playlists/${playlist.id}`)}
        >
          <Box sx={{ position: 'relative', paddingTop: '100%', width: '100%', overflow: 'hidden' }}>
            <CardMedia
              component="img"
              image={playlist.coverUrl || defaultCoverImage}
              alt={playlist.name}
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = defaultCoverImage;
              }}
              sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                transition: 'transform 0.3s ease'
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                p: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'white' }}>
                  {playlist.tracks?.length || playlist.trackCount || 0} songs
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>•</Typography>
                <Typography variant="caption" sx={{ color: 'white' }}>
                  {playlist.totalDuration ? `${Math.floor(playlist.totalDuration / 60)} min` : '0 min'}
                </Typography>
              </Box>
              <IconButton 
                size="small" 
                sx={{ 
                  backgroundColor: '#1db954',
                  width: 32,
                  height: 32,
                  '&:hover': { backgroundColor: '#1ed760' }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayPlaylist(playlist);
                }}
              >
                <PlayArrow fontSize="small" sx={{ color: 'white' }} />
              </IconButton>
            </Box>
            
            {/* Public/Private indicator */}
            <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
              <Chip
                icon={<PublicIcon sx={{ fontSize: 12 }} />}
                label="Public"
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(16, 185, 129, 0.8)',
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 24
                }}
              />
            </Box>
            
            {/* Like button */}
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleLikePlaylist(playlist);
              }}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(0,0,0,0.5)',
                width: 32,
                height: 32,
                color: playlist.isLiked ? '#ec4899' : 'white',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
              }}
            >
              {playlist.isLiked ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
            </IconButton>
          </Box>
          
          <CardContent sx={{ p: 1.5, height: '100px', maxHeight: '100px' }}>
            <Typography 
              variant="subtitle1" 
              component="div" 
              sx={{ 
                color: 'white',
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                mb: 0.5
              }}
            >
              {playlist.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Avatar 
                src={playlist.user?.avatarUrl} 
                alt={playlist.createdBy || 'User'}
                sx={{ width: 16, height: 16, mr: 0.5 }}
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '80%'
                }}
              >
                {playlist.createdBy || 'User'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <Typography 
                variant="caption" 
                sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}
              >
                {playlist.playCount || 0} plays 
              </Typography>
              
              {playlist.description && (
                <Tooltip title={playlist.description}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#1db954',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    Description
                  </Typography>
                </Tooltip>
              )}
            </Box>
          </CardContent>
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