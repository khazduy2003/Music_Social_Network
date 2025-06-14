import api from './api';

export const adminService = {
  // System Monitoring
  getSystemStats: async (adminId) => {
    try {
      const response = await api.get(`/admin/stats?adminId=${adminId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching system stats:', error);
      throw error;
    }
  },

  // User Management
  getAllUsers: async (adminId, page = 0, size = 10) => {
    try {
      const response = await api.get(`/admin/users?adminId=${adminId}&page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getUserDetails: async (userId, adminId) => {
    try {
      const response = await api.get(`/admin/users/${userId}?adminId=${adminId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  },

  updateUserRole: async (userId, role, adminId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/role?role=${role}&adminId=${adminId}`);
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  banUser: async (userId, reason, adminId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/ban?reason=${encodeURIComponent(reason)}&adminId=${adminId}`);
      return response.data;
    } catch (error) {
      console.error('Error banning user:', error);
      throw error;
    }
  },

  unbanUser: async (userId, adminId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/unban?adminId=${adminId}`);
      return response.data;
    } catch (error) {
      console.error('Error unbanning user:', error);
      throw error;
    }
  },

  deleteUser: async (userId, adminId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}?adminId=${adminId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Content Management
  deleteTrack: async (trackId, adminId) => {
    try {
      const response = await api.delete(`/admin/tracks/${trackId}?adminId=${adminId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting track:', error);
      throw error;
    }
  },

  deletePlaylist: async (playlistId, adminId) => {
    try {
      const response = await api.delete(`/admin/playlists/${playlistId}?adminId=${adminId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting playlist:', error);
      throw error;
    }
  },

  // Utility
  checkAdminAccess: async (userId) => {
    try {
      const response = await api.get(`/admin/check-access/${userId}`);
      return response.data.isAdmin;
    } catch (error) {
      console.error('Error checking admin access:', error);
      return false;
    }
  },

  // Legacy operations
  updateGenres: async (adminId) => {
    try {
      const response = await api.post(`/admin/update-genres?adminId=${adminId}`);
      return response.data;
    } catch (error) {
      console.error('Error updating genres:', error);
      throw error;
    }
  },

  updateUserPreferences: async (userId, adminId) => {
    try {
      const response = await api.post(`/admin/update-user-preferences?userId=${userId}&adminId=${adminId}`);
      return response.data;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }
}; 