import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  PlayArrow,
  Favorite,
  FavoriteBorder
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePlayerContext } from '../contexts/PlayerContext';

const ArtistCard = ({ artist }) => {
  const navigate = useNavigate();
  const { playArtistTopTracks } = usePlayerContext();
  const [isFavorite, setIsFavorite] = React.useState(false);
  
  const handlePlayArtist = (event) => {
    event.stopPropagation();
    // Giả định hàm này sẽ phát top tracks của nghệ sĩ
    playArtistTopTracks(artist.id);
  };
  
  const handleToggleFavorite = (event) => {
    event.stopPropagation();
    setIsFavorite(!isFavorite);
  };
  
  const handleCardClick = () => {
    navigate(`/artist/${artist.id}`);
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
          },
          '& .favorite-button': {
            opacity: 1
          }
        },
        cursor: 'pointer',
        position: 'relative'
      }}
      onClick={handleCardClick}
    >
      {/* Artist Image */}
      <Box sx={{ position: 'relative', paddingTop: '100%', width: '100%' }}>
        <CardMedia
          component="img"
          image={artist.imageUrl || 'https://via.placeholder.com/300?text=No+Image'}
          alt={artist.name}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            borderRadius: '50%',
            m: 'auto'
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
            transform: 'scale(0.9)',
            borderRadius: '50%'
          }}
        >
          <IconButton
            onClick={handlePlayArtist}
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
            <PlayArrow sx={{ color: 'white', fontSize: 28 }} />
          </IconButton>
        </Box>
        
        {/* Favorite Button */}
        <IconButton
          className="favorite-button"
          onClick={handleToggleFavorite}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(0,0,0,0.5)',
            opacity: isFavorite ? 1 : 0,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.7)'
            }
          }}
        >
          {isFavorite ? (
            <Favorite sx={{ color: '#ff4081' }} />
          ) : (
            <FavoriteBorder sx={{ color: 'white' }} />
          )}
        </IconButton>
      </Box>

      {/* Artist Info */}
      <CardContent sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
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
          {artist.name}
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(255,255,255,0.7)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {artist.genre}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ArtistCard; 