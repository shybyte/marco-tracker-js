export class AccurateInterval {
  private audioContext?: AudioContext;
  private nextTime = 0;
  private running = false;

  constructor(
    public intervalSeconds: number,
    private readonly callback: () => void,
  ) {}

  start(): void {
    if (this.running) return;

    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    this.nextTime = this.audioContext.currentTime;
    this.running = true;
    this.tick();
  }

  stop(): void {
    this.running = false;
  }

  private tick = () => {
    if (!this.running) return;

    const currentTime = this.audioContext!.currentTime;
    if (currentTime >= this.nextTime) {
      this.callback();
      this.nextTime += this.intervalSeconds;
    }

    // Use `setTimeout` or `requestAnimationFrame` ?
    setTimeout(this.tick, 1);
  };
}
