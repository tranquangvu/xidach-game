// Sound Manager for Blackjack Game
// Uses Web Audio API to generate fun sounds and manages background music
import wonderfulWorldMusic from '../assets/wonderful-world.mp3';

class SoundManager {
  private audioContext: AudioContext | null = null;
  private backgroundMusic: HTMLAudioElement | null = null;
  private backgroundMusicSource: AudioBufferSourceNode | null = null;
  private backgroundMusicGain: GainNode | null = null;
  private isSoundEnabled: boolean = true;
  private isMusicEnabled: boolean = true;
  private musicVolume: number = 0.15;
  private soundVolume: number = 0.5;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private musicPlaying: boolean = false;
  private musicIntervalId: number | null = null;

  constructor() {
    // Initialize audio context
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new AudioContext();
    }

    // Initialize background music with HTML5 Audio
    if (typeof window !== 'undefined') {
      this.backgroundMusic = new Audio(wonderfulWorldMusic);
      this.backgroundMusic.loop = true;
      this.backgroundMusic.volume = this.musicVolume;
      this.backgroundMusic.preload = 'auto';
    }
  }

  // Play a sound effect using Web Audio API
  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    if (!this.isSoundEnabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = type;
      oscillator.frequency.value = frequency;

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * this.soundVolume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  // Play a chord (multiple frequencies)
  private playChord(frequencies: number[], duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    if (!this.isSoundEnabled || !this.audioContext) return;

    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, duration, type, volume / frequencies.length);
      }, index * 20);
    });
  }

  // Sound effects
  playCardDeal() {
    // Quick, sharp sound for dealing cards
    this.playTone(800, 0.1, 'square', 0.4);
    setTimeout(() => this.playTone(600, 0.08, 'square', 0.3), 50);
  }

  playCardHit() {
    // Upward swoosh for hitting
    if (!this.isSoundEnabled || !this.audioContext) return;

    const startFreq = 300;
    const endFreq = 600;
    const duration = 0.2;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(endFreq, this.audioContext.currentTime + duration);

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4 * this.soundVolume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playBet() {
    // Coin-like sound for betting
    this.playChord([440, 554, 659], 0.15, 'square', 0.3);
  }

  playWin() {
    // Happy ascending chord for winning
    this.playChord([523, 659, 784, 988], 0.4, 'sine', 0.5);
  }

  playLose() {
    // Sad descending tone for losing
    if (!this.isSoundEnabled || !this.audioContext) return;

    const frequencies = [440, 392, 349, 330];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 0.2, 'sawtooth', 0.4);
      }, index * 100);
    });
  }

  playBust() {
    // Dramatic low sound for busting
    this.playTone(150, 0.5, 'sawtooth', 0.6);
    setTimeout(() => this.playTone(100, 0.3, 'sawtooth', 0.5), 200);
  }

  playBlackjack() {
    // Exciting fanfare for blackjack
    const fanfare = [523, 659, 784, 988, 1175, 1319];
    fanfare.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 0.15, 'sine', 0.4);
      }, index * 80);
    });
  }

  playStand() {
    // Simple click for standing
    this.playTone(1000, 0.05, 'square', 0.3);
  }

  playDouble() {
    // Double bet sound - two quick tones
    this.playTone(600, 0.1, 'square', 0.4);
    setTimeout(() => this.playTone(800, 0.1, 'square', 0.4), 100);
  }

  // Background music controls
  startBackgroundMusic() {
    if (!this.isMusicEnabled) return;

    try {
      // Resume audio context first (needed for sound effects)
      this.resumeAudioContext();

      // Stop existing music if any
      this.stopBackgroundMusic();

      // Use HTML5 Audio for the music file
      if (this.backgroundMusic) {
        this.backgroundMusic.volume = this.musicVolume;
        this.backgroundMusic.play().then(() => {
          this.musicPlaying = true;
        }).catch((error) => {
          console.warn('Error playing background music:', error);
          // If autoplay is blocked, music will start on next user interaction
        });
      }
    } catch (error) {
      console.warn('Error starting background music:', error);
    }
  }

  stopBackgroundMusic() {
    try {
      // Stop HTML5 Audio if playing
      if (this.backgroundMusic) {
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
      }

      // Clear the interval that schedules music patterns (for generated music fallback)
      if (this.musicIntervalId !== null) {
        clearInterval(this.musicIntervalId);
        this.musicIntervalId = null;
      }

      // Stop any playing oscillators (for generated music fallback)
      const oscillators = (this as any).backgroundMusicOscillators;
      if (oscillators && Array.isArray(oscillators)) {
        oscillators.forEach((osc: OscillatorNode) => {
          try {
            osc.stop();
          } catch (e) {
            // Oscillator might already be stopped
          }
        });
        (this as any).backgroundMusicOscillators = null;
      }

      if (this.backgroundMusicSource) {
        try {
          this.backgroundMusicSource.stop();
        } catch (e) {
          // Source might already be stopped
        }
      }
    } catch (e) {
      // Ignore errors during cleanup
    } finally {
      this.backgroundMusicSource = null;
      this.backgroundMusicGain = null;
      this.musicPlaying = false;
    }
  }

  // Toggle methods
  toggleSound() {
    this.isSoundEnabled = !this.isSoundEnabled;
    return this.isSoundEnabled;
  }

  toggleMusic() {
    this.isMusicEnabled = !this.isMusicEnabled;
    if (this.isMusicEnabled) {
      this.startBackgroundMusic();
    } else {
      this.stopBackgroundMusic();
    }
    return this.isMusicEnabled;
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.musicVolume;
    }
    if (this.backgroundMusicGain) {
      this.backgroundMusicGain.gain.value = this.musicVolume;
    }
  }

  setSoundVolume(volume: number) {
    this.soundVolume = Math.max(0, Math.min(1, volume));
  }

  // Getters
  getSoundEnabled() {
    return this.isSoundEnabled;
  }

  getMusicEnabled() {
    return this.isMusicEnabled;
  }

  // Resume audio context (needed for browser autoplay policies)
  resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
