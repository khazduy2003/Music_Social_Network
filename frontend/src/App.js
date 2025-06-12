import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { CssBaseline, Box } from '@mui/material';
import { Toaster } from 'react-hot-toast';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { PlayerProvider } from './contexts/PlayerContext';

// Components
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import MusicPlayer from './components/Player/MusicPlayer';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Playlists from './pages/Playlists';
import PublicPlaylists from './pages/PublicPlaylists';
import PlaylistDetail from './pages/PlaylistDetail';
import Discover from './pages/Discover';
import Library from './pages/Library';
import Favourites from './pages/Favourites';
import RecommendedMusic from './pages/RecommendedMusic';
import DiscoverUsers from './pages/DiscoverUsers';
import FollowersPage from './pages/FollowersPage';
import FollowingPage from './pages/FollowingPage';
import TrackDetail from './pages/TrackDetail';



function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <PlayerProvider>
          <Router>
            <Box sx={{ 
              display: 'flex', 
              height: '100vh', 
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 75%, #0f3460 100%)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 30% 40%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)',
                pointerEvents: 'none',
                zIndex: 0,
              }
            }}>
              <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route path="/*" element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                } />
              </Routes>
            </Box>
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#282828',
                  color: '#fff',
                },
              }}
            />
          </Router>
        </PlayerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const MainLayout = () => {
  return (
    <>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        minWidth: 0,
        position: 'relative',
        zIndex: 1
      }}>
        {/* Top Navigation */}
        <Navbar />
        
        {/* Page Content */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          paddingBottom: '90px', // Space for music player
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '4px',
            '&:hover': {
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            }
          }
        }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/recommended" element={<RecommendedMusic />} />
            <Route path="/search" element={<Search />} />
            <Route path="/library" element={<Library />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/public-playlists" element={<PublicPlaylists />} />
            <Route path="/playlists/:id" element={<PlaylistDetail />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/favourites" element={<Favourites />} />
            <Route path="/discover-users" element={<DiscoverUsers />} />
            <Route path="/users/:username/followers" element={<FollowersPage />} />
            <Route path="/users/:username/following" element={<FollowingPage />} />
            <Route path="/track/:id" element={<TrackDetail />} />
            <Route path="/tracks/:id" element={<TrackDetail />} />
          </Routes>
        </Box>
      </Box>
      
      {/* Music Player - Fixed at bottom */}
      <MusicPlayer />
    </>
  );
};

export default App;
