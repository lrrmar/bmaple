// For Fill Pattern caching

interface PatternInfo {
  pattern: CanvasPattern | null;
  ready: boolean;
}

interface PatternConfig {
  imageUrl: string;
  imageDesc: string;
  scale?: number;
  fallbackColor?: string;
}

class ImagePatternManager {
  private patternCache: Map<string, PatternInfo>;

  constructor() {
    this.patternCache = new Map();
  }

  public loadImagePattern(
    imageUrl: string,
    imageDesc: string,
    scale = 1,
  ): PatternInfo {
    const cacheKey = `${imageDesc}_${scale}`;
    console.log('check cache for: ' + cacheKey);

    const cached = this.patternCache.get(cacheKey);
    if (cached) {
      console.log('image found in cache');
      return cached;
    }

    console.log('image NOT in cache');

    const patternInfo: PatternInfo = {
      pattern: null,
      ready: false,
    };
    this.patternCache.set(cacheKey, patternInfo);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = (): void => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        console.error('Failed to get canvas context');
        patternInfo.ready = true;
        return;
      }

      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pattern = ctx.createPattern(canvas, 'repeat');

      if (pattern) {
        patternInfo.pattern = pattern;
      }
      patternInfo.ready = true;
    };

    img.onerror = (): void => {
      console.error(`Failed to load pattern image: ${imageDesc}`);
      patternInfo.ready = true;
    };

    return patternInfo;
  }

  public preloadPatterns(patternConfigs: PatternConfig[]): void {
    patternConfigs.forEach((config) => {
      this.loadImagePattern(
        config.imageUrl,
        config.imageDesc,
        config.scale || 1,
      );
    });
  }

  public isPatternReady(imageUrl: string, scale = 1): boolean {
    const cacheKey = `${imageUrl}_${scale}`;
    const patternInfo = this.patternCache.get(cacheKey);
    return patternInfo ? patternInfo.ready : false;
  }

  public clearCache(): void {
    this.patternCache.clear();
  }

  public getCacheSize(): number {
    return this.patternCache.size;
  }
}

// Create and export a single instance
const imagePatternManager = new ImagePatternManager();
export default imagePatternManager;
