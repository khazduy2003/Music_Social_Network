import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if user was already authenticated (has token)
    // For login failures, let the component handle the error
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock Data cho chức năng tìm kiếm (sẽ thay thế bằng API thực tế sau)
const mockTracks = [
  {
    id: '1',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    artistId: 'artist1',
    album: 'Divide',
    albumId: 'album1',
    duration: 235,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    genre: 'Pop',
    releaseDate: '2017-01-06',
    popularity: 9.8,
    rating: 4.9
  },
  {
    id: '2',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    artistId: 'artist2',
    album: 'After Hours',
    albumId: 'album2',
    duration: 200,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    genre: 'R&B',
    releaseDate: '2019-11-29',
    popularity: 9.5,
    rating: 4.8
  },
  {
    id: '3',
    title: 'Bad Guy',
    artist: 'Billie Eilish',
    artistId: 'artist3',
    album: 'When We All Fall Asleep, Where Do We Go?',
    albumId: 'album3',
    duration: 194,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273d55bc5760914c290e658a072',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    genre: 'Alternative',
    releaseDate: '2019-03-29',
    popularity: 9.3,
    rating: 4.7
  },
  {
    id: '4',
    title: 'Uptown Funk',
    artist: 'Mark Ronson ft. Bruno Mars',
    artistId: 'artist4',
    album: 'Uptown Special',
    albumId: 'album4',
    duration: 270,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273e419ccba0baa8bd3f3d7abf2',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    genre: 'Funk',
    releaseDate: '2014-11-10',
    popularity: 9.2,
    rating: 4.6
  },
  {
    id: '5',
    title: 'Someone Like You',
    artist: 'Adele',
    artistId: 'artist5',
    album: '21',
    albumId: 'album5',
    duration: 285,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273295d32aaf86d6f878e800308',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    genre: 'Pop',
    releaseDate: '2011-01-24',
    popularity: 9.0,
    rating: 4.8
  }
];

const mockArtists = [
  {
    id: 'artist1',
    name: 'Ed Sheeran',
    imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb12a2ef08d00dd7451a6dbed6',
    genre: 'Pop',
    popularity: 9.8,
    bio: 'Edward Christopher Sheeran is an English singer-songwriter.'
  },
  {
    id: 'artist2',
    name: 'The Weeknd',
    imageUrl: 'https://i.scdn.co/image/ab6761610000e5ebfc9d2abc85b6f4bef77f80ea',
    genre: 'R&B',
    popularity: 9.7,
    bio: 'Abel Makkonen Tesfaye, known professionally as the Weeknd, is a Canadian singer and songwriter.'
  },
  {
    id: 'artist3',
    name: 'Billie Eilish',
    imageUrl: 'https://i.scdn.co/image/ab6761610000e5ebd8b9980db67272cb4d2c3daf',
    genre: 'Alternative',
    popularity: 9.5,
    bio: 'Billie Eilish Pirate Baird O\'Connell is an American singer and songwriter.'
  },
  {
    id: 'artist5',
    name: 'Adele',
    imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb68f6e5892075d7f22615bd17',
    genre: 'Pop',
    popularity: 9.6,
    bio: 'Adele Laurie Blue Adkins MBE is an English singer-songwriter.'
  }
];

const mockAlbums = [
  {
    id: 'album1',
    title: 'Divide',
    artist: 'Ed Sheeran',
    artistId: 'artist1',
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96',
    releaseDate: '2017-03-03',
    genre: 'Pop',
    popularity: 9.6,
    trackCount: 16
  },
  {
    id: 'album2',
    title: 'After Hours',
    artist: 'The Weeknd',
    artistId: 'artist2',
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
    releaseDate: '2020-03-20',
    genre: 'R&B',
    popularity: 9.5,
    trackCount: 14
  },
  {
    id: 'album3',
    title: 'When We All Fall Asleep, Where Do We Go?',
    artist: 'Billie Eilish',
    artistId: 'artist3',
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273d55bc5760914c290e658a072',
    releaseDate: '2019-03-29',
    genre: 'Alternative',
    popularity: 9.4,
    trackCount: 14
  },
  {
    id: 'album5',
    title: '21',
    artist: 'Adele',
    artistId: 'artist5',
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273295d32aaf86d6f878e800308',
    releaseDate: '2011-01-24',
    genre: 'Pop',
    popularity: 9.7,
    trackCount: 11
  }
];

