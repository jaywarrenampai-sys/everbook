import { cn } from "@/lib/cn";

/**
 * Pure-CSS stand-in for a photo book — a stylized hardcover with a photo-grid
 * cover and a spine. Swap for a real <Image> render when photography is ready.
 */
export default function BookVisual({
  accent = "#EDE4D6",
  label = "Our Story",
  note,
  className,
}: {
  accent?: string;
  label?: string;
  note?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden", className)}
      style={{
        background: `radial-gradient(120% 90% at 50% 12%, ${accent} 0%, #F7F3EC 72%)`,
      }}
    >
      {/* soft light blooms */}
      <div className="pointer-events-none absolute -left-10 top-8 h-40 w-40 rounded-full bg-white/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-6 right-2 h-32 w-32 rounded-full bg-clay/30 blur-3xl" />

      {/* standing hardcover book */}
      <div
        className="relative flex"
        style={{ filter: "drop-shadow(0 18px 36px rgba(46,38,32,0.35))" }}
      >
        {/* spine */}
        <div className="h-64 w-3 rounded-l-sm bg-gradient-to-b from-espresso/80 to-espresso/60" />

        {/* cover */}
        <div className="relative h-64 w-52 rounded-r-md bg-mist p-3 ring-1 ring-espresso/10">
          {/* photo grid on cover */}
          <div className="grid h-[68%] grid-cols-3 grid-rows-2 gap-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-[3px]"
                style={{
                  background: `linear-gradient(${135 + i * 25}deg, ${accent}, #C9A88B)`,
                  opacity: 0.55 + (i % 3) * 0.15,
                }}
              />
            ))}
          </div>

          {/* title block */}
          <div className="mt-3 text-center">
            <div className="font-display text-lg font-semibold leading-tight text-ink">{label}</div>
            {note && (
              <div className="mt-1 text-[8px] uppercase tracking-[0.2em] text-espresso/45">{note}</div>
            )}
          </div>

          {/* page edges */}
          <div className="absolute -right-1 top-2 bottom-2 w-1 rounded-r-sm bg-gradient-to-r from-white to-stone-200" />
        </div>
      </div>
    </div>
  );
}
