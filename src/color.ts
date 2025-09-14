import HueChromaTone from "./hue-chroma-tone";

class Color {
  red: number;
  green: number;
  blue: number;

  constructor(red: number, green: number, blue: number) {
    this.red = red;
    this.green = green;
    this.blue = blue;
  }

  static fromHex(hex: string): Color {
    if (hex.startsWith("#")) {
      hex = hex.slice(1);
    }

    if (hex.length !== 6) {
      throw new Error("Invalid hex color format");
    }

    const red = parseInt(hex.slice(0, 2), 16);
    const green = parseInt(hex.slice(2, 4), 16);
    const blue = parseInt(hex.slice(4, 6), 16);

    return new Color(red, green, blue);
  }

  static fromHtc(hct: HueChromaTone): Color {
    const c = hct.chroma;
    const h = hct.hue;
    const t = hct.tone / 100; // Normalize tone to [0, 1]

    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    let r1 = 0, g1 = 0, b1 = 0;

    if (h >= 0 && h < 60) {
      r1 = c; g1 = x; b1 = 0;
    } else if (h >= 60 && h < 120) {
      r1 = x; g1 = c; b1 = 0;
    } else if (h >= 120 && h < 180) {
      r1 = 0; g1 = c; b1 = x;
    } else if (h >= 180 && h < 240) {
      r1 = 0; g1 = x; b1 = c;
    } else if (h >= 240 && h < 300) {
      r1 = x; g1 = 0; b1 = c;
    } else if (h >= 300 && h < 360) {
      r1 = c; g1 = 0; b1 = x;
    }

    const m = t - (0.3 * c); // Adjust lightness based on tone
    const r = Math.round((r1 + m) * 255);
    const g = Math.round((g1 + m) * 255);
    const b = Math.round((b1 + m) * 255);

    return new Color(
      Math.min(255, Math.max(0, r)),
      Math.min(255, Math.max(0, g)),
      Math.min(255, Math.max(0, b))
    );
  }

  static fromInt(intColor: number): Color {
    const red = (intColor >> 16) & 0xff;
    const green = (intColor >> 8) & 0xff;
    const blue = intColor & 0xff;
    return new Color(red, green, blue);
  }

  toHex(): string {
    const rHex = this.red.toString(16).padStart(2, "0");
    const gHex = this.green.toString(16).padStart(2, "0");
    const bHex = this.blue.toString(16).padStart(2, "0");
    return `#${rHex}${gHex}${bHex}`;
  }

  toInt(): number {
    return (this.red << 16) | (this.green << 8) | this.blue;
  }
}

export default Color;