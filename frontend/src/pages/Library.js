import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Fab, 
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import { Add, CloudUpload, MusicNote, PlaylistPlay } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { usePlayerContext } from '../contexts/PlayerContext';
import UploadTrackDialog from '../components/Dialogs/UploadTrackDialog';
import TrackCard from '../components/TrackCard';
import { trackService } from '../services/trackService';
import toast from 'react-hot-toast';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`library-tabpanel-${index}`}
      aria-labelledby={`library-tab-${index}`}
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

const Library = () => {
  const { user, isAuthenticated } = useAuth();
  const { playAllTracks } = usePlayerContext();
  
  const [tabValue, setTabValue] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  // My Tracks state
  const [myTracks, setMyTracks] = useState([]);
  const [myTracksLoading, setMyTracksLoading] = useState(false);
  const [myTracksError, setMyTracksError] = useState(null);
  
  // Liked Tracks state
  const [likedTracks, setLikedTracks] = useState([]);
  const [likedTracksLoading, setLikedTracksLoading] = useState(false);
  const [likedTracksError, setLikedTracksError] = useState(null);

  // Fetch user's uploaded tracks
  const fetchMyTracks = async () => {
    if (!isAuthenticated || !user) return;
    
    setMyTracksLoading(true);
    setMyTracksError(null);
    
    try {
      const response = await trackService.getTracksByUser(user.username);
      setMyTracks(response.content || []);
    } catch (err) {
      console.error('Error fetching my tracks:', err);
      setMyTracksError('Failed to load your tracks');
      setMyTracks([]);
    } finally {
      setMyTracksLoading(false);
    }
  };

  // Fetch liked tracks
  const fetchLikedTracks = async () => {
    if (!isAuthenticated || !user) return;
    
    setLikedTracksLoading(true);
    setLikedTracksError(null);
    
    try {
      const response = await trackService.getLikedTracks(user.id);
      setLikedTracks(response || []);
    } catch (err) {
      console.error('Error fetching liked tracks:', err);
      setLikedTracksError('Failed to load liked tracks');
      setLikedTracks([]);
    } finally {
      setLikedTracksLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyTracks();
      fetchLikedTracks();
    }
  }, [isAuthenticated, user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleUploadSuccess = (newTrack) => {
    // Add new track to the beginning of the list
    setMyTracks(prev => [newTrack, ...prev]);
    toast.success(`"${newTrack.title}" uploaded successfully!`);
  };

  const handlePlayAllMyTracks = () => {
    if (myTracks && myTracks.length > 0) {
      playAllTracks(myTracks);
      toast.success('Playing your tracks');
    } else {
      toast.error('No tracks to play');
    }
  };

  const handlePlayAllLikedTracks = () => {
    if (likedTracks && likedTracks.length > 0) {
      playAllTracks(likedTracks);
      toast.success('Playing liked tracks');
    } else {
      toast.error('No liked tracks to play');
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h4" sx={{ color: '#1db954', mb: 2 }}>
            🔒 Login Required
          </Typography>
          <Typography variant="body1" sx={{ color: '#b3b3b3', maxWidth: 600, mx: 'auto' }}>
            Please log in to access your personal music library and upload your tracks.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
          Your Library 📚
        </Typography>
        <Typography variant="h6" sx={{ color: '#b3b3b3' }}>
          Access your saved music and upload your own tracks
        </Typography>
      </Box>

      <Paper sx={{ 
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 2,
        mb: 3
      }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.7)',
                '&.Mui-selected': {
                  color: '#1db954',
                }
              }
            }}
          >
            <Tab 
              label={`My Tracks ${myTracks.length > 0 ? `(${myTracks.length})` : ''}`} 
              icon={<MusicNote />}
              iconPosition="start"
            />
            <Tab 
              label={`Liked Songs ${likedTracks.length > 0 ? `(${likedTracks.length})` : ''}`} 
              icon={<PlaylistPlay />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* My Tracks Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
              🎵 My Uploaded Tracks
            </Typography>
            <Box>
              {myTracks.length > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<PlaylistPlay />}
                  onClick={handlePlayAllMyTracks}
                  sx={{
                    mr: 2,
                    color: '#1db954',
                    borderColor: '#1db954',
                    '&:hover': { 
                      backgroundColor: 'rgba(29, 185, 84, 0.1)',
                      borderColor: '#1ed760'
                    }
                  }}
                >
                  Play All
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={() => setUploadDialogOpen(true)}
                sx={{
                  bgcolor: '#1db954',
                  '&:hover': { bgcolor: '#1ed760' }
                }}
              >
                Upload Track
              </Button>
            </Box>
          </Box>

          {myTracksError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {myTracksError}
            </Alert>
          )}

          {myTracksLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress sx={{ color: '#1db954' }} />
            </Box>
          ) : myTracks.length > 0 ? (
            <Grid container spacing={3}>
              {myTracks.map((track) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={track.id}>
                  <TrackCard track={track} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                🎤 No tracks uploaded yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Share your music with the world! Upload your first track to get started.
              </Typography>
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={() => setUploadDialogOpen(true)}
                sx={{
                  bgcolor: '#1db954',
                  '&:hover': { bgcolor: '#1ed760' }
                }}
              >
                Upload Your First Track
              </Button>
            </Box>
          )}
        </TabPanel>

        {/* Liked Tracks Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
              💖 Liked Songs
            </Typography>
            {likedTracks.length > 0 && (
              <Button
                variant="contained"
                startIcon={<PlaylistPlay />}
                onClick={handlePlayAllLikedTracks}
                sx={{
                  bgcolor: '#1db954',
                  '&:hover': { bgcolor: '#1ed760' }
                }}
              >
                Play All
              </Button>
            )}
          </Box>

          {likedTracksError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {likedTracksError}
            </Alert>
          )}

          {likedTracksLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress sx={{ color: '#1db954' }} />
            </Box>
          ) : likedTracks.length > 0 ? (
            <Grid container spacing={3}>
              {likedTracks.map((track) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={track.id}>
                  <TrackCard track={track} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                💔 No liked songs yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start exploring music and like songs to see them here!
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Paper>

      {/* Floating Action Button for Quick Upload */}
      <Fab
        color="primary"
        aria-label="upload"
        onClick={() => setUploadDialogOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 100,
          right: 32,
          bgcolor: '#1db954',
          '&:hover': { bgcolor: '#1ed760' }
        }}
      >
        <Add />
      </Fab>

      {/* Upload Dialog */}
      <UploadTrackDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUpload={handleUploadSuccess}
      />
    </Container>
  );
};

export default Library; 