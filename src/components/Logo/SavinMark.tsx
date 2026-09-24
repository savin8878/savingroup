import { useId } from "react";

/**
 * Savin Group mark — the blue→green "S" ribbon carrying the team, with the
 * growth arrow. Vector so it stays crisp from the 32px header up to the
 * share image. Gradient ids are per-instance (several logos can render on
 * one page).
 */
export function SavinMark({ className, title }: { className?: string; title?: string }) {
  const id = useId().replace(/:/g, "");
  const g = (name: string) => `savin-${name}-${id}`;
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id={g("top")} x1="10" y1="4" x2="84" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0AA2FF" />
          <stop offset=".45" stopColor="#0B63F0" />
          <stop offset="1" stopColor="#0A4FD6" />
        </linearGradient>
        <linearGradient id={g("band")} x1="10" y1="40" x2="84" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0A3FC4" />
          <stop offset=".45" stopColor="#0B74F2" />
          <stop offset=".75" stopColor="#08B3E6" />
          <stop offset="1" stopColor="#0A9E8C" />
        </linearGradient>
        <linearGradient id={g("bottom")} x1="80" y1="66" x2="6" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0BA878" />
          <stop offset=".5" stopColor="#0FB673" />
          <stop offset="1" stopColor="#16D06F" />
        </linearGradient>
        <linearGradient id={g("arrow")} x1="74" y1="68" x2="98" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0A9E5E" />
          <stop offset="1" stopColor="#17D66E" />
        </linearGradient>
        <linearGradient id={g("people")} x1="30" y1="22" x2="70" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1A5FD0" />
          <stop offset="1" stopColor="#0E3E9E" />
        </linearGradient>
      </defs>
      {/* Upper bowl: from the top-right cut, over the top, round the left. */}
      <path d="M89 7C74 1 42-3 20 9 3 18-2 36 8 48l5.5-12.5C13 24 26 17 44 17c14 0 26 4 34 10Z" fill={`url(#${g("top")})`} />
      {/* The band that crosses the middle. */}
      <path d="M13.5 35c4.5 7 18.5 10 34.5 12.6 15 2.4 28 5.4 36.5 12.9L83 72.5c-9-5.5-21-8-37-11S15 56 8 48Z" fill={`url(#${g("band")})`} />
      {/* Lower bowl, sweeping to the pointed bottom-left end. */}
      <path d="M84 60c11 8 10 24-2 32-12 8-37 9-57 5-11-2-20-5-24-6l14-22c7 6 17 10 29 10.5 12 .5 22-4.5 27-13.5Z" fill={`url(#${g("bottom")})`} />
      {/* Growth arrow. */}
      <path d="M82.5 69c3-8 4-15 3.3-22.5L92 46c.3 8.5-1.8 16.5-6 24.5Z" fill={`url(#${g("arrow")})`} />
      <path d="M97 29.5 72 41.5 99 57Z" fill={`url(#${g("arrow")})`} />
      {/* The team. */}
      <g fill={`url(#${g("people")})`}>
        <circle cx="48" cy="29" r="5.6" />
        <path d="M37.5 47.5c0-7.5 4.5-11.5 10.5-11.5s10.5 4 10.5 12.5Z" />
        <circle cx="35" cy="34" r="4.1" />
        <path d="M28 44c1-3 3.5-4.2 7-4.2 1.5 0 2.6.4 3.4 1-1.4 1.2-2 2.8-2.2 4.8Z" />
        <circle cx="61" cy="34" r="4.1" />
        <path d="M60 40.2c6-.2 10 3.3 11.5 10.8-4-1.4-7.5-2.2-10.9-2.7.2-3.3 0-5.9-.6-8.1Z" />
      </g>
    </svg>
  );
}
