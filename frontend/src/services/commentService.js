import api from './api';

export const commentService = {
  // Get comments for a track
  getTrackComments: async (trackId) => {
    try {
      // Get current user for context
      const user = JSON.parse(localStorage.getItem('user'));
      const currentUserId = user?.id || 1;
      
      const response = await api.get(`/tracks/${trackId}/comments`, {
        params: { currentUserId }
      });
      return response.data.content || [];
    } catch (error) {
      console.error('Error fetching track comments:', error);
      return [];
    }
  },

  // Add comment to a track
  addComment: async (trackId, commentData) => {
    try {
      // Get current user from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        throw new Error('User not logged in');
      }
      
      // Add userId to comment data (notification style)
      const requestData = {
        ...commentData,
        userId: user.id
      };
      
      const response = await api.post(`/tracks/${trackId}/comments`, requestData);
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Update comment
  updateComment: async (commentId, commentData) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        throw new Error('User not logged in');
      }
      
      const response = await api.put(`/comments/${commentId}`, commentData, {
        params: { userId: user.id }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },

  // Delete comment
  deleteComment: async (commentId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        throw new Error('User not logged in');
      }
      
      const response = await api.delete(`/comments/${commentId}`, {
        params: { userId: user.id }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  // Toggle like/unlike comment
  toggleLike: async (commentId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        throw new Error('User not logged in');
      }
      
      const response = await api.post(`/comments/${commentId}/toggle-like`, {}, {
        params: { userId: user.id }
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling comment like:', error);
      throw error;
    }
  },

  // Get comment likes
  getCommentLikes: async (commentId) => {
    try {
      const response = await api.get(`/comments/${commentId}/likes`);
      return response.data.content || [];
    } catch (error) {
      console.error('Error fetching comment likes:', error);
      return [];
    }
  }
}; 