import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  ThumbUp,
  MoreVert,
  Edit,
  Delete,
  Send,
  Comment as CommentIcon
} from '@mui/icons-material';
import { commentService } from '../services/commentService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const TrackComments = ({ trackId, trackTitle }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (trackId) {
      fetchComments();
    }
  }, [trackId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const commentsData = await commentService.getTrackComments(trackId);
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      setSubmitting(true);
      const commentData = {
        content: newComment.trim()
      };

      await commentService.addComment(trackId, commentData);
      setNewComment('');
      await fetchComments();
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async () => {
    if (!editText.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      const commentData = {
        content: editText.trim()
      };

      await commentService.updateComment(editingComment.id, commentData);
      setEditingComment(null);
      setEditText('');
      await fetchComments();
      toast.success('Comment updated successfully');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const handleDeleteComment = async () => {
    try {
      await commentService.deleteComment(selectedComment.id);
      setDeleteDialogOpen(false);
      setSelectedComment(null);
      await fetchComments();
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleToggleCommentLike = async (comment) => {
    if (!isAuthenticated) {
      toast.error('Please log in to like comments');
      return;
    }

    try {
      await commentService.toggleLike(comment.id);
      await fetchComments();
    } catch (error) {
      console.error('Error toggling comment like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleMenuOpen = (event, comment) => {
    setMenuAnchor(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedComment(null);
  };

  const handleEditClick = () => {
    setEditingComment(selectedComment);
    setEditText(selectedComment.content);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const formatCommentDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now - date;
      const diffInHours = diffInMs / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
      }
    } catch (error) {
      return 'Recently';
    }
  };

  const renderComment = (comment) => {
    const isOwner = user && comment.userId && comment.userId === user.id;
    const isEditing = editingComment && editingComment.id === comment.id;

    return (
      <Card 
        key={comment.id} 
        sx={{ 
          mb: 2, 
          backgroundColor: 'rgba(20, 20, 30, 0.8)',
          border: '1px solid rgba(139, 92, 246, 0.2)'
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <Avatar 
                src={comment.userProfilePictureUrl || '/default-avatar.png'} 
                alt={comment.username}
                sx={{ width: 32, height: 32, mr: 1 }}
              />
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {comment.username || 'Unknown User'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  {formatCommentDate(comment.createdAt)}
                </Typography>
              </Box>
            </Box>
            
            {isOwner && (
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, comment)}
                sx={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            )}
          </Box>

          {isEditing ? (
            <Box sx={{ mt: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                variant="outlined"
                placeholder="Edit your comment..."
                sx={{
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(139, 92, 246, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(139, 92, 246, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#8b5cf6' }
                  }
                }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleEditComment}
                  sx={{ 
                    bgcolor: '#8b5cf6',
                    '&:hover': { bgcolor: '#7c3aed' }
                  }}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setEditingComment(null);
                    setEditText('');
                  }}
                  sx={{ 
                    color: 'rgba(255,255,255,0.6)',
                    borderColor: 'rgba(255,255,255,0.3)'
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: 'white', mt: 1, mb: 2 }}>
              {comment.content}
            </Typography>
          )}

          {!isEditing && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                size="small"
                onClick={() => handleToggleCommentLike(comment)}
                sx={{ 
                  color: comment.liked ? '#3b82f6' : 'rgba(255,255,255,0.6)',
                  '&:hover': { color: '#3b82f6' }
                }}
              >
                <ThumbUp fontSize="small" />
              </IconButton>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                {comment.likesCount || 0}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <CommentIcon sx={{ color: '#8b5cf6', mr: 1 }} />
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
          Comments
        </Typography>
        <Chip 
          label={comments.length} 
          size="small" 
          sx={{ 
            ml: 1, 
            backgroundColor: 'rgba(139, 92, 246, 0.2)',
            color: '#8b5cf6'
          }}
        />
      </Box>

      {/* Add Comment Section */}
      {isAuthenticated ? (
        <Card sx={{ 
          mb: 3, 
          backgroundColor: 'rgba(20, 20, 30, 0.8)',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Avatar 
                src={user?.profileImageUrl || '/default-avatar.png'} 
                alt={user?.username}
                sx={{ width: 32, height: 32 }}
              />
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={`Add a comment about "${trackTitle}"...`}
                  variant="outlined"
                  sx={{
                    mb: 1,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(139, 92, 246, 0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(139, 92, 246, 0.5)' },
                      '&.Mui-focused fieldset': { borderColor: '#8b5cf6' }
                    }
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={submitting ? <CircularProgress size={16} /> : <Send />}
                  onClick={handleSubmitComment}
                  disabled={submitting || !newComment.trim()}
                  sx={{
                    bgcolor: '#8b5cf6',
                    '&:hover': { bgcolor: '#7c3aed' }
                  }}
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ 
          mb: 3, 
          backgroundColor: 'rgba(20, 20, 30, 0.5)',
          border: '1px solid rgba(139, 92, 246, 0.2)'
        }}>
          <CardContent sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Please log in to add comments
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#8b5cf6' }} />
        </Box>
      ) : comments.length > 0 ? (
        <Box>
          {comments.map(renderComment)}
        </Box>
      ) : (
        <Card sx={{ 
          backgroundColor: 'rgba(20, 20, 30, 0.5)',
          border: '1px solid rgba(139, 92, 246, 0.2)'
        }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <CommentIcon sx={{ fontSize: 48, color: 'rgba(139, 92, 246, 0.5)', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
              No comments yet
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Be the first to share your thoughts about this track!
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
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
          <Edit sx={{ mr: 1, fontSize: 16 }} />
          Edit Comment
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: '#ef4444' }}>
          <Delete sx={{ mr: 1, fontSize: 16 }} />
          Delete Comment
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            background: 'linear-gradient(145deg, #1e1e2e, #2a2a40)',
            color: 'white',
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>
          Delete Comment
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Are you sure you want to delete this comment? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: 'rgba(255,255,255,0.6)' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteComment}
            sx={{ color: '#ef4444', fontWeight: 'bold' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrackComments; 