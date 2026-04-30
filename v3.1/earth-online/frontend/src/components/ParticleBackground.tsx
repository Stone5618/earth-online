import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const detectPerformance = () => {
      const cores = navigator.hardwareConcurrency || 4;
      const memory = (navigator as any).deviceMemory || 4;
      const isSmallScreen = window.innerWidth < 768;
      return cores < 4 || memory < 2 || isSmallScreen;
    };

    const isLowPerformance = detectPerformance();
    const isMobileDevice = window.innerWidth < 768;
    let particleCount = 60;
    if (isMobileDevice) {
      particleCount = 25;
    } else if (isLowPerformance) {
      particleCount = 18;
    }
    
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    let lastMouseUpdate = 0;
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const now = Date.now();
        if (now - lastMouseUpdate > 50) {
          mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          lastMouseUpdate = now;
        }
      }
    };
    if (isMobileDevice) {
      window.addEventListener('touchmove', handleTouchMove);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;
      const mobile = window.innerWidth < 768;

      particles.forEach((particle, i) => {
        if (!mobile) {
          const dx = mouse.x - particle.x;
          const dy = mouse.y - particle.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 100) {
            const force = (100 - dist) / 100;
            particle.vx -= (dx / dist) * force * 0.02;
            particle.vy -= (dy / dist) * force * 0.02;
          }
        }

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        particle.vx *= 0.99;
        particle.vy *= 0.99;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 210, 255, ${particle.opacity})`;
        ctx.fill();

        if (!mobile) {
          for (let j = i + 1; j < particles.length; j++) {
            const other = particles[j];
            const dx2 = particle.x - other.x;
            const dy2 = particle.y - other.y;
            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

            if (dist2 < 100) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = `rgba(0, 210, 255, ${0.15 * (1 - dist2 / 100)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (isMobileDevice) {
        window.removeEventListener('touchmove', handleTouchMove);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = [];
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        background: 'transparent',
        willChange: 'transform'
      }}
    />
  );
}
