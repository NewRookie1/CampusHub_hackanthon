import { useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';

const PARTICLE_COUNT = 45;

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  hue: number;
}

export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { isDark } = useTheme();

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.1,
        hue: Math.random() * 60 + 220,
      });
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particles.forEach((p) => {
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 200) {
          const force = (200 - dist) / 200 * 0.02;
          p.x -= dx * force;
          p.y -= dy * force;
        }

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const pOpacity = isDark ? p.opacity : p.opacity * 0.4;
        const pHue = isDark ? p.hue : 230;
        const pSat = isDark ? 70 : 50;
        const pLight = isDark ? 70 : 55;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${pHue}, ${pSat}%, ${pLight}%, ${pOpacity})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const lineAlpha = isDark ? 0.08 : 0.04;
            ctx.strokeStyle = `rgba(99, 102, 241, ${lineAlpha * (1 - dist / 130)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Mouse glow connection
      if (mx > 0 && my > 0) {
        particles.forEach((p) => {
          const dx = mx - p.x;
          const dy = my - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mx, my);
            const glowAlpha = isDark ? 0.06 : 0.03;
            ctx.strokeStyle = `rgba(139, 92, 246, ${glowAlpha * (1 - dist / 180)})`;
            ctx.lineWidth = 0.3;
            ctx.stroke();
          }
        });
      }

      animId = requestAnimationFrame(drawParticles);
    };

    drawParticles();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isDark]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ opacity: 0.6 }}
      />
      <div className="liquid-blob w-[600px] h-[600px] bg-primary-600 top-[-200px] left-[-200px] fixed z-0" />
      <div className="liquid-blob w-[500px] h-[500px] bg-purple-600 bottom-[-150px] right-[-150px] fixed z-0" style={{ animationDelay: '3s' }} />
      <div className="liquid-blob w-[400px] h-[400px] bg-pink-600 top-[40%] left-[60%] fixed z-0" style={{ animationDelay: '5s' }} />
    </>
  );
}
