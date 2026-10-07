"use client";

// The info button: the letter "i" in a circle, with a 48px tap area (docs/UI_THEME.md > Terminal).
// It opens and closes a box that the caller draws under its row. It is never a game action.
export function InfoButton({ label, open, onToggle, dark = false }: { label: string; open: boolean; onToggle: () => void; dark?: boolean }) {
  const colour = dark ? "#F4F0E0" : "#1E1E1E";
  return (
    <button
      type="button"
      aria-label={`About ${label}`}
      aria-expanded={open}
      onClick={(e) => {
        // Inside a part card, the tap must not also pick or place the part.
        e.stopPropagation();
        onToggle();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md ${
        dark ? "hover:bg-[#2E2E2E]" : "hover:bg-black/5"
      } ${open ? (dark ? "bg-[#2E2E2E]" : "bg-black/5") : ""}`}
    >
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true" focusable="false">
        <circle cx="13" cy="13" r="11" fill="none" stroke={colour} strokeWidth="2.2" />
        <circle cx="13" cy="8" r="1.6" fill={colour} />
        <path d="M13 12 V19" stroke={colour} strokeWidth="2.6" strokeLinecap="round" />
      </svg>
    </button>
  );
}

// The box an info button opens, under its row.
export function InfoBox({ dark = false, children }: { dark?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`mt-1 flex flex-col gap-1 rounded-md border-2 px-3 py-2 text-[18px] ${
        dark ? "border-[#7A9CC6] bg-[#26303D] text-[#F4F0E0]" : "border-[#2A5FD0] bg-[#EEF3FD] text-ink"
      }`}
    >
      {children}
    </div>
  );
}
