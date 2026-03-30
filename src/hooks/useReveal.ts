import { useCallback, useEffect, useState } from "react";

/**
 * useReveal — scroll-reveal hook using a callback ref.
 *
 * Using a callback ref (instead of useRef) is critical here because the
 * component conditionally renders a skeleton first, then swaps to real content.
 * A plain useRef's useEffect would run once while the section is null and never
 * re-trigger. The callback ref pattern fires whenever the element mounts/unmounts,
 * so the IntersectionObserver is always set up on the real DOM node.
 *
 * Usage:
 *   const ref = useReveal();
 *   <section ref={ref}>
 *     <div data-reveal data-reveal-delay="0">…</div>
 *     <div data-reveal data-reveal-delay="1">…</div>
 *   </section>
 */
export function useReveal(threshold = 0.1) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  // Callback ref: called with the DOM node when the element mounts/unmounts
  const ref = useCallback((node: HTMLElement | null) => {
    setContainer(node);
  }, []);

  useEffect(() => {
    if (!container) return;

    const targets = container.querySelectorAll<HTMLElement>("[data-reveal]");
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delayStep = parseInt(el.dataset.revealDelay ?? "0", 10);
            el.style.transitionDelay = `${delayStep * 90}ms`;
            el.classList.add("revealed");
            observer.unobserve(el); // fire once
          }
        });
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [container, threshold]);

  return ref;
}
