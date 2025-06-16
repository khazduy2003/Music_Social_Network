import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import { 
  PlayArrow, 
  Pause, 
  MoreVert, 
  QueueMusic, 
  Favorite, 
  FavoriteBorder,
  PlaylistAdd,
  Share
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePlayerContext } from '../contexts/PlayerContext';
import { trackService } from '../services/trackService';
import { toast } from 'react-hot-toast';
import ShareModal from './ShareModal';

const TrackCard = ({ track, showArtist = true }) => {
  const navigate = useNavigate();
  const { 
    currentTrack, 
    isPlaying, 
    playTrack, 
    pauseTrack, 
    addToQueue 
  } = usePlayerContext();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  const isCurrentTrack = currentTrack?.id === track.id;
  
  // Xử lý menu
  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    if (event) event.stopPropagation();
    setAnchorEl(null);
  };

  // Xử lý phát nhạc
  const handlePlayPause = (event) => {
    event.stopPropagation();
    if (isCurrentTrack) {
      if (isPlaying) {
        pauseTrack();
      } else {
        playTrack(track);
      }
    } else {
      playTrack(track);
    }
  };

  // Xử lý thêm vào hàng đợi
  const handleAddToQueue = (event) => {
    event.stopPropagation();
    addToQueue(track);
    handleMenuClose(event);
  };

  // Xử lý yêu thích
  const handleToggleFavorite = (event) => {
    event.stopPropagation();
    setIsFavorite(!isFavorite);
    handleMenuClose(event);
  };

  // Chuyển đến trang chi tiết
  const handleCardClick = () => {
    navigate(`/tracks/${track.id}`);
  };

  const handleShare = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setAnchorEl(null);
    setShareModalOpen(true);
  };

  const defaultCoverImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMUUxRTJFIi8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzE3Mi4wOTEgMTAwIDE5MCA4Mi4wOTE0IDE5MCA2MEMxOTAgMzcuOTA4NiAxNzIuMDkxIDIwIDE1MCAyMEMxMjcuOTA5IDIwIDExMCAzNy45MDg2IDExMCA2MEMxMTAgODIuMDkxNCAxMjcuOTA5IDEwMCAxNTAgMTAwWiIgZmlsbD0iIzFEQjk1NCIvPgo8cGF0aCBkPSJNMjEwIDI4MEgyMDBDMjAwIDI1My40NzggMTg5LjQ2NCAyMjggMTcwLjcxMSAyMDkuMjg5QzE1MS45NTcgMTkwLjUzNiAxMjYuNTIyIDE4MCAxMDAgMThIODBDODAuMDAwMSAyMTkuMzMgOTEuMDcxNCAyNTcuNDg4IDExMS43MTcgMjg5SDgwVjI5MEg5MEg5NS44Mjg5QzEwNi41IDI5My4zMzMgMTE4LjUgMjk1IDEzMCAyOTVIMTcwQzE4MS41IDI5NSAxOTMuNSAyOTMuMzMzIDIwNC4xNzEgMjkwSDIxMFYyODBaIiBmaWxsPSIjMURCOTU0Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjQjNCM0IzIiBmb250LXNpemU9IjE2IiBmb250LWZhbWlseT0iQXJpYWwiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=';

  return (
    <>
      <Card 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          maxWidth: '240px', // Fixed width
          minWidth: '240px', // Added minimum width to maintain consistency
          margin: '0 auto', // Center the card
          backgroundColor: 'rgba(20, 20, 30, 0.8)',
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 20px rgba(0,0,0,0.3)',
            '& .MuiCardMedia-root': {
              transform: 'scale(1.05)'
            },
            '& .play-button': {
              opacity: 1,
              transform: 'scale(1)'
            }
          },
          cursor: 'pointer',
          position: 'relative'
        }}
        onClick={handleCardClick}
      >
        {/* Cover Image */}
        <Box sx={{ position: 'relative', paddingTop: '100%', width: '100%', overflow: 'hidden' }}>
          <CardMedia
            component="img"
            image={track.imageUrl || track.coverImageUrl || track.coverUrl || defaultCoverImage}
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
              objectPosition: 'center', // Center the image
              transition: 'transform 0.3s ease'
            }}
          />
          
          {/* Play Button Overlay */}
          <Box
            className="play-button"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.4)',
              opacity: 0,
              transition: 'all 0.3s ease',
              transform: 'scale(0.9)'
            }}
          >
            <IconButton
              onClick={handlePlayPause}
              sx={{
                backgroundColor: '#1db954',
                '&:hover': {
                  backgroundColor: '#1ed760',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease',
                width: 48, // Slightly smaller
                height: 48 // Slightly smaller
              }}
            >
              {isCurrentTrack && isPlaying ? (
                <Pause sx={{ color: 'white', fontSize: 24 }} />
              ) : (
                <PlayArrow sx={{ color: 'white', fontSize: 24 }} />
              )}
            </IconButton>
          </Box>
        </Box>

        {/* Track Info */}
        <CardContent sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          p: 1.5, // Reduce padding
          height: '100px', // Reduced height
          maxHeight: '100px'
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            mb: 0.5
          }}>
            <Typography 
              variant="subtitle1" // Smaller font size
              component="div" 
              onClick={handleCardClick}
              sx={{ 
                color: 'white',
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.2,
                cursor: 'pointer',
                width: '85%', // Leave space for the menu button
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              {track.title}
            </Typography>
            
            <Tooltip title="More options">
              <IconButton 
                size="small" 
                onClick={handleMenuOpen}
                sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': { color: 'white' },
                  padding: 0.5 // Smaller padding
                }}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Menu
              id={`track-menu-${track.id}`}
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              MenuListProps={{
                'aria-labelledby': 'track-menu-button',
              }}
            >
              <MenuItem onClick={handleAddToQueue}>
                <ListItemIcon>
                  <QueueMusic />
                </ListItemIcon>
                <ListItemText>Add to Queue</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleToggleFavorite}>
                <ListItemIcon>
                  {isFavorite ? (
                    <Favorite sx={{ color: '#ff4081' }} />
                  ) : (
                    <FavoriteBorder sx={{ color: 'rgba(255,255,255,0.7)' }} />
                  )}
                </ListItemIcon>
                <ListItemText>
                  {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                </ListItemText>
              </MenuItem>
              
              <MenuItem onClick={(e) => handleShare(e)}>
                <ListItemIcon>
                  <Share sx={{ color: 'rgba(255,255,255,0.7)' }} />
                </ListItemIcon>
                <ListItemText>Share</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
          
          {showArtist && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                color: 'rgba(255,255,255,0.7)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                cursor: 'pointer',
                fontSize: '0.8rem', // Smaller font size
                '&:hover': { color: '#1db954' }
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/artist/${track.artistId}`);
              }}
            >
              {track.artist}
            </Typography>
          )}
        </CardContent>
      </Card>
      
      {/* Share Modal */}
      <ShareModal 
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        item={track}
        type="track"
      />
    </>
  );
};

export default TrackCard; 