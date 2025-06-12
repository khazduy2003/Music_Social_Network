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
  Button,
  Fade,
  Grow,
  Zoom,
  useTheme,
  useMediaQuery
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
  ExpandMore as ExpandIcon,
  Stop as StopIcon,
  CloseFullscreen as ClosePlayerIcon
} from '@mui/icons-material';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { trackService } from '../../services/trackService';
import { useListeningHistory } from '../../hooks/useListeningHistory';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import ShareModal from '../ShareModal';

const MusicPlayer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sidebarWidth, isCollapsed } = useSidebar();
  
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
    stopTrack,
    closePlayer,
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

  // Handle stop button click
  const handleStop = async () => {
    try {
      await stopTrack();
      toast.success('Music stopped and listening history saved');
    } catch (error) {
      console.error('Error stopping track:', error);
      toast.error('Failed to stop track');
    }
  };

  // Handle close player button click
  const handleClosePlayer = async () => {
    try {
      await closePlayer();
      toast.success('Music player closed');
    } catch (error) {
      console.error('Error closing player:', error);
      toast.error('Failed to close player');
    }
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

  // Calculate responsive positioning and sizing
  const playerLeftOffset = isMobile ? 0 : sidebarWidth;
  const playerWidth = isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`;
  const trackInfoMaxWidth = isCollapsed ? '35%' : '30%';
  const progressBarMaxWidth = isCollapsed ? '35%' : '40%';

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
      <Fade in={true} timeout={800}>
        <Card
          sx={{
            position: 'fixed',
            bottom: 0,
            left: playerLeftOffset,
            width: playerWidth,
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, rgba(18, 18, 28, 0.98) 0%, rgba(25, 25, 40, 0.98) 50%, rgba(18, 18, 28, 0.98) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.4), 0 -2px 16px rgba(29, 185, 84, 0.1)',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            zIndex: 1000,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            height: isMinimized ? '80px' : 'auto',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #1db954, transparent)',
              opacity: 0.6
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 50% 0%, rgba(29, 185, 84, 0.05) 0%, transparent 70%)',
              pointerEvents: 'none'
            }
          }}
        >
          {/* Close Player Button */}
          <Box sx={{ position: 'absolute', bottom: 8, right: 12, zIndex: 10, 
                      opacity: isMinimized ? 0 : 1,
                      pointerEvents: isMinimized ? 'none' : 'auto',
                      transition: 'opacity 1s ease-in-out'}}>
            <Tooltip title="Close player" arrow>
              <IconButton onClick={handleClosePlayer} sx={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(30,30,40,0.7)', '&:hover': { color: '#ff4444', background: 'rgba(255,68,68,0.1)' }, boxShadow: 2 }}>
                <ClosePlayerIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Minimized Player */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              height: '80px',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60px',
                height: '3px',
                background: 'linear-gradient(90deg, transparent, rgba(29, 185, 84, 0.8), transparent)',
                borderRadius: '2px',
                opacity: isMinimized ? 0 : 1,
                transition: 'opacity 0.3s ease'
              }
            }}
          >
            {/* Track Info */}
            <Grow in={true} timeout={600}>
              <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: trackInfoMaxWidth }}>
                <Box
                  sx={{
                    position: 'relative',
                    mr: 2,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -2,
                      left: -2,
                      right: -2,
                      bottom: -2,
                      background: 'linear-gradient(45deg, #1db954, #1ed760, #1db954)',
                      borderRadius: '8px',
                      opacity: isPlaying ? 0.6 : 0,
                      transition: 'opacity 0.3s ease',
                      animation: isPlaying ? 'pulse 2s infinite' : 'none'
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{ 
                      width: 56, 
                      height: 56, 
                      borderRadius: '6px',
                      position: 'relative',
                      zIndex: 1,
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                    image={currentTrack.coverImageUrl || currentTrack.coverUrl || '/images/default-track.png'}
                    alt={currentTrack.title}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHZpZXdCb3g9IjAgMCA1NiA1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiBmaWxsPSIjMzMzIiByeD0iNiIvPgo8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2NiIgZm9udC1zaXplPSIxMnB4Ij5OTyBJTUc8L3RleHQ+Cjwvc3ZnPg==';
                    }}
                  />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 'bold',
                      color: 'white',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      background: 'linear-gradient(45deg, #ffffff, #f0f0f0)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
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
                      display: 'block',
                      transition: 'color 0.3s ease',
                      '&:hover': {
                        color: '#ffffff'
                      }
                    }}
                  >
                    {currentTrack.artist}
                  </Typography>
                </Box>
              </Box>
            </Grow>

            {/* Controls */}
            <Zoom in={true} timeout={800}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  onClick={playPreviousTrack} 
                  sx={{ 
                    color: 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      color: '#1db954',
                      transform: 'scale(1.1)',
                      backgroundColor: 'rgba(29, 185, 84, 0.1)'
                    }
                  }}
                >
                  <PrevIcon />
                </IconButton>
                
                <IconButton 
                  onClick={handlePlayPause} 
                  sx={{ 
                    mx: 1, 
                    color: 'white', 
                    background: 'linear-gradient(45deg, #1db954, #1ed760)',
                    width: 48,
                    height: 48,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 16px rgba(29, 185, 84, 0.4)',
                    '&:hover': { 
                      background: 'linear-gradient(45deg, #1ed760, #22e065)',
                      transform: 'scale(1.05)',
                      boxShadow: '0 6px 20px rgba(29, 185, 84, 0.6)'
                    },
                    '&:active': {
                      transform: 'scale(0.95)'
                    }
                  }}
                >
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </IconButton>

                {/* Stop Button */}
                <Tooltip title="Dừng và lưu lịch sử nghe" arrow>
                  <IconButton 
                    onClick={handleStop} 
                    sx={{ 
                      ml: 0.5,
                      color: 'rgba(255, 255, 255, 0.8)',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        color: '#ff6b6b',
                        transform: 'scale(1.1)',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)'
                      }
                    }}
                  >
                    <StopIcon />
                  </IconButton>
                </Tooltip>
                
                <IconButton 
                  onClick={playNextTrack} 
                  sx={{ 
                    color: 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      color: '#1db954',
                      transform: 'scale(1.1)',
                      backgroundColor: 'rgba(29, 185, 84, 0.1)'
                    }
                  }}
                >
                  <NextIcon />
                </IconButton>
              </Box>
            </Zoom>

            {/* Progress Bar & Volume (Visible on larger screens) */}
            <Fade in={true} timeout={1000}>
              <Box 
                sx={{ 
                  display: { xs: 'none', md: 'flex' }, 
                  alignItems: 'center', 
                  flex: 1, 
                  maxWidth: progressBarMaxWidth, 
                  mx: 3 
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
                    height: 6,
                    '& .MuiSlider-track': {
                      background: 'linear-gradient(90deg, #1db954, #1ed760)',
                      border: 'none',
                      boxShadow: '0 2px 8px rgba(29, 185, 84, 0.3)'
                    },
                    '& .MuiSlider-thumb': {
                      width: 16,
                      height: 16,
                      background: 'linear-gradient(45deg, #1db954, #1ed760)',
                      border: '2px solid white',
                      boxShadow: '0 2px 8px rgba(29, 185, 84, 0.4)',
                      transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: '0px 0px 0px 8px rgba(29, 185, 84, 0.16)',
                        transform: 'scale(1.2)'
                      }
                    },
                    '& .MuiSlider-rail': {
                      opacity: 0.3,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)'
                    }
                  }}
                />
                <Typography variant="caption" sx={{ color: '#b3b3b3', minWidth: '40px' }}>
                  {formatTime(duration)}
                </Typography>
              </Box>
            </Fade>

            {/* Right Controls */}
            <Grow in={true} timeout={1200}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {/* Volume Control - Visible on larger screens */}
                <Box sx={{ 
                  display: { xs: 'none', md: 'flex' }, 
                  alignItems: 'center', 
                  width: isCollapsed ? 120 : 150, 
                  mr: 2 
                }}>
                  <IconButton 
                    onClick={toggleMute} 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: '#1db954',
                        backgroundColor: 'rgba(29, 185, 84, 0.1)'
                      }
                    }}
                  >
                    {getVolumeIcon()}
                  </IconButton>
                  <Slider
                    value={muted ? 0 : volume}
                    onChange={handleVolumeChange}
                    sx={{
                      mx: 1,
                      color: '#1db954',
                      height: 4,
                      '& .MuiSlider-track': {
                        background: 'linear-gradient(90deg, #1db954, #1ed760)',
                        border: 'none'
                      },
                      '& .MuiSlider-thumb': {
                        width: 12,
                        height: 12,
                        background: 'linear-gradient(45deg, #1db954, #1ed760)',
                        border: '1px solid white',
                        transition: '0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.2)'
                        }
                      },
                      '& .MuiSlider-rail': {
                        opacity: 0.3,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)'
                      }
                    }}
                  />
                </Box>

                {/* Queue Button */}
                <Tooltip title="Queue" arrow>
                  <IconButton 
                    onClick={handleTogglePlaylist} 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: '#1db954',
                        backgroundColor: 'rgba(29, 185, 84, 0.1)',
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <Badge 
                      badgeContent={queue.length} 
                      color="primary"
                      sx={{ 
                        '& .MuiBadge-badge': { 
                          bgcolor: '#1db954',
                          color: 'white',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 8px rgba(29, 185, 84, 0.4)'
                        } 
                      }}
                    >
                      <PlaylistIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {/* Expand/Collapse Button */}
                <Tooltip title={isMinimized ? "Expand Player" : "Minimize Player"} arrow>
                  <IconButton 
                    onClick={handleToggleMinimized} 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: '#1db954',
                        backgroundColor: 'rgba(29, 185, 84, 0.1)',
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    {isMinimized ? <MaximizeIcon /> : <MinimizeIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Grow>
          </Box>

          {/* Expanded Player Content */}
          <Collapse in={!isMinimized} timeout={400}>
            <Box sx={{ p: 3, pt: 0 }}>
              {/* Mobile Progress Bar (only visible on small screens) */}
              <Fade in={!isMinimized} timeout={600}>
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
                      height: 6,
                      '& .MuiSlider-track': {
                        background: 'linear-gradient(90deg, #1db954, #1ed760)',
                        border: 'none',
                        boxShadow: '0 2px 8px rgba(29, 185, 84, 0.3)'
                      },
                      '& .MuiSlider-thumb': {
                        width: 16,
                        height: 16,
                        background: 'linear-gradient(45deg, #1db954, #1ed760)',
                        border: '2px solid white'
                      },
                      '& .MuiSlider-rail': {
                        opacity: 0.3,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)'
                      }
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#b3b3b3', minWidth: '40px' }}>
                    {formatTime(duration)}
                  </Typography>
                </Box>
              </Fade>

              {/* Additional Controls */}
              <Zoom in={!isMinimized} timeout={800}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <Tooltip title={isShuffled ? "Shuffle is on" : "Shuffle is off"} arrow>
                        <IconButton 
                          onClick={handleShuffleClick} 
                          sx={{ 
                            color: isShuffled ? '#1db954' : 'rgba(255, 255, 255, 0.7)',
                            transition: 'all 0.3s ease',
                            '&:hover': { 
                              color: isShuffled ? '#1ed760' : '#1db954',
                              backgroundColor: 'rgba(29, 185, 84, 0.1)',
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          <ShuffleIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <IconButton 
                        onClick={playPreviousTrack} 
                        sx={{ 
                          color: 'white',
                          transition: 'all 0.3s ease',
                          '&:hover': { 
                            color: '#1db954',
                            transform: 'scale(1.1)',
                            backgroundColor: 'rgba(29, 185, 84, 0.1)'
                          }
                        }}
                      >
                        <PrevIcon sx={{ fontSize: 28 }} />
                      </IconButton>
                      
                      <IconButton 
                        onClick={handlePlayPause} 
                        sx={{ 
                          mx: 2, 
                          color: 'white', 
                          background: 'linear-gradient(45deg, #1db954, #1ed760)',
                          width: 64,
                          height: 64,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 8px 24px rgba(29, 185, 84, 0.4)',
                          '&:hover': { 
                            background: 'linear-gradient(45deg, #1ed760, #22e065)',
                            transform: 'scale(1.05)',
                            boxShadow: '0 12px 32px rgba(29, 185, 84, 0.6)'
                          },
                          '&:active': {
                            transform: 'scale(0.95)'
                          }
                        }}
                      >
                        {isPlaying ? <PauseIcon sx={{ fontSize: 32 }} /> : <PlayIcon sx={{ fontSize: 32 }} />}
                      </IconButton>
                      
                      <IconButton 
                        onClick={playNextTrack} 
                        sx={{ 
                          color: 'white',
                          transition: 'all 0.3s ease',
                          '&:hover': { 
                            color: '#1db954',
                            transform: 'scale(1.1)',
                            backgroundColor: 'rgba(29, 185, 84, 0.1)'
                          }
                        }}
                      >
                        <NextIcon sx={{ fontSize: 28 }} />
                      </IconButton>
                      
                      <Tooltip title={repeatMode === 'one' ? "Repeat one" : repeatMode ? "Repeat all" : "Repeat off"} arrow>
                        <IconButton 
                          onClick={handleRepeatClick} 
                          sx={{ 
                            color: repeatMode ? '#1db954' : 'rgba(255, 255, 255, 0.7)',
                            transition: 'all 0.3s ease',
                            '&:hover': { 
                              color: repeatMode ? '#1ed760' : '#1db954',
                              backgroundColor: 'rgba(29, 185, 84, 0.1)',
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          {getRepeatIcon()}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    
                    <Stack direction="row" spacing={3} alignItems="center">
                      <Tooltip title={isLiked ? "Remove from favorites" : "Add to favorites"} arrow>
                        <IconButton 
                          onClick={handleLike} 
                          sx={{ 
                            color: isLiked ? '#ff4081' : 'rgba(255, 255, 255, 0.7)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              color: isLiked ? '#ff6b9d' : '#ff4081',
                              backgroundColor: isLiked ? 'rgba(255, 64, 129, 0.1)' : 'rgba(255, 64, 129, 0.1)',
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          {isLiked ? <LikeIcon /> : <UnlikeIcon />}
                        </IconButton>
                      </Tooltip>
                      
                      {/* <IconButton sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        <AddToPlaylistIcon />
                      </IconButton> */}
                      
                      <Tooltip title="Share track" arrow>
                        <IconButton 
                          onClick={handleShare} 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              color: '#1db954',
                              backgroundColor: 'rgba(29, 185, 84, 0.1)',
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          <ShareIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </Box>
              </Zoom>
            </Box>
          </Collapse>
        </Card>
      </Fade>

      {/* Queue Drawer */}
      <Drawer
        anchor="right"
        open={showPlaylist}
        onClose={handleTogglePlaylist}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            maxWidth: '100%',
            background: 'linear-gradient(135deg, rgba(18, 18, 28, 0.98) 0%, rgba(25, 25, 40, 0.98) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.5)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)'
          }
        }}
        transitionDuration={400}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #ffffff, #f0f0f0)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Queue
            </Typography>
            <IconButton 
              onClick={handleTogglePlaylist} 
              sx={{ 
                color: 'white',
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: '#1db954',
                  backgroundColor: 'rgba(29, 185, 84, 0.1)',
                  transform: 'rotate(90deg)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          
          <List sx={{ maxHeight: 'calc(100vh - 140px)', overflow: 'auto' }}>
            {queue.length > 0 ? (
              queue.map((track, index) => (
                <Fade in={true} timeout={300 + index * 100} key={`${track.id}-${index}`}>
                  <ListItem 
                    button
                    selected={index === queueIndex}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: index === queueIndex ? 'rgba(29, 185, 84, 0.15)' : 'transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: index === queueIndex ? 'rgba(29, 185, 84, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                        transform: 'translateX(4px)'
                      },
                      '&.Mui-selected': {
                        bgcolor: 'rgba(29, 185, 84, 0.15)',
                        '&:hover': {
                          bgcolor: 'rgba(29, 185, 84, 0.25)'
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
                        sx={{
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.1)'
                          }
                        }}
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
                          whiteSpace: 'nowrap',
                          fontWeight: index === queueIndex ? 'bold' : 'normal'
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
                          width: 6, 
                          height: 6, 
                          borderRadius: '50%', 
                          bgcolor: '#1db954',
                          mr: 1,
                          animation: 'pulse 2s infinite',
                          boxShadow: '0 0 8px rgba(29, 185, 84, 0.6)'
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
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.5)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              color: '#ff4444',
                              backgroundColor: 'rgba(255, 68, 68, 0.1)',
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          <RemoveCircleOutlineIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </ListItem>
                </Fade>
              ))
            ) : (
              <Fade in={true} timeout={600}>
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="body1" sx={{ color: '#b3b3b3', mb: 1 }}>
                    Your queue is empty
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Add songs to your queue to listen to them next
                  </Typography>
                </Box>
              </Fade>
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

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default MusicPlayer; 