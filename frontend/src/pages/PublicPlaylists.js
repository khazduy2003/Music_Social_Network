import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Pagination,
  CircularProgress,
  Chip,
  Avatar
} from '@mui/material';
import {
  PlayArrow,
  QueueMusic as QueueMusicIcon,
  Public as PublicIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { playlistService } from '../services/playlistService';
import { usePlayerContext } from '../contexts/PlayerContext';
import { useNavigate } from 'react-router-dom';
import ShareModal from '../components/ShareModal';

const PublicPlaylists = () => {
  const { playPlaylistById } = usePlayerContext();
  const navigate = useNavigate();
  
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [playlistToShare, setPlaylistToShare] = useState(null);
  
  const itemsPerPage = 12; // Số lượng playlist hiển thị trên mỗi trang
  
  const fetchPublicPlaylists = async (currentPage = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await playlistService.getPublicPlaylists();
      console.log('Public playlists fetched:', response);
      
      // Mô phỏng phân trang
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedPlaylists = response.slice(startIndex, endIndex);
      
      setPlaylists(paginatedPlaylists);
      setTotalPages(Math.ceil(response.length / itemsPerPage));
      setPage(currentPage);
    } catch (err) {
      console.error('Error fetching public playlists:', err);
      setError('Failed to load public playlists');
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPublicPlaylists(1);
  }, []);
  
  const handlePageChange = (event, value) => {
    fetchPublicPlaylists(value);
  };
  
  const handlePlayPlaylist = (playlist) => {
    if (playlist && playlist.id) {
      playlistService.incrementPlayCount(playlist.id);
      playPlaylistById(playlist.id);
    }
  };
  
  const handleSharePlaylist = (playlist) => {
    setPlaylistToShare(playlist);
    setShareModalOpen(true);
  };
  
  const renderPlaylistCard = (playlist) => {
    return (
      <Grid item xs={12} sm={6} md={4} lg={3} key={playlist.id}>
        <Card 
          sx={{ 
            borderRadius: 2,
            background: 'linear-gradient(145deg, #1e1e2e, #2a2a40)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s ease',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
              '& .play-button': {
                opacity: 1,
                visibility: 'visible'
              }
            }
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
              className="play-button"
              sx={{ 
                position: 'absolute', 
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(10px)',
                width: 56,
                height: 56,
                opacity: 0,
                visibility: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  background: 'rgba(29, 185, 84, 0.9)',
                  transform: 'translate(-50%, -50%) scale(1.1)'
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPlaylist(playlist);
              }}
            >
              <PlayArrow sx={{ fontSize: 28 }} />
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
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                    color: 'white'
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/profile/${playlist.user?.id}`);
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
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleSharePlaylist(playlist);
              }}
              sx={{ color: 'white' }}
            >
              <ShareIcon fontSize="small" />
            </IconButton>
          </Box>
        </Card>
      </Grid>
    );
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
          Public Playlists
        </Typography>
        <Typography variant="h6" sx={{ color: '#b3b3b3' }}>
          Discover playlists shared by the community
        </Typography>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#1db954' }} />
        </Box>
      ) : error ? (
        <Box sx={{ p: 4, textAlign: 'center', color: '#ff5757' }}>
          <Typography variant="h6">{error}</Typography>
        </Box>
      ) : playlists.length === 0 ? (
        <Box sx={{ p: 8, textAlign: 'center' }}>
          <QueueMusicIcon sx={{ fontSize: 80, color: '#b3b3b3', mb: 2 }} />
          <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>
            No public playlists found
          </Typography>
          <Typography variant="body1" sx={{ color: '#b3b3b3' }}>
            It seems there are no public playlists available right now.
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {playlists.map(renderPlaylistCard)}
          </Grid>
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange}
                variant="outlined" 
                shape="rounded"
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.2)',
                    '&.Mui-selected': {
                      background: 'rgba(29,185,84,0.8)',
                      borderColor: 'transparent'
                    },
                    '&:hover': {
                      background: 'rgba(255,255,255,0.1)'
                    }
                  }
                }}
              />
            </Box>
          )}
        </>
      )}
      
      <ShareModal 
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        item={playlistToShare}
        type="playlist"
      />
    </Container>
  );
};

export default PublicPlaylists; 