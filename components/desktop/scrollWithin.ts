// Scrolls an element into view inside its own window only. The browser's scrollIntoView
// would also move the room and the desktop around it, which must stay still.
export function scrollWithin(el: HTMLElement | null) {
  if (!el) return;
  for (let p = el.parentElement; p; p = p.parentElement) {
    const { overflowY } = getComputedStyle(p);
    if (overflowY !== "auto" && overflowY !== "scroll") continue;
    const box = p.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (r.bottom > box.bottom) p.scrollTop += Math.min(r.bottom - box.bottom + 8, r.top - box.top - 8);
    else if (r.top < box.top) p.scrollTop -= box.top - r.top + 8;
    return;
  }
}
