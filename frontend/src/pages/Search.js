import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Grid, 
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon, TravelExplore } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import TrackCard from '../components/TrackCard';
import ArtistCard from '../components/ArtistCard';
import { searchTracks, searchArtists, searchAlbums } from '../services/api';
import AlbumCard from '../components/AlbumCard';

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ tracks: [], artists: [], albums: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [sortBy, setSortBy] = useState('relevance');

  // Lấy query từ URL khi component mount hoặc URL thay đổi
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [location.search]);

  const performSearch = async (query) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      // Thực hiện tìm kiếm đồng thời trên cả 3 loại dữ liệu
      const [trackResults, artistResults, albumResults] = await Promise.all([
        searchTracks(query),
        searchArtists(query),
        searchAlbums(query)
      ]);
      
      setSearchResults({
        tracks: trackResults || [],
        artists: artistResults || [],
        albums: albumResults || []
      });
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error);
      // Fallback khi API lỗi - có thể thay đổi theo cách xử lý lỗi của bạn
      setSearchResults({ tracks: [], artists: [], albums: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults({ tracks: [], artists: [], albums: [] });
    navigate('/search');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    // Thực hiện sắp xếp kết quả dựa trên giá trị mới
    // Đây là logic giả định, bạn cần điều chỉnh theo cách API của bạn hỗ trợ sắp xếp
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  // Lấy danh sách kết quả dựa trên tab đang active
  const getResultsByTab = () => {
    switch (activeTab) {
      case 0: // All Results
        return {
          tracks: searchResults.tracks.slice(0, 6),
          artists: searchResults.artists.slice(0, 4),
          albums: searchResults.albums.slice(0, 4)
        };
      case 1: // Tracks
        return { 
          tracks: searchResults.tracks,
          artists: [],
          albums: []
        };
      case 2: // Artists
        return {
          tracks: [],
          artists: searchResults.artists,
          albums: []
        };
      case 3: // Albums
        return {
          tracks: [],
          artists: [],
          albums: searchResults.albums
        };
      default:
        return searchResults;
    }
  };

  const results = getResultsByTab();
  const hasResults = results.tracks.length > 0 || results.artists.length > 0 || results.albums.length > 0;
  const hasQuery = searchQuery.trim().length > 0;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
          Search Music 🔍
        </Typography>
        <Typography variant="h6" sx={{ color: '#b3b3b3', mb: 3 }}>
          Find your favorite tracks, artists, and albums
        </Typography>

        {/* Search Form */}
        <Box 
          component="form" 
          onSubmit={handleSearchSubmit}
          sx={{ 
            width: '100%', 
            maxWidth: 800,
            position: 'relative',
            mb: 4
          }}
        >
          <TextField
            fullWidth
            placeholder="Search for songs, artists, or albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 3,
                height: 56,
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
                  <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 24 }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton 
                    edge="end" 
                    onClick={handleClearSearch}
                    sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress sx={{ color: '#1db954' }} />
        </Box>
      ) : hasQuery ? (
        hasResults ? (
          <Box>
            {/* Filter và Sort Options */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                sx={{
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#1db954',
                  },
                  '& .MuiTab-root': {
                    color: '#b3b3b3',
                    '&.Mui-selected': {
                      color: '#1db954',
                    }
                  }
                }}
              >
                <Tab label="All" />
                <Tab label={`Tracks (${searchResults.tracks.length})`} />
                <Tab label={`Artists (${searchResults.artists.length})`} />
                <Tab label={`Albums (${searchResults.albums.length})`} />
              </Tabs>

              <FormControl 
                variant="outlined" 
                size="small"
                sx={{ 
                  minWidth: 150,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '& .MuiInputLabel-root': {
                    color: '#b3b3b3',
                  },
                  '& .MuiSelect-icon': {
                    color: '#b3b3b3',
                  }
                }}
              >
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={handleSortChange}
                  label="Sort By"
                >
                  <MenuItem value="relevance">Relevance</MenuItem>
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="popularity">Popularity</MenuItem>
                  <MenuItem value="a-z">A-Z</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Search Results */}
            {activeTab === 0 && (
              <>
                {/* All Results Section */}
                {results.tracks.length > 0 && (
                  <Box sx={{ mb: 5 }}>
                    <Box sx={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2
                    }}>
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                        Tracks
                      </Typography>
                      {searchResults.tracks.length > 6 && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#1db954', 
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                          onClick={() => setActiveTab(1)}
                        >
                          See all tracks
                        </Typography>
                      )}
                    </Box>
                    <Grid container spacing={2}>
                      {results.tracks.map(track => (
                        <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={track.id}>
                          <TrackCard track={track} />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {results.artists.length > 0 && (
                  <Box sx={{ mb: 5 }}>
                    <Box sx={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2
                    }}>
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                        Artists
                      </Typography>
                      {searchResults.artists.length > 4 && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#1db954', 
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                          onClick={() => setActiveTab(2)}
                        >
                          See all artists
                        </Typography>
                      )}
                    </Box>
                    <Grid container spacing={3}>
                      {results.artists.map(artist => (
                        <Grid item xs={6} sm={4} md={3} key={artist.id}>
                          <ArtistCard artist={artist} />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {results.albums.length > 0 && (
                  <Box sx={{ mb: 5 }}>
                    <Box sx={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2
                    }}>
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                        Albums
                      </Typography>
                      {searchResults.albums.length > 4 && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#1db954', 
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                          onClick={() => setActiveTab(3)}
                        >
                          See all albums
                        </Typography>
                      )}
                    </Box>
                    <Grid container spacing={3}>
                      {results.albums.map(album => (
                        <Grid item xs={6} sm={4} md={3} key={album.id}>
                          <AlbumCard album={album} />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </>
            )}

            {activeTab === 1 && results.tracks.length > 0 && (
              <Box>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, mb: 3 }}>
                  Tracks
                </Typography>
                <Grid container spacing={2}>
                  {results.tracks.map(track => (
                    <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={track.id}>
                      <TrackCard track={track} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {activeTab === 2 && results.artists.length > 0 && (
              <Box>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, mb: 3 }}>
                  Artists
                </Typography>
                <Grid container spacing={3}>
                  {results.artists.map(artist => (
                    <Grid item xs={6} sm={4} md={3} key={artist.id}>
                      <ArtistCard artist={artist} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {activeTab === 3 && results.albums.length > 0 && (
              <Box>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, mb: 3 }}>
                  Albums
                </Typography>
                <Grid container spacing={3}>
                  {results.albums.map(album => (
                    <Grid item xs={6} sm={4} md={3} key={album.id}>
                      <AlbumCard album={album} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h4" sx={{ color: '#b3b3b3', mb: 2 }}>
              No results found for "{searchQuery}"
            </Typography>
            <Typography variant="body1" sx={{ color: '#b3b3b3', maxWidth: 600, mx: 'auto' }}>
              Try different keywords or check your spelling
            </Typography>
          </Box>
        )
      ) : (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h4" sx={{ color: '#1db954', mb: 2 }}>
            🎵 Discover New Music
          </Typography>
          <Typography variant="body1" sx={{ color: '#b3b3b3', maxWidth: 600, mx: 'auto' }}>
            Use the search bar above to find tracks, artists, albums, and more. 
            Your next favorite song is just a search away!
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Search; 