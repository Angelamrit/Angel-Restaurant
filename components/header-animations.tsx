"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ANIMATION_DURATIONS, ANIMATION_EASING } from "@/lib/animation-utilities";

interface ScrollHeaderProps {
  children: React.ReactNode;
}

export function ScrollHeader({ children }: ScrollHeaderProps) {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 100;
      setHasScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      animate={{
        background: hasScrolled
          ? "color-mix(in srgb, rgb(37, 19, 13) 94%, transparent)"
          : "transparent",
        boxShadow: hasScrolled
          ? "0 8px 40px color-mix(in srgb, rgb(22, 12, 8) 28%, transparent)"
          : "0 0px 0px transparent",
      }}
      transition={{
        duration: ANIMATION_DURATIONS.ui / 1000,
        ease: ANIMATION_EASING.standard,
      }}
    >
      {children}
    </motion.div>
  );
}

interface MobileMenuAnimationProps {
  isOpen: boolean;
  children: React.ReactNode;
}

export function MobileMenuAnimation({ isOpen, children }: MobileMenuAnimationProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: ANIMATION_DURATIONS.ui / 1000,
            ease: ANIMATION_EASING.standard,
          }}
        >
          {children}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

interface NavLinkAnimationProps {
  href: string;
  isCurrent?: boolean;
  children: React.ReactNode;
}

export function NavLinkAnimation({ children }: NavLinkAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: ANIMATION_DURATIONS.ui / 1000,
        ease: ANIMATION_EASING.reveal,
      }}
    >
      {children}
    </motion.div>
  );
}

interface ButtonHoverAnimationProps {
  children: React.ReactNode;
  className?: string;
}

export function ButtonHoverAnimation({ children, className }: ButtonHoverAnimationProps) {
  return (
    <motion.div
      whileHover={{
        scale: 1.04,
        transition: {
          duration: ANIMATION_DURATIONS.fast / 1000,
          ease: ANIMATION_EASING.reveal,
        },
      }}
      whileTap={{
        scale: 0.98,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
