import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  IconButton,
  Chip
} from '@mui/material';
import { 
  PlayArrow,
  Pause,
  CalendarMonth
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePlayerContext } from '../contexts/PlayerContext';

const AlbumCard = ({ album }) => {
  const navigate = useNavigate();
  const { 
    currentAlbum, 
    isPlaying, 
    playAlbum, 
    pausePlayback 
  } = usePlayerContext();
  
  const isCurrentAlbum = currentAlbum?.id === album.id;
  
  // Format release date
  const formatReleaseDate = (dateString) => {
    const date = new Date(dateString);
    return date.getFullYear();
  };
  
  // Xử lý phát album
  const handlePlayAlbum = (event) => {
    event.stopPropagation();
    if (isCurrentAlbum && isPlaying) {
      pausePlayback();
    } else {
      playAlbum(album.id);
    }
  };
  
  // Chuyển đến trang chi tiết album
  const handleCardClick = () => {
    navigate(`/album/${album.id}`);
  };
  
  return (
    <Card 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
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
      {/* Album Cover */}
      <Box sx={{ position: 'relative', paddingTop: '100%', width: '100%' }}>
        <CardMedia
          component="img"
          image={album.coverUrl || 'https://via.placeholder.com/300?text=No+Image'}
          alt={album.title}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
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
            onClick={handlePlayAlbum}
            sx={{
              backgroundColor: '#1db954',
              '&:hover': {
                backgroundColor: '#1ed760',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease',
              width: 56,
              height: 56
            }}
          >
            {isCurrentAlbum && isPlaying ? (
              <Pause sx={{ color: 'white', fontSize: 28 }} />
            ) : (
              <PlayArrow sx={{ color: 'white', fontSize: 28 }} />
            )}
          </IconButton>
        </Box>
        
        {/* Release Year Badge */}
        <Chip
          icon={<CalendarMonth sx={{ fontSize: 16 }} />}
          label={formatReleaseDate(album.releaseDate)}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            fontSize: '0.75rem',
            height: 24,
            '& .MuiChip-icon': {
              color: 'rgba(255,255,255,0.8)'
            }
          }}
        />
      </Box>

      {/* Album Info */}
      <CardContent sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        p: 2
      }}>
        <Typography 
          variant="h6" 
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
          {album.title}
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(255,255,255,0.7)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            cursor: 'pointer',
            '&:hover': { color: '#1db954' }
          }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/artist/${album.artistId}`);
          }}
        >
          {album.artist}
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mt: 'auto', 
          pt: 1
        }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.75rem'
            }}
          >
            {album.trackCount} tracks • {album.genre}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AlbumCard; 