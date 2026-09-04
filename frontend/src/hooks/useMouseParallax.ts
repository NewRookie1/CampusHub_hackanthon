import { useState, useEffect } from 'react';

export function useMouseParallax(factor = 0.02) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) * factor;
      const y = (e.clientY - window.innerHeight / 2) * factor;
      setOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [factor]);

  return offset;
}
