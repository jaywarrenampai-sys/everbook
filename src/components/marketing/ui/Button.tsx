"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface Props {
  children: React.ReactNode;
  href?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  onClick?: () => void;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: "bg-espresso text-cream hover:bg-ink",
  outline: "border border-espresso/25 text-espresso hover:border-espresso hover:bg-espresso/[0.03]",
  ghost: "text-espresso hover:bg-espresso/[0.05]",
};

const SIZES: Record<Size, string> = {
  sm: "text-sm px-4 py-2",
  md: "text-[0.95rem] px-6 py-3",
  lg: "text-base px-8 py-4",
};

export default function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className,
  onClick,
  fullWidth,
}: Props) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-colors duration-200 cursor-pointer select-none",
    VARIANTS[variant],
    SIZES[size],
    fullWidth && "w-full",
    className
  );

  const motionProps = {
    whileHover: { scale: 1.03 },
    whileTap: { scale: 0.97 },
    transition: { type: "spring" as const, stiffness: 400, damping: 25 },
  };

  if (href) {
    return (
      <motion.a href={href} className={classes} {...motionProps}>
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button onClick={onClick} className={classes} {...motionProps}>
      {children}
    </motion.button>
  );
}
