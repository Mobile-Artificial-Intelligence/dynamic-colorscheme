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

    // Chroma (difference between max and min)
    const chroma = delta;

    // Tone (lightness, scaled to 0–100 like HCT does)
    const tone = ((max + min) / 2) * 100;

    return new HueChromaTone(hue, chroma, tone);
  }

  static copyWithTone(hct: HueChromaTone, newTone: number): HueChromaTone {
    return new HueChromaTone(hct.hue, hct.chroma, newTone);
  }
}

export default HueChromaTone;
