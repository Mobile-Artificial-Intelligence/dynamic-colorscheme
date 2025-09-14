import Color from "./color";
import DynamicColors from "./dynamic-colors";
import DynamicScheme from "./dynamic-scheme";
import HueChromaTone from "./hue-chroma-tone";
import TonalPalette from "./tonal-palette";
import { sanitizeDegreesDouble } from "./utilities";

export type Brightness = "light" | "dark";

export interface ColorScheme {
  brightness: Brightness;

  // Primary
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  primaryFixed: string;
  onPrimaryFixed: string;
  primaryFixedDim: string;
  onPrimaryFixedVariant: string;

  // Secondary
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  secondaryFixed: string;
  onSecondaryFixed: string;
  secondaryFixedDim: string;
  onSecondaryFixedVariant: string;

  // Tertiary
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  tertiaryFixed: string;
  onTertiaryFixed: string;
  tertiaryFixedDim: string;
  onTertiaryFixedVariant: string;

  // Error
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;

  // Surface & background
  surface: string;
  onSurface: string;
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  surfaceVariant: string;
  onSurfaceVariant: string;

  // Utility
  outline: string;
  outlineVariant: string;
  shadow: string;
  scrim: string;

  // Inverse roles
  inverseSurface: string;
  inversePrimary: string;

  // Tint
  surfaceTint: string;
}

