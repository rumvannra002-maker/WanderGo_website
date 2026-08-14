// Signature motif: the five-tower Angkor skyline, reused across the site
// (nav mark, hero backdrop, section dividers) as the visual thread.
export default function TowerSkyline({ variant = 'divider', color = 'var(--ink)' }) {
  if (variant === 'mark') {
    return (
      <svg width="34" height="30" viewBox="0 0 34 30" fill="none" aria-hidden="true">
        <path
          d="M2 28 L2 18 L6 12 L6 18 L10 8 L14 18 L14 10 L17 4 L20 10 L20 18 L24 8 L28 18 L28 12 L32 18 L32 28 Z"
          fill={color}
        />
      </svg>
    );
  }
  return (
    <svg
      className="tower-divider"
      viewBox="0 0 1200 90"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M0 90 L0 60 L60 34 L110 60 L110 20 L170 60 L230 12 L260 44 L300 60 L300 30 L360 60 L410 46 L440 60 L440 20 L500 60 L560 8 L600 40 L640 8 L700 60 L700 20 L760 60 L810 46 L840 60 L840 30 L900 60 L950 12 L990 44 L1030 60 L1030 20 L1090 60 L1140 34 L1200 60 L1200 90 Z"
        fill={color}
      />
    </svg>
  );
}
