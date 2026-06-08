"use client";

interface Props {
  cropX: number;
  cropY: number;
  zoom: number;
  onCropXChange: (value: number) => void;
  onCropYChange: (value: number) => void;
  onZoomChange: (value: number) => void;
}

const SLIDER =
  "h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-secondary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0";

/**
 * Advanced controls for full bleed mode.
 * Allows adjusting image crop position and zoom level.
 */
export default function FullBleedControls({
  cropX,
  cropY,
  zoom,
  onCropXChange,
  onCropYChange,
  onZoomChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 rounded-2xl border-2 border-border bg-card px-4 py-2.5 text-xs shadow-sm">
      {/* Horizontal Position */}
      <div className="flex items-center gap-2">
        <label className="font-semibold text-muted-foreground">X</label>
        <input
          type="range"
          min="-100"
          max="100"
          value={cropX}
          onChange={(e) => onCropXChange(parseInt(e.target.value, 10))}
          className={SLIDER}
        />
        <span className="w-8 text-right font-semibold text-foreground">{cropX}</span>
      </div>

      {/* Vertical Position */}
      <div className="flex items-center gap-2">
        <label className="font-semibold text-muted-foreground">Y</label>
        <input
          type="range"
          min="-100"
          max="100"
          value={cropY}
          onChange={(e) => onCropYChange(parseInt(e.target.value, 10))}
          className={SLIDER}
        />
        <span className="w-8 text-right font-semibold text-foreground">{cropY}</span>
      </div>

      {/* Zoom */}
      <div className="flex items-center gap-2">
        <label className="font-semibold text-muted-foreground">ซูม</label>
        <input
          type="range"
          min="100"
          max="300"
          value={zoom}
          onChange={(e) => onZoomChange(parseInt(e.target.value, 10))}
          className={SLIDER}
        />
        <span className="w-12 text-right font-semibold text-foreground">{zoom}%</span>
      </div>
    </div>
  );
}
