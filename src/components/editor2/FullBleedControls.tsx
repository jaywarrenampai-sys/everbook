"use client";

interface Props {
  cropX: number;
  cropY: number;
  zoom: number;
  onCropXChange: (value: number) => void;
  onCropYChange: (value: number) => void;
  onZoomChange: (value: number) => void;
}

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
    <div className="flex items-center gap-3 rounded-lg bg-neutral-50 px-3 py-2 text-xs">
      {/* Horizontal Position */}
      <div className="flex items-center gap-2">
        <label className="min-w-12 text-neutral-600">X</label>
        <input
          type="range"
          min="-100"
          max="100"
          value={cropX}
          onChange={(e) => onCropXChange(parseInt(e.target.value, 10))}
          className="h-1 w-24 cursor-pointer appearance-none bg-neutral-300 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-neutral-900 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-neutral-900 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
        />
        <span className="w-8 text-right text-neutral-700">{cropX}</span>
      </div>

      {/* Vertical Position */}
      <div className="flex items-center gap-2">
        <label className="min-w-12 text-neutral-600">Y</label>
        <input
          type="range"
          min="-100"
          max="100"
          value={cropY}
          onChange={(e) => onCropYChange(parseInt(e.target.value, 10))}
          className="h-1 w-24 cursor-pointer appearance-none bg-neutral-300 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-neutral-900 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-neutral-900 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
        />
        <span className="w-8 text-right text-neutral-700">{cropY}</span>
      </div>

      {/* Zoom */}
      <div className="flex items-center gap-2">
        <label className="min-w-12 text-neutral-600">Zoom</label>
        <input
          type="range"
          min="100"
          max="300"
          value={zoom}
          onChange={(e) => onZoomChange(parseInt(e.target.value, 10))}
          className="h-1 w-24 cursor-pointer appearance-none bg-neutral-300 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-neutral-900 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-neutral-900 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
        />
        <span className="w-12 text-right text-neutral-700">{zoom}%</span>
      </div>
    </div>
  );
}
