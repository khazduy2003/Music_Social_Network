import api from './api';

export const playlistService = {
  // Get all playlists
  getAllPlaylists: async () => {
    try {
      const response = await api.get('/playlists');
      return response.data.content || [];
    } catch (error) {
      console.error('Error fetching all playlists:', error);
      return [];
    }
  },

  // Get user's playlists
  getUserPlaylists: async (username) => {
    try {
      const response = await api.get(`/playlists/user/${username}`);
      console.log('User playlists response for', username, ':', response.data);
      return response.data.content || [];
    } catch (error) {
      console.error('Error fetching user playlists:', error);
      return [];
    }
  },

  // Get playlist by ID
  getPlaylistById: async (id) => {
    try {
      const response = await api.get(`/playlists/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching playlist with ID ${id}:`, error);
      return null;
    }
  },

  // Create new playlist
  createPlaylist: async (playlistData) => {
    try {
      const response = await api.post('/playlists', playlistData);
      return response.data;
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  },

  // Update playlist
  updatePlaylist: async (id, playlistData) => {
    try {
      const response = await api.put(`/playlists/${id}`, playlistData);
      return response.data;
    } catch (error) {
      console.error('Error updating playlist:', error);
      throw error;
    }
  },

  // Delete playlist
  deletePlaylist: async (id) => {
    try {
      const response = await api.delete(`/playlists/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting playlist:', error);
      throw error;
    }
  },

  // Add track to playlist
  addTrackToPlaylist: async (playlistId, trackId) => {
    try {
      const response = await api.post(`/playlists/${playlistId}/tracks/${trackId}`);
      return response.data;
    } catch (error) {
      console.error('Error adding track to playlist:', error);
      throw error;
    }
  },

  // Remove track from playlist
  removeTrackFromPlaylist: async (playlistId, trackId) => {
    try {
      const response = await api.delete(`/playlists/${playlistId}/tracks/${trackId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing track from playlist:', error);
      throw error;
    }
  },

  // Like playlist
  likePlaylist: async (userId, playlistId) => {
    try {
      const response = await api.post(`/playlists/${playlistId}/like/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error liking playlist:', error);
      throw error;
    }
  },

  // Unlike playlist
  unlikePlaylist: async (userId, playlistId) => {
    try {
      const response = await api.delete(`/playlists/${playlistId}/like/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error unliking playlist:', error);
      throw error;
    }
  },

  // Toggle like/unlike playlist
  toggleLike: async (playlistId) => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Get the playlist to check if it's already liked
      const playlist = await playlistService.getPlaylistById(playlistId);
      if (playlist.isLiked) {
        await playlistService.unlikePlaylist(userId, playlistId);
      } else {
        await playlistService.likePlaylist(userId, playlistId);
      }
      return true;
    } catch (error) {
      console.error('Error toggling playlist like:', error);
      throw error;
    }
  },

  // Get public playlists
  getPublicPlaylists: async () => {
    try {
      const response = await api.get('/playlists/public');
      console.log('Public playlists response:', response.data);
      return response.data.content || [];
    } catch (error) {
      console.error('Error fetching public playlists:', error);
      return [];
    }
  },

  // Search playlists
  searchPlaylists: async (query) => {
    try {
      const response = await api.get(`/playlists/search?query=${encodeURIComponent(query)}`);
      return response.data.content || [];
    } catch (error) {
      console.error('Error searching playlists:', error);
      return [];
    }
  },

  // Get most played playlists
  getMostPlayedPlaylists: async () => {
    try {
      const response = await api.get('/playlists/most-played');
      return response.data.content || [];
    } catch (error) {
      console.error('Error fetching most played playlists:', error);
      return [];
    }
  },

  // Increment play count
  incrementPlayCount: async (playlistId) => {
    try {
      await api.post(`/playlists/${playlistId}/play`);
      return true;
    } catch (error) {
      console.error('Error incrementing play count:', error);
      throw error;
    }
  }
}; 