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
  
  // Similar Artists state
  const [similarArtistTracks, setSimilarArtistTracks] = useState([]);
  const [similarArtistPage, setSimilarArtistPage] = useState(1);
  const [similarArtistTotalPages, setSimilarArtistTotalPages] = useState(1);
  const [similarArtistLoading, setSimilarArtistLoading] = useState(false);
  
  // Similar Genres state
  const [similarGenreTracks, setSimilarGenreTracks] = useState([]);
  const [similarGenrePage, setSimilarGenrePage] = useState(1);
  const [similarGenreTotalPages, setSimilarGenreTotalPages] = useState(1);
  const [similarGenreLoading, setSimilarGenreLoading] = useState(false);

  // Following Liked Tracks state
  const [followingLikedTracks, setFollowingLikedTracks] = useState([]);
  const [followingLikedPage, setFollowingLikedPage] = useState(1);
  const [followingLikedTotalPages, setFollowingLikedTotalPages] = useState(1);
  const [followingLikedLoading, setFollowingLikedLoading] = useState(false);
  
  // Share modal
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [itemToShare, setItemToShare] = useState(null);
  const [shareType, setShareType] = useState('track');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const fetchSimilarArtistTracks = async (page = 1) => {
    setSimilarArtistLoading(true);
    setError(null);
    
    try {
      const limit = 20; // Items per page
      const offset = (page - 1) * limit;
      
      // Get similar artist tracks
      const response = await trackService.getSimilarArtistTracks(limit * page);
      
      // Debug: Check image properties
      if (response && response.length > 0) {
        console.log('Similar artist tracks sample:', response[0]);
      }
      
      // Simulate pagination by slicing the results
      const startIndex = offset;
      const endIndex = startIndex + limit;
      const paginatedTracks = response.slice(startIndex, endIndex);
      
      setSimilarArtistTracks(paginatedTracks);
      setSimilarArtistTotalPages(Math.ceil(response.length / limit));
      setSimilarArtistPage(page);
    } catch (err) {
      console.error('Error fetching similar artist tracks:', err);
      setError('Failed to load similar artist tracks');
      setSimilarArtistTracks([]);
    } finally {
      setSimilarArtistLoading(false);
    }
  };

  const fetchSimilarGenreTracks = async (page = 1) => {
    setSimilarGenreLoading(true);
    setError(null);
    
    try {
      const limit = 20; // Items per page
      const offset = (page - 1) * limit;
      
      // Get similar genre tracks
      const response = await trackService.getSimilarGenreTracks(limit * page);
      
      // Debug: Check image properties
      if (response && response.length > 0) {
        console.log('Similar genre tracks sample:', response[0]);
      }
      
      // Simulate pagination by slicing the results
      const startIndex = offset;
      const endIndex = startIndex + limit;
      const paginatedTracks = response.slice(startIndex, endIndex);
      
      setSimilarGenreTracks(paginatedTracks);
      setSimilarGenreTotalPages(Math.ceil(response.length / limit));
      setSimilarGenrePage(page);
    } catch (err) {
      console.error('Error fetching similar genre tracks:', err);
      setError('Failed to load similar genre tracks');
      setSimilarGenreTracks([]);
    } finally {
      setSimilarGenreLoading(false);
    }
  };

  const fetchFollowingLikedTracks = async (page = 1) => {
    setFollowingLikedLoading(true);
    setError(null);
    
    try {
      const limit = 20; // Items per page
      const offset = (page - 1) * limit;
      
      // Get following liked tracks
      const response = await trackService.getFollowingLikedTracks(limit * page);
      
      // Debug: Check image properties
      if (response && response.length > 0) {
        console.log('Following liked tracks sample:', response[0]);
      }
      
      // Simulate pagination by slicing the results
      const startIndex = offset;
      const endIndex = startIndex + limit;
      const paginatedTracks = response.slice(startIndex, endIndex);
      
      setFollowingLikedTracks(paginatedTracks);
      setFollowingLikedTotalPages(Math.ceil(response.length / limit));
      setFollowingLikedPage(page);
    } catch (err) {
      console.error('Error fetching following liked tracks:', err);
      setError('Failed to load following liked tracks');
      setFollowingLikedTracks([]);
    } finally {
      setFollowingLikedLoading(false);
    }
  };

  useEffect(() => {
    fetchSimilarArtistTracks(1);
    fetchSimilarGenreTracks(1);
    fetchFollowingLikedTracks(1);
  }, []);

  const handleSimilarArtistPageChange = (event, page) => {
    fetchSimilarArtistTracks(page);
  };

  const handleSimilarGenrePageChange = (event, page) => {
    fetchSimilarGenreTracks(page);
  };

  const handleFollowingLikedPageChange = (event, page) => {
    fetchFollowingLikedTracks(page);
  };

  const handleShareItem = (item, type) => {
    setItemToShare(item);
    setShareType(type);
    setShareModalOpen(true);
  };

  // Determine if we should show pagination based on available data
  const shouldShowSimilarArtistPagination = similarArtistTracks.length > 0 && similarArtistTotalPages > 1;
  const shouldShowSimilarGenrePagination = similarGenreTracks.length > 0 && similarGenreTotalPages > 1;
  const shouldShowFollowingLikedPagination = followingLikedTracks.length > 0 && followingLikedTotalPages > 1;

  // Check if any tab has content
  const hasSimilarArtistContent = similarArtistTracks.length > 0;
  const hasSimilarGenreContent = similarGenreTracks.length > 0;
  const hasFollowingLikedContent = followingLikedTracks.length > 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Recommended Music
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Discover new music based on your listening habits and social connections
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="recommendation tabs"
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
            }
          }}
        >
          <Tab 
            label="Similar Artists" 
            {...a11yProps(0)}
            icon={<QueueMusicIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Similar Genres" 
            {...a11yProps(1)}
            icon={<QueueMusicIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Following Liked Tracks" 
            {...a11yProps(2)}
            icon={<PublicIcon />}
            iconPosition="start"
          />
        </Tabs>

        {/* Similar Artists Tab */}
        <TabPanel value={value} index={0}>
          <Typography variant="h6" gutterBottom>
            Tracks from Artists You've Listened To
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Based on artists from tracks you've listened to for more than 30 seconds
          </Typography>
          
          {similarArtistLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : hasSimilarArtistContent ? (
            <>
              <Grid container spacing={2}>
                {similarArtistTracks.map((track) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={track.id}>
                    <TrackCard
                      track={track}
                      onShare={() => handleShareItem(track, 'track')}
                    />
                  </Grid>
                ))}
              </Grid>
              
              {shouldShowSimilarArtistPagination && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination
                    count={similarArtistTotalPages}
                    page={similarArtistPage}
                    onChange={handleSimilarArtistPageChange}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          ) : (
            <Alert severity="info">
              No similar artist tracks found. Start listening to music to get personalized recommendations!
            </Alert>
          )}
        </TabPanel>

        {/* Similar Genres Tab */}
        <TabPanel value={value} index={1}>
          <Typography variant="h6" gutterBottom>
            Tracks from Genres You Enjoy
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Based on genres from tracks you've listened to for more than 30 seconds
          </Typography>
          
          {similarGenreLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : hasSimilarGenreContent ? (
            <>
              <Grid container spacing={2}>
                {similarGenreTracks.map((track) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={track.id}>
                    <TrackCard
                      track={track}
                      onShare={() => handleShareItem(track, 'track')}
                    />
                  </Grid>
                ))}
              </Grid>
              
              {shouldShowSimilarGenrePagination && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination
                    count={similarGenreTotalPages}
                    page={similarGenrePage}
                    onChange={handleSimilarGenrePageChange}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          ) : (
            <Alert severity="info">
              No similar genre tracks found. Start listening to music to get personalized recommendations!
            </Alert>
          )}
        </TabPanel>

        {/* Following Liked Tracks Tab */}
        <TabPanel value={value} index={2}>
          <Typography variant="h6" gutterBottom>
            Tracks Liked by People You Follow
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Discover music through your social network
          </Typography>
          
          {followingLikedLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : hasFollowingLikedContent ? (
            <>
              <Grid container spacing={2}>
                {followingLikedTracks.map((track) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={track.id}>
                    <TrackCard
                      track={track}
                      onShare={() => handleShareItem(track, 'track')}
                    />
                  </Grid>
                ))}
              </Grid>
              
              {shouldShowFollowingLikedPagination && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination
                    count={followingLikedTotalPages}
                    page={followingLikedPage}
                    onChange={handleFollowingLikedPageChange}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          ) : (
            <Alert severity="info">
              No tracks found from people you follow. Follow other users to see their liked tracks here!
            </Alert>
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