export function createColorScheme(seedColor: string, brightness: Brightness = "light", contrastLevel: number = 0.0): ColorScheme {
    const isDark = brightness === "dark";
    const sourceColor = Color.fromHex(seedColor);
    const sourceColorHct = HueChromaTone.fromColor(sourceColor);
    const scheme = new DynamicScheme(
        sourceColorHct.toInt(),
        "tonal-spot",
        isDark,
        TonalPalette.of(sourceColorHct.hue, 36.0),
        TonalPalette.of(sourceColorHct.hue, 16.0),
        TonalPalette.of(sanitizeDegreesDouble(sourceColorHct.hue + 60.0), 24.0),
        TonalPalette.of(sourceColorHct.hue, 6.0),
        TonalPalette.of(sourceColorHct.hue, 8.0),
        contrastLevel
    );

    const primary = Color.fromInt(DynamicColors.primary.getArgb(scheme)).toHex();
    const onPrimary = Color.fromInt(DynamicColors.onPrimary.getArgb(scheme)).toHex();
    const primaryContainer = Color.fromInt(DynamicColors.primaryContainer.getArgb(scheme)).toHex();
    const onPrimaryContainer = Color.fromInt(DynamicColors.onPrimaryContainer.getArgb(scheme)).toHex();
    const primaryFixed = Color.fromInt(DynamicColors.primaryFixed.getArgb(scheme)).toHex();
    const onPrimaryFixed = Color.fromInt(DynamicColors.onPrimaryFixed.getArgb(scheme)).toHex();
    const primaryFixedDim = Color.fromInt(DynamicColors.primaryFixedDim.getArgb(scheme)).toHex();
    const onPrimaryFixedVariant = Color.fromInt(DynamicColors.onPrimaryFixedVariant.getArgb(scheme)).toHex();

    const secondary = Color.fromInt(DynamicColors.secondary.getArgb(scheme)).toHex();
    const onSecondary = Color.fromInt(DynamicColors.onSecondary.getArgb(scheme)).toHex();
    const secondaryContainer = Color.fromInt(DynamicColors.secondaryContainer.getArgb(scheme)).toHex();
    const onSecondaryContainer = Color.fromInt(DynamicColors.onSecondaryContainer.getArgb(scheme)).toHex();
    const secondaryFixed = Color.fromInt(DynamicColors.secondaryFixed.getArgb(scheme)).toHex();
    const onSecondaryFixed = Color.fromInt(DynamicColors.onSecondaryFixed.getArgb(scheme)).toHex();
    const secondaryFixedDim = Color.fromInt(DynamicColors.secondaryFixedDim.getArgb(scheme)).toHex();
    const onSecondaryFixedVariant = Color.fromInt(DynamicColors.onSecondaryFixedVariant.getArgb(scheme)).toHex();

    const tertiary = Color.fromInt(DynamicColors.tertiary.getArgb(scheme)).toHex();
    const onTertiary = Color.fromInt(DynamicColors.onTertiary.getArgb(scheme)).toHex();
    const tertiaryContainer = Color.fromInt(DynamicColors.tertiaryContainer.getArgb(scheme)).toHex();
    const onTertiaryContainer = Color.fromInt(DynamicColors.onTertiaryContainer.getArgb(scheme)).toHex();
    const tertiaryFixed = Color.fromInt(DynamicColors.tertiaryFixed.getArgb(scheme)).toHex();
    const onTertiaryFixed = Color.fromInt(DynamicColors.onTertiaryFixed.getArgb(scheme)).toHex();
    const tertiaryFixedDim = Color.fromInt(DynamicColors.tertiaryFixedDim.getArgb(scheme)).toHex();
    const onTertiaryFixedVariant = Color.fromInt(DynamicColors.onTertiaryFixedVariant.getArgb(scheme)).toHex();

    const error = Color.fromInt(DynamicColors.error.getArgb(scheme)).toHex();
    const onError = Color.fromInt(DynamicColors.onError.getArgb(scheme)).toHex();
    const errorContainer = Color.fromInt(DynamicColors.errorContainer.getArgb(scheme)).toHex();
    const onErrorContainer = Color.fromInt(DynamicColors.onErrorContainer.getArgb(scheme)).toHex();

    const surface = Color.fromInt(DynamicColors.surface.getArgb(scheme)).toHex();
    const onSurface = Color.fromInt(DynamicColors.onSurface.getArgb(scheme)).toHex();
    const surfaceDim = Color.fromInt(DynamicColors.surfaceDim.getArgb(scheme)).toHex();
    const surfaceBright = Color.fromInt(DynamicColors.surfaceBright.getArgb(scheme)).toHex();
    const surfaceContainerLowest = Color.fromInt(DynamicColors.surfaceContainerLowest.getArgb(scheme)).toHex();
    const surfaceContainerLow = Color.fromInt(DynamicColors.surfaceContainerLow.getArgb(scheme)).toHex();
    const surfaceContainer = Color.fromInt(DynamicColors.surfaceContainer.getArgb(scheme)).toHex();
    const surfaceContainerHigh = Color.fromInt(DynamicColors.surfaceContainerHigh.getArgb(scheme)).toHex();
    const surfaceContainerHighest = Color.fromInt(DynamicColors.surfaceContainerHighest.getArgb(scheme)).toHex();
    const surfaceVariant = Color.fromInt(DynamicColors.surfaceVariant.getArgb(scheme)).toHex();
    const onSurfaceVariant = Color.fromInt(DynamicColors.onSurfaceVariant.getArgb(scheme)).toHex();

    const outline = Color.fromInt(DynamicColors.outline.getArgb(scheme)).toHex();
    const outlineVariant = Color.fromInt(DynamicColors.outlineVariant.getArgb(scheme)).toHex();
    const shadow = Color.fromInt(DynamicColors.shadow.getArgb(scheme)).toHex();
    const scrim = Color.fromInt(DynamicColors.scrim.getArgb(scheme)).toHex();

    const inverseSurface = Color.fromInt(DynamicColors.inverseSurface.getArgb(scheme)).toHex();
    const inversePrimary = Color.fromInt(DynamicColors.inversePrimary.getArgb(scheme)).toHex();

    const surfaceTint = Color.fromInt(DynamicColors.surfaceTint.getArgb(scheme)).toHex();

    return {
        brightness,
        primary,
        onPrimary,
        primaryContainer,
        onPrimaryContainer,
        primaryFixed,
        onPrimaryFixed,
        primaryFixedDim,
        onPrimaryFixedVariant,
        secondary,
        onSecondary,
        secondaryContainer,
        onSecondaryContainer,
        secondaryFixed,
        onSecondaryFixed,
        secondaryFixedDim,
        onSecondaryFixedVariant,
        tertiary,
        onTertiary,
        tertiaryContainer,
        onTertiaryContainer,
        tertiaryFixed,
        onTertiaryFixed,
        tertiaryFixedDim,
        onTertiaryFixedVariant,
        error,
        onError,
        errorContainer,
        onErrorContainer,
        surface,
        onSurface,
        surfaceDim,
        surfaceBright,
        surfaceContainerLowest,
        surfaceContainerLow,
        surfaceContainer,
        surfaceContainerHigh,
        surfaceContainerHighest,
        surfaceVariant,
        onSurfaceVariant,
        outline,
        outlineVariant,
        shadow,
        scrim,
        inverseSurface,
        inversePrimary,
        surfaceTint
    };
}