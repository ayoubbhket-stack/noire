const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, viewBox: '0 0 24 24' };
export const SearchIcon = () => <svg {...P}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>;
export const HeartIcon = () => <svg {...P}><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z" /></svg>;
export const BagIcon = () => <svg {...P}><path d="M5 8h14l-1.2 12H6.2L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></svg>;
export const MenuIcon = () => <svg {...P}><path d="M4 8h16M4 16h16" /></svg>;
export const CloseIcon = () => <svg {...P}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const GridIcon = () => <svg {...P}><rect x="4" y="4" width="6.5" height="6.5" rx="1" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" /></svg>;
export const ListIcon = () => <svg {...P}><rect x="4" y="5" width="5" height="5" rx="1" /><path d="M12 7.5h8" /><rect x="4" y="14" width="5" height="5" rx="1" /><path d="M12 16.5h8" /></svg>;
export const ArrowIcon = () => <svg {...P} className="arrow-ic" style={{ width: 18, height: 18 }}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
export const FilterIcon = () => <svg {...P} style={{ width: 18, height: 18 }}><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></svg>;
export const EyeIcon = () => <svg {...P} style={{ width: 16, height: 16 }}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></svg>;
export const ShieldIcon = () => <svg {...P}><path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></svg>;
export const TruckIcon = () => <svg {...P}><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></svg>;
export const CashIcon = () => <svg {...P}><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6.5 9.5v.01M17.5 14.5v.01" /></svg>;
export const ReturnIcon = () => <svg {...P}><path d="M4 9h11a5 5 0 0 1 0 10H8" /><path d="m8 5-4 4 4 4" /></svg>;
export const GiftIcon = () => <svg {...P}><rect x="4" y="9" width="16" height="11" rx="1" /><path d="M3 9h18M12 9v11M12 9c-2-4-6-4-6-1.5S12 9 12 9Zm0 0c2-4 6-4 6-1.5S12 9 12 9Z" /></svg>;
export const SparkIcon = () => <svg {...P}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></svg>;
export const GlobeIcon = () => <svg {...P} style={{ width: 18, height: 18 }}><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.4-3.5-8.5s1-5.9 3.5-8.5Z" /></svg>;

/** NOIRÉ mark: a small faceted bottle. */
export function LogoMark({ className = 'logo-mark' }) {
  return (
    <svg className={className} viewBox="0 0 24 32" aria-hidden="true">
      <rect x="9" y="1.5" width="6" height="5" rx="1" fill="currentColor" />
      <rect x="10.2" y="6.5" width="3.6" height="2.4" fill="#c9a45c" />
      <path d="M5 11.5c0-1.4 1.1-2.6 2.6-2.6h8.8c1.5 0 2.6 1.2 2.6 2.6V27a3.5 3.5 0 0 1-3.5 3.5H8.5A3.5 3.5 0 0 1 5 27V11.5Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.4 19h9.2v7.6a1.8 1.8 0 0 1-1.8 1.8H9.2a1.8 1.8 0 0 1-1.8-1.8V19Z" fill="#c9a45c" opacity=".55" />
    </svg>
  );
}

/** Illustrated glyph for each scent family (home + finder). */
export function FamilyGlyph({ family }) {
  const g = {
    floral: <><circle cx="24" cy="24" r="4" /><path d="M24 20c-3-6 3-10 0-14M24 20c3-6-3-10 0-14" transform="rotate(0 24 24)" /><path d="M24 14c-5 0-8 4-8 10 6 0 8-4 8-10Zm0 0c5 0 8 4 8 10-6 0-8-4-8-10Z" /><path d="M24 34c-5 0-8-4-8-10M24 34c5 0 8-4 8-10M24 28v14" /></>,
    woody: <><path d="M24 42V20" /><path d="M24 26l-7-6M24 30l8-7M24 22l-4-8M24 22l5-9" /><path d="M14 42h20" /></>,
    oriental: <><path d="M16 38h16l-2-8H18l-2 8Z" /><path d="M24 30v-6" /><path d="M24 24c-4-3-2-8 0-10 2 2 4 7 0 10Z" /><path d="M20 12c0-2 1-4 2-5M28 12c0-2-1-4-2-5" /></>,
    fresh: <><circle cx="24" cy="24" r="10" /><path d="M24 14v20M14 24h20M17 17l14 14M31 17 17 31" /></>,
    citrus: <><circle cx="24" cy="24" r="10" /><path d="M24 14v20M14 24h20M17 17l14 14M31 17 17 31" /></>,
    aquatic: <><path d="M8 20c4-4 8-4 12 0s8 4 12 0 6-3 8-2" /><path d="M8 28c4-4 8-4 12 0s8 4 12 0 6-3 8-2" /><path d="M8 36c4-4 8-4 12 0s8 4 12 0 6-3 8-2" /></>,
    gourmand: <><path d="M15 22h18l-3 18H18l-3-18Z" /><path d="M18 22c0-5 3-8 6-8s6 3 6 8" /><path d="M24 14c0-3 2-5 4-6" /></>,
    leather: <><path d="M12 14c4-2 20-2 24 0-1 8-1 14 0 22-4 2-20 2-24 0 1-8 1-14 0-22Z" /><path d="M16 18c3-1 13-1 16 0M16 32c3 1 13 1 16 0" strokeDasharray="2 3" /></>,
    spicy: <><path d="M18 36c-4-6 0-18 10-22 2 4 2 8 0 12-3 5-6 8-10 10Z" /><path d="M28 14c0-3 2-5 5-6" /></>,
  }[family] || <circle cx="24" cy="24" r="10" />;
  return <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="fam-glyph">{g}</svg>;
}
