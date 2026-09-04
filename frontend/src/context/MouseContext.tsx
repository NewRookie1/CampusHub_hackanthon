import { createContext, useContext, useRef, useState, useEffect, useCallback, ReactNode } from 'react';

interface MouseContextType {
  position: { x: number; y: number };
  isHovering: boolean;
  setIsHovering: (v: boolean) => void;
}

const MouseContext = createContext<MouseContextType>({
  position: { x: 0, y: 0 },
  isHovering: false,
  setIsHovering: () => {},
});

export function MouseProvider({ children }: { children: ReactNode }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return (
    <MouseContext.Provider value={{ position, isHovering, setIsHovering }}>
      {children}
    </MouseContext.Provider>
  );
}

export const useMouse = () => useContext(MouseContext);
