import api from './api';

export const notificationService = {
  // Get user notifications with pagination
  getUserNotifications: async (userId, page = 0, size = 10) => {
    try {
      const response = await api.get(`/notifications/user/${userId}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return { content: [], totalElements: 0 };
    }
  },

  // Get count of unread notifications
  getUnreadCount: async (userId) => {
    try {
      const response = await api.get(`/notifications/user/${userId}/unread-count`);
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  // Create a notification
  createNotification: async (notificationData) => {
    try {
      const response = await api.post('/notifications', notificationData);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Create a share notification
  createShareNotification: async (senderId, receiverId, itemType, itemId, itemName) => {
    try {
      const response = await api.post('/notifications/share', {
        senderId,
        receiverId,
        itemType,
        itemId,
        itemName
      });
      return response.data;
    } catch (error) {
      console.error('Error creating share notification:', error);
      throw error;
    }
  }
}; 