// Hàm tìm kiếm bài hát
export const searchTracks = async (query, options = {}) => {
  try {
    // Thử gọi API thực tế
    // const response = await api.get(`/search/tracks?q=${encodeURIComponent(query)}`);
    // return response.data;
    
    // Mô phỏng trễ mạng
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Tìm kiếm trong dữ liệu giả lập
    const queryLower = query.toLowerCase();
    let results = mockTracks.filter(track => 
      track.title.toLowerCase().includes(queryLower) ||
      track.artist.toLowerCase().includes(queryLower) ||
      track.album?.toLowerCase().includes(queryLower) ||
      track.genre.toLowerCase().includes(queryLower)
    );
    
    // Áp dụng các filter từ options (nếu có)
    if (options.genre) {
      results = results.filter(track => 
        track.genre.toLowerCase() === options.genre.toLowerCase()
      );
    }
    
    if (options.artist) {
      results = results.filter(track => 
        track.artist.toLowerCase().includes(options.artist.toLowerCase()) ||
        track.artistId === options.artist
      );
    }
    
    if (options.minRating) {
      results = results.filter(track => 
        track.rating >= options.minRating
      );
    }
    
    // Sắp xếp kết quả
    if (options.sortBy) {
      switch (options.sortBy) {
        case 'newest':
          results.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
          break;
        case 'popularity':
          results.sort((a, b) => b.popularity - a.popularity);
          break;
        case 'a-z':
          results.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'relevance':
        default:
          // Relevance: items với query trong title được ưu tiên hơn
          results.sort((a, b) => {
            const aInTitle = a.title.toLowerCase().includes(queryLower);
            const bInTitle = b.title.toLowerCase().includes(queryLower);
            if (aInTitle && !bInTitle) return -1;
            if (!aInTitle && bInTitle) return 1;
            return b.popularity - a.popularity;
          });
          break;
      }
    }
    
    console.log(`[Search API] Found ${results.length} tracks for query "${query}"`);
    return results;
  } catch (error) {
    console.error('Error searching tracks:', error);
    return [];
  }
};

// Hàm tìm kiếm nghệ sĩ
export const searchArtists = async (query, options = {}) => {
  try {
    // Thử gọi API thực tế
    // const response = await api.get(`/search/artists?q=${encodeURIComponent(query)}`);
    // return response.data;
    
    // Mô phỏng trễ mạng
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Tìm kiếm trong dữ liệu giả lập
    const queryLower = query.toLowerCase();
    let results = mockArtists.filter(artist => 
      artist.name.toLowerCase().includes(queryLower) ||
      artist.genre.toLowerCase().includes(queryLower)
    );
    
    // Áp dụng các filter từ options (nếu có)
    if (options.genre) {
      results = results.filter(artist => 
        artist.genre.toLowerCase() === options.genre.toLowerCase()
      );
    }
    
    // Sắp xếp kết quả
    if (options.sortBy) {
      switch (options.sortBy) {
        case 'popularity':
          results.sort((a, b) => b.popularity - a.popularity);
          break;
        case 'a-z':
          results.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'relevance':
        default:
          // Ưu tiên theo mức độ trùng khớp và độ phổ biến
          results.sort((a, b) => {
            const aNameMatch = a.name.toLowerCase().includes(queryLower);
            const bNameMatch = b.name.toLowerCase().includes(queryLower);
            if (aNameMatch && !bNameMatch) return -1;
            if (!aNameMatch && bNameMatch) return 1;
            return b.popularity - a.popularity;
          });
          break;
      }
    }
    
    console.log(`[Search API] Found ${results.length} artists for query "${query}"`);
    return results;
  } catch (error) {
    console.error('Error searching artists:', error);
    return [];
  }
};

// Hàm tìm kiếm album
export const searchAlbums = async (query, options = {}) => {
  try {
    // Thử gọi API thực tế
    // const response = await api.get(`/search/albums?q=${encodeURIComponent(query)}`);
    // return response.data;
    
    // Mô phỏng trễ mạng
    await new Promise(resolve => setTimeout(resolve, 550));
    
    // Tìm kiếm trong dữ liệu giả lập
    const queryLower = query.toLowerCase();
    let results = mockAlbums.filter(album => 
      album.title.toLowerCase().includes(queryLower) ||
      album.artist.toLowerCase().includes(queryLower) ||
      album.genre.toLowerCase().includes(queryLower)
    );
    
    // Áp dụng các filter từ options (nếu có)
    if (options.genre) {
      results = results.filter(album => 
        album.genre.toLowerCase() === options.genre.toLowerCase()
      );
    }
    
    if (options.artist) {
      results = results.filter(album => 
        album.artist.toLowerCase().includes(options.artist.toLowerCase()) ||
        album.artistId === options.artist
      );
    }
    
    // Sắp xếp kết quả
    if (options.sortBy) {
      switch (options.sortBy) {
        case 'newest':
          results.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
          break;
        case 'popularity':
          results.sort((a, b) => b.popularity - a.popularity);
          break;
        case 'a-z':
          results.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'relevance':
        default:
          // Ưu tiên theo mức độ trùng khớp và ngày phát hành
          results.sort((a, b) => {
            const aTitleMatch = a.title.toLowerCase().includes(queryLower);
            const bTitleMatch = b.title.toLowerCase().includes(queryLower);
            if (aTitleMatch && !bTitleMatch) return -1;
            if (!aTitleMatch && bTitleMatch) return 1;
            return new Date(b.releaseDate) - new Date(a.releaseDate);
          });
          break;
      }
    }
    
    console.log(`[Search API] Found ${results.length} albums for query "${query}"`);
    return results;
  } catch (error) {
    console.error('Error searching albums:', error);
    return [];
  }
};

export default api; 