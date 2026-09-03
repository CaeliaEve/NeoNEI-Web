export type TickListener = (tick: number) => void;

class GlobalTimeline {
  private currentTick = 0;
  private timer: number | null = null;
  private listeners = new Set<TickListener>();

  public start() {
    if (this.timer !== null) return;
    this.timer = window.setInterval(() => {
      this.currentTick++;
      for (const listener of this.listeners) {
        listener(this.currentTick);
      }
    }, 50); // 20Hz = 50ms per Minecraft tick
  }

  public stop() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public getTick(): number {
    return this.currentTick;
  }

  public subscribe(listener: TickListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const timeline = new GlobalTimeline();
