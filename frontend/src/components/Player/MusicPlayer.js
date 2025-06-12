import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardMedia,
  IconButton,
  Typography,
  Slider,
  Stack,
  Collapse,
  Tooltip,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as NextIcon,
  SkipPrevious as PrevIcon,
  VolumeUp as VolumeIcon,
  VolumeMute as MuteIcon,
  VolumeDown as VolumeLowIcon,
  Favorite as LikeIcon,
  FavoriteBorder as UnlikeIcon,
  Share as ShareIcon,
  KeyboardArrowUp as MaximizeIcon,
  KeyboardArrowDown as MinimizeIcon,
  Repeat as RepeatIcon,
  RepeatOne as RepeatOneIcon,
  Shuffle as ShuffleIcon,
  QueueMusic as PlaylistIcon,
  Add as AddToPlaylistIcon,
  PlaylistAdd as AddToQueueIcon,
  Close as CloseIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
  ExpandLess as CollapseIcon,
  ExpandMore as ExpandIcon
} from '@mui/icons-material';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { trackService } from '../../services/trackService';
import { useListeningHistory } from '../../hooks/useListeningHistory';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import ShareModal from '../ShareModal';

const MusicPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    duration,
    progress,
    volume,
    muted,
    queue,
    queueIndex,
    isShuffled,
    repeatMode,
    isLoading,
    playTrack,
    pauseTrack,
    seekTo,
    playNextTrack,
    playPreviousTrack,
    setVolume,
    toggleMute,
    addToQueue,
    removeFromQueue,
    clearQueue,
    toggleShuffle,
    toggleRepeat
  } = usePlayerContext();

  // Use listening history hook to track playback
  const { forceLogHistory } = useListeningHistory(currentTrack, isPlaying, progress, duration);

  const [isLiked, setIsLiked] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Format time in MM:SS format
  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle play/pause button click
  const handlePlayPause = () => {
    if (isPlaying) {
      pauseTrack();
    } else if (currentTrack) {
      playTrack(currentTrack);
    }
  };

  // Handle progress change
  const handleProgressChange = (event, newValue) => {
    seekTo(newValue);
  };

  // Handle volume change
  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
  };

  // Handle repeat mode toggle
  const handleRepeatClick = () => {
    toggleRepeat();
  };

  // Handle shuffle toggle
  const handleShuffleClick = () => {
    toggleShuffle();
  };

  // Toggle playlist drawer
  const handleTogglePlaylist = () => {
    setShowPlaylist(!showPlaylist);
  };

  // Handle like button click
  const handleLike = async () => {
    if (!currentTrack) return;
    
    try {
      // Toggle like status
      setIsLiked(!isLiked);
      
      // Call API to update like status
      await trackService.toggleLike(currentTrack.id);
      toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error toggling like:', error);
      setIsLiked(!isLiked); // Revert on error
      toast.error('Failed to update favorites');
    }
  };

  // Handle share button click
  const handleShare = () => {
    if (!currentTrack) return;
    setShareModalOpen(true);
  };

  // Handle remove from queue
  const handleRemoveFromQueue = (trackId) => {
    removeFromQueue(trackId);
    toast.success('Removed from queue');
  };

  // Get volume icon based on current volume
  const getVolumeIcon = () => {
    if (muted || volume === 0) return <MuteIcon />;
    if (volume < 50) return <VolumeLowIcon />;
    return <VolumeIcon />;
  };

  // Get repeat icon based on repeat state
  const getRepeatIcon = () => {
    if (repeatMode === 'one') return <RepeatOneIcon />;
    return <RepeatIcon />;
  };

  // Toggle minimized player
  const handleToggleMinimized = () => {
    setIsMinimized(!isMinimized);
  };

  // Set up Media Session API for browser media controls
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album || '',
        artwork: [
          { src: currentTrack.coverUrl || '', sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      // Set action handlers
      navigator.mediaSession.setActionHandler('play', () => playTrack(currentTrack));
      navigator.mediaSession.setActionHandler('pause', pauseTrack);
      navigator.mediaSession.setActionHandler('nexttrack', playNextTrack);
      navigator.mediaSession.setActionHandler('previoustrack', playPreviousTrack);
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime) {
          seekTo(details.seekTime);
        }
      });
    }
  }, [currentTrack, isPlaying, playTrack, pauseTrack, playNextTrack, playPreviousTrack, seekTo]);

  // Check if track is liked when it changes
  useEffect(() => {
    if (currentTrack) {
      // Here you would typically check if the track is liked from your API
      // For now we'll just reset it
      setIsLiked(false);
    }
  }, [currentTrack]);

  // Render nothing if no track is loaded
  if (!currentTrack) {
    return null;
  }

  return (
    <>
      {/* Debug Queue Panel - Temporary 
      {process.env.NODE_ENV === 'development' && (
        <Box
          sx={{
            position: 'fixed',
            top: 10,
            right: 10,
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            p: 2,
            borderRadius: 1,
            zIndex: 2000,
            maxWidth: 300,
            fontSize: '12px'
          }}
        >
          <Typography variant="subtitle2">Queue Debug Info:</Typography>
          <Typography variant="body2">Queue Length: {queue.length}</Typography>
          <Typography variant="body2">Current Index: {queueIndex}</Typography>
          <Typography variant="body2">Repeat Mode: {repeatMode}</Typography>
          <Typography variant="body2">Is Shuffled: {isShuffled ? 'Yes' : 'No'}</Typography>
          <Typography variant="body2">Current Track: {currentTrack?.title}</Typography>
          <Button 
            size="small" 
            onClick={playNextTrack}
            sx={{ mt: 1, fontSize: '10px' }}
          >
            Test Next Track
          </Button>
        </Box>
      )}
      */}

      {/* Main Player - Fixed at Bottom */}
      <Card
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(18, 18, 28, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 1000,
          transition: 'all 0.3s ease',
          height: isMinimized ? '70px' : 'auto',
          overflow: 'hidden'
        }}
      >
        {/* Minimized Player */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1,
            height: '70px'
          }}
        >
          {/* Track Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '30%' }}>
            <CardMedia
              component="img"
              sx={{ width: 50, height: 50, borderRadius: 1, mr: 2 }}
              image={currentTrack.coverImageUrl || currentTrack.coverUrl || '/images/default-track.png'}
              alt={currentTrack.title}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjEycHgiPk5PIElNRzwvdGV4dD4KPC9zdmc+';
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 'bold',
                  color: 'white',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {currentTrack.title}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#b3b3b3',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block'
                }}
              >
                {currentTrack.artist}
              </Typography>
            </Box>
          </Box>

          {/* Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={playPreviousTrack} sx={{ color: 'white' }}>
              <PrevIcon />
            </IconButton>
            
            <IconButton 
              onClick={handlePlayPause} 
              sx={{ 
                mx: 1, 
                color: 'white', 
                bgcolor: '#1db954', 
                '&:hover': { bgcolor: '#1ed760' },
                width: 40,
                height: 40
              }}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
            
            <IconButton onClick={playNextTrack} sx={{ color: 'white' }}>
              <NextIcon />
            </IconButton>
          </Box>

          {/* Progress Bar & Volume (Visible on larger screens) */}
          <Box 
            sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              alignItems: 'center', 
              flex: 1, 
              maxWidth: '40%', 
              mx: 2 
            }}
          >
            <Typography variant="caption" sx={{ color: '#b3b3b3', minWidth: '40px', textAlign: 'right' }}>
              {formatTime(progress)}
            </Typography>
            <Slider
              value={progress}
              max={duration || 100}
              onChange={handleProgressChange}
              sx={{
                mx: 2,
                color: '#1db954',
                height: 4,
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                  transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0px 0px 0px 8px rgba(29, 185, 84, 0.16)'
                  }
                },
                '& .MuiSlider-rail': {
                  opacity: 0.28
                }
              }}
            />
            <Typography variant="caption" sx={{ color: '#b3b3b3', minWidth: '40px' }}>
              {formatTime(duration)}
            </Typography>
          </Box>

          {/* Right Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Volume Control - Visible on larger screens */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', width: 150, mr: 2 }}>
              <IconButton onClick={toggleMute} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {getVolumeIcon()}
              </IconButton>
              <Slider
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                sx={{
                  mx: 1,
                  color: '#1db954',
                  height: 4,
                  '& .MuiSlider-thumb': {
                    width: 12,
                    height: 12
                  }
                }}
              />
            </Box>

            {/* Queue Button */}
            <Tooltip title="Queue">
              <IconButton onClick={handleTogglePlaylist} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                <Badge 
                  badgeContent={queue.length} 
                  color="primary"
                  sx={{ '& .MuiBadge-badge': { bgcolor: '#1db954' } }}
                >
                  <PlaylistIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Expand/Collapse Button */}
            <IconButton onClick={handleToggleMinimized} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {isMinimized ? <MaximizeIcon /> : <MinimizeIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Expanded Player Content */}
        <Collapse in={!isMinimized}>
          <Box sx={{ p: 3, pt: 0 }}>
            {/* Mobile Progress Bar (only visible on small screens) */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', my: 2 }}>
              <Typography variant="caption" sx={{ color: '#b3b3b3', minWidth: '40px', textAlign: 'right' }}>
                {formatTime(progress)}
              </Typography>
              <Slider
                value={progress}
                max={duration || 100}
                onChange={handleProgressChange}
                sx={{
                  mx: 2,
                  color: '#1db954',
                  height: 4,
                  '& .MuiSlider-thumb': {
                    width: 12,
                    height: 12
                  }
                }}
              />
              <Typography variant="caption" sx={{ color: '#b3b3b3', minWidth: '40px' }}>
                {formatTime(duration)}
              </Typography>
            </Box>

            {/* Additional Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Tooltip title={isShuffled ? "Shuffle is on" : "Shuffle is off"}>
                    <IconButton 
                      onClick={handleShuffleClick} 
                      sx={{ 
                        color: isShuffled ? '#1db954' : 'rgba(255, 255, 255, 0.7)',
                        '&:hover': { color: isShuffled ? '#1db954' : 'white' }
                      }}
                    >
                      <ShuffleIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <IconButton onClick={playPreviousTrack} sx={{ color: 'white' }}>
                    <PrevIcon />
                  </IconButton>
                  
                  <IconButton 
                    onClick={handlePlayPause} 
                    sx={{ 
                      mx: 1, 
                      color: 'white', 
                      bgcolor: '#1db954', 
                      '&:hover': { bgcolor: '#1ed760' },
                      width: 56,
                      height: 56
                    }}
                  >
                    {isPlaying ? <PauseIcon sx={{ fontSize: 30 }} /> : <PlayIcon sx={{ fontSize: 30 }} />}
                  </IconButton>
                  
                  <IconButton onClick={playNextTrack} sx={{ color: 'white' }}>
                    <NextIcon />
                  </IconButton>
                  
                  <Tooltip title={repeatMode === 'one' ? "Repeat one" : repeatMode ? "Repeat all" : "Repeat off"}>
                    <IconButton 
                      onClick={handleRepeatClick} 
                      sx={{ 
                        color: repeatMode ? '#1db954' : 'rgba(255, 255, 255, 0.7)',
                        '&:hover': { color: repeatMode ? '#1db954' : 'white' }
                      }}
                    >
                      {getRepeatIcon()}
                    </IconButton>
                  </Tooltip>
                </Stack>
                
                <Stack direction="row" spacing={2} alignItems="center">
                  <IconButton onClick={handleLike} sx={{ color: isLiked ? '#ff4081' : 'rgba(255, 255, 255, 0.7)' }}>
                    {isLiked ? <LikeIcon /> : <UnlikeIcon />}
                  </IconButton>
                  
                  <IconButton sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    <AddToPlaylistIcon />
                  </IconButton>
                  
                  <IconButton onClick={handleShare} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    <ShareIcon />
                  </IconButton>
                </Stack>
              </Box>
            </Box>
          </Box>
        </Collapse>
      </Card>

      {/* Queue Drawer */}
      <Drawer
        anchor="right"
        open={showPlaylist}
        onClose={handleTogglePlaylist}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            maxWidth: '100%',
            background: 'rgba(18, 18, 28, 0.98)',
            backdropFilter: 'blur(10px)',
            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.5)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              Queue
            </Typography>
            <IconButton onClick={handleTogglePlaylist} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          
          <List sx={{ maxHeight: 'calc(100vh - 100px)', overflow: 'auto' }}>
            {queue.length > 0 ? (
              queue.map((track, index) => (
                <ListItem 
                  key={`${track.id}-${index}`}
                  button
                  selected={index === queueIndex}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: index === queueIndex ? 'rgba(29, 185, 84, 0.1)' : 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.05)'
                    },
                    '&.Mui-selected': {
                      bgcolor: 'rgba(29, 185, 84, 0.15)',
                      '&:hover': {
                        bgcolor: 'rgba(29, 185, 84, 0.2)'
                      }
                    }
                  }}
                  onClick={() => playTrack(track)}
                >
                  <ListItemAvatar>
                    <Avatar 
                      variant="rounded" 
                      src={track.coverUrl || 'https://via.placeholder.com/40'}
                      alt={track.title}
                    />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={track.title} 
                    secondary={track.artist}
                    primaryTypographyProps={{
                      sx: { 
                        color: 'white',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }
                    }}
                    secondaryTypographyProps={{
                      sx: { 
                        color: '#b3b3b3',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {index === queueIndex && isPlaying && (
                      <Box sx={{ 
                        width: 4, 
                        height: 4, 
                        borderRadius: '50%', 
                        bgcolor: '#1db954',
                        mr: 1,
                        animation: 'pulse 2s infinite'
                      }} />
                    )}
                    <Typography variant="caption" sx={{ color: '#b3b3b3', mr: 1 }}>
                      {formatTime(track.duration || 0)}
                    </Typography>
                    {index !== queueIndex && (
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromQueue(track.id);
                        }}
                        sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                      >
                        <RemoveCircleOutlineIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </ListItem>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" sx={{ color: '#b3b3b3' }}>
                  Your queue is empty
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                  Add songs to your queue to listen to them next
                </Typography>
              </Box>
            )}
          </List>
        </Box>
      </Drawer>

      {/* Share Modal */}
      <ShareModal 
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        item={currentTrack}
        type="track"
      />
    </>
  );
};

export default MusicPlayer; 