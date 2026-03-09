import type { ReactNode } from "react";

export type BrandMarkProps = {
  className?: string;
  suffix?: ReactNode;
};

export function BrandMark({ className, suffix }: BrandMarkProps) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`.trim()}>
      <div className="relative flex h-9 w-9 items-center justify-center">
        <svg viewBox="0 0 64 64" className="h-9 w-9" aria-hidden="true">
          <defs>
            <linearGradient id="vtGradient" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#facc15" />
            </linearGradient>
          </defs>
          <path
            d="M32 6c7.7 0 14.8 3.2 19.9 8.4-5.3-2.2-11.5-2.4-17.2-.3l-7.9 2.9c-4.9 1.8-10.3 1.5-14.9-.5C16.9 10.3 24.1 6 32 6Z"
            fill="url(#vtGradient)"
          />
          <path
            d="M56.5 32c0 7.7-3.2 14.8-8.4 19.9 2.2-5.3 2.4-11.5.3-17.2l-2.9-7.9c-1.8-4.9-1.5-10.3.5-14.9 6.2 5 10.5 12.2 10.5 20.1Z"
            fill="#dc2626"
            opacity="0.9"
          />
          <path
            d="M32 56.5c-7.7 0-14.8-3.2-19.9-8.4 5.3 2.2 11.5 2.4 17.2.3l7.9-2.9c4.9-1.8 10.3-1.5 14.9.5-5 6.2-12.2 10.5-20.1 10.5Z"
            fill="#facc15"
            opacity="0.9"
          />
          <circle cx="32" cy="32" r="6" fill="#0b0b0b" opacity="0.9" />
        </svg>
      </div>
      <div>
        <div className="text-base font-extrabold tracking-tight text-gray-900">
          VidyaTrack
        </div>
        {suffix ? (
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            {suffix}
          </div>
        ) : null}
      </div>
    </div>
  );
}
