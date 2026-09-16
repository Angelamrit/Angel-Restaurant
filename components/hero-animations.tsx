"use client";

import { motion } from "framer-motion";
import { ANIMATION_DURATIONS, ANIMATION_STAGGER, ANIMATION_EASING, prefersReducedMotion } from "@/lib/animation-utilities";

interface HeroAnimationsProps {
  children: React.ReactNode;
}

export function HeroAnimations({ children }: HeroAnimationsProps) {
  const reduced = prefersReducedMotion();

  if (reduced) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: ANIMATION_EASING.reveal }}
    >
      {children}
    </motion.div>
  );
}

// Staggered text animation for hero headline
export function HeroHeadlineAnimated({ children }: { children: React.ReactNode }) {
  if (prefersReducedMotion()) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          transition: {
            staggerChildren: ANIMATION_STAGGER.default / 1000,
            delayChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// Individual line animation for hero headline
export function HeroHeadlineLine({ children }: { children: React.ReactNode }) {
  if (prefersReducedMotion()) {
    return <>{children}</>;
  }

  return (
    <motion.div
      variants={{
        initial: {
          opacity: 0,
          y: 30,
        },
        animate: {
          opacity: 1,
          y: 0,
        },
      }}
      transition={{
        duration: ANIMATION_DURATIONS.reveal / 1000,
        ease: ANIMATION_EASING.reveal,
      }}
    >
      {children}
    </motion.div>
  );
}

// Stamp rotation animation
export function HeroStampAnimated({ children }: { children: React.ReactNode }) {
  if (prefersReducedMotion()) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ rotate: -8, opacity: 0, scale: 0.95 }}
      whileInView={{ rotate: -8, opacity: 1, scale: 1 }}
      animate={{ rotate: [-8, -9, -8] }}
      transition={{
        initial: { duration: 0.6, ease: ANIMATION_EASING.reveal },
        rotate: {
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: ANIMATION_EASING.standard,
        },
        opacity: { duration: 0.6 },
      }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
}

// Footer text stagger
export function HeroFooterAnimated({ children }: { children: React.ReactNode }) {
  if (prefersReducedMotion()) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{
        duration: 0.6,
        delay: 0.3,
        ease: ANIMATION_EASING.reveal,
      }}
      viewport={{ once: true, amount: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
