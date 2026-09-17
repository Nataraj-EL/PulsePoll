import React, { useEffect, useState } from 'react';

export function ClickBurstProvider({ children }) {
  const [effects, setEffects] = useState([]);

  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target;
      if (!target) return;

      // Skip input, textarea, select controls so typing remains unhindered
      const tag = target.tagName ? target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        return;
      }

      // Detect background tone to adapt particle accent color
      let el = target;
      let isDarkBackground = false;

      while (el && el !== document.body) {
        const style = window.getComputedStyle(el);
        const bgColor = style.backgroundColor;

        if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
          const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (match) {
            const r = parseInt(match[1], 10);
            const g = parseInt(match[2], 10);
            const b = parseInt(match[3], 10);

            const alphaMatch = bgColor.match(/rgba?\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/);
            const alpha = alphaMatch ? parseFloat(alphaMatch[1]) : 1;

            if (alpha > 0.1) {
              const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
              if (luminance < 120) {
                isDarkBackground = true;
              }
              break;
            }
          }
        }
        el = el.parentElement;
      }

      const newEffect = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
        color: isDarkBackground ? '#56f68f' : '#0ad652',
      };

      setEffects((prev) => [...prev, newEffect]);

      setTimeout(() => {
        setEffects((prev) => prev.filter((eff) => eff.id !== newEffect.id));
      }, 500);
    };

    window.addEventListener('click', handleClick, { capture: true });
    return () => {
      window.removeEventListener('click', handleClick, { capture: true });
    };
  }, []);

  return (
    <>
      {children}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 99999,
      }}>
        {effects.map((eff) => (
          <div
            key={eff.id}
            style={{
              position: 'absolute',
              top: eff.y,
              left: eff.x,
              transform: 'translate(-50%, -50%)',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="burst-line animate-burst-1" style={{ backgroundColor: eff.color }} />
            <span className="burst-line animate-burst-2" style={{ backgroundColor: eff.color }} />
            <span className="burst-line animate-burst-3" style={{ backgroundColor: eff.color }} />
            <span className="burst-line animate-burst-4" style={{ backgroundColor: eff.color }} />
          </div>
        ))}
      </div>
    </>
  );
}
