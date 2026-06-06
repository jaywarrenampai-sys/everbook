interface Props {
  name: string;
  className?: string;
  size?: number;
}

const PATHS: Record<string, React.ReactNode> = {
  drop: (
    <path
      d="M12 3s6 6.5 6 10.5A6 6 0 0 1 6 13.5C6 9.5 12 3 12 3z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  leaf: (
    <>
      <path d="M4 20s.5-7 5-11.5S20 4 20 4s-.5 9-5 12.5S4 20 4 20z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
      <path d="M9 15s3-4 8-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </>
  ),
  star: (
    <path
      d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9L12 3.5z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  truck: (
    <>
      <path d="M2 6h11v9H2zM13 9h4l3 3v3h-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <circle cx="6" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="16" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 2.5v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10v-5L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  cart: (
    <>
      <path d="M3 4h2l2 11h10l2-7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="9" cy="19" r="1.4" fill="currentColor" />
      <circle cx="17" cy="19" r="1.4" fill="currentColor" />
    </>
  ),
  arrow: (
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  chevron: (
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  menu: (
    <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
  ),
  close: (
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
  ),
};

export default function Icon({ name, className, size = 24 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      {PATHS[name] ?? null}
    </svg>
  );
}
