function GhostLightLogo({ size = 40, withWordmark = false, opacity = 1, style = {} }) {
  const strokeWidth = size <= 28 ? 5 : 3.5;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: withWordmark ? '10px' : '0', opacity, ...style }}>
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="34" r="20" fill="#c9a14a" opacity="0.14" />
        <circle cx="50" cy="34" r="13" fill="none" stroke="#c9a14a" strokeWidth={strokeWidth} />
        <line x1="50" y1="21" x2="50" y2="16" stroke="#c9a14a" strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="50" y1="47" x2="50" y2="68" stroke="#c9a14a" strokeWidth={strokeWidth} strokeLinecap="round" />
        <path d="M50 68 L28 90 M50 68 L72 90 M50 68 L50 92" stroke="#c9a14a" strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
        <path d="M20 92 L80 92" stroke="#c9a14a" strokeWidth={strokeWidth} strokeLinecap="round" />
      </svg>
      {withWordmark && (
        <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: Math.round(size * 0.36) + 'px', color: '#f4ede2', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
          Ghost<span style={{ color: '#c9a14a' }}>Light</span>
        </span>
      )}
    </span>
  );
}
window.GhostLightLogo = GhostLightLogo;
