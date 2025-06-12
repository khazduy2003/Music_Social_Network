import api from './api';

export const listeningHistoryService = {
  // Add track to listening history
  addToHistory: async (userId, trackId, duration) => {
    try {
      console.log('[History Service] Adding to history:', { userId, trackId, duration });
      
      // Validate parameters
      if (!userId || !trackId || !duration) {
        console.error('[History Service] Missing required parameters:', { userId, trackId, duration });
        throw new Error('Missing required parameters');
      }
      
      // Log request details
      console.log(`[History Service] Request URL: /history/${userId}/tracks/${trackId}?duration=${duration}`);
      
      const response = await api.post(`/history/${userId}/tracks/${trackId}?duration=${duration}`);
      console.log('[History Service] History added successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('[History Service] Error adding to history:', error);
      console.error('[History Service] Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      throw error;
    }
  },

  // Get user's listening history
  getUserHistory: async (userId, page = 0, size = 20) => {
    try {
      console.log('[History Service] Getting user history:', { userId, page, size });
      const response = await api.get(`/history/${userId}?page=${page}&size=${size}&sort=createdAt,desc`);
      console.log('[History Service] User history fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('[History Service] Error fetching user history:', error);
      console.error('[History Service] Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Get user's most listened tracks
  getMostListenedTracks: async (userId, page = 0, size = 10) => {
    try {
      console.log('[History Service] Getting most listened tracks:', { userId, page, size });
      const response = await api.get(`/history/${userId}/most-listened?page=${page}&size=${size}`);
      console.log('[History Service] Most listened tracks fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('[History Service] Error fetching most listened tracks:', error);
      console.error('[History Service] Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Get user's recent tracks
  getRecentTracks: async (userId, page = 0, size = 10) => {
    try {
      console.log('[History Service] Getting recent tracks:', { userId, page, size });
      const response = await api.get(`/history/${userId}/recent?page=${page}&size=${size}`);
      console.log('[History Service] Recent tracks fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('[History Service] Error fetching recent tracks:', error);
      console.error('[History Service] Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }
}; 