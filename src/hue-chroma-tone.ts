import { Cam16 } from "./cam16";
import Color from "./color";
import { HctSolver } from "./hue-chroma-tone-solver";
import { ColorUtils } from "./utilities";
import { ViewingConditions } from "./viewing-conditions";

class HueChromaTone {
  private _hue: number;
  private _chroma: number;
  private _tone: number;
  private _argb: number;

  private constructor(argb: number) {
    this._argb = argb;
    const cam16 = Cam16.fromInt(argb);
    this._hue = cam16.hue;
    this._chroma = cam16.chroma;
    this._tone = ColorUtils.lstarFromArgb(argb);
  }

  /** Create HCT from hue/chroma/tone */
  static from(hue: number, chroma: number, tone: number): HueChromaTone {
    const argb = HctSolver.solveToInt(hue, chroma, tone);
    return new HueChromaTone(argb);
  }

  /** Create HCT from an ARGB int */
  static fromInt(argb: number): HueChromaTone {
    return new HueChromaTone(argb);
  }

  /** Create HCT from a Color object */
  static fromColor(color: Color): HueChromaTone {
    // Force alpha=255
    const argb = (0xff << 24) | color.toInt();
    return new HueChromaTone(argb);
  }

  toInt(): number {
    return this._argb;
  }

  get hue(): number {
    return this._hue;
  }

  set hue(newHue: number) {
    this._argb = HctSolver.solveToInt(newHue, this._chroma, this._tone);
    const cam16 = Cam16.fromInt(this._argb);
    this._hue = cam16.hue;
    this._chroma = cam16.chroma;
    this._tone = ColorUtils.lstarFromArgb(this._argb);
  }

  get chroma(): number {
    return this._chroma;
  }

  set chroma(newChroma: number) {
    this._argb = HctSolver.solveToInt(this._hue, newChroma, this._tone);
    const cam16 = Cam16.fromInt(this._argb);
    this._hue = cam16.hue;
    this._chroma = cam16.chroma;
    this._tone = ColorUtils.lstarFromArgb(this._argb);
  }

  get tone(): number {
    return this._tone;
  }

  set tone(newTone: number) {
    this._argb = HctSolver.solveToInt(this._hue, this._chroma, newTone);
    const cam16 = Cam16.fromInt(this._argb);
    this._hue = cam16.hue;
    this._chroma = cam16.chroma;
    this._tone = ColorUtils.lstarFromArgb(this._argb);
  }

  equals(other: unknown): boolean {
    return other instanceof HueChromaTone && this._argb === other._argb;
  }

  hashCode(): number {
    return this._argb;
  }

  toString(): string {
    return `H${Math.round(this._hue)} C${Math.round(this._chroma)} T${Math.round(this._tone)}`;
  }

  inViewingConditions(vc: ViewingConditions): HueChromaTone {
    const cam16 = Cam16.fromInt(this.toInt());
    const viewedInVc = cam16.xyzInViewingConditions(vc);
    const recastInVc = Cam16.fromXyzInViewingConditions(
      viewedInVc[0]!,
      viewedInVc[1]!,
      viewedInVc[2]!,
      ViewingConditions.make()
    );
    return HueChromaTone.from(
      recastInVc.hue,
      recastInVc.chroma,
      ColorUtils.lstarFromY(viewedInVc[1]!)
    );
  }
}

export default HueChromaTone;