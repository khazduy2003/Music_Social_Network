import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Pagination,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Avatar,
  Chip
} from '@mui/material';
import { 
  PlayArrow, 
  Share, 
  QueueMusic as QueueMusicIcon,
  Public as PublicIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import TrackCard from '../components/TrackCard';
import { trackService } from '../services/trackService';
import { playlistService } from '../services/playlistService';
import { usePlayerContext } from '../contexts/PlayerContext';
import ShareModal from '../components/ShareModal';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`recommendation-tabpanel-${index}`}
      aria-labelledby={`recommendation-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `recommendation-tab-${index}`,
    'aria-controls': `recommendation-tabpanel-${index}`,
  };
}

const RecommendedMusic = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { playPlaylistById } = usePlayerContext();
  const [value, setValue] = useState(0);
  const [error, setError] = useState(null);
  
  // Artist-based recommendations
  const [artistTracks, setArtistTracks] = useState([]);
  const [artistPage, setArtistPage] = useState(1);
  const [artistTotalPages, setArtistTotalPages] = useState(1);
  const [artistLoading, setArtistLoading] = useState(false);
  
  // Genre-based recommendations
  const [genreTracks, setGenreTracks] = useState([]);
  const [genrePage, setGenrePage] = useState(1);
  const [genreTotalPages, setGenreTotalPages] = useState(1);
  const [genreLoading, setGenreLoading] = useState(false);

  // Public Playlists
  const [publicPlaylists, setPublicPlaylists] = useState([]);
  const [playlistPage, setPlaylistPage] = useState(1);
  const [playlistTotalPages, setPlaylistTotalPages] = useState(1);
  const [playlistLoading, setPlaylistLoading] = useState(false);
  
  // Share modal
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [itemToShare, setItemToShare] = useState(null);
  const [shareType, setShareType] = useState('track');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const fetchArtistRecommendations = async (page = 1) => {
    setArtistLoading(true);
    setError(null);
    
    try {
      const limit = 20; // Items per page
      const offset = (page - 1) * limit;
      
      // For artist recommendations, we'll call the API multiple times to get paginated results
      const response = await trackService.getRecommendationsByArtist(limit * page);
      
      // Debug: Check image properties
      if (response && response.length > 0) {
        console.log('Artist recommendations track sample:', response[0]);
        console.log('Available image properties:', {
          imageUrl: response[0].imageUrl,
          coverImageUrl: response[0].coverImageUrl,
          coverUrl: response[0].coverUrl
        });
      }
      
      // Simulate pagination by slicing the results
      const startIndex = offset;
      const endIndex = startIndex + limit;
      const paginatedTracks = response.slice(startIndex, endIndex);
      
      setArtistTracks(paginatedTracks);
      setArtistTotalPages(Math.ceil(response.length / limit));
      setArtistPage(page);
    } catch (err) {
      console.error('Error fetching artist recommendations:', err);
      setError('Failed to load artist recommendations');
      setArtistTracks([]);
    } finally {
      setArtistLoading(false);
    }
  };

  const fetchGenreRecommendations = async (page = 1) => {
    setGenreLoading(true);
    setError(null);
    
    try {
      const limit = 20; // Items per page
      const offset = (page - 1) * limit;
      
      // For genre recommendations
      const response = await trackService.getRecommendationsByGenre(limit * page);
      
      // Debug: Check image properties
      if (response && response.length > 0) {
        console.log('Genre recommendations track sample:', response[0]);
        console.log('Available image properties:', {
          imageUrl: response[0].imageUrl,
          coverImageUrl: response[0].coverImageUrl,
          coverUrl: response[0].coverUrl
        });
      }
      
      // Simulate pagination by slicing the results
      const startIndex = offset;
      const endIndex = startIndex + limit;
      const paginatedTracks = response.slice(startIndex, endIndex);
      
      setGenreTracks(paginatedTracks);
      setGenreTotalPages(Math.ceil(response.length / limit));
      setGenrePage(page);
    } catch (err) {
      console.error('Error fetching genre recommendations:', err);
      setError('Failed to load genre recommendations');
      setGenreTracks([]);
    } finally {
      setGenreLoading(false);
    }
  };

  const fetchPublicPlaylists = async (page = 1) => {
    setPlaylistLoading(true);
    setError(null);
    
    try {
      const response = await playlistService.getPublicPlaylists();
      
      // Simulate pagination (assuming the API doesn't support it)
      const ITEMS_PER_PAGE = 20;
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const paginatedPlaylists = response.slice(startIndex, endIndex);
      
      setPublicPlaylists(paginatedPlaylists);
      setPlaylistTotalPages(Math.ceil(response.length / ITEMS_PER_PAGE));
      setPlaylistPage(page);
    } catch (err) {
      console.error('Error fetching public playlists:', err);
      setError('Failed to load public playlists');
      setPublicPlaylists([]);
    } finally {
      setPlaylistLoading(false);
    }
  };

  useEffect(() => {
    fetchArtistRecommendations(1);
    fetchGenreRecommendations(1);
    fetchPublicPlaylists(1);
  }, []);

  const handleArtistPageChange = (event, page) => {
    fetchArtistRecommendations(page);
  };

  const handleGenrePageChange = (event, page) => {
    fetchGenreRecommendations(page);
  };

  const handlePlaylistPageChange = (event, page) => {
    fetchPublicPlaylists(page);
  };

  const handlePlayPlaylist = (playlist) => {
    if (playlist && playlist.id) {
      playlistService.incrementPlayCount(playlist.id);
      playPlaylistById(playlist.id);
    }
  };

  const handleShareItem = (item, type) => {
    setItemToShare(item);
    setShareType(type);
    setShareModalOpen(true);
  };

  // Determine if we should show pagination based on available data
  const shouldShowArtistPagination = artistTracks.length > 0 && artistTotalPages > 1;
  const shouldShowGenrePagination = genreTracks.length > 0 && genreTotalPages > 1;
  const shouldShowPlaylistPagination = publicPlaylists.length > 0 && playlistTotalPages > 1;

  // Check if any tab has content
  const hasArtistContent = artistTracks.length > 0;
  const hasGenreContent = genreTracks.length > 0;
  const hasPublicPlaylistsContent = publicPlaylists.length > 0;

  // Auto-switch to genre tab if artist tab is empty but genre has content
  useEffect(() => {
    if (!hasArtistContent && hasGenreContent && value === 0) {
      setValue(1);
    }
  }, [hasArtistContent, hasGenreContent, value]);

  // Playlist card renderer
  const renderPlaylistCard = (playlist) => {
    return (
      <Grid item xs={12} sm={6} md={4} lg={3} key={playlist.id}>
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
                handleShareItem(playlist, 'playlist');
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ 
        fontWeight: 700,
        background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        mb: 4
      }}>
        🎵 Recommended For You
      </Typography>

      <Paper sx={{ 
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2
      }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={value} 
            onChange={handleChange} 
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                }
              }
            }}
          >
            <Tab label="Artist-Based" {...a11yProps(0)} />
            <Tab label="Genre-Based" {...a11yProps(1)} />
            <Tab label="Public Playlists" {...a11yProps(2)} />
          </Tabs>
        </Box>

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {/* Similar Artists Tab */}
        <TabPanel value={value} index={0}>
          {artistLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : artistTracks.length > 0 ? (
            <>
              <Grid container spacing={3}>
                {artistTracks.map((track) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={`artist-${track.id}`}>
                    <TrackCard track={track} />
                  </Grid>
                ))}
              </Grid>
              
              {shouldShowArtistPagination && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination
                    count={artistTotalPages}
                    page={artistPage}
                    onChange={handleArtistPageChange}
                    color="primary"
                    size="large"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        fontSize: '1rem',
                      }
                    }}
                  />
                </Box>
              )}
            </>
          ) : (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                🎨 No artist-based recommendations available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Listen to more music to get personalized recommendations based on your favorite artists!
              </Typography>
            </Box>
          )}
        </TabPanel>

        {/* Similar Genres Tab */}
        <TabPanel value={value} index={1}>
          {genreLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : genreTracks.length > 0 ? (
            <>
              <Grid container spacing={3}>
                {genreTracks.map((track) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={`genre-${track.id}`}>
                    <TrackCard track={track} />
                  </Grid>
                ))}
              </Grid>
              
              {shouldShowGenrePagination && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination
                    count={genreTotalPages}
                    page={genrePage}
                    onChange={handleGenrePageChange}
                    color="primary"
                    size="large"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        fontSize: '1rem',
                      }
                    }}
                  />
                </Box>
              )}
            </>
          ) : (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                🎭 No genre-based recommendations available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Listen to more diverse music genres to get personalized recommendations!
              </Typography>
            </Box>
          )}
        </TabPanel>

        {/* Public Playlists */}
        <TabPanel value={value} index={2}>
          {playlistLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          ) : publicPlaylists.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" gutterBottom>No public playlists found</Typography>
              <Typography variant="body1" color="text.secondary">
                Users haven't created any public playlists yet.
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {publicPlaylists.map(renderPlaylistCard)}
              </Grid>
              
              {shouldShowPlaylistPagination && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination 
                    count={playlistTotalPages} 
                    page={playlistPage} 
                    onChange={handlePlaylistPageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </TabPanel>
      </Paper>

      {/* Share Modal */}
      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        item={itemToShare}
        type={shareType}
      />
    </Container>
  );
};

export default RecommendedMusic; 