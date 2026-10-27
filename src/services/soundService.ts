// Browser-based Sound Notification Service using Web Audio API

class SoundService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5; // 0.0 to 1.0

  constructor() {
    // Load persisted user sound preferences
    try {
      const savedMuted = localStorage.getItem('bybit_ai_sound_muted');
      if (savedMuted !== null) {
        this.isMuted = JSON.parse(savedMuted);
      }
      const savedVol = localStorage.getItem('bybit_ai_sound_volume');
      if (savedVol !== null) {
        this.volume = parseFloat(savedVol);
      }
    } catch (e) {
      console.warn('Could not load sound preferences:', e);
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    return this.audioCtx;
  }

  public isMutedState(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('bybit_ai_sound_muted', JSON.stringify(muted));
    } catch (e) {}
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number): void {
    this.volume = Math.min(1, Math.max(0, vol));
    try {
      localStorage.setItem('bybit_ai_sound_volume', this.volume.toString());
    } catch (e) {}
  }

  /**
   * Plays a subtle, pleasant dual-tone alert sound when a price alert is triggered
   */
  public playPriceAlertSound(): void {
    if (this.isMuted) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume * 0.4, now);
      masterGain.connect(ctx.destination);

      // Tone 1: Gentle C5 (523.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.01, now);
      gain1.gain.exponentialRampToValueAtTime(0.6, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(masterGain);

      // Tone 2: Harmonious E5 (659.25 Hz) slightly delayed
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(659.25, now + 0.12);
      gain2.gain.setValueAtTime(0.01, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.7, now + 0.17);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc2.connect(gain2);
      gain2.connect(masterGain);

      // Tone 3: Bright G5 (783.99 Hz) resolution note
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(783.99, now + 0.24);
      gain3.gain.setValueAtTime(0.01, now + 0.24);
      gain3.gain.exponentialRampToValueAtTime(0.8, now + 0.28);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc3.connect(gain3);
      gain3.connect(masterGain);

      // Start and Stop
      osc1.start(now);
      osc1.stop(now + 0.4);

      osc2.start(now + 0.12);
      osc2.stop(now + 0.6);

      osc3.start(now + 0.24);
      osc3.stop(now + 0.85);
    } catch (e) {
      console.warn('Error playing alert sound:', e);
    }
  }

  /**
   * Plays a quick test tone for user confirmation
   */
  public playTestSound(): void {
    this.playPriceAlertSound();
  }
}

export const soundService = new SoundService();
