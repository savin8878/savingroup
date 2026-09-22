/**
 * HeroAtmosphere — the field behind the hero.
 *
 * Flat by design: a square grid on the same rhythm as the layout, one soft
 * accent wash in the top corner, grain, and a fade into the next section.
 * No perspective, no drifting blobs — the grid is the point, because it is
 * what the hero's columns are aligned to.
 *
 * Pure CSS and no state, so it renders on the server.
 */
export function HeroAtmosphere() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="bg-grid hero-grid" />
      <div className="hero-wash" />
      <div className="bg-noise absolute inset-0 opacity-50" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}

export default HeroAtmosphere;
