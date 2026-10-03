// Short numbers for the tray, for example 1.2M and £3.4K (docs/UI_THEME.md > Phone layout).
export function shortNumber(n: number): string {
  const steps: [number, string][] = [
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ];
  for (const [size, mark] of steps) {
    if (n >= size) {
      const v = n / size;
      return `${v >= 100 ? Math.round(v) : Math.round(v * 10) / 10}${mark}`;
    }
  }
  return String(Math.round(n));
}

export const fullNumber = (n: number) => n.toLocaleString("en-GB");
