import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  CardActions,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Skeleton,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  PlayArrow as PlayIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Share as ShareIcon,
  PlaylistAdd as PlaylistAddIcon,
  PlaylistPlay as PlaylistPlayIcon
} from '@mui/icons-material';
import { usePlayerContext } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import { trackService } from '../services/trackService';
import { useNavigate } from 'react-router-dom';
import ShareModal from '../components/ShareModal';

const Favourites = () => {
  const { currentTrack, playTrack, isPlaying, pauseTrack, resumeTrack, addToQueue, playAllTracks } = usePlayerContext();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [favouriteTracks, setFavouriteTracks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [trackToShare, setTrackToShare] = useState(null);

  useEffect(() => {
    const fetchFavouriteTracks = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const tracks = await trackService.getLikedTracks();
        setFavouriteTracks(tracks);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching favourite tracks:', err);
        setError('Failed to load your favourite tracks');
        setLoading(false);
      }
    };

    fetchFavouriteTracks();
  }, [isAuthenticated, navigate]);

  const filteredTracks = favouriteTracks.filter(track =>
    track.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.album?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleRemoveFromFavourites = async (trackId) => {
    try {
      await trackService.unlikeTrack(trackId);
      setFavouriteTracks(prev => prev.filter(track => track.id !== trackId));
      setSnackbar({
        open: true,
        message: 'Track removed from favourites',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error removing track from favourites:', err);
      setSnackbar({
        open: true,
        message: 'Failed to remove track from favourites',
        severity: 'error'
      });
    }
  };

  const handleAddToQueue = (track) => {
    addToQueue(track);
    setSnackbar({
      open: true,
      message: `Added "${track.title}" to queue`,
      severity: 'success'
    });
  };

  const handleAddToPlaylist = (track) => {
    // This would typically open a modal to select a playlist
    setSnackbar({
      open: true,
      message: 'Add to playlist feature coming soon!',
      severity: 'info'
    });
  };

  const handleShareTrack = (track) => {
    setTrackToShare(track);
    setShareModalOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handlePlayAll = () => {
    if (filteredTracks.length > 0) {
      playAllTracks(filteredTracks);
      setSnackbar({
        open: true,
        message: `Playing all ${filteredTracks.length} favourite tracks`,
        severity: 'success'
      });
    } else {
      setSnackbar({
        open: true,
        message: 'No tracks to play',
        severity: 'warning'
      });
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FavoriteIcon sx={{ fontSize: 40, color: '#ec4899', mr: 2 }} />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ec4899, #f97316)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Your Favourites
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ color: '#b3b3b3', mb: 3 }}>
          {favouriteTracks.length} tracks you've saved
        </Typography>

        {/* Search */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search your favourites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#b3b3b3' }} />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 500, flex: 1 }}
          />
          {filteredTracks.length > 0 && (
            <Button
              variant="contained"
              startIcon={<PlaylistPlayIcon />}
              onClick={handlePlayAll}
              sx={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                },
                minWidth: 'auto',
                px: 3
              }}
            >
              Play All
            </Button>
          )}
        </Box>
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card sx={{ background: 'rgba(20, 20, 30, 0.8)' }}>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={20} width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" sx={{ color: '#b3b3b3', mb: 2 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              '&:hover': {
                background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
              }
            }}
          >
            Try Again
          </Button>
        </Box>
      ) : favouriteTracks.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <FavoriteBorderIcon sx={{ fontSize: 80, color: '#666', mb: 2 }} />
          <Typography variant="h5" sx={{ color: '#b3b3b3', mb: 2 }}>
            No favourites yet
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
            Start exploring and add tracks to your favourites!
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/discover')}
            sx={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              '&:hover': {
                background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
              }
            }}
          >
            Discover Music
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredTracks.map((track) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={track.id}>
              <Card
                sx={{
                  background: 'rgba(20, 20, 30, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                  }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={track.coverImageUrl || track.imageUrl || 'https://via.placeholder.com/300?text=No+Image'}
                    alt={track.title}
                    sx={{ borderRadius: '12px 12px 0 0' }}
                  />
                  <IconButton
                    onClick={() => handlePlayTrack(track)}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: 'white',
                      width: 60,
                      height: 60,
                      opacity: 0,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translate(-50%, -50%) scale(1.1)',
                        boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
                      },
                      '.MuiCard-root:hover &': {
                        opacity: 1,
                      }
                    }}
                  >
                    <PlayIcon sx={{ fontSize: 30 }} />
                  </IconButton>
                </Box>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: 'white',
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
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
                    sx={{ color: '#b3b3b3', mb: 2 }}
                  >
                    {track.artist}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={formatDuration(track.duration)}
                      size="small"
                      sx={{
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={() => handleRemoveFromFavourites(track.id)}
                      sx={{ color: '#ec4899' }}
                    >
                      <FavoriteIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleAddToPlaylist(track)}
                      sx={{ color: 'white' }}
                    >
                      <AddIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleAddToQueue(track)}
                      sx={{ color: 'white' }}
                      title="Add to queue"
                    >
                      <PlaylistAddIcon />
                    </IconButton>
                  </Box>
                  <IconButton 
                    size="small" 
                    onClick={() => handleShareTrack(track)}
                    sx={{ color: 'white' }}
                  >
                    <ShareIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
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

      {/* Share Modal */}
      <ShareModal 
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        item={trackToShare}
        type="track"
      />
    </Container>
  );
};

export default Favourites;