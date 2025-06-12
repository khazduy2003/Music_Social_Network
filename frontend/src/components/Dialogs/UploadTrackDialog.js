import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Avatar,
  CircularProgress,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Close,
  CloudUpload,
  MusicNote,
  Image as ImageIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { trackService } from '../../services/trackService';
import toast from 'react-hot-toast';

const UploadTrackDialog = ({ open, onClose, onUpload }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form data
  const [trackData, setTrackData] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
    description: ''
  });
  
  // File states
  const [audioFile, setAudioFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Predefined genres
  const genres = [
    'Pop', 'Rock', 'Hip Hop', 'R&B', 'Country', 'Electronic', 'Jazz', 
    'Classical', 'Folk', 'Blues', 'Reggae', 'Metal', 'Punk', 'Indie', 
    'Alternative', 'Dance', 'House', 'Techno', 'Dubstep', 'Other'
  ];

  const handleInputChange = (field, value) => {
    setTrackData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAudioFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'];
      if (!validAudioTypes.includes(file.type)) {
        toast.error('Please select a valid audio file (MP3, WAV, OGG, M4A)');
        return;
      }

      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Audio file size must be less than 50MB');
        return;
      }

      setAudioFile(file);
      
      // Create audio preview
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      setAudioPreview(audio);

      // Auto-fill title if empty
      if (!trackData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        setTrackData(prev => ({ ...prev, title: fileName }));
      }
    }
  };

  const handleImageFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, WebP)');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image file size must be less than 5MB');
        return;
      }

      setCoverImage(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!trackData.title.trim()) {
      toast.error('Please enter a track title');
      return;
    }

    if (!audioFile) {
      toast.error('Please select an audio file');
      return;
    }

    if (!trackData.artist.trim()) {
      // Auto-fill artist with current user's name
      setTrackData(prev => ({ ...prev, artist: user.name || user.username }));
    }

    setLoading(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add track data
      formData.append('title', trackData.title.trim());
      formData.append('artist', trackData.artist.trim() || user.name || user.username);
      formData.append('album', trackData.album.trim());
      formData.append('genre', trackData.genre || 'Other');
      formData.append('description', trackData.description.trim());
      
      // Add files
      formData.append('audioFile', audioFile);
      if (coverImage) {
        formData.append('coverImage', coverImage);
      }
      
      // Add userId
      formData.append('userId', user.id);

      // Call upload API using trackService
      const result = await trackService.uploadTrack(formData);
      
      toast.success('Track uploaded successfully!');
      
      // Reset form
      resetForm();
      
      // Notify parent component
      if (onUpload) {
        onUpload(result);
      }
      
      onClose();
      
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload track. Please try again.');
      toast.error('Failed to upload track');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTrackData({
      title: '',
      artist: '',
      album: '',
      genre: '',
      description: ''
    });
    setAudioFile(null);
    setCoverImage(null);
    setAudioPreview(null);
    setImagePreview(null);
    setError(null);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
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
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        color: 'white',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MusicNote sx={{ mr: 1, color: '#1db954' }} />
          <Typography variant="h6">Upload Your Music</Typography>
        </Box>
        <IconButton 
          onClick={handleClose} 
          disabled={loading}
          sx={{ color: 'rgba(255,255,255,0.7)' }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Audio File Upload */}
          <Grid item xs={12}>
            <Box sx={{ 
              border: '2px dashed rgba(255,255,255,0.3)',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              backgroundColor: audioFile ? 'rgba(29, 185, 84, 0.1)' : 'rgba(255,255,255,0.05)',
              borderColor: audioFile ? '#1db954' : 'rgba(255,255,255,0.3)'
            }}>
              <input
                accept="audio/*"
                style={{ display: 'none' }}
                id="audio-file-upload"
                type="file"
                onChange={handleAudioFileChange}
                disabled={loading}
              />
              <label htmlFor="audio-file-upload">
                <IconButton component="span" disabled={loading}>
                  <CloudUpload sx={{ fontSize: 48, color: audioFile ? '#1db954' : 'rgba(255,255,255,0.7)' }} />
                </IconButton>
              </label>
              <Typography variant="h6" sx={{ color: 'white', mt: 1 }}>
                {audioFile ? audioFile.name : 'Select Audio File'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {audioFile ? 
                  `${(audioFile.size / (1024 * 1024)).toFixed(2)} MB` :
                  'Drag & drop or click to select (MP3, WAV, OGG, M4A - Max 50MB)'
                }
              </Typography>
            </Box>
          </Grid>

          {/* Cover Image Upload */}
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                Cover Image (Optional)
              </Typography>
              <Box sx={{ 
                border: '2px dashed rgba(255,255,255,0.3)',
                borderRadius: 2,
                p: 2,
                textAlign: 'center',
                backgroundColor: 'rgba(255,255,255,0.05)',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {imagePreview ? (
                  <Avatar
                    src={imagePreview}
                    sx={{ width: 120, height: 120, mb: 1 }}
                    variant="rounded"
                  />
                ) : (
                  <Avatar
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      bgcolor: 'rgba(255,255,255,0.1)',
                      mb: 1
                    }}
                    variant="rounded"
                  >
                    <ImageIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.7)' }} />
                  </Avatar>
                )}
                
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="cover-image-upload"
                  type="file"
                  onChange={handleImageFileChange}
                  disabled={loading}
                />
                <label htmlFor="cover-image-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    size="small"
                    disabled={loading}
                    sx={{ 
                      mt: 1,
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.3)'
                    }}
                  >
                    {imagePreview ? 'Change Image' : 'Select Image'}
                  </Button>
                </label>
              </Box>
            </Box>
          </Grid>

          {/* Track Information */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Track Title"
                  value={trackData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused fieldset': { borderColor: '#1db954' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Artist"
                  value={trackData.artist}
                  onChange={(e) => handleInputChange('artist', e.target.value)}
                  placeholder={user?.name || user?.username || 'Your name'}
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused fieldset': { borderColor: '#1db954' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={loading}>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Genre</InputLabel>
                  <Select
                    value={trackData.genre}
                    onChange={(e) => handleInputChange('genre', e.target.value)}
                    label="Genre"
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1db954' }
                    }}
                  >
                    {genres.map((genre) => (
                      <MenuItem key={genre} value={genre}>
                        {genre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Album (Optional)"
                  value={trackData.album}
                  onChange={(e) => handleInputChange('album', e.target.value)}
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused fieldset': { borderColor: '#1db954' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description (Optional)"
                  value={trackData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  multiline
                  rows={3}
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused fieldset': { borderColor: '#1db954' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          sx={{ color: 'rgba(255,255,255,0.7)' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !trackData.title.trim() || !audioFile}
          sx={{
            bgcolor: '#1db954',
            '&:hover': { bgcolor: '#1ed760' },
            '&:disabled': { bgcolor: 'rgba(255,255,255,0.1)' }
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Uploading...
            </>
          ) : (
            'Upload Track'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadTrackDialog; 