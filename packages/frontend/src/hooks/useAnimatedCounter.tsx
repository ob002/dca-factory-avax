"use client";

import { useEffect, useState, useRef } from "react";

interface UseAnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  startOnMount?: boolean;
}

/**
 * Hook for smooth count-up animation
 * Returns animated value that counts up to target
 */
export function useAnimatedCounter({
  value,
  duration = 2000,
  decimals = 2,
  startOnMount = true,
}: UseAnimatedCounterProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousValue = useRef(value);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!startOnMount) return;

    // Reset animation state
    setIsAnimating(true);
    startTimeRef.current = null;
    
    const startValue = previousValue.current;
    const change = value - startValue;
    
    // Skip animation for very small changes
    if (Math.abs(change) < 0.001) {
      setAnimatedValue(value);
      setIsAnimating(false);
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function: easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      const currentValue = startValue + change * easeProgress;
      setAnimatedValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setAnimatedValue(value);
        setIsAnimating(false);
        previousValue.current = value;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, startOnMount]);

  return {
    value: animatedValue,
    formatted: animatedValue.toFixed(decimals),
    isAnimating,
  };
}

/**
 * AnimatedNumber Component
 * Displays a number with smooth count-up animation
 */
export function AnimatedNumber({
  value,
  duration = 2000,
  decimals = 2,
  prefix = "",
  suffix = "",
  className = "",
  style,
}: {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { formatted } = useAnimatedCounter({ value, duration, decimals });

  return (
    <span className={className} style={style}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

/**
 * AnimatedDollar Component
 * Specialized AnimatedNumber for dollar values
 */
export function AnimatedDollar({
  value,
  ...props
}: Omit<React.ComponentProps<typeof AnimatedNumber>, "prefix" | "decimals">) {
  return (
    <AnimatedNumber
      value={value}
      prefix="$"
      decimals={2}
      {...props}
    />
  );
}

/**
 * AnimatedInteger Component
 * Specialized AnimatedNumber for whole numbers
 */
export function AnimatedInteger({
  value,
  ...props
}: Omit<React.ComponentProps<typeof AnimatedNumber>, "decimals">) {
  return (
    <AnimatedNumber
      value={value}
      decimals={0}
      {...props}
    />
  );
}
