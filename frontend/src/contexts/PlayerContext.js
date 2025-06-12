import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { listeningHistoryService } from '../services/listeningHistoryService';
import { useAuth } from './AuthContext';
import { trackService } from '../services/trackService';

// Tạo context cho player
const PlayerContext = createContext();

// Custom hook để sử dụng PlayerContext
export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayerContext must be used within a PlayerProvider');
  }
  return context;
};

// Provider component
export const PlayerProvider = ({ children }) => {
  // State cho player
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
  const [isLoading, setIsLoading] = useState(false);
  
  // Track play time tracking
  const [playStartTime, setPlayStartTime] = useState(null);
  const [listenedDuration, setListenedDuration] = useState(0);
  
  // Refs
  const audioRef = useRef(null);
  const progressIntervalRef = useRef(null);
  
  // Khởi tạo audio element
  useEffect(() => {
    audioRef.current = new Audio();
    
    // Thiết lập các event listeners
    audioRef.current.addEventListener('ended', handleTrackEnd);
    audioRef.current.addEventListener('loadstart', () => setIsLoading(true));
    audioRef.current.addEventListener('canplay', () => setIsLoading(false));
    audioRef.current.addEventListener('loadedmetadata', () => {
      setDuration(audioRef.current.duration);
    });
    
    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', handleTrackEnd);
        audioRef.current.removeEventListener('loadstart', () => setIsLoading(true));
        audioRef.current.removeEventListener('canplay', () => setIsLoading(false));
        audioRef.current.removeEventListener('loadedmetadata', () => {
          setDuration(audioRef.current.duration);
        });
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);
  
  // Cập nhật volume khi state thay đổi
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume / 100;
    }
  }, [volume, muted]);
  
  // Cập nhật progress khi đang phát
  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        if (audioRef.current) {
          setProgress(audioRef.current.currentTime);
        }
      }, 1000);
    } else {
      clearInterval(progressIntervalRef.current);
    }
    
    return () => clearInterval(progressIntervalRef.current);
  }, [isPlaying]);
  
  // Handle track end
  const handleTrackEnd = () => {
    console.log('Track ended. Repeat mode:', repeatMode);
    console.log('Queue index:', queueIndex, 'Queue length:', queue.length);
    
    // Track the play duration before moving to next track
    if (currentTrack && playStartTime) {
      const listenedSeconds = Math.floor((Date.now() - playStartTime) / 1000);
      trackPlayDuration(currentTrack.id, listenedSeconds);
    }
    
    if (repeatMode === 'one') {
      // Lặp lại bài hiện tại
      console.log('Repeating current track');
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (repeatMode === 'all' || queueIndex < queue.length - 1) {
      // Chuyển bài tiếp theo trong queue
      console.log('Auto-advancing to next track');
      playNextTrack();
    } else {
      // Hết queue và không lặp lại
      console.log('Playlist ended');
      setIsPlaying(false);
      setProgress(0);
    }
  };
  
  // Track play duration
  const trackPlayDuration = async (trackId, seconds) => {
    if (!trackId || !seconds) return;
    
    console.log(`Track ${trackId} played for ${seconds} seconds`);
    
    try {
      // Record the play with actual listened duration
      await trackService.incrementPlayCount(trackId, seconds);
    } catch (error) {
      console.error('Error tracking play duration:', error);
    }
  };
  
  // Phát một track
  const playTrack = (track, skipQueueUpdate = false) => {
    console.log('playTrack called with:', track, 'skipQueueUpdate:', skipQueueUpdate);
    if (!track) {
      console.log('No track provided to playTrack');
      return;
    }
    
    console.log('Track audioUrl:', track.audioUrl);
    
    // Nếu đang phát track này rồi thì chỉ cần tiếp tục phát
    if (currentTrack && currentTrack.id === track.id) {
      console.log('Resume playing current track');
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }
    
    // Dừng track hiện tại nếu có
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // Thiết lập track mới
    setCurrentTrack(track);
    console.log('Setting new current track:', track.title);
    
    // Cập nhật queue nếu không bỏ qua và đang phát track không nằm trong queue
    if (!skipQueueUpdate && !queue.some(item => item.id === track.id)) {
      console.log('Track not in queue, creating new queue');
      setQueue([track]);
      setQueueIndex(0);
    } else if (!skipQueueUpdate) {
      // Cập nhật queueIndex nếu track nằm trong queue
      const newIndex = queue.findIndex(item => item.id === track.id);
      if (newIndex !== -1) {
        console.log('Updating queue index to:', newIndex);
        setQueueIndex(newIndex);
      }
    }
    
    // Phát track mới
    console.log('Setting audio source to:', track.audioUrl);
    audioRef.current.src = track.audioUrl;
    audioRef.current.play()
      .then(() => {
        console.log('Successfully started playing:', track.title);
        setIsPlaying(true);
        setProgress(0);
      })
      .catch(error => {
        console.error('Error playing track:', error);
        console.error('Failed audio URL:', track.audioUrl);
        setIsPlaying(false);
      });
    
    // Reset play tracking
    setPlayStartTime(Date.now());
    setListenedDuration(0);
  };
  
  // Phát album
  const playAlbum = async (albumId) => {
    try {
      // Giả định: Gọi API để lấy thông tin album và danh sách tracks
      // const albumData = await fetchAlbumById(albumId);
      // const albumTracks = await fetchAlbumTracks(albumId);
      
      // Giả lập dữ liệu cho mục đích demo
      const albumData = { id: albumId, title: 'Album Demo' };
      const albumTracks = [
        { 
          id: 'track1', 
          title: 'Track 1', 
          artist: 'Artist 1', 
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' 
        },
        { 
          id: 'track2', 
          title: 'Track 2', 
          artist: 'Artist 1', 
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' 
        }
      ];
      
      // Cập nhật state
      setCurrentAlbum(albumData);
      setQueue(albumTracks);
      setQueueIndex(0);
      
      // Phát track đầu tiên
      playTrack(albumTracks[0]);
    } catch (error) {
      console.error('Error playing album:', error);
    }
  };
  
  // Phát top tracks của nghệ sĩ
  const playArtistTopTracks = async (artistId) => {
    try {
      // Giả định: Gọi API để lấy top tracks của nghệ sĩ
      // const artistTracks = await fetchArtistTopTracks(artistId);
      
      // Giả lập dữ liệu cho mục đích demo
      const artistTracks = [
        { 
          id: 'track1', 
          title: 'Top Track 1', 
          artist: 'Artist Demo', 
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' 
        },
        { 
          id: 'track2', 
          title: 'Top Track 2', 
          artist: 'Artist Demo', 
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' 
        }
      ];
      
      // Cập nhật queue và phát
      setQueue(artistTracks);
      setQueueIndex(0);
      playTrack(artistTracks[0]);
    } catch (error) {
      console.error('Error playing artist tracks:', error);
    }
  };
  
  // Dừng phát
  const pauseTrack = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      
      // Track duration when pausing
      if (currentTrack && playStartTime) {
        const listenedSeconds = Math.floor((Date.now() - playStartTime) / 1000);
        setListenedDuration(prev => prev + listenedSeconds);
        setPlayStartTime(null);
      }
    }
  };
  
  // Dừng phát (alias cho pauseTrack)
  const pausePlayback = pauseTrack;
  
  // Chuyển đến một vị trí cụ thể trong track
  const seekTo = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };
  
  // Phát track tiếp theo trong queue
  const playNextTrack = () => {
    console.log('playNextTrack called. Current queue:', queue);
    console.log('Current queueIndex:', queueIndex);
    console.log('Queue length:', queue.length);
    
    if (queue.length === 0) return;
    
    let nextIndex;
    
    if (isShuffled) {
      // Chọn ngẫu nhiên track tiếp theo (khác với track hiện tại)
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * queue.length);
      } while (randomIndex === queueIndex && queue.length > 1);
      
      nextIndex = randomIndex;
    } else {
      // Chuyển đến track tiếp theo theo thứ tự
      nextIndex = (queueIndex + 1) % queue.length;
    }
    
    console.log('Next index calculated:', nextIndex);
    
    // Nếu đã hết queue và không lặp lại
    if (nextIndex === 0 && repeatMode === 'off' && !isShuffled) {
      console.log('End of queue reached, stopping playback');
      pauseTrack();
      return;
    }
    
    console.log('Playing next track:', queue[nextIndex]);
    setQueueIndex(nextIndex);
    playTrack(queue[nextIndex], true);
  };
  
  // Phát track trước đó trong queue
  const playPreviousTrack = () => {
    if (queue.length === 0) return;
    
    // Nếu đang phát được hơn 3 giây, quay về đầu bài hiện tại
    if (audioRef.current && audioRef.current.currentTime > 3) {
      seekTo(0);
      return;
    }
    
    let prevIndex;
    
    if (isShuffled) {
      // Chọn ngẫu nhiên track trước đó (khác với track hiện tại)
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * queue.length);
      } while (randomIndex === queueIndex && queue.length > 1);
      
      prevIndex = randomIndex;
    } else {
      // Quay lại track trước đó theo thứ tự
      prevIndex = queueIndex - 1;
      if (prevIndex < 0) {
        prevIndex = repeatMode !== 'off' ? queue.length - 1 : 0;
      }
    }
    
    setQueueIndex(prevIndex);
    playTrack(queue[prevIndex], true);
  };
  
  // Thêm track vào queue
  const addToQueue = (track) => {
    if (!track) return;
    
    // Nếu queue rỗng, thêm vào và phát luôn
    if (queue.length === 0) {
      setQueue([track]);
      setQueueIndex(0);
      playTrack(track);
      return;
    }
    
    // Thêm vào cuối queue
    setQueue(prevQueue => [...prevQueue, track]);
  };
  
  // Xóa track khỏi queue
  const removeFromQueue = (trackId) => {
    // Không cho phép xóa track đang phát
    if (currentTrack && currentTrack.id === trackId) return;
    
    // Xóa khỏi queue
    const newQueue = queue.filter(track => track.id !== trackId);
    setQueue(newQueue);
    
    // Cập nhật queueIndex nếu cần
    if (queueIndex >= newQueue.length) {
      setQueueIndex(Math.max(0, newQueue.length - 1));
    }
  };
  
  // Xóa toàn bộ queue
  const clearQueue = () => {
    // Giữ lại track đang phát
    if (currentTrack) {
      setQueue([currentTrack]);
      setQueueIndex(0);
    } else {
      setQueue([]);
      setQueueIndex(0);
    }
  };
  
  // Chuyển đổi chế độ shuffle
  const toggleShuffle = () => {
    setIsShuffled(prev => !prev);
  };
  
  // Chuyển đổi chế độ repeat
  const toggleRepeat = () => {
    setRepeatMode(prev => {
      switch (prev) {
        case 'off': return 'all';
        case 'all': return 'one';
        case 'one': return 'off';
        default: return 'off';
      }
    });
  };
  
  // Phát playlist
  const playPlaylist = (playlist) => {
    if (!playlist || !playlist.tracks || playlist.tracks.length === 0) {
      console.warn('Playlist is empty or invalid');
      return;
    }
    
    // Thiết lập queue với tất cả tracks trong playlist
    setQueue(playlist.tracks);
    setQueueIndex(0);
    setCurrentPlaylist(playlist);
    
    // Phát track đầu tiên
    playTrack(playlist.tracks[0]);
  };

  // Phát playlist bằng ID - Load tracks từ API và đưa vào queue
  const playPlaylistById = async (playlistId) => {
    try {
      setIsLoading(true);
      console.log('Loading playlist with ID:', playlistId);
      
      // Import playlistService dynamically to avoid circular dependency
      const { playlistService } = await import('../services/playlistService');
      
      // Lấy thông tin playlist (đã bao gồm tracks)
      const playlistInfo = await playlistService.getPlaylistById(playlistId);
      console.log('Playlist info received:', playlistInfo);
      
      if (!playlistInfo) {
        console.error('Playlist not found');
        return;
      }
      
      // Chuyển tracks từ Set thành Array nếu cần
      const playlistTracks = playlistInfo.tracks ? Array.from(playlistInfo.tracks) : [];
      console.log('Playlist tracks:', playlistTracks);
      
      if (!playlistTracks || playlistTracks.length === 0) {
        console.warn('Playlist is empty');
        return;
      }
      
      // Cập nhật play count
      await playlistService.incrementPlayCount(playlistId);
      
      // Thiết lập queue với tất cả tracks trong playlist
      setQueue(playlistTracks);
      setQueueIndex(0);
      setCurrentPlaylist(playlistInfo);
      
      console.log('Starting to play first track:', playlistTracks[0]);
      // Phát track đầu tiên với skipQueueUpdate = true để không ghi đè queue
      playTrack(playlistTracks[0], true);
      
    } catch (error) {
      console.error('Error playing playlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Phát tất cả tracks trong một list
  const playAllTracks = (tracks) => {
    console.log('playAllTracks called with:', tracks);
    if (!tracks || tracks.length === 0) {
      console.warn('No tracks provided to playAllTracks');
      return;
    }
    
    // Thiết lập queue với tất cả tracks
    setQueue(tracks);
    setQueueIndex(0);
    setCurrentPlaylist(null); // Reset current playlist since this is a custom list
    
    console.log('Starting to play first track from list:', tracks[0]);
    // Phát track đầu tiên với skipQueueUpdate = true để không ghi đè queue
    playTrack(tracks[0], true);
  };

  // Tiếp tục phát (resume)
  const resumeTrack = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setPlayStartTime(Date.now());
        })
        .catch(error => {
          console.error('Error resuming track:', error);
        });
    }
  };
  
  // When component unmounts or track changes, track final play duration
  useEffect(() => {
    return () => {
      if (currentTrack && playStartTime) {
        const listenedSeconds = Math.floor((Date.now() - playStartTime) / 1000);
        const totalListened = listenedDuration + listenedSeconds;
        trackPlayDuration(currentTrack.id, totalListened);
      }
    };
  }, [currentTrack]);
  
  // Giá trị context
  const value = {
    currentTrack,
    currentAlbum,
    currentPlaylist,
    isPlaying,
    volume,
    muted,
    progress,
    duration,
    queue,
    queueIndex,
    isShuffled,
    repeatMode,
    isLoading,
    playTrack,
    playPlaylist,
    playPlaylistById,
    pauseTrack,
    resumeTrack,
    pausePlayback,
    seekTo,
    playNextTrack,
    playPreviousTrack,
    setVolume,
    toggleMute: () => setMuted(prev => !prev),
    addToQueue,
    removeFromQueue,
    clearQueue,
    toggleShuffle,
    toggleRepeat,
    playAlbum,
    playArtistTopTracks,
    playAllTracks
  };
  
  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerContext; 