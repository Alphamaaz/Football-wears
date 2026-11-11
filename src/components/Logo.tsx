import Link from "next/link";

type LogoProps = {
  variant?: "wordmark" | "mark" | "stacked";
  className?: string;
};

export function Logo({ variant = "wordmark", className = "" }: LogoProps) {
  const iconSvg = (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ink to-primary text-white shadow-soft">
      {/* Football Icon Shape */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 text-white"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m12 7 3.5 2.5-1.5 4.5h-4L8.5 9.5 12 7Z" fill="currentColor" fillOpacity="0.25" />
        <path d="M12 2v5" />
        <path d="M15.5 9.5 21 8" />
        <path d="M14 14l5 3.5" />
        <path d="M10 14l-5 3.5" />
        <path d="M8.5 9.5 3 8" />
      </svg>
      {/* Accent dot */}
      <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-surface" />
    </div>
  );

  if (variant === "mark") {
    return (
      <Link href="/" className={`inline-flex items-center ${className}`} aria-label="Football Wears">
        {iconSvg}
      </Link>
    );
  }

  if (variant === "stacked") {
    return (
      <Link href="/" className={`inline-flex flex-col items-center gap-2 ${className}`}>
        {iconSvg}
        <div className="text-center">
          <span className="block text-base font-black tracking-tight text-ink uppercase">Football Wears</span>
          <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Pro &amp; Retro Kits</span>
        </div>
      </Link>
    );
  }

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 ${className}`}>
      {iconSvg}
      <div className="flex flex-col leading-none">
        <span className="text-base sm:text-lg font-black tracking-tight text-ink uppercase">
          FOOTBALL <span className="text-primary">WEARS</span>
        </span>
        <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted">
          Official &amp; Retro Shop
        </span>
      </div>
    </Link>
  );
}
