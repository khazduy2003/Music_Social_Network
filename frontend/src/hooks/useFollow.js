import { useState, useCallback } from 'react';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

export const useFollow = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user: currentUser } = useAuth();

  const followUser = useCallback(async (targetUserId) => {
    if (!currentUser) {
      setError('Must be logged in to follow users');
      return false;
    }

    if (currentUser.id === targetUserId) {
      setError('Cannot follow yourself');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await userService.followUser(targetUserId);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to follow user');
      console.error('Follow user error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const unfollowUser = useCallback(async (targetUserId) => {
    if (!currentUser) {
      setError('Must be logged in to unfollow users');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await userService.unfollowUser(targetUserId);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unfollow user');
      console.error('Unfollow user error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const toggleFollow = useCallback(async (targetUserId, isCurrentlyFollowing) => {
    if (isCurrentlyFollowing) {
      return await unfollowUser(targetUserId);
    } else {
      return await followUser(targetUserId);
    }
  }, [followUser, unfollowUser]);

  const checkIsFollowing = useCallback(async (targetUserId) => {
    if (!currentUser || currentUser.id === targetUserId) {
      return false;
    }

    try {
      return await userService.isFollowing(targetUserId);
    } catch (err) {
      console.error('Failed to check follow status:', err);
      return false;
    }
  }, [currentUser]);

  return {
    followUser,
    unfollowUser,
    toggleFollow,
    checkIsFollowing,
    loading,
    error,
    currentUser
  };
}; 