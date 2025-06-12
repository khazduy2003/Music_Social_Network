import { useEffect, useRef, useCallback } from 'react';
import { listeningHistoryService } from '../services/listeningHistoryService';
import { useAuth } from '../contexts/AuthContext';

export const useListeningHistory = (currentTrack, isPlaying, progress, duration) => {
  const { user, isAuthenticated } = useAuth();
  
  // Refs for tracking state
  const currentTrackIdRef = useRef(null);
  const playStartTimeRef = useRef(null);
  const lastProgressRef = useRef(0);
  const totalListeningTimeRef = useRef(0);
  const sessionSegmentsRef = useRef([]);
  const saveTimeoutRef = useRef(null);
  const lastSaveTimeRef = useRef(0);
  const isPlayingRef = useRef(false);
  const currentTrackRef = useRef(null); // Store current track for cleanup
  const previousProgressRef = useRef(0); // Store progress before track change
  const sessionStartProgressRef = useRef(0); // Store progress when session started
  
  // Constants
  const SAVE_INTERVAL = 30000; // Save every 30 seconds
  const MIN_SAVE_DURATION = 5; // Only save if duration >= 5 seconds
  const SEEK_THRESHOLD = 2; // Consider as seek if progress jumps > 2 seconds

  // Reset tracking for new track
  const resetTracking = useCallback(() => {
    console.log('[History Tracker] Resetting tracking for new track');
    playStartTimeRef.current = null;
    lastProgressRef.current = 0;
    totalListeningTimeRef.current = 0;
    lastSaveTimeRef.current = 0;
    sessionSegmentsRef.current = [];
    isPlayingRef.current = false;
    previousProgressRef.current = 0;
    sessionStartProgressRef.current = 0;
    
    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  }, []);

  // Save listening data to backend
  const saveListeningData = useCallback(async (trackToSave, timeToSave, isTrackChange = false) => {
    if (!trackToSave || !isAuthenticated || !user) {
      return;
    }

    // Use provided timeToSave or calculate from current state
    const finalTimeToSave = timeToSave !== undefined ? timeToSave : (totalListeningTimeRef.current - lastSaveTimeRef.current);
    
    if (finalTimeToSave < MIN_SAVE_DURATION && !isTrackChange) {
      console.log(`[History Tracker] Skipping save - insufficient time: ${finalTimeToSave.toFixed(2)}s`);
      return;
    }

    try {
      console.log(`[History Tracker] Saving listening data: Track "${trackToSave.title}" - ${Math.round(finalTimeToSave)}s`);
      
      await listeningHistoryService.addToHistory(
        user.id,
        trackToSave.id,
        Math.round(finalTimeToSave)
      );
      
      console.log('[History Tracker] Listening data saved successfully');
      
      // Update last save time only if saving current track
      if (trackToSave === currentTrack) {
        lastSaveTimeRef.current = totalListeningTimeRef.current;
      }
      
    } catch (error) {
      console.error('[History Tracker] Error saving listening data:', error);
    }
  }, [user, isAuthenticated, currentTrack]);

  // Add session time to total
  const addSessionTime = useCallback((startProgress, endProgress, startTime) => {
    if (!startTime) {
      console.log('[History Tracker] No start time recorded, skipping session');
      return 0;
    }
    
    if (endProgress < startProgress) {
      console.log(`[History Tracker] Invalid progress values (${startProgress.toFixed(2)}s → ${endProgress.toFixed(2)}s), skipping session`);
      return 0;
    }
    
    const sessionTime = (Date.now() - startTime) / 1000;
    const progressDiff = endProgress - startProgress;
    
    // Use the smaller value to account for speed changes or pauses
    const actualListeningTime = Math.min(sessionTime, progressDiff);
    
    console.log(`[History Tracker] Session calculation: sessionTime=${sessionTime.toFixed(2)}s, progressDiff=${progressDiff.toFixed(2)}s, actual=${actualListeningTime.toFixed(2)}s`);
    
    if (actualListeningTime > 0.1) { // At least 0.1 seconds
      totalListeningTimeRef.current += actualListeningTime;
      sessionSegmentsRef.current.push({
        startProgress,
        endProgress,
        duration: actualListeningTime,
        timestamp: new Date().toISOString()
      });
      
      console.log(`[History Tracker] Session ended - Duration: ${actualListeningTime.toFixed(2)}s, Total: ${totalListeningTimeRef.current.toFixed(2)}s, Saved: ${lastSaveTimeRef.current.toFixed(2)}s`);
      return actualListeningTime;
    }
    
    console.log('[History Tracker] Session too short, skipping');
    return 0;
  }, []);

  // End current session and optionally save
  const endCurrentSession = useCallback(async (currentProgress, shouldSave = false) => {
    if (!playStartTimeRef.current || !currentTrackRef.current) {
      console.log('[History Tracker] No active session to end');
      return;
    }

    console.log(`[History Tracker] Ending current session at progress: ${currentProgress.toFixed(2)}s (from ${sessionStartProgressRef.current.toFixed(2)}s)`);
    
    // Add current session to total using session start progress
    const sessionTime = addSessionTime(sessionStartProgressRef.current, currentProgress, playStartTimeRef.current);
    
    // Save if requested and we have meaningful time
    if (shouldSave && totalListeningTimeRef.current > lastSaveTimeRef.current) {
      const timeToSave = totalListeningTimeRef.current - lastSaveTimeRef.current;
      console.log(`[History Tracker] Attempting to save ${timeToSave.toFixed(2)}s for track: ${currentTrackRef.current.title}`);
      await saveListeningData(currentTrackRef.current, timeToSave, true);
    }
    
    // Clear session
    playStartTimeRef.current = null;
    
    return sessionTime;
  }, [addSessionTime, saveListeningData]);

  // Schedule periodic save
  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (currentTrack) {
        saveListeningData(currentTrack);
      }
      // Schedule next save if still playing
      if (isPlayingRef.current && currentTrack) {
        scheduleSave();
      }
    }, SAVE_INTERVAL);
  }, [saveListeningData, currentTrack]);

  // Handle track changes
  useEffect(() => {
    if (!currentTrack || !isAuthenticated || !user) return;

    // Handle track change
    if (currentTrackIdRef.current !== currentTrack.id) {
      
      // End and save previous track session if exists
      // Check for accumulated time instead of just playStartTimeRef
      if (currentTrackIdRef.current && currentTrackRef.current && totalListeningTimeRef.current > lastSaveTimeRef.current) {
        console.log('[History Tracker] Track changed, ending and saving previous track session');
        console.log(`[History Tracker] Previous track: "${currentTrackRef.current.title}", Total: ${totalListeningTimeRef.current.toFixed(2)}s, Saved: ${lastSaveTimeRef.current.toFixed(2)}s`);
        
        // If there's an active session, end it first
        if (playStartTimeRef.current) {
          addSessionTime(sessionStartProgressRef.current, lastProgressRef.current, playStartTimeRef.current);
          playStartTimeRef.current = null;
        }
        
        // Save accumulated time
        const timeToSave = totalListeningTimeRef.current - lastSaveTimeRef.current;
        if (timeToSave >= MIN_SAVE_DURATION) {
          console.log(`[History Tracker] Attempting to save ${timeToSave.toFixed(2)}s for track: ${currentTrackRef.current.title}`);
          saveListeningData(currentTrackRef.current, timeToSave, true);
        } else {
          console.log(`[History Tracker] Not saving - insufficient time: ${timeToSave.toFixed(2)}s`);
        }
      }
      
      // Update refs
      currentTrackIdRef.current = currentTrack.id;
      currentTrackRef.current = currentTrack;
      resetTracking();
      
      console.log(`[History Tracker] Started tracking: "${currentTrack.title}"`);
    }

  }, [currentTrack, user, isAuthenticated, addSessionTime, saveListeningData, resetTracking]);

  // Handle progress changes (seek detection and progress tracking)
  useEffect(() => {
    if (!currentTrack || !isAuthenticated || !user || currentTrackIdRef.current !== currentTrack.id) return;

    // Store previous progress before updating
    previousProgressRef.current = lastProgressRef.current;

    // Handle seek detection
    const progressDiff = Math.abs(progress - lastProgressRef.current);
    if (progressDiff > SEEK_THRESHOLD && playStartTimeRef.current) {
      console.log(`[History Tracker] Seek detected: ${lastProgressRef.current.toFixed(2)}s → ${progress.toFixed(2)}s`);
      
      // End current session at the point where seek started
      addSessionTime(sessionStartProgressRef.current, lastProgressRef.current, playStartTimeRef.current);
      
      // Reset for new position
      playStartTimeRef.current = null;
      lastProgressRef.current = progress;
      sessionStartProgressRef.current = progress;
      
      // Restart if still playing
      if (isPlaying) {
        playStartTimeRef.current = Date.now();
        console.log(`[History Tracker] Resumed tracking after seek at: ${progress.toFixed(2)}s`);
      }
      
      return;
    }

    // Update last progress for next comparison
    lastProgressRef.current = progress;

  }, [currentTrack, progress, user, isAuthenticated, isPlaying, addSessionTime]);

  // Handle play/pause state changes
  useEffect(() => {
    if (!currentTrack || !isAuthenticated || !user || currentTrackIdRef.current !== currentTrack.id) return;

    // Avoid duplicate calls
    if (isPlayingRef.current === isPlaying) return;
    
    isPlayingRef.current = isPlaying;

    if (isPlaying) {
      // Start new session only if not already started
      if (!playStartTimeRef.current) {
        playStartTimeRef.current = Date.now();
        lastProgressRef.current = progress;
        sessionStartProgressRef.current = progress;
        console.log(`[History Tracker] Play started at progress: ${progress.toFixed(2)}s`);
        
        // Start periodic saving
        scheduleSave();
      }
    } else {
      // End current session
      if (playStartTimeRef.current) {
        console.log(`[History Tracker] Play paused at progress: ${progress.toFixed(2)}s`);
        addSessionTime(sessionStartProgressRef.current, progress, playStartTimeRef.current);
        playStartTimeRef.current = null;
      }
      
      // Clear periodic save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    }

  }, [isPlaying, currentTrack, progress, user, isAuthenticated, addSessionTime, scheduleSave]);

  // Handle track completion
  useEffect(() => {
    if (!currentTrack || !duration || progress < duration - 1) return;

    // Track completed
    if (playStartTimeRef.current) {
      console.log('[History Tracker] Track completed');
      endCurrentSession(progress, true);
    }

  }, [progress, duration, endCurrentSession, currentTrack]);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // End current session if playing
      if (playStartTimeRef.current && currentTrackRef.current) {
        const sessionTime = addSessionTime(sessionStartProgressRef.current, progress, playStartTimeRef.current);
        const timeToSave = totalListeningTimeRef.current - lastSaveTimeRef.current;
        
        if (timeToSave > 0) {
          // Try to save (may not complete due to page unload)
          console.log('[History Tracker] Page unloading, attempting to save data');
          navigator.sendBeacon && navigator.sendBeacon(
            `/api/history/${user?.id}/tracks/${currentTrackRef.current?.id}?duration=${Math.round(timeToSave)}`
          );
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user, addSessionTime]);

  // Cleanup on unmount - REMOVED progress dependency to avoid loops
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Return current tracking stats for debugging
  return {
    totalListeningTime: totalListeningTimeRef.current,
    savedTime: lastSaveTimeRef.current,
    sessionSegments: sessionSegmentsRef.current,
    isTracking: !!playStartTimeRef.current
  };
}; 