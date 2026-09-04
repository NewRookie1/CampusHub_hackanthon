import { ReactNode } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface Props {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'left' | 'right' | 'scale';
  delay?: number;
}

export default function GlassCard({ children, className = '', direction = 'up', delay = 0 }: Props) {
  const { ref, isVisible } = useScrollReveal();

  const dirClass = {
    up: isVisible ? 'scroll-visible' : 'scroll-hidden',
    left: isVisible ? 'scroll-visible-left' : 'scroll-hidden-left',
    right: isVisible ? 'scroll-visible-right' : 'scroll-hidden-right',
    scale: isVisible ? 'scroll-visible-scale' : 'scroll-hidden-scale',
  }[direction];

  return (
    <div
      ref={ref}
      className={`glass-card ${dirClass} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
