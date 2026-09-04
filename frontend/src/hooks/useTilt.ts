import { useCallback, useRef, useState } from 'react';

export function useTilt(maxTilt = 15) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({});

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const tiltX = (0.5 - y) * maxTilt;
      const tiltY = (x - 0.5) * maxTilt;

      setStyle({
        transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`,
        transition: 'transform 0.1s ease-out',
      });
    },
    [maxTilt]
  );

  const handleMouseLeave = useCallback(() => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s ease-out',
    });
  }, []);

  return { ref, style, handleMouseMove, handleMouseLeave };
}
