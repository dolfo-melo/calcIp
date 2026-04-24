import { useEffect, useRef } from 'react';

interface Props {
  opacity?: number;
  speed?: number;
  fontSize?: number;
  className?: string;
}

// Katakana + binary + hex pool para o efeito Matrix
const CHARS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン' +
  '0123456789ABCDEFabcdef01101001110100110100110101' +
  '∑Ω∆∇∂∫√∞≠≤≥÷×±';

export default function MatrixRain({
  opacity = 0.85,
  speed = 1,
  fontSize = 14,
  className = '',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const lastTime = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cols = () => Math.floor(canvas.width / fontSize);

    // resize handler
    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drops.length = 0;
      for (let i = 0; i < cols(); i++) {
        drops[i] = Math.random() * -50;
      }
    }

    const drops: number[] = [];
    resize();
    window.addEventListener('resize', resize);

    const interval = 50 / speed; // ms por frame

    function draw(timestamp: number) {
      animRef.current = requestAnimationFrame(draw);
      if (timestamp - lastTime.current < interval) return;
      lastTime.current = timestamp;

      if (!canvas || !ctx) return;

      // Rastro de fade
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const colCount = cols();
      for (let i = 0; i < colCount; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Caracter líder — mais brilhante (head glow)
        if (y > 0 && y < canvas.height) {
          ctx.fillStyle = '#ccffcc';
          ctx.shadowColor = '#00ff41';
          ctx.shadowBlur = 8;
          ctx.font = `bold ${fontSize}px 'JetBrains Mono', monospace`;
          ctx.fillText(char, x, y);
        }

        // Caracter do body — verde normal
        const bodyChar = CHARS[Math.floor(Math.random() * CHARS.length)];
        const bodyY = (drops[i] - 1) * fontSize;
        if (bodyY > 0 && bodyY < canvas.height) {
          // Gradiente: mais brilhante perto do topo da gota, esmaece atrás
          const brightness = Math.max(0.1, 1 - (canvas.height - bodyY) / canvas.height);
          ctx.fillStyle = `rgba(0, ${Math.floor(160 + brightness * 95)}, ${Math.floor(brightness * 65)}, ${brightness})`;
          ctx.shadowBlur = 0;
          ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
          ctx.fillText(bodyChar, x, bodyY);
        }

        // Reset drop quando sai da tela
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.5;
      }
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [fontSize, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ opacity }}
    />
  );
}
