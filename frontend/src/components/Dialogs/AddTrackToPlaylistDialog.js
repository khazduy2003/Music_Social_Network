import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Checkbox,
  Box,
  Typography,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  MusicNote as MusicNoteIcon
} from '@mui/icons-material';
import { trackService } from '../../services/trackService';
import { playlistService } from '../../services/playlistService';
import { useNavigate } from 'react-router-dom';

const AddTrackToPlaylistDialog = ({ open, onClose, playlist, onTracksAdded }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingTracks, setAddingTracks] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      fetchAllTracks();
    }
  }, [open]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim()) {
        searchTracks(searchQuery);
      } else {
        fetchAllTracks();
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const fetchAllTracks = async () => {
    try {
      setLoading(true);
      
      // Gọi đồng thời 3 API để lấy tất cả tracks
      const [topTracksResponse, mostPlayedResponse, allTracksResponse] = await Promise.all([
        trackService.getTopTracks(),
        trackService.getMostPlayedTracks(),
        trackService.getAllTracksForDiscover()
      ]);

      // Gộp 3 danh sách
      const allTracksList = [
        ...(topTracksResponse || []),
        ...(mostPlayedResponse || []),
        ...(allTracksResponse || [])
      ];

      // Loại bỏ duplicate dựa trên ID
      const uniqueTracks = allTracksList.filter((track, index, self) => 
        index === self.findIndex(t => t.id === track.id)
      );

      // Sắp xếp theo title từ A-Z
      const sortedTracks = uniqueTracks.sort((a, b) => 
        a.title.toLowerCase().localeCompare(b.title.toLowerCase())
      );

      // Filter out tracks that are already in the playlist
      const playlistTrackIds = playlist.tracks?.map(track => track.id) || [];
      const availableTracks = sortedTracks.filter(track => !playlistTrackIds.includes(track.id));
      
      setTracks(availableTracks);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      // Fallback to just getAllTracksForDiscover if there's an error
      try {
        const fallbackResponse = await trackService.getAllTracksForDiscover();
        const playlistTrackIds = playlist.tracks?.map(track => track.id) || [];
        const availableTracks = (fallbackResponse || []).filter(track => !playlistTrackIds.includes(track.id));
        setTracks(availableTracks);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        setTracks([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const searchTracks = async (query) => {
    try {
      setLoading(true);
      const searchResults = await trackService.searchTracks(query);
      // Filter out tracks that are already in the playlist
      const playlistTrackIds = playlist.tracks?.map(track => track.id) || [];
      const availableTracks = searchResults.filter(track => !playlistTrackIds.includes(track.id));
      setTracks(availableTracks);
    } catch (error) {
      console.error('Error searching tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackToggle = (track) => {
    setSelectedTracks(prev => {
      if (prev.find(t => t.id === track.id)) {
        return prev.filter(t => t.id !== track.id);
      } else {
        return [...prev, track];
      }
    });
  };

  const handleAddTracks = async () => {
    if (selectedTracks.length === 0) return;

    try {
      setAddingTracks(true);
      
      // Add each selected track to the playlist
      for (const track of selectedTracks) {
        await playlistService.addTrackToPlaylist(playlist.id, track.id);
      }

      // Clear selections and close dialog
      setSelectedTracks([]);
      onTracksAdded(); // Refresh parent component
      onClose();
    } catch (error) {
      console.error('Error adding tracks to playlist:', error);
    } finally {
      setAddingTracks(false);
    }
  };

  const handleClose = () => {
    setSelectedTracks([]);
    setSearchQuery('');
    onClose();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(145deg, #1e1e2e, #2a2a40)',
          color: 'white',
          borderRadius: 3,
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle sx={{ color: 'white', fontWeight: 'bold', pb: 1, flexShrink: 0 }}>
        Add Tracks to "{playlist.name}"
      </DialogTitle>
      
      <DialogContent sx={{ px: 3, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Search Bar */}
        <Box sx={{ 
          flexShrink: 0,
          pb: 2 
        }}>
          <TextField
            fullWidth
            placeholder="Search for tracks to add..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: '#b3b3b3', mr: 1 }} />
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 2,
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(139, 92, 246, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#8b5cf6',
                },
              },
              '& .MuiInputBase-input': {
                color: 'white',
                '&::placeholder': {
                  color: '#b3b3b3',
                  opacity: 1
                }
              }
            }}
          />
          
          {selectedTracks.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: '#8b5cf6' }}>
                {selectedTracks.length} track{selectedTracks.length !== 1 ? 's' : ''} selected
              </Typography>
              <Button
                size="small"
                onClick={() => setSelectedTracks([])}
                sx={{ color: '#b3b3b3', minWidth: 'auto', p: 0.5 }}
              >
                Clear All
              </Button>
            </Box>
          )}
        </Box>

        {/* Track List */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#8b5cf6' }} />
            </Box>
          ) : tracks.length > 0 ? (
            <List sx={{ p: 0 }}>
              {tracks.map((track, index) => {
                const isSelected = selectedTracks.find(t => t.id === track.id);
                
                return (
                  <React.Fragment key={track.id}>
                    <ListItem
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                        border: isSelected ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'rgba(139, 92, 246, 0.1)',
                          transform: 'translateX(4px)'
                        }
                      }}
                      onClick={() => handleTrackToggle(track)}
                    >
                      <Checkbox
                        checked={!!isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleTrackToggle(track);
                        }}
                        sx={{
                          color: '#8b5cf6',
                          '&.Mui-checked': {
                            color: '#8b5cf6',
                          },
                          mr: 1
                        }}
                      />
                      
                      <ListItemAvatar>
                        <Avatar
                          src={track.imageUrl}
                          alt={track.title}
                          sx={{ 
                            width: 50, 
                            height: 50,
                            borderRadius: 1
                          }}
                        >
                          <MusicNoteIcon />
                        </Avatar>
                      </ListItemAvatar>
                      
                      <ListItemText
                        primary={
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              color: 'white', 
                              fontWeight: 500,
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                            }}
                            onClick={() => handleTrackToggle(track)}
                          >
                            {track.title}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                            <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                              {track.artist}
                            </Typography>
                            <Chip 
                              label={track.genre} 
                              size="small"
                              sx={{ 
                                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                                color: '#8b5cf6',
                                fontSize: '0.7rem'
                              }}
                            />
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                              {formatDuration(track.duration)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    
                    {index < tracks.length - 1 && (
                      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                    )}
                  </React.Fragment>
                );
              })}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <MusicNoteIcon sx={{ fontSize: 48, color: '#6b7280', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#b3b3b3', mb: 1 }}>
                {searchQuery ? 'No tracks found' : 'No available tracks'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                {searchQuery 
                  ? 'Try a different search term' 
                  : 'All tracks are already in this playlist'
                }
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1, flexShrink: 0 }}>
        <Button 
          onClick={handleClose}
          sx={{ color: '#b3b3b3' }}
          disabled={addingTracks}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleAddTracks}
          variant="contained"
          disabled={selectedTracks.length === 0 || addingTracks}
          sx={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            },
            '&:disabled': {
              background: 'rgba(139, 92, 246, 0.3)',
            }
          }}
        >
          {addingTracks ? (
            <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
          ) : null}
          Add {selectedTracks.length > 0 ? `${selectedTracks.length} ` : ''}Track{selectedTracks.length !== 1 ? 's' : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTrackToPlaylistDialog; 