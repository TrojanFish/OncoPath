/**
 * OncoPath Taptic Web Haptics Engine
 * Provides Apple Taptic-grade physical feedback using the Web Vibration API with graceful fallback.
 */

export type HapticType = "light" | "medium" | "success" | "warning" | "danger";

const HAPTIC_PATTERNS: Record<HapticType, number | number[]> = {
  light: 10,                 // Subtle click for tab switching and pill selections
  medium: 20,                // Noticeable tap for modal open, segmented control change
  success: [15, 35, 20],     // Double soft pulse for successful save or safe drug compatibility
  warning: [25, 40, 25],     // Staggered caution pulse for PPI timing alerts or STAS+
  danger: [40, 60, 40],      // Firm double pulse for severe contraindication or positive margins
};

export function triggerHaptic(type: HapticType = "light"): void {
  if (typeof window === "undefined" || !("vibrate" in navigator)) {
    return;
  }

  try {
    const pattern = HAPTIC_PATTERNS[type];
    navigator.vibrate(pattern);
  } catch {
    // Graceful degradation on unsupported or restricted environments
  }
}
