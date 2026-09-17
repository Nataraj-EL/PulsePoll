import React, { useEffect, useRef } from 'react';

export function DotMatrixBackground({ targetRef, dotColor = '31, 21, 20', glowColor = '10, 214, 82' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use targetRef or container parent node
    const container = targetRef?.current || canvas.parentElement;
    if (!container) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = 1;

    let mouse = { x: -1000, y: -1000, active: false };
    let lastEmitterPos = { x: -1000, y: -1000 };
    let lastRippleTime = 0;

    let dots = [];
    let shockwaves = [];

    let isMobile = false;
    let spacing = 16;
    let baseDotSize = 0.80;
    let baseAlpha = 0.11;

    let prevWidth = 0;
    let prevHeight = 0;

    function initGrid() {
      if (!container || !canvas) return;

      const currentWidth = container.clientWidth;
      const currentHeight = container.clientHeight;

      if (dots.length > 0 && currentWidth === prevWidth && Math.abs(currentHeight - prevHeight) < 40) {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = currentWidth;
        height = currentHeight;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        prevHeight = currentHeight;
        return;
      }

      prevWidth = currentWidth;
      prevHeight = currentHeight;
      width = currentWidth;
      height = currentHeight;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      isMobile = width <= 640;
      spacing = isMobile ? 18 : 16;
      baseDotSize = isMobile ? 0.70 : 0.80;
      baseAlpha = isMobile ? 0.09 : 0.11;

      dots = [];
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * spacing + 8;
          const y = r * spacing + 8;
          if (y < 20) continue;

          dots.push({
            ox: x,
            oy: y,
            x: x,
            y: y,
            size: baseDotSize,
            alpha: baseAlpha,
            rippleGlow: 0
          });
        }
      }
    }

    initGrid();

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initGrid, 100);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    let ro;
    if (typeof ResizeObserver !== 'undefined' && container) {
      ro = new ResizeObserver(() => {
        initGrid();
      });
      ro.observe(container);
    }

    function spawnCircleRipple(x, y, strength = 1.0, maxRadiusOverride = null) {
      const now = performance.now();
      const minDistance = isMobile ? 50 : 60;
      const dx = x - lastEmitterPos.x;
      const dy = y - lastEmitterPos.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < minDistance * minDistance && now - lastRippleTime < 260) {
        return;
      }

      lastRippleTime = now;
      lastEmitterPos = { x, y };

      if (shockwaves.length >= 3) {
        shockwaves.shift();
      }

      shockwaves.push({
        x,
        y,
        radius: 0,
        maxRadius: maxRadiusOverride || (isMobile ? 220 : 300),
        expansionSpeed: isMobile ? 3.6 : 4.6,
        strength: (isMobile ? 0.75 : 1.0) * strength,
        maxRingWidth: isMobile ? 36 : 48
      });
    }

    const handleMouseEnter = (e) => {
      mouse.active = true;
      const rect = container.getBoundingClientRect();
      const nx = e.clientX - rect.left;
      const ny = e.clientY - rect.top;
      mouse.x = nx;
      mouse.y = ny;
      spawnCircleRipple(nx, ny, 1.1);
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
      lastEmitterPos = { x: -1000, y: -1000 };
    };

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const nx = e.clientX - rect.left;
      const ny = e.clientY - rect.top;
      mouse.x = nx;
      mouse.y = ny;
      mouse.active = true;
      spawnCircleRipple(nx, ny);
    };

    const handleClick = (e) => {
      const rect = container.getBoundingClientRect();
      const nx = e.clientX - rect.left;
      const ny = e.clientY - rect.top;
      spawnCircleRipple(nx, ny, 1.4, isMobile ? 260 : 360);
    };

    const handleTouch = (e) => {
      if (e.touches && e.touches[0]) {
        const rect = container.getBoundingClientRect();
        const nx = e.touches[0].clientX - rect.left;
        const ny = e.touches[0].clientY - rect.top;
        mouse.x = nx;
        mouse.y = ny;
        mouse.active = true;
        spawnCircleRipple(nx, ny);
      }
    };

    const handleTouchStart = (e) => {
      mouse.active = true;
      handleTouch(e);
    };

    const handleTouchEnd = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
      lastEmitterPos = { x: -1000, y: -1000 };
    };

    container.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    container.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    container.addEventListener('mousemove', handleMouseMove, { passive: true });
    container.addEventListener('click', handleClick);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouch, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    let ambientTimer = 0;
    let rafId = null;
    let isVisible = true;

    const baseRGB = dotColor.split(',').map(n => parseInt(n.trim(), 10));
    const glowRGB = glowColor.split(',').map(n => parseInt(n.trim(), 10));

    function animate() {
      if (!isVisible) {
        rafId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      ambientTimer += 16;
      if (!mouse.active && ambientTimer > 4800 && shockwaves.length === 0) {
        ambientTimer = 0;
        spawnCircleRipple(width * 0.5, height * 0.45, 0.6, isMobile ? 220 : 300);
      }

      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        sw.radius += sw.expansionSpeed;
        sw.strength *= 0.975;

        if (sw.radius > sw.maxRadius || sw.strength < 0.012) {
          shockwaves.splice(s, 1);
        }
      }

      const dotCount = dots.length;
      const repelRadius = isMobile ? 95 : 120;

      for (let i = 0; i < dotCount; i++) {
        const d = dots[i];

        let targetX = d.ox;
        let targetY = d.oy;
        let targetSize = baseDotSize;
        let targetAlpha = baseAlpha;
        let waveGlow = 0;

        // 1. Direct Cursor Repulsion
        if (mouse.active) {
          const mdx = d.ox - mouse.x;
          const mdy = d.oy - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist > 0.5 && mdist < repelRadius) {
            const repelNorm = 1 - (mdist / repelRadius);
            const repelForce = Math.pow(repelNorm, 1.8) * (isMobile ? 12 : 18);
            const angle = Math.atan2(mdy, mdx);

            targetX += Math.cos(angle) * repelForce;
            targetY += Math.sin(angle) * repelForce;

            targetSize = Math.max(targetSize, baseDotSize + repelNorm * 0.75);
            targetAlpha = Math.min(isMobile ? 0.40 : 0.50, targetAlpha + repelNorm * 0.35);
            waveGlow = Math.max(waveGlow, repelNorm * 0.7);
          }
        }

        // 2. Expanding Concentric Circle Ripples
        for (let s = 0; s < shockwaves.length; s++) {
          const sw = shockwaves[s];
          const dx = d.ox - sw.x;
          const dy = d.oy - sw.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 0.1) {
            const radProgress = Math.min(1, sw.radius / sw.maxRadius);
            const currentRingWidth = 14 + radProgress * (sw.maxRingWidth - 14);

            const ringDelta = Math.abs(dist - sw.radius);

            if (ringDelta < currentRingWidth) {
              const normDelta = ringDelta / currentRingWidth;
              const envelope = 0.5 * (1 + Math.cos(Math.PI * normDelta));
              const fade = Math.pow(1 - radProgress, 1.2);
              const ringForce = envelope * sw.strength * fade;

              const angle = Math.atan2(dy, dx);
              const push = ringForce * (isMobile ? 5.5 : 8.5);

              targetX += Math.cos(angle) * push;
              targetY += Math.sin(angle) * push;

              targetSize = Math.max(targetSize, baseDotSize + ringForce * 0.8);
              targetAlpha = Math.min(isMobile ? 0.40 : 0.50, targetAlpha + ringForce * 0.35);
              waveGlow = Math.max(waveGlow, ringForce);
            }
          }
        }

        // 3. Lerp integration
        d.x += (targetX - d.x) * 0.18;
        d.y += (targetY - d.y) * 0.18;

        d.size += (targetSize - d.size) * 0.16;
        d.alpha += (targetAlpha - d.alpha) * 0.16;
        d.rippleGlow = (d.rippleGlow || 0) * 0.85 + waveGlow * 0.15;

        // Render dot with color glow transition
        if (d.rippleGlow > 0.03) {
          const gRatio = Math.min(1, d.rippleGlow * 1.3);
          const r = Math.round(baseRGB[0] + (glowRGB[0] - baseRGB[0]) * gRatio);
          const g = Math.round(baseRGB[1] + (glowRGB[1] - baseRGB[1]) * gRatio);
          const b = Math.round(baseRGB[2] + (glowRGB[2] - baseRGB[2]) * gRatio);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${d.alpha})`;
        } else {
          ctx.fillStyle = `rgba(${baseRGB[0]}, ${baseRGB[1]}, ${baseRGB[2]}, ${d.alpha})`;
        }

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(animate);
    }

    let observer;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible = true;
            if (!rafId) {
              rafId = requestAnimationFrame(animate);
            }
          } else {
            isVisible = false;
            if (rafId) {
              cancelAnimationFrame(rafId);
              rafId = null;
            }
          }
        });
      }, { threshold: 0.01 });

      observer.observe(container);
    } else {
      rafId = requestAnimationFrame(animate);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (ro) ro.disconnect();
      if (observer) observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);

      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouch);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [targetRef, dotColor, glowColor]);

  return (
    <canvas
      ref={canvasRef}
      className="dot-matrix-canvas"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}
