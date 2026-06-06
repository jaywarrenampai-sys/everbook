import { cn } from "@/lib/cn";

export default function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1200px] px-5 md:px-8", className)}>
      {children}
    </div>
  );
}
