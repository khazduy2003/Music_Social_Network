import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Button, 
  IconButton, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  Fab,
  Chip,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  QueueMusic as QueueMusicIcon,
  Public as PublicIcon,
  Lock as PrivateIcon,
  MusicNote as MusicNoteIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { playlistService } from '../services/playlistService';
import { usePlayerContext } from '../contexts/PlayerContext';
import AddTrackToPlaylistDialog from '../components/Dialogs/AddTrackToPlaylistDialog';
import { useNavigate } from 'react-router-dom';
import ShareModal from '../components/ShareModal';
import { toast } from 'react-hot-toast';

const Playlists = () => {
  const { user, isAuthenticated } = useAuth();
  const { playPlaylistById, currentPlaylist, isPlaying, pauseTrack, resumeTrack } = usePlayerContext();
  
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addTrackDialogOpen, setAddTrackDialogOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuPlaylist, setMenuPlaylist] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [playlistToShare, setPlaylistToShare] = useState(null);
  
  // Form states
  const [playlistForm, setPlaylistForm] = useState({
    name: '',
    description: '',
    isPublic: true
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserPlaylists();
    }
  }, [isAuthenticated, user]);

  const fetchUserPlaylists = async () => {
    try {
      setLoading(true);
      const userPlaylists = await playlistService.getUserPlaylists(user.username);
      console.log('Fetched user playlists:', userPlaylists);
      setPlaylists(userPlaylists);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    try {
      const playlistData = {
        ...playlistForm,
        userId: user.id
      };
      
      await playlistService.createPlaylist(playlistData);
      setCreateDialogOpen(false);
      setPlaylistForm({ name: '', description: '', isPublic: true });
      
      // Hiển thị thông báo thành công
      toast.success(`Playlist created successfully${playlistForm.isPublic ? ' and shared publicly' : ''}`);
      
      // Refresh the list to show the new playlist
      await fetchUserPlaylists();
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast.error('Failed to create playlist');
    }
  };

  const handleEditPlaylist = async () => {
    try {
      // Đảm bảo giữ nguyên trạng thái public/private của playlist
      const playlistUpdateData = {
        name: playlistForm.name,
        description: playlistForm.description,
        isPublic: selectedPlaylist.isPublic // Sử dụng giá trị isPublic ban đầu từ selectedPlaylist
      };
      
      console.log('Before update, playlist data:', { 
        id: selectedPlaylist.id, 
        updateData: playlistUpdateData,
        originalIsPublic: selectedPlaylist.isPublic 
      });
      
      const updatedPlaylist = await playlistService.updatePlaylist(selectedPlaylist.id, playlistUpdateData);
      console.log('After update, response:', updatedPlaylist);
      
      setEditDialogOpen(false);
      setSelectedPlaylist(null);
      setPlaylistForm({ name: '', description: '', isPublic: true });
      
      // Hiển thị thông báo thành công
      toast.success('Playlist updated successfully');
      
      // Refresh the list to show the updated playlist status
      await fetchUserPlaylists();
    } catch (error) {
      console.error('Error updating playlist:', error);
      toast.error('Failed to update playlist');
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    try {
      await playlistService.deletePlaylist(playlistId);
      
      // Hiển thị thông báo thành công
      toast.success('Playlist deleted successfully');
      
      // Refresh the list
      await fetchUserPlaylists();
      handleCloseMenu();
    } catch (error) {
      console.error('Error deleting playlist:', error);
      toast.error('Failed to delete playlist');
    }
  };

  const handlePlayPlaylist = async (playlist) => {
    if (currentPlaylist && currentPlaylist.id === playlist.id) {
      if (isPlaying) {
        pauseTrack();
      } else {
        resumeTrack();
      }
    } else {
      // Sử dụng playPlaylistById để load tracks từ API vào queue
      await playPlaylistById(playlist.id);
    }
  };

  const handleMenuOpen = (event, playlist) => {
    setMenuAnchor(event.currentTarget);
    setMenuPlaylist(playlist);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setMenuPlaylist(null);
  };

  const handleEditClick = () => {
    setSelectedPlaylist(menuPlaylist);
    setPlaylistForm({
      name: menuPlaylist.name,
      description: menuPlaylist.description || '',
      isPublic: menuPlaylist.isPublic
    });
    setEditDialogOpen(true);
    handleCloseMenu();
  };

  const handleAddTrackClick = () => {
    setSelectedPlaylist(menuPlaylist);
    setAddTrackDialogOpen(true);
    handleCloseMenu();
  };

  const handleSharePlaylist = () => {
    setPlaylistToShare(menuPlaylist);
    setShareModalOpen(true);
    handleCloseMenu();
  };

  const formatDuration = (totalSeconds) => {
    if (!totalSeconds) return '0 min';
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  const renderPlaylistCard = (playlist) => {
    const isCurrentlyPlaying = currentPlaylist && currentPlaylist.id === playlist.id && isPlaying;
    const totalDuration = playlist.tracks?.reduce((total, track) => total + (track.duration || 0), 0) || 0;
    
    console.log(`Rendering playlist: ${playlist.name}, isPublic:`, playlist.isPublic);
    
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
            minWidth: '280px',
            
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
              height="200"
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
              {isCurrentlyPlaying ? <PauseIcon sx={{ fontSize: 28 }} /> : <PlayIcon sx={{ fontSize: 28 }} />}
            </IconButton>

            <IconButton
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                width: 36,
                height: 36,
                '&:hover': { 
                  background: 'rgba(0,0,0,0.9)',
                  transform: 'scale(1.1)'
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOpen(e, playlist);
              }}
            >
              <MoreVertIcon sx={{ fontSize: 20 }} />
            </IconButton>

            <Box sx={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              display: 'flex',
              gap: 1
            }}>
              {playlist.isPublic ? (
                <Chip 
                  icon={<PublicIcon sx={{ fontSize: 14 }} />} 
                  label="Public" 
                  size="small"
                  sx={{ 
                    background: 'rgba(16, 185, 129, 0.8)',
                    color: 'white',
                    border: '1px solid rgba(16, 185, 129, 0.9)',
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
                    background: 'rgba(156, 163, 175, 0.8)',
                    color: 'white',
                    border: '1px solid rgba(156, 163, 175, 0.9)',
                    fontSize: '0.7rem',
                    height: 24
                  }}
                />
              )}
            </Box>
          </Box>
          
          <CardContent sx={{ flexGrow: 1, pb: 2, px: 2 }}>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                color: 'white',
                fontWeight: 'bold',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                mb: 1,
                fontSize: '1.1rem'
              }}
            >
              {playlist.name}
            </Typography>
            
            {playlist.description && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#b3b3b3',
                  mb: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.4
                }}
              >
                {playlist.description}
              </Typography>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#8b5cf6', fontWeight: 500 }}>
                {playlist.tracks?.length || 0} tracks
              </Typography>
              <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                {formatDuration(totalDuration)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar 
                  src={playlist.user?.avatarUrl} 
                  alt={playlist.user?.username}
                  sx={{ width: 24, height: 24 }}
                />
                <Typography variant="caption" sx={{ color: '#b3b3b3' }}>
                  {playlist.user?.username}
                </Typography>
              </Box>
              
              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                {playlist.playCount || 0} plays
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <QueueMusicIcon sx={{ fontSize: 60, color: '#8b5cf6', mb: 2 }} />
          <Typography variant="h4" sx={{ color: 'white', mb: 2 }}>
            Please log in to view your playlists
          </Typography>
          <Typography variant="body1" sx={{ color: '#b3b3b3', maxWidth: 600, mx: 'auto' }}>
            Sign in to create and manage your music collections,
            organize your favorite tracks, and share your musical taste.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
            My Playlists
          </Typography>
          <Typography variant="h6" sx={{ color: '#b3b3b3' }}>
            Create and manage your music collections
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 'bold',
            py: 1.5,
            px: 3,
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              boxShadow: '0 6px 20px rgba(139, 92, 246, 0.6)',
            }
          }}
        >
          Create Playlist
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress sx={{ color: '#8b5cf6' }} />
        </Box>
      ) : playlists.length > 0 ? (
        <Grid container spacing={3}>
          {playlists.map(renderPlaylistCard)}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <QueueMusicIcon sx={{ fontSize: 80, color: '#6b7280', mb: 3 }} />
          <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>
            No playlists yet
          </Typography>
          <Typography variant="body1" sx={{ color: '#b3b3b3', mb: 4, maxWidth: 500, mx: 'auto' }}>
            Create your first playlist to start organizing your favorite tracks.
            Build the perfect soundtrack for every mood and moment!
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold',
              py: 1.5,
              px: 4,
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                boxShadow: '0 6px 20px rgba(139, 92, 246, 0.6)',
              }
            }}
          >
            Create Your First Playlist
          </Button>
        </Box>
      )}

      {/* Menu for playlist actions */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        sx={{
          '& .MuiPaper-root': {
            background: 'rgba(20, 20, 30, 0.95)',
            backdropFilter: 'blur(20px)',
            color: 'white',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: 2
          }
        }}
      >
        <MenuItem onClick={handleEditClick}>
          <ListItemIcon>
            <EditIcon sx={{ color: '#8b5cf6' }} />
          </ListItemIcon>
          Edit Playlist
        </MenuItem>
        <MenuItem onClick={handleAddTrackClick}>
          <ListItemIcon>
            <MusicNoteIcon sx={{ color: '#10b981' }} />
          </ListItemIcon>
          Add Tracks
        </MenuItem>
        <MenuItem onClick={handleSharePlaylist}>
          <ListItemIcon>
            <ShareIcon sx={{ color: '#3b82f6' }} />
          </ListItemIcon>
          Share Playlist
        </MenuItem>
        <MenuItem onClick={() => handleDeletePlaylist(menuPlaylist?.id)}>
          <ListItemIcon>
            <DeleteIcon sx={{ color: '#ef4444' }} />
          </ListItemIcon>
          Delete Playlist
        </MenuItem>
      </Menu>

      {/* Create Playlist Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
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
          Create New Playlist
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
            onClick={() => setCreateDialogOpen(false)}
            sx={{ color: '#b3b3b3' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreatePlaylist}
            variant="contained"
            disabled={!playlistForm.name.trim()}
            sx={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              }
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

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
          <Box sx={{ mt: 1, mb: 1 }}>
            <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
              Status: {playlistForm.isPublic ? (
                <Chip 
                  icon={<PublicIcon sx={{ fontSize: 14 }} />} 
                  label="Public" 
                  size="small"
                  sx={{ 
                    background: 'rgba(16, 185, 129, 0.8)',
                    color: 'white',
                    fontSize: '0.7rem',
                    ml: 1
                  }}
                />
              ) : (
                <Chip 
                  icon={<PrivateIcon sx={{ fontSize: 14 }} />} 
                  label="Private" 
                  size="small"
                  sx={{ 
                    background: 'rgba(156, 163, 175, 0.8)',
                    color: 'white',
                    fontSize: '0.7rem',
                    ml: 1
                  }}
                />
              )}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: '#6b7280', mt: 1 }}>
              The public/private status can only be set when creating a playlist.
            </Typography>
          </Box>
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
      {selectedPlaylist && (
        <AddTrackToPlaylistDialog
          open={addTrackDialogOpen}
          onClose={() => setAddTrackDialogOpen(false)}
          playlist={selectedPlaylist}
          onTracksAdded={fetchUserPlaylists}
        />
      )}

      {/* Share Modal */}
      <ShareModal 
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        item={playlistToShare}
        type="playlist"
      />
    </Container>
  );
};

export default Playlists; 