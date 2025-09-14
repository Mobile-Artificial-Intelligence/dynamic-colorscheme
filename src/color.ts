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