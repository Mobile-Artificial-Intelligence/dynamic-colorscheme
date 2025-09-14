import Color from "./color";

class HueChromaTone {
  hue: number;
  chroma: number;
  tone: number;

  constructor(hue: number, chroma: number, tone: number) {
    this.hue = hue;
    this.chroma = chroma;
    this.tone = tone;
  }

  static fromColor(color: Color): HueChromaTone {
    // Normalize to [0, 1]
    const r = color.red / 255;
    const g = color.green / 255;
    const b = color.blue / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    // Hue
    let hue = 0;
    if (delta !== 0) {
      if (max === r) {
        hue = ((g - b) / delta) % 6;
      } else if (max === g) {
        hue = (b - r) / delta + 2;
      } else {
        hue = (r - g) / delta + 4;
      }
      hue *= 60;
      if (hue < 0) hue += 360;
    }

    // Chroma = difference between max and min
    const chroma = delta * 100; // scaled up to feel closer to Dart’s values

    // Tone = perceived lightness
    const tone = ((max + min) / 2) * 100;

    return new HueChromaTone(hue, chroma, tone);
  }

  /** ARGB -> HCT */
  static fromInt(argb: number): HueChromaTone {
    // Extract channels
    const a = (argb >> 24) & 0xff;
    const r = (argb >> 16) & 0xff;
    const g = (argb >> 8) & 0xff;
    const b = argb & 0xff;

    // Use fromColor for now
    return HueChromaTone.fromColor(new Color(r, g, b));
  }

  /** ARGB conversion (naive) */
  toInt(): number {
    // This is not perceptual — just a stub until HctSolver is ported.
    const r = Math.round((this.tone / 100) * 255);
    const g = Math.round((this.tone / 100) * 255);
    const b = Math.round((this.tone / 100) * 255);
    return (255 << 24) | (r << 16) | (g << 8) | b;
  }

  static copyWithTone(hct: HueChromaTone, newTone: number): HueChromaTone {
    return new HueChromaTone(hct.hue, hct.chroma, newTone);
  }
}

export default HueChromaTone;
