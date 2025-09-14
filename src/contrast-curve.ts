function lerp(start: number, stop: number, amount: number): number {
  return start + (stop - start) * amount;
}

class ContrastCurve {
  low: number;
  normal: number;
  medium: number;
  high: number;

  constructor(low: number, normal: number, medium: number, high: number) {
    this.low = low;
    this.normal = normal;
    this.medium = medium;
    this.high = high;
  }

  get(contrastLevel: number): number {
    if (contrastLevel <= -1.0) {
      return this.low;
    } else if (contrastLevel < 0.0) {
      return lerp(this.low, this.normal, (contrastLevel - -1.0) / 1.0);
    } else if (contrastLevel < 0.5) {
      return lerp(this.normal, this.medium, (contrastLevel - 0.0) / 0.5);
    } else if (contrastLevel < 1.0) {
      return lerp(this.medium, this.high, (contrastLevel - 0.5) / 0.5);
    } else {
      return this.high;
    }
  }
}

export default ContrastCurve;