import { useCallback, useRef, useState } from 'react';

interface MagneticStyle {
  '--mx': string;
  '--my': string;
}

export function useMagnetic() {
  const ref = useRef<HTMLButtonElement>(null);
  const [style, setStyle] = useState<MagneticStyle>({ '--mx': '50%', '--my': '50%' });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setStyle({
        '--mx': `${x}%`,
        '--my': `${y}%`,
      });
    },
    []
  );

  const handleMouseEnter = useCallback(() => {
    setHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    setStyle({ '--mx': '50%', '--my': '50%' });
  }, []);

  return { ref, style, hovered, handleMouseMove, handleMouseEnter, handleMouseLeave };
}
