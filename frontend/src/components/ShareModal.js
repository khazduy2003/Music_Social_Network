import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  IconButton,
  Divider,
  Snackbar,
  Alert,
  Grid,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Telegram as TelegramIcon,
  LinkedIn as LinkedInIcon,
  Close as CloseIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { notificationService } from '../services/notificationService';
import { toast } from 'react-hot-toast';

const ShareModal = ({ open, onClose, item, type = 'track' }) => {
  const [copied, setCopied] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [mutualFollowers, setMutualFollowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  // Generate the share URL
  const shareUrl = item ? `${window.location.origin}/${type}s/${item.id}` : '';
  
  useEffect(() => {
    if (open && user) {
      fetchMutualFollowers();
    }
  }, [open, user]);
  
  // Fetch users who have mutual following relationship with current user
  const fetchMutualFollowers = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const mutualUsers = await userService.getMutualFollowingUsers(user.id);
      setMutualFollowers(mutualUsers);
    } catch (error) {
      console.error('Error fetching mutual followers:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Generate share text based on type
  const getShareText = () => {
    if (!item) return '';
    
    switch (type) {
      case 'track':
        return `Check out "${item.title}" by ${item.artist} on MusicSocial!`;
      case 'playlist':
        return `Check out this playlist "${item.name}" on MusicSocial!`;
      case 'album':
        return `Check out "${item.title}" by ${item.artist} on MusicSocial!`;
      default:
        return `Check out this ${type} on MusicSocial!`;
    }
  };
  
  const shareText = getShareText();
  const encodedShareText = encodeURIComponent(shareText);
  const encodedShareUrl = encodeURIComponent(shareUrl);
  
  // Handle copy to clipboard
  const handleCopyLink = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };
  
  // Social media share URLs
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}&quote=${encodedShareText}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodedShareText}&url=${encodedShareUrl}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodedShareText}%20${encodedShareUrl}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodedShareUrl}&text=${encodedShareText}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`;
  const emailShareUrl = `mailto:?subject=${encodedShareText}&body=${shareText}%0A%0A${shareUrl}`;
  
  // Handle social media share
  const handleSocialShare = (url, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    window.open(url, '_blank', 'width=600,height=400');
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle share with a mutual follower
  const handleShareWithUser = async (receiverUser) => {
    if (!user || !item) return;
    
    try {
      const itemName = item.title || item.name;
      await notificationService.createShareNotification(
        user.id,
        receiverUser.id,
        type,
        item.id,
        itemName
      );
      toast.success(`Shared with ${receiverUser.username} successfully!`);
    } catch (error) {
      console.error('Error sharing with user:', error);
      toast.error('Failed to share. Please try again.');
    }
  };
  
  if (!item) return null;
  
  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: 'linear-gradient(145deg, #1e1e2e, #2a2a40)',
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div" sx={{ color: 'white' }}>
            Share {type === 'track' ? 'Track' : type === 'playlist' ? 'Playlist' : 'Album'}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {/* Item info */}
          <Box sx={{ display: 'flex', mb: 3, alignItems: 'center' }}>
            <Box
              component="img"
              src={item.coverImageUrl || item.imageUrl || '/images/default-track.png'}
              alt={item.title || item.name}
              sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: 1,
                objectFit: 'cover',
                mr: 2
              }}
            />
            <Box>
              <Typography variant="h6" sx={{ color: 'white' }}>
                {item.title || item.name}
              </Typography>
              {item.artist && (
                <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                  {item.artist}
                </Typography>
              )}
            </Box>
          </Box>
          
          <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
          
          {/* Tabs */}
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': { color: '#b3b3b3', textTransform: 'none' },
              '& .Mui-selected': { color: '#1db954' },
              '& .MuiTabs-indicator': { bgcolor: '#1db954' },
              mb: 3
            }}
          >
            <Tab label="Social Media" />
            <Tab label="Following Together" />
          </Tabs>
          
          {/* Social Media Tab */}
          {tabValue === 0 && (
            <>
              {/* Share link */}
              <Typography variant="subtitle1" sx={{ mb: 1, color: 'white' }}>
                Share via link
              </Typography>
              <Box sx={{ display: 'flex', mb: 3 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={shareUrl}
                  InputProps={{
                    readOnly: true,
                    sx: { 
                      bgcolor: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.1)'
                      }
                    }
                  }}
                  size="small"
                />
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={(e) => handleCopyLink(e)}
                  startIcon={<CopyIcon />}
                  sx={{ ml: 1 }}
                >
                  Copy
                </Button>
              </Box>
              
              <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
              
              {/* Social media sharing */}
              <Typography variant="subtitle1" sx={{ mb: 2, color: 'white' }}>
                Share on social media
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={4} sm={2}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={(e) => handleSocialShare(facebookShareUrl, e)}
                    sx={{ 
                      borderColor: '#1877F2', 
                      color: '#1877F2',
                      minWidth: 'unset',
                      p: 1,
                      '&:hover': {
                        borderColor: '#1877F2',
                        bgcolor: 'rgba(24, 119, 242, 0.1)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <FacebookIcon />
                      <Typography variant="caption" sx={{ mt: 0.5 }}>Facebook</Typography>
                    </Box>
                  </Button>
                </Grid>
                
                <Grid item xs={4} sm={2}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={(e) => handleSocialShare(twitterShareUrl, e)}
                    sx={{ 
                      borderColor: '#1DA1F2', 
                      color: '#1DA1F2',
                      minWidth: 'unset',
                      p: 1,
                      '&:hover': {
                        borderColor: '#1DA1F2',
                        bgcolor: 'rgba(29, 161, 242, 0.1)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <TwitterIcon />
                      <Typography variant="caption" sx={{ mt: 0.5 }}>Twitter</Typography>
                    </Box>
                  </Button>
                </Grid>
                
                <Grid item xs={4} sm={2}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={(e) => handleSocialShare(whatsappShareUrl, e)}
                    sx={{ 
                      borderColor: '#25D366', 
                      color: '#25D366',
                      minWidth: 'unset',
                      p: 1,
                      '&:hover': {
                        borderColor: '#25D366',
                        bgcolor: 'rgba(37, 211, 102, 0.1)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <WhatsAppIcon />
                      <Typography variant="caption" sx={{ mt: 0.5 }}>WhatsApp</Typography>
                    </Box>
                  </Button>
                </Grid>
                
                <Grid item xs={4} sm={2}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={(e) => handleSocialShare(telegramShareUrl, e)}
                    sx={{ 
                      borderColor: '#0088cc', 
                      color: '#0088cc',
                      minWidth: 'unset',
                      p: 1,
                      '&:hover': {
                        borderColor: '#0088cc',
                        bgcolor: 'rgba(0, 136, 204, 0.1)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <TelegramIcon />
                      <Typography variant="caption" sx={{ mt: 0.5 }}>Telegram</Typography>
                    </Box>
                  </Button>
                </Grid>
                
                <Grid item xs={4} sm={2}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={(e) => handleSocialShare(linkedinShareUrl, e)}
                    sx={{ 
                      borderColor: '#0077b5', 
                      color: '#0077b5',
                      minWidth: 'unset',
                      p: 1,
                      '&:hover': {
                        borderColor: '#0077b5',
                        bgcolor: 'rgba(0, 119, 181, 0.1)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <LinkedInIcon />
                      <Typography variant="caption" sx={{ mt: 0.5 }}>LinkedIn</Typography>
                    </Box>
                  </Button>
                </Grid>
                
                <Grid item xs={4} sm={2}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={(e) => handleSocialShare(emailShareUrl, e)}
                    sx={{ 
                      borderColor: '#EA4335', 
                      color: '#EA4335',
                      minWidth: 'unset',
                      p: 1,
                      '&:hover': {
                        borderColor: '#EA4335',
                        bgcolor: 'rgba(234, 67, 53, 0.1)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <EmailIcon />
                      <Typography variant="caption" sx={{ mt: 0.5 }}>Email</Typography>
                    </Box>
                  </Button>
                </Grid>
              </Grid>
            </>
          )}
          
          {/* Following Together Tab */}
          {tabValue === 1 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 1, color: 'white' }}>
                Share with followers who follow you back
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={30} sx={{ color: '#1db954' }} />
                </Box>
              ) : mutualFollowers.length === 0 ? (
                <Box sx={{ 
                  bgcolor: 'rgba(255,255,255,0.05)', 
                  p: 3, 
                  borderRadius: 2, 
                  textAlign: 'center'
                }}>
                  <Typography variant="body1" sx={{ color: '#b3b3b3', mb: 1 }}>
                    No mutual followers found
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#8b8b8b' }}>
                    You can only share content with users who follow you and whom you follow back.
                  </Typography>
                </Box>
              ) : (
                <List sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  {mutualFollowers.map((follower) => (
                    <ListItem 
                      key={follower.id} 
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          onClick={() => handleShareWithUser(follower)}
                          sx={{ 
                            color: '#1db954',
                            '&:hover': { 
                              bgcolor: 'rgba(29, 185, 84, 0.1)' 
                            }
                          }}
                        >
                          <SendIcon />
                        </IconButton>
                      }
                      sx={{ 
                        borderRadius: 1, 
                        mb: 1,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } 
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          src={follower.avatarUrl} 
                          alt={follower.username}
                          sx={{ 
                            width: 40, 
                            height: 40,
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                        />
                      </ListItemAvatar>
                      <ListItemText 
                        primary={
                          <Typography sx={{ color: 'white' }}>
                            {follower.username}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                            {follower.fullName}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Link copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default ShareModal; 