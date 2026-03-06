"use client";

import { ReactNode, CSSProperties } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  highlight?: boolean;
  glow?: boolean;
  padding?: "sm" | "md" | "lg";
  style?: CSSProperties;
  onClick?: () => void;
}

/**
 * GlassCard Component
 * Premium glassmorphism card with frosted glass effect and subtle glow
 */
export function GlassCard({
  children,
  className = "",
  highlight = false,
  glow = false,
  padding = "md",
  style,
  onClick,
}: GlassCardProps) {
  const paddingStyles = {
    sm: "1rem",
    md: "1.5rem",
    lg: "2rem",
  };

  const baseStyles: CSSProperties = {
    background: "rgba(17, 17, 17, 0.6)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: highlight 
      ? "1px solid rgba(232, 65, 66, 0.3)" 
      : "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "8px",
    padding: paddingStyles[padding],
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative" as const,
    overflow: "hidden" as const,
    ...(glow && {
      boxShadow: highlight
        ? "0 0 30px rgba(232, 65, 66, 0.15), inset 0 0 30px rgba(232, 65, 66, 0.05)"
        : "0 0 20px rgba(255, 255, 255, 0.05), inset 0 0 20px rgba(255, 255, 255, 0.02)",
    }),
    ...style,
  };

  const hoverStyles: CSSProperties = {
    ...(glow && {
      transform: "translateY(-2px)",
      borderColor: highlight 
        ? "rgba(232, 65, 66, 0.5)" 
        : "rgba(255, 255, 255, 0.15)",
    }),
  };

  return (
    <div
      className={className}
      style={baseStyles}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (glow) {
          Object.assign(e.currentTarget.style, hoverStyles);
        }
      }}
      onMouseLeave={(e) => {
        if (glow) {
          Object.assign(e.currentTarget.style, {
            transform: "translateY(0)",
            borderColor: highlight 
              ? "rgba(232, 65, 66, 0.3)" 
              : "rgba(255, 255, 255, 0.08)",
          });
        }
      }}
    >
      {/* Subtle gradient overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: highlight
            ? "linear-gradient(90deg, transparent, rgba(232, 65, 66, 0.5), transparent)"
            : "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
          opacity: 0.5,
        }}
      />
      
      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

/**
 * GradientText Component
 * Applies gradient color to text
 */
export function GradientText({
  children,
  from = "#E84142",
  to = "#ff6b6b",
  className = "",
  style,
}: {
  children: ReactNode;
  from?: string;
  to?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={className}
      style={{
        background: `linear-gradient(135deg, ${from}, ${to})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/**
 * GlowBorder Component
 * Adds animated glowing border effect
 */
export function GlowBorder({
  children,
  color = "#E84142",
  intensity = 0.3,
}: {
  children: ReactNode;
  color?: string;
  intensity?: number;
}) {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: "8px",
        padding: "1px",
        background: `linear-gradient(135deg, ${color}40, ${color}10, ${color}40)`,
        boxShadow: `0 0 ${20 * intensity}px ${color}30`,
      }}
    >
      {children}
    </div>
  );
}
