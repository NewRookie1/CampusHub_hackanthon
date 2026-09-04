import { useCallback, useRef } from 'react';

export function useRipple() {
  const containerRef = useRef<HTMLDivElement>(null);

  const createRipple = useCallback((e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    container.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }, []);

  return { containerRef, createRipple };
}
