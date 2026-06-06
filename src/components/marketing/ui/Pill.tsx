import { cn } from "@/lib/cn";

export default function Pill({
  children,
  className,
  tone = "rose",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "rose" | "sand" | "dark";
}) {
  const tones: Record<string, string> = {
    rose: "bg-rosetag text-terracotta",
    sand: "bg-sand text-espresso",
    dark: "bg-espresso text-cream",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
