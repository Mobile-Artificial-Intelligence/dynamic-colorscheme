import Color from "./color";
import HueChromaTone from "./hue-chroma-tone";

class TonalPalette {
  static commonTones: number[] = [0,10,20,30,40,50,60,70,80,90,95,99,100];

  hue: number;
  chroma: number;
  keyColor: HueChromaTone;
  private cache: Map<number, number>;
  private isFromCache: boolean;

  private constructor(hue: number, chroma: number, keyColor?: HueChromaTone) {
    this.hue = hue;
    this.chroma = chroma;
    this.keyColor = keyColor ?? TonalPalette.createKeyColor(hue, chroma);
    this.cache = new Map();
    this.isFromCache = false;
  }

  static of(hue: number, chroma: number): TonalPalette {
    return new TonalPalette(hue, chroma);
  }

  static fromHtc(hct: HueChromaTone): TonalPalette {
    return new TonalPalette(hct.hue, hct.chroma, hct);
  }

  static fromList(colors: number[]): TonalPalette {
    if (colors.length !== TonalPalette.commonTones.length) {
      throw new Error("fromList requires exactly commonTones.length colors");
    }

    const cache = new Map<number, number>();
    TonalPalette.commonTones.forEach((tone, i) => cache.set(tone, colors[i]!));

    let bestHue = 0, bestChroma = 0;
    for (const intColor of colors) {
      const hct = HueChromaTone.fromColor(Color.fromInt(intColor));
      if (hct.tone > 98) continue;
      if (hct.chroma > bestChroma) {
        bestHue = hct.hue;
        bestChroma = hct.chroma;
      }
    }

    const tp = new TonalPalette(bestHue, bestChroma);
    tp.cache = cache;
    tp.isFromCache = true;
    return tp;
  }

  /** Create the "key color" at ~T50 with best chroma match */
  static createKeyColor(hue: number, chroma: number): HueChromaTone {
    const startTone = 50;
    let smallestDeltaHct = new HueChromaTone(hue, chroma, startTone);
    let smallestDelta = Math.abs(smallestDeltaHct.chroma - chroma);

    for (let delta = 1; delta < 50; delta++) {
      if (Math.round(chroma) === Math.round(smallestDeltaHct.chroma)) {
        return smallestDeltaHct;
      }

      const hctAdd = new HueChromaTone(hue, chroma, startTone + delta);
      const addDelta = Math.abs(hctAdd.chroma - chroma);
      if (addDelta < smallestDelta) {
        smallestDelta = addDelta;
        smallestDeltaHct = hctAdd;
      }

      const hctSub = new HueChromaTone(hue, chroma, startTone - delta);
      const subDelta = Math.abs(hctSub.chroma - chroma);
      if (subDelta < smallestDelta) {
        smallestDelta = subDelta;
        smallestDeltaHct = hctSub;
      }
    }
    return smallestDeltaHct;
  }

  asList(): number[] {
    return TonalPalette.commonTones.map(t => this.get(t));
  }

  get(tone: number): number {
    if (this.cache.has(tone)) {
      return this.cache.get(tone)!;
    }
    const hct = new HueChromaTone(this.hue, this.chroma, tone);
    const colorInt = Color.fromHtc(hct).toInt();
    this.cache.set(tone, colorInt);
    return colorInt;
  }

  getHct(tone: number): HueChromaTone {
    if (this.cache.has(tone)) {
      return HueChromaTone.fromColor(Color.fromInt(this.cache.get(tone)!));
    }
    return new HueChromaTone(this.hue, this.chroma, tone);
  }
}

export default TonalPalette;