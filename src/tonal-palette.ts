import Color from "./color";
import HueChromaTone from "./hue-chroma-tone";

class TonalPalette {
  /** Commonly-used tone values */
  static readonly commonTones: number[] = [
    0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100,
  ];

  static readonly commonSize = TonalPalette.commonTones.length;

  readonly hue: number;
  readonly chroma: number;
  readonly keyColor: HueChromaTone;

  private readonly _cache: Map<number, number>;
  private readonly _isFromCache: boolean;

  private constructor(hue: number, chroma: number, keyColor: HueChromaTone, cache: Map<number, number>, isFromCache: boolean) {
    this.hue = hue;
    this.chroma = chroma;
    this.keyColor = keyColor;
    this._cache = cache;
    this._isFromCache = isFromCache;
  }

  /** Create colors using [hue] and [chroma]. */
  static of(hue: number, chroma: number): TonalPalette {
    const keyColor = TonalPalette.createKeyColor(hue, chroma);
    return new TonalPalette(hue, chroma, keyColor, new Map(), false);
  }

  /** Create a Tonal Palette from hue and chroma of [hct]. */
  static fromHct(hct: HueChromaTone): TonalPalette {
    return new TonalPalette(hct.hue, hct.chroma, hct, new Map(), false);
  }

  /** Create colors from a fixed-size list of ARGB ints. */
  static fromList(colors: number[]): TonalPalette {
    if (colors.length !== TonalPalette.commonSize) {
      throw new Error(`Expected list of size ${TonalPalette.commonSize}`);
    }

    const cache = new Map<number, number>();
    TonalPalette.commonTones.forEach((tone, index) => {
      cache.set(tone, colors[index]!);
    });

    // Deduce best hue & chroma from most colorful swatch
    let bestHue = 0.0;
    let bestChroma = 0.0;

    for (const argb of colors) {
      const hct = HueChromaTone.fromInt(argb);

      if (hct.tone > 98.0) continue;

      if (hct.chroma > bestChroma) {
        bestHue = hct.hue;
        bestChroma = hct.chroma;
      }
    }

    const keyColor = TonalPalette.createKeyColor(bestHue, bestChroma);
    return new TonalPalette(bestHue, bestChroma, keyColor, cache, true);
  }

  /**
   * Creates a key color from a [hue] and [chroma].
   * The key color is the first tone, starting from T50, matching the given hue and chroma.
   */
  static createKeyColor(hue: number, chroma: number): HueChromaTone {
    let startTone = 50.0;
    let smallestDeltaHct = HueChromaTone.from(hue, chroma, startTone);
    let smallestDelta = Math.abs(smallestDeltaHct.chroma - chroma);

    for (let delta = 1.0; delta < 50.0; delta += 1.0) {
      if (Math.round(chroma) === Math.round(smallestDeltaHct.chroma)) {
        return smallestDeltaHct;
      }

      const hctAdd = HueChromaTone.from(hue, chroma, startTone + delta);
      const hctAddDelta = Math.abs(hctAdd.chroma - chroma);
      if (hctAddDelta < smallestDelta) {
        smallestDelta = hctAddDelta;
        smallestDeltaHct = hctAdd;
      }

      const hctSubtract = HueChromaTone.from(hue, chroma, startTone - delta);
      const hctSubtractDelta = Math.abs(hctSubtract.chroma - chroma);
      if (hctSubtractDelta < smallestDelta) {
        smallestDelta = hctSubtractDelta;
        smallestDeltaHct = hctSubtract;
      }
    }

    return smallestDeltaHct;
  }

  /** Returns a fixed-size list of ARGB ints for common tone values. */
  get asList(): number[] {
    return TonalPalette.commonTones.map((tone) => this.get(tone));
  }

  /** Returns ARGB at the given tone. */
  get(tone: number): number {
    if (!this._cache.has(tone)) {
      this._cache.set(tone, HueChromaTone.from(this.hue, this.chroma, tone).toInt());
    }
    return this._cache.get(tone)!;
  }

  /** Returns HCT at the given tone. */
  getHct(tone: number): HueChromaTone {
    if (this._cache.has(tone)) {
      return HueChromaTone.fromInt(this._cache.get(tone)!);
    }
    return HueChromaTone.from(this.hue, this.chroma, tone);
  }

  /** Equality check */
  equals(other: unknown): boolean {
    if (!(other instanceof TonalPalette)) return false;

    if (!this._isFromCache && !other._isFromCache) {
      return this.hue === other.hue && this.chroma === other.chroma;
    } else {
      const a = this.asList;
      const b = other.asList;
      return a.length === b.length && a.every((v, i) => v === b[i]);
    }
  }

  /** Hash code */
  hashCode(): number {
    const hashString = (s: string): number => {
      let hash = 0;
      for (let i = 0; i < s.length; i++) {
        hash = (hash * 31 + s.charCodeAt(i)) | 0;
      }
      return hash;
    };

    if (!this._isFromCache) {
      return hashString(`${this.hue},${this.chroma}`);
    } else {
      return hashString(this.asList.join(","));
    }
  }

  toString(): string {
    if (!this._isFromCache) {
      return `TonalPalette.of(${this.hue}, ${this.chroma})`;
    } else {
      return `TonalPalette.fromList(${this.asList})`;
    }
  }
}

export default TonalPalette;