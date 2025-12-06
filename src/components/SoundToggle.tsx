import { useState, useEffect } from 'react';
import { soundManager } from '../utils/soundManager';

export const SoundToggle = () => {
  const [soundEnabled, setSoundEnabled] = useState(soundManager.getSoundEnabled());
  const [musicEnabled, setMusicEnabled] = useState(soundManager.getMusicEnabled());

  useEffect(() => {
    // Resume audio context on first user interaction (required by browsers)
    const handleFirstInteraction = () => {
      soundManager.resumeAudioContext();
      // Start music if enabled after user interaction
      if (musicEnabled && soundManager.getMusicEnabled()) {
        // Small delay to ensure audio context is ready
        setTimeout(() => {
          soundManager.startBackgroundMusic();
        }, 100);
      }
    };

    // Try to start music immediately if audio context is already active
    if (musicEnabled && soundManager.getMusicEnabled()) {
      soundManager.resumeAudioContext();
      setTimeout(() => {
        soundManager.startBackgroundMusic();
      }, 200);
    }

    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [musicEnabled]);

  const handleToggleSound = () => {
    const newState = soundManager.toggleSound();
    setSoundEnabled(newState);
  };

  const handleToggleMusic = () => {
    // Resume audio context before toggling
    soundManager.resumeAudioContext();
    const newState = soundManager.toggleMusic();
    setMusicEnabled(newState);

    // If music was just enabled, ensure it starts
    if (newState) {
      setTimeout(() => {
        soundManager.startBackgroundMusic();
      }, 100);
    }
  };

  // SVG Icons
  const SoundOnIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    </svg>
  );

  const SoundOffIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
    </svg>
  );

  const MusicOnIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>
  );

  const MusicOffIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6zm-2 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
      <path d="M19.73 4.27L4.27 19.73l1.41 1.41L21.14 5.68l-1.41-1.41z" opacity="0.5"/>
    </svg>
  );

  return (
    <div className="fixed top-4 md:top-6 right-4 md:right-6 z-[60] flex flex-col items-center gap-2 md:gap-3">
      {/* Sound Toggle */}
      <button
        onClick={handleToggleSound}
        className={`p-2.5 md:p-3 rounded-full border-2 transition-all ${
          soundEnabled
            ? 'bg-neon-green text-dark-bg border-neon-green shadow-neon'
            : 'bg-gray-800 text-gray-400 border-gray-600'
        }`}
        title={soundEnabled ? 'Sound On' : 'Sound Off'}
      >
        {soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
      </button>

      {/* Music Toggle */}
      <button
        onClick={handleToggleMusic}
        className={`p-2.5 md:p-3 rounded-full border-2 transition-all ${
          musicEnabled
            ? 'bg-neon-green text-dark-bg border-neon-green shadow-neon'
            : 'bg-gray-800 text-gray-400 border-gray-600 opacity-50'
        }`}
        title={musicEnabled ? 'Music On' : 'Music Off'}
      >
        {musicEnabled ? <MusicOnIcon /> : <MusicOffIcon />}
      </button>
    </div>
  );
};
