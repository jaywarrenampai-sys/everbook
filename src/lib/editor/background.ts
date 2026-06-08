// Helpers for interpreting a BookPage.background value, which can be either:
//   - a solid colour  ("#fce4ec")
//   - an image path    ("/backgrounds/clouds/cloud-01.svg")
//   - a legacy css url ("url(blob:...)")
// Shared by the editor canvas, preview and (color path) the print PDF so they
// stay in sync.

export function isImageBackground(bg?: string): boolean {
  if (!bg) return false;
  return (
    bg.startsWith("/") ||
    bg.startsWith("url(") ||
    bg.startsWith("data:") ||
    bg.startsWith("http")
  );
}

/** Returns the <img> src for an image background, or null for colours. */
export function backgroundImageSrc(bg?: string): string | null {
  if (!isImageBackground(bg)) return null;
  if (bg!.startsWith("url(")) {
    return bg!.slice(4, -1).replace(/^["']|["']$/g, "");
  }
  return bg!;
}

/** Returns the solid colour to paint the page, defaulting to white. */
export function backgroundColor(bg?: string): string {
  if (!bg || isImageBackground(bg)) return "#ffffff";
  return bg;
}
