import React, { useState, useEffect } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { PersonAdd, PersonRemove } from '@mui/icons-material';
import { useFollow } from '../hooks/useFollow';

const FollowButton = ({ 
  targetUser, 
  variant = 'contained', 
  size = 'medium',
  onFollowChange = () => {} 
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const { toggleFollow, checkIsFollowing, loading, currentUser } = useFollow();

  useEffect(() => {
    if (targetUser && targetUser.isFollowing !== undefined) {
      setIsFollowing(targetUser.isFollowing);
    } else if (targetUser && currentUser && targetUser.id !== currentUser.id) {
      checkFollowStatus();
    }
  }, [targetUser, currentUser]);

  const checkFollowStatus = async () => {
    if (!targetUser || !currentUser || targetUser.id === currentUser.id) return;
    
    setLocalLoading(true);
    try {
      const following = await checkIsFollowing(targetUser.id);
      setIsFollowing(following);
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!targetUser || !currentUser) return;

    const success = await toggleFollow(targetUser.id, isFollowing);
    if (success) {
      const newIsFollowing = !isFollowing;
      setIsFollowing(newIsFollowing);
      
      // Force refresh local state after successful follow/unfollow
      setTimeout(() => {
        checkFollowStatus();
      }, 100);
      
      // Notify parent component about the change
      onFollowChange(targetUser.id, newIsFollowing);
    }
  };

  // Don't show button for current user or when not logged in
  if (!currentUser || !targetUser || currentUser.id === targetUser.id) {
    return null;
  }

  const isLoading = loading || localLoading;

  return (
    <Button
      variant={variant}
      size={size}
      color={isFollowing ? 'secondary' : 'primary'}
      onClick={handleToggleFollow}
      disabled={isLoading}
      startIcon={
        isLoading ? (
          <CircularProgress size={16} />
        ) : isFollowing ? (
          <PersonRemove />
        ) : (
          <PersonAdd />
        )
      }
      sx={{
        minWidth: 120,
        textTransform: 'none',
        borderRadius: 2,
      }}
    >
      {isLoading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
};

export default FollowButton; 