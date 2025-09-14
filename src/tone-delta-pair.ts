import DynamicColor from "./dynamic-color";

export type TonePolarity = "darker" | "lighter" | "nearer" | "farther";

class ToneDeltaPair {
  roleA: DynamicColor;
  roleB: DynamicColor;
  delta: number;
  polarity: TonePolarity;
  stayTogether: boolean;

  constructor(
    roleA: DynamicColor,
    roleB: DynamicColor,
    delta: number,
    polarity: TonePolarity,
    stayTogether: boolean
  ) {
    this.roleA = roleA;
    this.roleB = roleB;
    this.delta = delta;
    this.polarity = polarity;
    this.stayTogether = stayTogether;
  }
}

export default ToneDeltaPair;