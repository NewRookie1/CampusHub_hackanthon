import { ButtonHTMLAttributes, ReactNode } from 'react';
import { useRipple } from '../hooks/useRipple';
import { useMagnetic } from '../hooks/useMagnetic';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'glass' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const variants = {
  primary: 'bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:from-primary-500 hover:to-purple-500 shadow-lg shadow-primary-500/25',
  glass: 'glass text-white hover:bg-white/10',
  ghost: 'bg-transparent text-white/70 hover:text-white hover:bg-white/5',
  danger: 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20',
};

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-6 py-3 text-sm rounded-xl',
  lg: 'px-8 py-4 text-base rounded-2xl',
};

export default function GlassButton({ children, variant = 'primary', size = 'md', className = '', onClick, ...props }: Props) {
  const { containerRef, createRipple } = useRipple();
  const { ref: magneticRef, style: magneticStyle, hovered, handleMouseMove, handleMouseEnter, handleMouseLeave } = useMagnetic();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(e);
    onClick?.(e);
  };

  return (
    <div ref={containerRef as any} className="ripple-container inline-flex relative">
      <button
        ref={magneticRef as any}
        className={`
          relative font-semibold transition-all duration-200
          ${variants[variant]} ${sizes[size]}
          active:scale-[0.97]
          disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
          ${className}
        `}
        style={magneticStyle as React.CSSProperties}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        {...props}
      >
        <span
          className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300"
          style={{
            background: 'radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,0.18) 0%, transparent 55%)',
            opacity: hovered ? 1 : 0,
          }}
        />
        <span className="relative z-10">{children}</span>
      </button>
    </div>
  );
}
