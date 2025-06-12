import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  IconButton,
  Divider,
  Chip,
  Avatar,
  Skeleton,
  CircularProgress,
  Card,
  CardMedia
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Favorite,
  FavoriteBorder,
  Share,
  PlaylistAdd,
  QueueMusic,
  ArrowBack,
  Person,
  Album,
  MusicNote,
  AccessTime
} from '@mui/icons-material';
import { trackService } from '../services/trackService';
import { usePlayerContext } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import ShareModal from '../components/ShareModal';

const TrackDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { 
    currentTrack, 
    isPlaying, 
    playTrack, 
    pauseTrack, 
    resumeTrack,
    addToQueue 
  } = usePlayerContext();
  
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  // Fetch track details
  useEffect(() => {
    const fetchTrackDetails = async () => {
      try {
        setLoading(true);
        const fetchedTrack = await trackService.getTrackById(id);
        if (!fetchedTrack) {
          setError('Track not found');
        } else {
          setTrack(fetchedTrack);
          setIsLiked(fetchedTrack.isLiked || false);
        }
      } catch (err) {
        console.error('Error fetching track details:', err);
        setError('Failed to load track details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrackDetails();
  }, [id]);
  
  // Handle play/pause
  const handlePlayPause = () => {
    if (!track) return;
    
    const isCurrentlyPlaying = currentTrack && currentTrack.id === track.id && isPlaying;
    
    if (isCurrentlyPlaying) {
      pauseTrack();
    } else if (currentTrack && currentTrack.id === track.id) {
      resumeTrack();
    } else {
      playTrack(track);
    }
  };
  
  // Handle like/unlike
  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to like tracks');
      return;
    }
    
    try {
      await trackService.toggleLike(track.id);
      setIsLiked(!isLiked);
      toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
    } catch (err) {
      console.error('Error toggling like:', err);
      toast.error('Failed to update favorites');
    }
  };
  
  // Handle add to queue
  const handleAddToQueue = () => {
    if (!track) return;
    
    const success = addToQueue(track);
    if (success) {
      toast.success(`Added "${track.title}" to queue`);
    }
  };
  
  // Handle add to playlist
  const handleAddToPlaylist = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add tracks to playlists');
      return;
    }
    
    // Here you would typically open a modal to select a playlist
    toast.success('Add to playlist feature coming soon!');
  };
  
  // Handle share
  const handleShare = () => {
    setShareModalOpen(true);
  };
  
  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: 'white', mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Skeleton variant="text" width={200} height={40} />
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="text" width="80%" height={60} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="50%" height={30} sx={{ mb: 3 }} />
            
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <Skeleton variant="circular" width={50} height={50} />
              <Skeleton variant="circular" width={50} height={50} />
              <Skeleton variant="circular" width={50} height={50} />
            </Box>
            
            <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="70%" height={20} sx={{ mb: 1 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h4" sx={{ color: 'white', mb: 2 }}>
            {error}
          </Typography>
          <Typography variant="body1" sx={{ color: '#b3b3b3', mb: 4 }}>
            The track you're looking for might have been removed or doesn't exist.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate(-1)}
            startIcon={<ArrowBack />}
            sx={{ 
              bgcolor: '#1db954', 
              '&:hover': { bgcolor: '#1ed760' }
            }}
          >
            Go Back
          </Button>
        </Box>
      </Container>
    );
  }
  
  // No track state
  if (!track) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h4" sx={{ color: 'white', mb: 2 }}>
            Track Not Found
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate(-1)}
            startIcon={<ArrowBack />}
            sx={{ 
              bgcolor: '#1db954', 
              '&:hover': { bgcolor: '#1ed760' }
            }}
          >
            Go Back
          </Button>
        </Box>
      </Container>
    );
  }
  
  // Determine if track is currently playing
  const isCurrentlyPlaying = currentTrack && currentTrack.id === track.id && isPlaying;
  
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Back button */}
      <Box sx={{ display: 'flex', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: 'white', mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ color: 'white' }}>
          Back
        </Typography>
      </Box>
      
      <Grid container spacing={4}>
        {/* Track Cover */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            borderRadius: 2, 
            overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.02)'
            }
          }}>
            <CardMedia
              component="img"
              image={track.coverImageUrl || track.imageUrl || '/images/default-track.png'}
              alt={track.title}
              sx={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover' }}
            />
          </Card>
        </Grid>
        
        {/* Track Details */}
        <Grid item xs={12} md={8}>
          <Box>
            <Typography variant="overline" sx={{ color: '#b3b3b3' }}>
              TRACK
            </Typography>
            <Typography variant="h2" sx={{ 
              color: 'white', 
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}>
              {track.title}
            </Typography>
            <Typography variant="h5" sx={{ color: '#b3b3b3', mb: 3 }}>
              {track.artist}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={isCurrentlyPlaying ? <Pause /> : <PlayArrow />}
                onClick={handlePlayPause}
                sx={{
                  bgcolor: '#1db954',
                  '&:hover': { bgcolor: '#1ed760' },
                  borderRadius: 50,
                  px: 4
                }}
              >
                {isCurrentlyPlaying ? 'Pause' : 'Play'}
              </Button>
              
              <IconButton 
                onClick={handleToggleLike}
                sx={{ 
                  color: isLiked ? '#ff4081' : 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                {isLiked ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
              
              <IconButton 
                onClick={handleAddToQueue}
                sx={{ 
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <QueueMusic />
              </IconButton>
              
              <IconButton 
                onClick={handleAddToPlaylist}
                sx={{ 
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <PlaylistAdd />
              </IconButton>
              
              <IconButton 
                onClick={handleShare}
                sx={{ 
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <Share />
              </IconButton>
            </Box>
            
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />
            
            {/* Track Info */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Person sx={{ color: '#b3b3b3', mr: 2 }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: '#b3b3b3' }}>Artist</Typography>
                    <Typography variant="body1" sx={{ color: 'white' }}>{track.artist}</Typography>
                  </Box>
                </Box>
              </Grid>
              
              {track.album && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Album sx={{ color: '#b3b3b3', mr: 2 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#b3b3b3' }}>Album</Typography>
                      <Typography variant="body1" sx={{ color: 'white' }}>{track.album}</Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MusicNote sx={{ color: '#b3b3b3', mr: 2 }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: '#b3b3b3' }}>Genre</Typography>
                    <Typography variant="body1" sx={{ color: 'white' }}>{track.genre || 'Unknown'}</Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccessTime sx={{ color: '#b3b3b3', mr: 2 }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: '#b3b3b3' }}>Duration</Typography>
                    <Typography variant="body1" sx={{ color: 'white' }}>{formatDuration(track.duration)}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            
            {/* Additional stats */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {track.playCount !== undefined && (
                <Chip 
                  label={`${track.playCount} total plays`} 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.1)', 
                    color: 'white',
                    cursor: 'default',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }
                  }} 
                  clickable={false}
                />
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
      
      {/* Share Modal */}
      <ShareModal 
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        item={track}
        type="track"
      />
    </Container>
  );
};

export default TrackDetail; 