import React, { useEffect, useRef } from 'react';

const Wave3D = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    // Wave surface point calculation
    const getY = (x, lineIndex, totalLines, t) => {
      const norm = lineIndex / totalLines; // 0 to 1
      const phase = norm * Math.PI * 2;
      const amp = H() * 0.18 + norm * H() * 0.06;

      return (
        H() * 0.25 +
        norm * H() * 0.5 +
        Math.sin(x / W() * Math.PI * 2.5 + t * 0.6 + phase) * amp * 0.6 +
        Math.sin(x / W() * Math.PI * 1.2 - t * 0.4 + phase * 1.5) * amp * 0.45 +
        Math.sin(x / W() * Math.PI * 4.0 + t * 0.9 + phase * 0.7) * amp * 0.2
      );
    };

    const TOTAL_LINES = 38;
    const STEPS = 120;

    const draw = () => {
      const t = timeRef.current;
      const w = W();
      const h = H();
      ctx.clearRect(0, 0, w, h);

      // ── Background blob 1 ──
      const g1 = ctx.createRadialGradient(w * 0.28, h * 0.42, 0, w * 0.28, h * 0.42, w * 0.38);
      g1.addColorStop(0, 'rgba(88, 50, 200, 0.55)');
      g1.addColorStop(0.5, 'rgba(70, 30, 170, 0.30)');
      g1.addColorStop(1, 'rgba(30, 10, 80, 0)');
      ctx.fillStyle = g1;
      ctx.beginPath();
      ctx.ellipse(
        w * 0.28 + Math.sin(t * 0.3) * 12,
        h * 0.42 + Math.cos(t * 0.2) * 8,
        w * 0.30,
        h * 0.40,
        -0.3 + Math.sin(t * 0.15) * 0.1,
        0, Math.PI * 2
      );
      ctx.fill();

      // ── Background blob 2 ──
      const g2 = ctx.createRadialGradient(w * 0.55, h * 0.58, 0, w * 0.55, h * 0.58, w * 0.28);
      g2.addColorStop(0, 'rgba(70, 30, 180, 0.50)');
      g2.addColorStop(0.5, 'rgba(50, 20, 140, 0.25)');
      g2.addColorStop(1, 'rgba(20, 5, 60, 0)');
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.ellipse(
        w * 0.55 + Math.cos(t * 0.25) * 10,
        h * 0.58 + Math.sin(t * 0.18) * 10,
        w * 0.24,
        h * 0.32,
        0.4 + Math.cos(t * 0.12) * 0.1,
        0, Math.PI * 2
      );
      ctx.fill();

      // ── Dot grid (right side) ──
      const dotCols = 7, dotRows = 5;
      const dotStartX = w * 0.72;
      const dotStartY = h * 0.42;
      const dotGap = 14;
      for (let dr = 0; dr < dotRows; dr++) {
        for (let dc = 0; dc < dotCols; dc++) {
          const pulse = 0.4 + 0.3 * Math.sin(t * 1.2 + dr * 0.8 + dc * 0.5);
          ctx.beginPath();
          ctx.arc(dotStartX + dc * dotGap, dotStartY + dr * dotGap, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(160, 130, 255, ${pulse})`;
          ctx.fill();
        }
      }

      // ── Flowing contour lines ──
      for (let li = 0; li < TOTAL_LINES; li++) {
        const norm = li / (TOTAL_LINES - 1); // 0..1

        // Color: interpolate purple → gold based on depth
        const r = Math.round(120 + norm * 135);
        const g = Math.round(60 + norm * 110);
        const b = Math.round(255 - norm * 200);
        const alpha = 0.12 + norm * 0.55;

        ctx.beginPath();
        let started = false;

        for (let si = 0; si <= STEPS; si++) {
          const x = (si / STEPS) * w;
          const y = getY(x, li, TOTAL_LINES - 1, t);

          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.lineWidth = li < TOTAL_LINES * 0.4 ? 0.6 : 0.9;
        ctx.stroke();
      }

      timeRef.current += 0.012;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  );
};

export default Wave3D;
