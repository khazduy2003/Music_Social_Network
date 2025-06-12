import api from './api';

export const trackService = {
  // Get all tracks
  getAllTracks: async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      const response = await api.get(`/tracks${userId ? `?userId=${userId}` : ''}`);
      return response.data.content || [];
    } catch (error) {
      console.error('Error fetching all tracks:', error);
      return [];
    }
  },

  // Get track by ID
  getTrackById: async (id) => {
    try {
      const response = await api.get(`/tracks/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching track with ID ${id}:`, error);
      return null;
    }
  },

  // Search tracks
  searchTracks: async (query, filters = {}) => {
    try {
      // Xây dựng query string từ các filter
      const queryParams = new URLSearchParams();
      
      // Thêm query text
      if (query) {
        queryParams.append('query', query);
      }
      
      // Thêm các filter
      if (filters.genre) {
        queryParams.append('genre', filters.genre);
      }
      
      if (filters.artist) {
        queryParams.append('artist', filters.artist);
      }
      
      if (filters.sortBy) {
        queryParams.append('sortBy', filters.sortBy);
      }
      
      if (filters.sortDirection) {
        queryParams.append('sortDirection', filters.sortDirection);
      }
      
      if (filters.minRating) {
        queryParams.append('minRating', filters.minRating);
      }
      
      // Thêm paging nếu cần
      if (filters.page) {
        queryParams.append('page', filters.page);
      }
      
      if (filters.size) {
        queryParams.append('size', filters.size);
      }
      
      // Add current user ID to get correct like status
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      if (userId) {
        queryParams.append('userId', userId);
      }
      
      const url = `/tracks/search?${queryParams.toString()}`;
      console.log('Searching tracks with URL:', url);
      
      const response = await api.get(url);
      console.log('Search response:', response.data);
      return response.data.content || [];
    } catch (error) {
      console.error('Error searching tracks:', error);
      // Fallback trong trường hợp lỗi
      try {
        console.log('Attempting fallback to get all tracks');
        const fallbackResponse = await api.get('/tracks');
        return fallbackResponse.data.content || [];
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        return [];
      }
    }
  },

  // Get tracks by genre
  getTracksByGenre: async (genre) => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      const response = await api.get(`/tracks/genre/${genre}${userId ? `?userId=${userId}` : ''}`);
      return response.data.content || [];
    } catch (error) {
      console.error('Error fetching tracks by genre:', error);
      return [];
    }
  },

  // Like track
  likeTrack: async (trackId) => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      await api.post(`/tracks/${trackId}/like/${userId}`);
      return true;
    } catch (error) {
      console.error('Error liking track:', error);
      throw error;
    }
  },

  // Unlike track
  unlikeTrack: async (trackId) => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      await api.delete(`/tracks/${trackId}/like/${userId}`);
      return true;
    } catch (error) {
      console.error('Error unliking track:', error);
      throw error;
    }
  },

  // Toggle like/unlike track
  toggleLike: async (trackId) => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Get the track to check if it's already liked
      const track = await trackService.getTrackById(trackId);
      if (track.isLiked) {
        await trackService.unlikeTrack(trackId);
      } else {
        await trackService.likeTrack(trackId);
      }
      return true;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  },

  // Get liked tracks
  getLikedTracks: async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      const response = await api.get(`/tracks/liked/${userId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching liked tracks:', error);
      return [];
    }
  },

  // Get top tracks
  getTopTracks: async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      const response = await api.get(`/tracks/top-rated${userId ? `?userId=${userId}` : ''}`);
      return response.data.content || [];
    } catch (error) {
      console.error('Error fetching top tracks:', error);
      return [];
    }
  },

  // Get recommended tracks
  getRecommendedTracks: async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      if (!userId) {
        console.log('User not authenticated, using fallback tracks');
        // Return most played tracks as fallback for unauthenticated users
        const response = await api.get('/tracks/most-played');
        return response.data.content || [];
      }
      
      // Call our new recommendation API
      const response = await api.get(`/recommendations/user/${userId}?page=0&size=20`);
      return response.data.content || [];
    } catch (error) {
      console.error('Error fetching recommended tracks:', error);
      // Fallback to most played tracks if recommendation fails
      try {
        const fallbackResponse = await api.get('/tracks/most-played');
        return fallbackResponse.data.content || [];
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        return [];
      }
    }
  },

  // Get recommendations by artist
  getRecommendationsByArtist: async (limit = 10) => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const response = await api.get(`/recommendations/user/${userId}/by-artist?limit=${limit}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching artist-based recommendations:', error);
      return [];
    }
  },

  // Get recommendations by genre
  getRecommendationsByGenre: async (limit = 10) => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const response = await api.get(`/recommendations/user/${userId}/by-genre?limit=${limit}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching genre-based recommendations:', error);
      return [];
    }
  },

  // Create new track
  createTrack: async (trackData) => {
    const response = await api.post('/tracks', trackData);
    return response.data;
  },

  // Update track
  updateTrack: async (id, trackData) => {
    const response = await api.put(`/tracks/${id}`, trackData);
    return response.data;
  },

  // Delete track
  deleteTrack: async (id) => {
    const response = await api.delete(`/tracks/${id}`);
    return response.data;
  },

  // Rate track
  rateTrack: async (trackId, rating) => {
    const response = await api.post(`/tracks/${trackId}/rate`, { rating });
    return response.data;
  },

  // Get track comments
  getTrackComments: async (trackId) => {
    const response = await api.get(`/tracks/${trackId}/comments`);
    return response.data;
  },

  // Add comment to track
  addComment: async (trackId, content) => {
    const response = await api.post(`/tracks/${trackId}/comments`, { content });
    return response.data;
  },

  // Get most played tracks
  getMostPlayedTracks: async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      const response = await api.get(`/tracks/most-played${userId ? `?userId=${userId}` : ''}`);
      return response.data.content || [];
    } catch (error) {
      console.error('Error fetching most played tracks:', error);
      return [];
    }
  },

  // Get all tracks for discover page (sorted A-Z, no pagination)
  getAllTracksForDiscover: async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      const response = await api.get(`/tracks/all-for-discover${userId ? `?userId=${userId}` : ''}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching all tracks for discover:', error);
      return [];
    }
  },

  // User Preferences API calls
  getUserPreferences: async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const response = await api.get(`/preferences/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  },

  updatePreferencesFromHistory: async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const response = await api.post(`/preferences/${userId}/update-from-history`);
      return response.data;
    } catch (error) {
      console.error('Error updating preferences from history:', error);
      return null;
    }
  },

  hasValidListeningHistory: async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      if (!userId) {
        return false;
      }
      
      const response = await api.get(`/preferences/${userId}/has-valid-history`);
      return response.data;
    } catch (error) {
      console.error('Error checking listening history:', error);
      return false;
    }
  },

  // Debug recommendation system
  debugRecommendations: async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const response = await api.get(`/recommendations/debug/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error debugging recommendations:', error);
      throw error;
    }
  },

  // Get tracks by user
  getTracksByUser: async (username) => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      const response = await api.get(`/tracks/user/${username}${userId ? `?userId=${userId}` : ''}`);
      return response.data || { content: [] };
    } catch (error) {
      console.error('Error fetching tracks by user:', error);
      return { content: [] };
    }
  },

  // Upload track
  uploadTrack: async (formData) => {
    try {
      const response = await api.post('/tracks/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading track:', error);
      throw error;
    }
  },

  // Get tracks liked by users the current user is following
  getTracksLikedByFollowing: async (limit = 10) => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const response = await api.get('/tracks/liked-by-following', {
        params: { 
          limit,
          userId 
        }
      });
      return response.data.content || response.data || [];
    } catch (error) {
      console.error('Error fetching tracks liked by following users:', error);
      return [];
    }
  },

  // Increment play count with listened duration tracking
  incrementPlayCount: async (trackId, listenedDuration) => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      
      // If we have both userId and listenedDuration, send them to properly track plays
      if (userId && listenedDuration) {
        await api.post(`/tracks/${trackId}/play`, null, {
          params: {
            userId, 
            listenedDuration
          }
        });
      } else {
        // Fallback to simple increment without duration tracking
        await api.post(`/tracks/${trackId}/play`);
      }
      return true;
    } catch (error) {
      console.error('Error incrementing play count:', error);
      return false;
    }
  },
}; 