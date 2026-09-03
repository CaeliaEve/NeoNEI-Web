export interface AtlasFrame {
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TimelineFrame {
  frameIndex: number;
  durationMs: number;
}

export interface SpriteEntry {
  page: string; // e.g. "atlas_0.webp"
  x: number;
  y: number;
  w: number;
  h: number;
  animated?: {
    frames: AtlasFrame[];
    timeline: TimelineFrame[];
    totalDurationMs: number;
  };
}

export class AtlasRegistry {
  private pages = new Map<string, HTMLImageElement | ImageBitmap>();
  private sprites = new Map<string, SpriteEntry>();
  private loadingPages = new Set<string>();

  public registerSprite(id: string, entry: SpriteEntry) {
    this.sprites.set(id, entry);
  }

  public registerSprites(map: Record<string, SpriteEntry>) {
    for (const [id, entry] of Object.entries(map)) {
      this.sprites.set(id, entry);
    }
  }

  public registerPageImage(pageName: string, img: HTMLImageElement | ImageBitmap) {
    this.pages.set(pageName, img);
  }

  public loadPage(pageName: string, url: string): Promise<void> {
    if (this.pages.has(pageName) || this.loadingPages.has(pageName)) {
      return Promise.resolve();
    }
    this.loadingPages.add(pageName);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        this.pages.set(pageName, img);
        this.loadingPages.delete(pageName);
        resolve();
      };
      img.onerror = (err) => {
        this.loadingPages.delete(pageName);
        reject(err);
      };
      img.src = url;
    });
  }

  public getSprite(id: string): SpriteEntry | undefined {
    return this.sprites.get(id);
  }

  /**
   * Draws sprite to canvas context at (destX, destY, destW, destH)
   * Handles multi-frame texture animations based on current timestamp
   */
  public drawSprite(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    id: string,
    destX: number,
    destY: number,
    destW: number,
    destH: number,
    nowMs: number
  ): boolean {
    const sprite = this.sprites.get(id);
    if (!sprite) return false;

    const pageImg = this.pages.get(sprite.page);
    if (!pageImg) return false;

    let srcX = sprite.x;
    let srcY = sprite.y;
    let srcW = sprite.w;
    let srcH = sprite.h;

    // Handle animation timeline
    if (sprite.animated && sprite.animated.timeline.length > 0 && sprite.animated.totalDurationMs > 0) {
      let cursor = (nowMs >>> 0) % sprite.animated.totalDurationMs;
      let targetFrameIndex = 0;

      for (let i = 0; i < sprite.animated.timeline.length; i++) {
        const tf = sprite.animated.timeline[i];
        if (cursor < tf.durationMs) {
          targetFrameIndex = tf.frameIndex;
          break;
        }
        cursor -= tf.durationMs;
      }

      const frame = sprite.animated.frames[targetFrameIndex];
      if (frame) {
        srcX = frame.x;
        srcY = frame.y;
        srcW = frame.w;
        srcH = frame.h;
      }
    }

    ctx.drawImage(pageImg, srcX, srcY, srcW, srcH, destX, destY, destW, destH);
    return true;
  }
}

export const atlasRegistry = new AtlasRegistry();
