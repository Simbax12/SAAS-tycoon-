// Named viewports shared by testing/suites, macros and live-verify's
// Before/After screenshots. A Before and After pair must use the same name.
// The widths are the ones every milestone has been checked at: 1440, 1024 and 375.

export const VIEWPORTS = {
  phone: { width: 375, height: 812 },
  laptop: { width: 1024, height: 768 },
  desktop: { width: 1440, height: 900 },
} as const;

export type ViewportName = keyof typeof VIEWPORTS;
