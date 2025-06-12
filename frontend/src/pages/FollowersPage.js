import React from 'react';
import { useParams } from 'react-router-dom';
import FollowList from '../components/FollowList';

const FollowersPage = () => {
  const { username } = useParams();
  
  return <FollowList username={username} initialTab={0} />;
};

export default FollowersPage; 