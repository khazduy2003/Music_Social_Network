import React from 'react';
import { useParams } from 'react-router-dom';
import FollowList from '../components/FollowList';

const FollowingPage = () => {
  const { username } = useParams();
  
  return <FollowList username={username} initialTab={1} />;
};

export default FollowingPage; 