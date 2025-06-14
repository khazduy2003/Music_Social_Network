import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions, 
  IconButton,
  Skeleton,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  CircularProgress,
  Pagination,
  Chip,
  Menu,
  MenuItem,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider
} from '@mui/material';
import { 
  PlayArrow, 
  Pause, 
  Favorite, 
  FavoriteBorder, 
  Add, 
  Share,
  Search as SearchIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
  PlaylistAdd,
  PlaylistPlay,
  Close as CloseIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { trackService } from '../services/trackService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePlayerContext } from '../contexts/PlayerContext';
import toast from 'react-hot-toast';
import ShareModal from '../components/ShareModal';

const ITEMS_PER_PAGE = 12;

// Danh sách genres mẫu (có thể được lấy từ backend trong thực tế)
const GENRES = [
  'Pop', 'Rock', 'Hip Hop', 'R&B', 'Electronic', 'Jazz', 'Classical', 
  'Country', 'Folk', 'Indie', 'Latin', 'Metal', 'Reggae', 'Blues'
];

// Danh sách tùy chọn sắp xếp
const SORT_OPTIONS = [
  { value: 'latest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'title', label: 'Title (A-Z)' },
  { value: 'title_desc', label: 'Title (Z-A)' }
];

const Discover = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter states
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [artistFilter, setArtistFilter] = useState('');
  
  // Sort states
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0]);
  
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [trackToShare, setTrackToShare] = useState(null);
  
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { 
    currentTrack, 
    isPlaying, 
    playTrack,
    pauseTrack,
    resumeTrack,
    addToQueue,
    playAllTracks
  } = usePlayerContext();

  // Thêm các ref ở đầu component
  const isFilterInitialRender = useRef(true);
  const isPageInitialRender = useRef(true);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setPage(1); // Reset pagination when changing tabs
    
    // Nếu đã có filter, áp dụng lại khi đổi tab
    if (selectedGenres.length > 0 || minRating > 0 || artistFilter) {
      applySearch();
    }
  };
  
  // Fetch tracks based on current tab
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true);
        let response;
        
        // Lấy userId từ localStorage để truyền vào API calls
        const userId = JSON.parse(localStorage.getItem('user'))?.id;
        
        switch(currentTab) {
          case 0: // All Tracks - Gộp most played và tất cả tracks
            try {
              // Gọi đồng thời 2 API (removed top rated)
              const [mostPlayedResponse, allTracksResponse] = await Promise.all([
                trackService.getMostPlayedTracks(),
                trackService.getAllTracksForDiscover()
              ]);

              // Gộp 2 danh sách
              const allTracksList = [
                ...(mostPlayedResponse || []),
                ...(allTracksResponse || [])
              ];

              // Loại bỏ duplicate dựa trên ID
              const uniqueTracks = allTracksList.filter((track, index, self) => 
                index === self.findIndex(t => t.id === track.id)
              );

              // Sắp xếp theo title từ A-Z
              const sortedTracks = uniqueTracks.sort((a, b) => 
                (a.title || '').toLowerCase().localeCompare((b.title || '').toLowerCase())
              );

              setTracks(sortedTracks);
              setTotalPages(Math.ceil(sortedTracks.length / ITEMS_PER_PAGE));
              setLoading(false);
              return; // Return early để không chạy code bên dưới
            } catch (error) {
              console.error('Error fetching combined tracks:', error);
              // Fallback to just all tracks if there's an error
              response = await trackService.getAllTracksForDiscover();
            }
            break;
          case 1: // Most Played - 50 tracks from database
            response = await trackService.getMostPlayedTracks();
            break;
          default:
            response = await trackService.getAllTracks();
        }
        
        // Set tracks and calculate total pages for non-All Tracks tabs
        if (currentTab !== 0) {
          if (response && Array.isArray(response)) {
            setTracks(response);
            setTotalPages(Math.ceil(response.length / ITEMS_PER_PAGE));
          } else if (response && response.content) {
            setTracks(response.content);
            setTotalPages(response.totalPages || Math.ceil(response.content.length / ITEMS_PER_PAGE));
          } else {
            setTracks([]);
            setTotalPages(1);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tracks:', err);
        setError('Failed to load tracks. Please try again later.');
        setLoading(false);
      }
    };

    fetchTracks();
  }, [currentTab]);
  
  // Apply search and filters
  const applySearch = async () => {
    try {
      setLoading(true);
      
      // Lấy userId từ localStorage
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      
      // Nếu không có filter nào, fetch lại tracks theo tab hiện tại
      if (!searchQuery && selectedGenres.length === 0 && minRating === 0 && !artistFilter) {
        const fetchTracks = async () => {
          let response;
          
          switch(currentTab) {
            case 0: // All Tracks
              try {
                // Gọi đồng thời 2 API (removed top rated)
                const [mostPlayedResponse, allTracksResponse] = await Promise.all([
                  trackService.getMostPlayedTracks(),
                  trackService.getAllTracksForDiscover()
                ]);

                // Gộp 2 danh sách
                const allTracksList = [
                  ...(mostPlayedResponse || []),
                  ...(allTracksResponse || [])
                ];

                // Loại bỏ duplicate dựa trên ID
                const uniqueTracks = allTracksList.filter((track, index, self) => 
                  index === self.findIndex(t => t.id === track.id)
                );

                // Sắp xếp theo title từ A-Z
                const sortedTracks = uniqueTracks.sort((a, b) => 
                  (a.title || '').toLowerCase().localeCompare((b.title || '').toLowerCase())
                );

                setTracks(sortedTracks);
                setTotalPages(Math.ceil(sortedTracks.length / ITEMS_PER_PAGE));
                setLoading(false);
                return;
              } catch (error) {
                console.error('Error fetching combined tracks:', error);
                response = await trackService.getAllTracksForDiscover();
              }
              break;
            case 1: // Most Played
              response = await trackService.getMostPlayedTracks();
              break;
            default:
              response = await trackService.getAllTracks();
          }
          
          if (response && Array.isArray(response)) {
            setTracks(response);
            setTotalPages(Math.ceil(response.length / ITEMS_PER_PAGE));
          } else if (response && response.content) {
            setTracks(response.content);
            setTotalPages(response.totalPages || Math.ceil(response.content.length / ITEMS_PER_PAGE));
          } else {
            setTracks([]);
            setTotalPages(1);
          }
          
          setLoading(false);
        };
        
        await fetchTracks();
        return;
      }
      
      // Nếu có filter, lấy tất cả tracks để filter
      let allTracks = [];
      
      switch(currentTab) {
        case 0: // All Tracks
          try {
            // Gọi đồng thời 2 API (removed top rated)
            const [mostPlayedResponse, allTracksResponse] = await Promise.all([
              trackService.getMostPlayedTracks(),
              trackService.getAllTracksForDiscover()
            ]);

            // Gộp 2 danh sách
            const allTracksList = [
              ...(mostPlayedResponse || []),
              ...(allTracksResponse || [])
            ];

            // Loại bỏ duplicate dựa trên ID
            allTracks = allTracksList.filter((track, index, self) => 
              index === self.findIndex(t => t.id === track.id)
            );
          } catch (error) {
            console.error('Error fetching combined tracks:', error);
            const response = await trackService.getAllTracksForDiscover();
            allTracks = response || [];
          }
          break;
        case 1: // Most Played
          const response = await trackService.getMostPlayedTracks();
          allTracks = response || [];
          break;
        default:
          const defaultResponse = await trackService.getAllTracks();
          allTracks = defaultResponse?.content || [];
      }
      
      // Apply filters
      let filteredTracks = allTracks;
      
      // Search filter
      if (searchQuery) {
        filteredTracks = filteredTracks.filter(track =>
          (track.title && track.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (track.artist && track.artist.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (track.album && track.album.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (track.genre && track.genre.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      // Genre filter
      if (selectedGenres.length > 0) {
        filteredTracks = filteredTracks.filter(track =>
          track.genre && selectedGenres.some(genre => 
            track.genre.toLowerCase().includes(genre.toLowerCase())
          )
        );
      }
      
      // Rating filter
      if (minRating > 0) {
        filteredTracks = filteredTracks.filter(track =>
          (track.rating || 0) >= minRating
        );
      }
      
      // Artist filter
      if (artistFilter) {
        filteredTracks = filteredTracks.filter(track =>
          track.artist && track.artist.toLowerCase().includes(artistFilter.toLowerCase())
        );
      }
      
      // Apply sorting
      switch(sortOption.value) {
        case 'latest':
          filteredTracks.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          break;
        case 'oldest':
          filteredTracks.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
          break;
        case 'popular':
          filteredTracks.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
          break;
        case 'rating':
          filteredTracks.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'title':
          filteredTracks.sort((a, b) => (a.title || '').toLowerCase().localeCompare((b.title || '').toLowerCase()));
          break;
        case 'title_desc':
          filteredTracks.sort((a, b) => (b.title || '').toLowerCase().localeCompare((a.title || '').toLowerCase()));
          break;
        default:
          // For Most Played tab, always sort by playCount DESC if no specific sort is selected
          if (currentTab === 1) {
            filteredTracks.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
          }
          break;
      }
      
      setTracks(filteredTracks);
      setTotalPages(Math.ceil(filteredTracks.length / ITEMS_PER_PAGE));
      setPage(1); // Reset to first page
      setLoading(false);
    } catch (error) {
      console.error('Error applying search/filters:', error);
      setError('Failed to apply filters. Please try again.');
      setLoading(false);
    }
  };
  
  // Handle search - với debounce
  useEffect(() => {
    // Clear any existing timeout
    const debounceTimeout = setTimeout(() => {
      if (searchQuery.trim()) {
        console.log('Search query changed, applying search with debounce');
        applySearch();
      } else if (searchQuery === '' && tracks.length > 0) {
        // Nếu xóa query, fetch lại tracks theo tab hiện tại
        console.log('Search query cleared, fetching tracks based on current tab');
        // Nếu vẫn còn filter khác, vẫn áp dụng search
        if (selectedGenres.length > 0 || minRating > 0 || artistFilter) {
          applySearch();
        } else {
          // Nếu không còn filter nào, fetch theo tab
          const fetchTracks = async () => {
            try {
              setLoading(true);
              let response;
              
              // Lấy userId từ localStorage để truyền vào API calls
              const userId = JSON.parse(localStorage.getItem('user'))?.id;
              
              switch(currentTab) {
                case 0: // All Tracks - Gộp most played và tất cả tracks
                  try {
                    // Gọi đồng thời 2 API (removed top rated)
                    const [mostPlayedResponse, allTracksResponse] = await Promise.all([
                      trackService.getMostPlayedTracks(),
                      trackService.getAllTracksForDiscover()
                    ]);

                    // Gộp 2 danh sách
                    const allTracksList = [
                      ...(mostPlayedResponse || []),
                      ...(allTracksResponse || [])
                    ];

                    // Loại bỏ duplicate dựa trên ID
                    const uniqueTracks = allTracksList.filter((track, index, self) => 
                      index === self.findIndex(t => t.id === track.id)
                    );

                    // Sắp xếp theo title từ A-Z
                    const sortedTracks = uniqueTracks.sort((a, b) => 
                      (a.title || '').toLowerCase().localeCompare((b.title || '').toLowerCase())
                    );

                    setTracks(sortedTracks);
                    setTotalPages(Math.ceil(sortedTracks.length / ITEMS_PER_PAGE));
                    setLoading(false);
                    return;
                  } catch (error) {
                    console.error('Error fetching combined tracks:', error);
                    response = await trackService.getAllTracksForDiscover();
                  }
                  break;
                case 1: // Most Played
                  response = await trackService.getMostPlayedTracks();
                  break;
                default:
                  response = await trackService.getAllTracks();
              }
              
              console.log('Fetched tracks for tab:', currentTab, response);
              
              // Set tracks and calculate total pages
              if (response && Array.isArray(response)) {
                setTracks(response);
                setTotalPages(Math.ceil(response.length / ITEMS_PER_PAGE));
              } else if (response && response.content) {
                setTracks(response.content);
                setTotalPages(response.totalPages || Math.ceil(response.content.length / ITEMS_PER_PAGE));
              } else {
                setTracks([]);
                setTotalPages(1);
              }
              
              setLoading(false);
            } catch (err) {
              console.error('Error fetching tracks:', err);
              setError('Failed to load tracks. Please try again later.');
              setLoading(false);
            }
          };
          
          fetchTracks();
        }
      }
    }, 500);
    
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, currentTab]);
  
  // Xử lý khi thay đổi filter
  useEffect(() => {
    // Skip the initial render
    if (isFilterInitialRender.current) {
      isFilterInitialRender.current = false;
      return;
    }
    
    // Chỉ gọi API khi có filter được áp dụng và không phải lần render đầu tiên
    if (selectedGenres.length > 0 || minRating > 0 || artistFilter) {
      console.log('Filters changed, applying search');
      applySearch();
    }
  }, [selectedGenres, minRating, artistFilter, sortOption]);
  
  // Cập nhật khi thay đổi trang
  useEffect(() => {
    // Skip the initial render
    if (isPageInitialRender.current) {
      isPageInitialRender.current = false;
      return;
    }
    
    console.log('Page changed to', page, 'applying search');
    applySearch();
  }, [page]);
  
  // Handlers for filter and sort
  const handleOpenFilter = () => {
    setFilterOpen(true);
  };

  const handleCloseFilter = () => {
    setFilterOpen(false);
  };

  const handleApplyFilter = () => {
    applySearch();
    handleCloseFilter();
  };

  const handleClearFilter = () => {
    setSelectedGenres([]);
    setMinRating(0);
    setArtistFilter('');
    handleCloseFilter();
  };

  const handleOpenSortMenu = (event) => {
    setSortMenuAnchor(event.currentTarget);
  };

  const handleCloseSortMenu = () => {
    setSortMenuAnchor(null);
  };

  const handleSelectSortOption = (option) => {
    setSortOption(option);
    handleCloseSortMenu();
  };
  
  const handlePlayTrack = (track) => {
    if (currentTrack && currentTrack.id === track.id) {
      if (isPlaying) {
        pauseTrack();
      } else {
        resumeTrack();
      }
    } else {
      playTrack(track);
    }
  };

  const handleLikeTrack = async (trackId) => {
    if (!isAuthenticated) {
      toast.error('Please log in to like tracks');
      return;
    }
    
    try {
      await trackService.toggleLike(trackId);
      toast.success('Track added to your favorites');
      
      // Update the local state to reflect the change
      setTracks(tracks.map(track => 
        track.id === trackId 
          ? { ...track, isLiked: !track.isLiked }
          : track
      ));
    } catch (err) {
      console.error('Error liking track:', err);
      toast.error('Failed to like track');
    }
  };

  const handleAddToPlaylist = (track) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add tracks to playlists');
      return;
    }
    
    // Here you would typically open a modal to select a playlist
    toast.success('Add to playlist feature coming soon!');
  };

  const handleShareTrack = (track) => {
    setTrackToShare(track);
    setShareModalOpen(true);
  };

  const handleAddToQueue = (track) => {
    const success = addToQueue(track);
    if (success) {
      toast.success(`Added "${track.title}" to queue`);
    }
  };

  const handlePlayAll = (tracks) => {
    if (tracks && tracks.length > 0) {
      playAllTracks(tracks);
      toast.success('Playing all tracks');
    } else {
      toast.error('No tracks available to play');
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCurrentPageTracks = () => {
    // Nếu API đã hỗ trợ phân trang, trả về toàn bộ tracks
    if (tracks.length <= ITEMS_PER_PAGE) return tracks;
    
    // Ngược lại, thực hiện phân trang phía client
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return tracks.slice(startIndex, endIndex);
  };

  const renderTrackCard = (track, index) => {
    const isCurrentlyPlaying = currentTrack && currentTrack.id === track.id && isPlaying;
    
    return (
      <Grid item xs={12} sm={6} md={4} lg={3} key={track.id || index}>
        <Card sx={{ 
          borderRadius: 2,
          background: 'linear-gradient(145deg, #1e1e2e, #2a2a40)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)'
          }
        }}>
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height="180"
              image={track.imageUrl || 'https://source.unsplash.com/random/300x300/?music'}
              alt={track.title}
              sx={{ objectFit: 'cover' }}
            />
            <IconButton 
              sx={{ 
                position: 'absolute', 
                bottom: 8, 
                right: 8,
                background: 'rgba(0,0,0,0.6)',
                '&:hover': { background: 'rgba(29, 185, 84, 0.8)' }
              }}
              onClick={() => handlePlayTrack(track)}
            >
              {isCurrentlyPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
          </Box>
          
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                color: 'white',
                fontWeight: 'bold',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
              onClick={() => navigate(`/track/${track.id}`)}
            >
              {track.title}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                color: '#b3b3b3',
                mb: 1,
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}
            >
              {track.artist}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'inline-block',
                background: 'rgba(29, 185, 84, 0.2)',
                color: '#1db954',
                padding: '3px 8px',
                borderRadius: 10,
                fontSize: '0.7rem'
              }}
            >
              {track.genre}
            </Typography>
          </CardContent>
          
          <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
            <Box>
              <IconButton 
                size="small" 
                onClick={() => handleLikeTrack(track.id)}
                sx={{ color: track.isLiked ? '#ec4899' : 'white' }}
              >
                {track.isLiked ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
              
              <IconButton 
                size="small" 
                onClick={() => handleAddToQueue(track)}
                sx={{ color: 'white' }}
                title="Add to queue"
              >
                <PlaylistAdd />
              </IconButton>
            </Box>
            <IconButton 
              size="small" 
              onClick={() => handleShareTrack(track)}
              sx={{ color: 'white' }}
            >
              <Share />
            </IconButton>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  // Render skeleton loaders
  const renderSkeletons = (count) => {
    return Array(count).fill(0).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={`skeleton-${index}`}>
        <Card sx={{ 
          borderRadius: 2,
          background: 'linear-gradient(145deg, #1e1e2e, #2a2a40)',
          height: '100%',
        }}>
          <Skeleton variant="rectangular" height={180} animation="wave" />
          <CardContent>
            <Skeleton variant="text" width="80%" height={28} animation="wave" />
            <Skeleton variant="text" width="60%" height={20} animation="wave" />
            <Skeleton variant="text" width="40%" height={20} animation="wave" />
          </CardContent>
          <CardActions sx={{ px: 2, pb: 2 }}>
            <Skeleton variant="circular" width={30} height={30} animation="wave" />
            <Skeleton variant="circular" width={30} height={30} animation="wave" />
            <Box sx={{ flexGrow: 1 }} />
            <Skeleton variant="circular" width={30} height={30} animation="wave" />
          </CardActions>
        </Card>
      </Grid>
    ));
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
          Discover Music 🌟
        </Typography>
        <Typography variant="h6" sx={{ color: '#b3b3b3' }}>
          Find trending tracks and new releases
        </Typography>
      </Box>
      
      {/* Search and filter bar */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2
      }}>
        <TextField
          placeholder="Search tracks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          sx={{
            maxWidth: { xs: '100%', sm: 320 },
            width: '100%',
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 3,
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
              '&.Mui-focused': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1db954',
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
              </InputAdornment>
            ),
          }}
        />
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<PlaylistPlay />}
            sx={{
              bgcolor: '#1db954',
              '&:hover': { bgcolor: '#0f9d58' }
            }}
            onClick={() => handlePlayAll(tracks)}
            disabled={loading || tracks.length === 0}
          >
            Play All
          </Button>
          
          {/* Sắp xếp */}
          <Chip 
            icon={<SortIcon />} 
            label={sortOption.label}
            variant="outlined" 
            onClick={handleOpenSortMenu}
            sx={{
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }
            }}
          />
          
          {/* Menu Sắp xếp */}
          <Menu
            anchorEl={sortMenuAnchor}
            open={Boolean(sortMenuAnchor)}
            onClose={handleCloseSortMenu}
            PaperProps={{
              sx: {
                bgcolor: '#282828',
                color: 'white',
                minWidth: 200,
                boxShadow: '0 8px 16px rgba(0,0,0,0.5)'
              }
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <MenuItem 
                key={option.value} 
                selected={option.value === sortOption.value}
                onClick={() => handleSelectSortOption(option)}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: 'rgba(29, 185, 84, 0.1)',
                  },
                  '&.Mui-selected:hover': {
                    bgcolor: 'rgba(29, 185, 84, 0.2)',
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                  }
                }}
              >
                {option.label}
                {option.value === sortOption.value && (
                  <CheckIcon fontSize="small" sx={{ ml: 1, color: '#1db954' }} />
                )}
              </MenuItem>
            ))}
          </Menu>
          
          {/* Lọc */}
          <Chip 
            icon={<FilterIcon />} 
            label={selectedGenres.length > 0 || minRating > 0 || artistFilter ? "Filters Active" : "Filter"}
            variant="outlined"
            onClick={handleOpenFilter}
            sx={{ 
              color: 'white',
              borderColor: selectedGenres.length > 0 || minRating > 0 || artistFilter ? '#1db954' : 'rgba(255, 255, 255, 0.2)',
              backgroundColor: selectedGenres.length > 0 || minRating > 0 || artistFilter ? 'rgba(29, 185, 84, 0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: selectedGenres.length > 0 || minRating > 0 || artistFilter ? 'rgba(29, 185, 84, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              }
            }} 
          />
        </Box>
      </Box>
      
      {/* Hiển thị filter đang áp dụng */}
      {(selectedGenres.length > 0 || minRating > 0 || artistFilter) && (
        <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ color: '#b3b3b3', mr: 1 }}>
            Active filters:
          </Typography>
          
          {selectedGenres.map(genre => (
            <Chip
              key={genre}
              label={genre}
              size="small"
              onDelete={() => setSelectedGenres(prev => prev.filter(g => g !== genre))}
              sx={{
                bgcolor: 'rgba(29, 185, 84, 0.1)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(29, 185, 84, 0.2)' }
              }}
            />
          ))}
          
          {minRating > 0 && (
            <Chip
              label={`Min Rating: ${minRating}⭐`}
              size="small"
              onDelete={() => setMinRating(0)}
              sx={{
                bgcolor: 'rgba(29, 185, 84, 0.1)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(29, 185, 84, 0.2)' }
              }}
            />
          )}
          
          {artistFilter && (
            <Chip
              label={`Artist: ${artistFilter}`}
              size="small"
              onDelete={() => setArtistFilter('')}
              sx={{
                bgcolor: 'rgba(29, 185, 84, 0.1)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(29, 185, 84, 0.2)' }
              }}
            />
          )}
          
          <Chip
            label="Clear All"
            size="small"
            onClick={handleClearFilter}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
            }}
          />
        </Box>
      )}
      
      {/* Filter Dialog */}
      <Dialog 
        open={filterOpen} 
        onClose={handleCloseFilter}
        PaperProps={{
          sx: {
            bgcolor: '#282828',
            color: 'white',
            minWidth: { xs: '90%', sm: 500 },
            maxWidth: { xs: '90%', sm: 500 },
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          pb: 2
        }}>
          <Typography variant="h6">Filter Tracks</Typography>
          <IconButton onClick={handleCloseFilter} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ py: 3 }}>
          {/* Genre Filter */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Genres</Typography>
            <Autocomplete
              multiple
              options={GENRES}
              value={selectedGenres}
              onChange={(e, newValue) => setSelectedGenres(newValue)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  placeholder="Select genres" 
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1db954',
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: 'white'
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'rgba(255, 255, 255, 0.7)'
                    }
                  }}
                />
              )}
              sx={{
                '& .MuiChip-root': {
                  bgcolor: 'rgba(29, 185, 84, 0.1)',
                  color: 'white',
                  '& .MuiChip-deleteIcon': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                      color: 'white'
                    }
                  }
                }
              }}
            />
          </Box>
          
          {/* Artist Filter */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Artist</Typography>
            <TextField
              fullWidth
              placeholder="Enter artist name"
              value={artistFilter}
              onChange={(e) => setArtistFilter(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1db954',
                  }
                }
              }}
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Button 
            onClick={handleClearFilter}
            sx={{ color: 'white' }}
          >
            Clear All
          </Button>
          <Button 
            variant="contained"
            onClick={handleApplyFilter}
            sx={{ bgcolor: '#1db954', '&:hover': { bgcolor: '#0f9d58' } }}
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Category tabs */}
      <Tabs 
        value={currentTab} 
        onChange={handleTabChange} 
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 4,
          '& .MuiTabs-indicator': {
            backgroundColor: '#1db954',
          },
          '& .MuiTab-root': {
            color: 'rgba(255, 255, 255, 0.7)',
            '&.Mui-selected': {
              color: '#1db954',
            }
          }
        }}
      >
        <Tab label="All Tracks" />
        <Tab label="Most Played (Top 50)" />
      </Tabs>
      
      {error && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="error">{error}</Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2, bgcolor: '#1db954', '&:hover': { bgcolor: '#0f9d58' } }}
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Box>
      )}
      
      {/* Display empty state if no results */}
      {!loading && tracks.length === 0 && !error && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>No tracks found</Typography>
          <Typography variant="body1" sx={{ color: '#b3b3b3', mb: 3 }}>
            Try adjusting your search or filters to find what you're looking for.
          </Typography>
          <Button 
            variant="outlined" 
            onClick={handleClearFilter}
            sx={{ 
              color: 'white', 
              borderColor: 'rgba(255, 255, 255, 0.3)',
              '&:hover': { borderColor: 'white', bgcolor: 'rgba(255, 255, 255, 0.05)' }
            }}
          >
            Clear Filters
          </Button>
        </Box>
      )}
      
      {/* Track grid */}
      <Grid container spacing={3}>
        {loading ? 
          renderSkeletons(ITEMS_PER_PAGE) : 
          getCurrentPageTracks().map(renderTrackCard)
        }
      </Grid>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            sx={{
              '& .MuiPaginationItem-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-selected': {
                  bgcolor: 'rgba(29, 185, 84, 0.2)',
                  color: '#1db954',
                  '&:hover': {
                    bgcolor: 'rgba(29, 185, 84, 0.3)',
                  }
                },
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                }
              }
            }}
          />
        </Box>
      )}
      
      {/* Share Modal */}
      <ShareModal 
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        item={trackToShare}
        type="track"
      />
    </Container>
  );
};

export default Discover; 