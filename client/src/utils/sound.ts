class SoundManager {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  constructor() {
    try {
      const saved = localStorage.getItem('friends_arcade_muted');
      if (saved !== null) {
        this.isMuted = saved === 'true';
      }
    } catch (e) {
      // ignore
    }
  }

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('friends_arcade_muted', String(this.isMuted));
    } catch (e) {}
    return this.isMuted;
  }

  public playTone(freq: number, type: OscillatorType, duration: number, startVol = 0.15, endVol = 0.001) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(startVol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(endVol, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // ignore audio errors
    }
  }

  public playClick() {
    this.playTone(600, 'sine', 0.08, 0.1, 0.01);
  }

  public playPop() {
    this.playTone(850, 'triangle', 0.1, 0.15, 0.01);
  }

  public playMove() {
    this.playTone(440, 'triangle', 0.12, 0.15, 0.01);
  }

  public playReady() {
    const ctx = this.getContext();
    if (!ctx) return;
    this.playTone(523.25, 'sine', 0.1, 0.12, 0.01); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.15, 0.15, 0.01), 100); // E5
  }

  public playStart() {
    const ctx = this.getContext();
    if (!ctx) return;
    this.playTone(440, 'sine', 0.1, 0.15, 0.01);
    setTimeout(() => this.playTone(554.37, 'sine', 0.1, 0.15, 0.01), 120);
    setTimeout(() => this.playTone(659.25, 'sine', 0.25, 0.2, 0.01), 240);
  }

  public playWin() {
    const ctx = this.getContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.25, 0.2, 0.01), idx * 120);
    });
  }

  public playError() {
    this.playTone(180, 'sawtooth', 0.25, 0.2, 0.01);
  }

  public playCountdown() {
    this.playTone(400, 'sine', 0.15, 0.15, 0.01);
  }

  public playGo() {
    this.playTone(880, 'triangle', 0.35, 0.25, 0.01);
  }

  public playMatch() {
    this.playTone(587.33, 'sine', 0.12, 0.15, 0.01); // D5
    setTimeout(() => this.playTone(880, 'sine', 0.2, 0.2, 0.01), 100); // A5
  }
}

export const sounds = new SoundManager();
