import api from './api';

export const userService = {
  // Get all users (new - returns list instead of paginated)
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data.content || response.data; // Handle both paginated and list responses
  },

  // Get user profile
  getUserProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  // Follow/Unfollow user (legacy - uses current user from token)
  toggleFollow: async (userId) => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },

  // Search users
  searchUsers: async (query, page = 0, size = 10) => {
    const response = await api.get('/users/search', {
      params: { query, page, size }
    });
    return response.data;
  },

  // Get user's listening history
  getListeningHistory: async (userId) => {
    const response = await api.get(`/users/${userId}/history`);
    return response.data;
  },

  // Get user preferences
  getUserPreferences: async () => {
    const response = await api.get('/users/preferences');
    return response.data;
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    const response = await api.put('/users/preferences', preferences);
    return response.data;
  },

  // Get user by ID
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Get user with follow status (updated to match backend)
  getUserWithFollowStatus: async (id) => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const currentUserId = currentUser ? currentUser.id : null;
    
    const response = await api.get(`/users/${id}/with-follow-status`, {
      params: { currentUserId }
    });
    return response.data;
  },

  // Get user by username
  getUserByUsername: async (username) => {
    const response = await api.get(`/users/username/${username}`);
    return response.data;
  },

  // Follow user (updated to use current user)
  followUser: async (followingId) => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) throw new Error('User not authenticated');
    
    const response = await api.post(`/users/current/follow/${followingId}`, null, {
      params: { currentUserId: currentUser.id }
    });
    return response.data;
  },

  // Unfollow user (updated to use current user)
  unfollowUser: async (followingId) => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) throw new Error('User not authenticated');
    
    const response = await api.delete(`/users/current/follow/${followingId}`, {
      params: { currentUserId: currentUser.id }
    });
    return response.data;
  },

  // Check if current user is following another user (updated)
  isFollowing: async (followingId) => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) return false;
    
    try {
      const response = await api.get(`/users/current/is-following/${followingId}`, {
        params: { currentUserId: currentUser.id }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  },

  // Get followers by username (returns list)
  getFollowersByUsername: async (username) => {
    const response = await api.get(`/users/${username}/followers`);
    // Handle both paginated and list responses
    return response.data.content || response.data;
  },

  // Get following by username (returns list)
  getFollowingByUsername: async (username) => {
    const response = await api.get(`/users/${username}/following`);
    // Handle both paginated and list responses
    return response.data.content || response.data;
  },

  // Get users with mutual following relationship (following each other)
  getMutualFollowingUsers: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/mutual-following`);
      return response.data;
    } catch (error) {
      console.error('Error fetching mutual following users:', error);
      return [];
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  }
}; 