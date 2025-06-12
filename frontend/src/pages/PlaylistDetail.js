import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Avatar,
  Button,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  CardMedia
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Favorite,
  FavoriteBorder,
  MoreVert,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Public as PublicIcon,
  LockOutlined as PrivateIcon,
  QueueMusic as QueueMusicIcon,
  Add as AddIcon,
  MusicNote as MusicNoteIcon,
  PlaylistPlay as PlaylistPlayIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { playlistService } from '../services/playlistService';
import { usePlayerContext } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import AddTrackToPlaylistDialog from '../components/Dialogs/AddTrackToPlaylistDialog';
import ShareModal from '../components/ShareModal';

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    currentPlaylist, 
    currentTrack, 
    isPlaying, 
    playPlaylistById, 
    playTrack,
    addToQueue 
  } = usePlayerContext();
  
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addTrackDialogOpen, setAddTrackDialogOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  const [playlistForm, setPlaylistForm] = useState({
    name: '',
    description: '',
    isPublic: true
  });

  // Default image for playlists and tracks
  const defaultCoverImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMUUxRTJFIi8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzE3Mi4wOTEgMTAwIDE5MCA4Mi4wOTE0IDE5MCA2MEMxOTAgMzcuOTA4NiAxNzIuMDkxIDIwIDE1MCAyMEMxMjcuOTA5IDIwIDExMCAzNy45MDg2IDExMCA2MEMxMTAgODIuMDkxNCAxMjcuOTA5IDEwMCAxNTAgMTAwWiIgZmlsbD0iIzFEQjk1NCIvPgo8cGF0aCBkPSJNMjEwIDI4MEgyMDBDMjAwIDI1My40NzggMTg5LjQ2NCAyMjggMTcwLjcxMSAyMDkuMjg5QzE1MS45NTcgMTkwLjUzNiAxMjYuNTIyIDE4MCAxMDAgMThIODBDODAuMDAwMSAyMTkuMzMgOTEuMDcxNCAyNTcuNDg4IDExMS43MTcgMjg5SDgwVjI5MEg5MEg5NS44Mjg5QzEwNi41IDI5My4zMzMgMTE4LjUgMjk1IDEzMCAyOTVIMTcwQzE4MS41IDI5NSAxOTMuNSAyOTMuMzMzIDIwNC4xNzEgMjkwSDIxMFYyODBaIiBmaWxsPSIjMURCOTU0Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjQjNCM0IzIiBmb250LXNpemU9IjE2IiBmb250LWZhbWlseT0iQXJpYWwiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=';

  const fetchPlaylist = async () => {
    try {
      setLoading(true);
      const data = await playlistService.getPlaylistById(id);
      setPlaylist(data);
      setPlaylistForm({
        name: data.name,
        description: data.description || '',
        isPublic: data.isPublic
      });
    } catch (error) {
      console.error('Error fetching playlist:', error);
      setError('Failed to load playlist. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPlaylist();
    }
  }, [id]);

  const handlePlayPlaylist = () => {
    if (playlist) {
      playlistService.incrementPlayCount(playlist.id);
      playPlaylistById(playlist.id);
    }
  };

  const handlePlayTrack = (track) => {
    if (track) {
      playTrack(track);
    }
  };

  const handleLikePlaylist = async () => {
    if (!playlist) return;
    
    try {
      await playlistService.toggleLike(playlist.id);
      // Update playlist to reflect new like status
      fetchPlaylist();
    } catch (error) {
      console.error('Error toggling playlist like:', error);
    }
  };

  const handleEditPlaylist = async () => {
    try {
      await playlistService.updatePlaylist(playlist.id, playlistForm);
      setEditDialogOpen(false);
      fetchPlaylist();
    } catch (error) {
      console.error('Error updating playlist:', error);
    }
  };

  const handleRemoveTrack = async (trackId) => {
    try {
      await playlistService.removeTrackFromPlaylist(playlist.id, trackId);
      fetchPlaylist();
    } catch (error) {
      console.error('Error removing track from playlist:', error);
    }
  };

  const handleAddToQueue = (track) => {
    addToQueue(track);
  };

  const handleSharePlaylist = () => {
    setShareModalOpen(true);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    if (!playlist || !playlist.tracks || playlist.tracks.length === 0) return 0;
    return playlist.tracks.reduce((total, track) => total + (track.duration || 0), 0);
  };

  const formatTotalDuration = () => {
    const totalSeconds = getTotalDuration();
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ color: '#8b5cf6' }} />
      </Container>
    );
  }

  if (error || !playlist) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Typography variant="h5" color="error" sx={{ textAlign: 'center', mt: 8 }}>
          {error || 'Playlist not found'}
        </Typography>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/playlists')}
            sx={{ 
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              }
            }}
          >
            Back to Playlists
          </Button>
        </Box>
      </Container>
    );
  }

  const isCurrentlyPlaying = currentPlaylist && currentPlaylist.id === playlist.id && isPlaying;
  const isOwner = user && playlist.user && user.id === playlist.user.id;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'flex-end' }, gap: 4 }}>
        {/* Playlist Cover */}
        <Box sx={{ 
          width: { xs: '100%', md: 300 }, 
          height: { xs: 300, md: 300 },
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative'
        }}>
          <Box sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: playlist.coverImageUrl 
              ? `url(${playlist.coverImageUrl})` 
              : `url(${defaultCoverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {!playlist.coverImageUrl && !playlist.coverUrl && (
              <QueueMusicIcon sx={{ fontSize: 60, color: 'white', opacity: 0.7 }} />
            )}
          </Box>
        </Box>
        
        {/* Playlist Info */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="overline" sx={{ color: '#b3b3b3', letterSpacing: 1 }}>
              PLAYLIST
            </Typography>
            {playlist.isPublic ? (
              <Chip 
                icon={<PublicIcon sx={{ fontSize: 14 }} />} 
                label="Public" 
                size="small"
                sx={{ 
                  ml: 2,
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontSize: '0.7rem',
                  height: 24
                }}
              />
            ) : (
              <Chip 
                icon={<PrivateIcon sx={{ fontSize: 14 }} />} 
                label="Private" 
                size="small"
                sx={{ 
                  ml: 2,
                  background: 'rgba(156, 163, 175, 0.2)',
                  color: '#9ca3af',
                  border: '1px solid rgba(156, 163, 175, 0.3)',
                  fontSize: '0.7rem',
                  height: 24
                }}
              />
            )}
          </Box>
          
          <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
            {playlist.name}
          </Typography>
          
          {playlist.description && (
            <Typography variant="body1" sx={{ color: '#b3b3b3', mb: 2, maxWidth: 700 }}>
              {playlist.description}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar 
              src={playlist.user?.avatarUrl} 
              alt={playlist.user?.username}
              sx={{ mr: 1, width: 32, height: 32 }}
            />
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: 'white', 
                fontWeight: 500,
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' }
              }}
              onClick={() => navigate(`/profile/${playlist.user?.id}`)}
            >
              {playlist.user?.username}
            </Typography>
            <Box sx={{ mx: 1, color: '#b3b3b3' }}>•</Box>
            <Typography variant="subtitle1" sx={{ color: '#b3b3b3' }}>
              {playlist.tracks?.length || 0} songs, {formatTotalDuration()}
            </Typography>
            <Box sx={{ mx: 1, color: '#b3b3b3' }}>•</Box>
            <Typography variant="subtitle1" sx={{ color: '#b3b3b3' }}>
              {playlist.playCount || 0} plays
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button 
              variant="contained" 
              startIcon={isCurrentlyPlaying ? <Pause /> : <PlayArrow />}
              onClick={handlePlayPlaylist}
              sx={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                px: 3,
                py: 1,
                borderRadius: 5,
                textTransform: 'none',
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                }
              }}
            >
              {isCurrentlyPlaying ? 'Pause' : 'Play'}
            </Button>
            
            <IconButton 
              onClick={handleLikePlaylist}
              sx={{ 
                color: playlist.isLiked ? '#ec4899' : 'white',
                '&:hover': { 
                  bgcolor: 'rgba(236, 72, 153, 0.1)'
                }
              }}
            >
              {playlist.isLiked ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            
            <IconButton 
              onClick={handleSharePlaylist}
              sx={{ 
                color: 'white',
                '&:hover': { 
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <ShareIcon />
            </IconButton>
            
            {isOwner && (
              <>
                <IconButton 
                  onClick={() => setEditDialogOpen(true)}
                  sx={{ 
                    color: '#8b5cf6',
                    '&:hover': { 
                      bgcolor: 'rgba(139, 92, 246, 0.1)'
                    }
                  }}
                >
                  <EditIcon />
                </IconButton>
                
                <IconButton 
                  onClick={() => setAddTrackDialogOpen(true)}
                  sx={{ 
                    color: '#10b981',
                    '&:hover': { 
                      bgcolor: 'rgba(16, 185, 129, 0.1)'
                    }
                  }}
                >
                  <AddIcon />
                </IconButton>
              </>
            )}
          </Box>
        </Box>
      </Box>
      
      <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />
      
      {/* Tracks Section */}
      {playlist.tracks?.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <MusicNoteIcon sx={{ fontSize: 60, color: '#6b7280', mb: 2 }} />
          <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>
            No tracks in this playlist yet
          </Typography>
          {isOwner && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddTrackDialogOpen(true)}
              sx={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'bold',
                py: 1,
                px: 3,
                mt: 2,
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                }
              }}
            >
              Add Tracks
            </Button>
          )}
        </Box>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
              Tracks
            </Typography>
            {playlist.tracks?.length > 0 && (
              <Button
                variant="text"
                startIcon={<PlaylistPlayIcon />}
                onClick={handlePlayPlaylist}
                sx={{
                  color: '#8b5cf6',
                  '&:hover': {
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  },
                }}
              >
                Play All
              </Button>
            )}
          </Box>
          
          <TableContainer component={Paper} sx={{ 
            bgcolor: 'transparent', 
            boxShadow: 'none',
          }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell width={50} sx={{ color: '#b3b3b3', borderColor: 'rgba(255,255,255,0.1)', px: 1 }}>#</TableCell>
                  <TableCell sx={{ color: '#b3b3b3', borderColor: 'rgba(255,255,255,0.1)' }}>TITLE</TableCell>
                  <TableCell sx={{ color: '#b3b3b3', borderColor: 'rgba(255,255,255,0.1)' }}>ARTIST</TableCell>
                  <TableCell sx={{ color: '#b3b3b3', borderColor: 'rgba(255,255,255,0.1)' }}>GENRE</TableCell>
                  <TableCell sx={{ color: '#b3b3b3', borderColor: 'rgba(255,255,255,0.1)', display: { xs: 'none', md: 'table-cell' } }}>PLAYS</TableCell>
                  <TableCell align="right" sx={{ color: '#b3b3b3', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <AccessTimeIcon fontSize="small" />
                  </TableCell>
                  <TableCell width={80} sx={{ color: '#b3b3b3', borderColor: 'rgba(255,255,255,0.1)' }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {playlist.tracks.map((track, index) => {
                  const isTrackPlaying = currentTrack && currentTrack.id === track.id && isPlaying;
                  
                  return (
                    <TableRow 
                      key={track.id}
                      hover
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { 
                          backgroundColor: 'rgba(255,255,255,0.05)' 
                        },
                        ...(isTrackPlaying && {
                          backgroundColor: 'rgba(139, 92, 246, 0.1) !important'
                        })
                      }}
                      onClick={() => handlePlayTrack(track)}
                    >
                      <TableCell sx={{ color: isTrackPlaying ? '#8b5cf6' : '#b3b3b3', borderColor: 'rgba(255,255,255,0.1)', px: 1 }}>
                        {isTrackPlaying ? (
                          <PlayArrow sx={{ fontSize: 18 }} />
                        ) : (
                          index + 1
                        )}
                      </TableCell>
                      <TableCell sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            variant="rounded"
                            src={track.imageUrl || track.coverImageUrl || defaultCoverImage} 
                            alt={track.title}
                            onError={(e) => {
                              e.target.onerror = null; 
                              e.target.src = defaultCoverImage;
                            }}
                            sx={{ width: 40, height: 40, mr: 2 }}
                          >
                            <MusicNoteIcon />
                          </Avatar>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              color: isTrackPlaying ? '#8b5cf6' : 'white',
                              fontWeight: isTrackPlaying ? 'bold' : 'normal',
                              cursor: 'pointer',
                              '&:hover': {
                                textDecoration: 'underline'
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/track/${track.id}`);
                            }}
                          >
                            {track.title}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#b3b3b3', borderColor: 'rgba(255,255,255,0.1)' }}>
                        {track.artist}
                      </TableCell>
                      <TableCell sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Chip 
                          label={track.genre} 
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(139, 92, 246, 0.2)',
                            color: '#8b5cf6',
                            fontSize: '0.7rem'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#b3b3b3', borderColor: 'rgba(255,255,255,0.1)', display: { xs: 'none', md: 'table-cell' } }}>
                        {track.playCount || 0}
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#b3b3b3', borderColor: 'rgba(255,255,255,0.1)' }}>
                        {formatDuration(track.duration)}
                      </TableCell>
                      <TableCell sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          {isOwner && (
                            <IconButton 
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveTrack(track.id);
                              }}
                              sx={{ color: '#ef4444' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToQueue(track);
                            }}
                            sx={{ color: 'white' }}
                          >
                            <PlaylistPlayIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      
      {/* Edit Playlist Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(145deg, #1e1e2e, #2a2a40)',
            color: 'white',
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', fontWeight: 'bold' }}>
          Edit Playlist
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Playlist Name"
            value={playlistForm.name}
            onChange={(e) => setPlaylistForm({ ...playlistForm, name: e.target.value })}
            margin="normal"
            variant="outlined"
            required
            InputLabelProps={{ style: { color: '#b3b3b3' } }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description (Optional)"
            value={playlistForm.description}
            onChange={(e) => setPlaylistForm({ ...playlistForm, description: e.target.value })}
            margin="normal"
            variant="outlined"
            multiline
            rows={3}
            InputLabelProps={{ style: { color: '#b3b3b3' } }}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={playlistForm.isPublic}
                onChange={(e) => setPlaylistForm({ ...playlistForm, isPublic: e.target.checked })}
                color="primary"
              />
            }
            label="Make playlist public"
            sx={{ color: '#b3b3b3' }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            sx={{ color: '#b3b3b3' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditPlaylist}
            variant="contained"
            disabled={!playlistForm.name.trim()}
            sx={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Track to Playlist Dialog */}
      {playlist && (
        <AddTrackToPlaylistDialog
          open={addTrackDialogOpen}
          onClose={() => setAddTrackDialogOpen(false)}
          playlist={playlist}
          onTracksAdded={fetchPlaylist}
        />
      )}
      
      {/* Share Modal */}
      <ShareModal 
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        item={playlist}
        type="playlist"
      />
    </Container>
  );
};

export default PlaylistDetail; 