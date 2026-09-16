// Animation utilities and configuration for luxury restaurant site
// Aligned with CSS design tokens for consistency

export const ANIMATION_DURATIONS = {
  fast: 160,
  ui: 240,
  reveal: 700,
  cinematic: 1200,
} as const;

export const ANIMATION_STAGGER = {
  default: 80,
  tight: 60,
  loose: 120,
} as const;

export const ANIMATION_EASING = {
  standard: [0.2, 0, 0.2, 1],
  reveal: [0.22, 1, 0.36, 1],
} as const;

// Reduced motion preference detection
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Watch for reduced motion changes
export function onReducedMotionChange(callback: (prefersReduced: boolean) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const listener = (e: MediaQueryListEvent) => callback(e.matches);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

// Framer Motion variants for common animations
export const motionVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: ANIMATION_DURATIONS.reveal / 1000 },
  },

  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: ANIMATION_DURATIONS.reveal / 1000, ease: ANIMATION_EASING.reveal },
  },

  staggerContainer: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: {
      staggerChildren: ANIMATION_STAGGER.default / 1000,
      delayChildren: 0.1,
    },
  },

  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: ANIMATION_DURATIONS.reveal / 1000, ease: ANIMATION_EASING.reveal },
  },

  buttonHover: {
    scale: 1.04,
    transition: { duration: ANIMATION_DURATIONS.ui / 1000 },
  },

  imageScale: {
    scale: 1.035,
    transition: { duration: ANIMATION_DURATIONS.cinematic / 1000, ease: ANIMATION_EASING.reveal },
  },

  heroBounce: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: ANIMATION_EASING.reveal,
    },
  },

  textUnderline: {
    scaleX: 1,
    transition: { duration: ANIMATION_DURATIONS.ui / 1000, ease: ANIMATION_EASING.reveal },
  },

  textUnderlineHover: {
    scaleX: 0,
    transformOrigin: "right",
    transition: { duration: ANIMATION_DURATIONS.ui / 1000, ease: ANIMATION_EASING.reveal },
  },
};

// Parallax calculation helper
export function calculateParallax(scrollProgress: number, maxParallax: number = 20): number {
  if (prefersReducedMotion()) return 0;
  // scrollProgress from 0 to 1, converts to pixel offset
  return scrollProgress * maxParallax;
}

// Hook for prefers-reduced-motion safe animations
export function useAnimationDuration(baseDuration: number): number {
  const reduced = prefersReducedMotion();
  return reduced ? 0 : baseDuration;
}

export function useAnimationDelay(baseDelay: number): number {
  const reduced = prefersReducedMotion();
  return reduced ? 0 : baseDelay;
}

// Mobile viewport detection for responsive animations
export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 48rem)").matches;
}

// Animation configuration presets
export const animationPresets = {
  hero: {
    headerDuration: ANIMATION_DURATIONS.reveal,
    headerStagger: ANIMATION_STAGGER.default,
    parallaxMax: 40,
  },
  card: {
    duration: ANIMATION_DURATIONS.reveal,
    stagger: ANIMATION_STAGGER.default,
    parallaxMax: 15,
  },
  gallery: {
    duration: ANIMATION_DURATIONS.cinematic,
    parallaxMax: 20,
  },
  section: {
    duration: ANIMATION_DURATIONS.reveal,
    stagger: ANIMATION_STAGGER.loose,
  },
};
