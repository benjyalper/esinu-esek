/**
 * DicePopup — floating overlay that shows dice rolling for 3 seconds,
 * displays the result for ~1 second, then auto-closes.
 * The static result remains in the bottom-of-screen Dice component.
 */
import { useEffect, useState } from 'react';

const DOTS = {
  1: [[50,50]],
  2: [[25,25],[75,75]],
  3: [[25,25],[50,50],[75,75]],
  4: [[25,25],[75,25],[25,75],[75,75]],
  5: [[25,25],[75,25],[50,50],[25,75],[75,75]],
  6: [[25,25],[75,25],[25,50],[75,50],[25,75],[75,75]],
};

function BigDie({ value, rolling, color = '#6366f1', size = 90 }) {
  const [display, setDisplay] = useState(value || 1);

  useEffect(() => {
    if (rolling) {
      const iv = setInterval(() => setDisplay(Math.floor(Math.random() * 6) + 1), 55);
      return () => clearInterval(iv);
    } else {
      if (value) setDisplay(value);
    }
  }, [rolling, value]);

  const dots = DOTS[display] || DOTS[1];

  return (
    <div
      style={{
        width: size, height: size,
        backgroundColor: '#0f172a',
        border: `3px solid ${color}`,
        borderRadius: 16,
        boxShadow: rolling
          ? `0 0 24px ${color}cc, 0 0 60px ${color}55`
          : `0 0 14px ${color}88`,
        transition: 'box-shadow 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {rolling && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 50% 50%, ${color}22, transparent 70%)`,
          animation: 'diceRoll 0.3s linear infinite',
        }}/>
      )}
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {dots.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={11} fill={color}/>
        ))}
      </svg>
    </div>
  );
}

export default function DicePopup({ d1, d2, rolling, isDouble, visible }) {
  const [opacity, setOpacity] = useState(0);

  // Fade in when becoming visible
  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => setOpacity(1));
    } else {
      setOpacity(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 60,
        pointerEvents: 'none',
        opacity,
        transition: 'opacity 0.3s ease',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
          border: '2px solid #6366f1',
          borderRadius: 28,
          padding: '28px 36px',
          boxShadow: '0 25px 80px rgba(0,0,0,0.8), 0 0 40px rgba(99,102,241,0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          minWidth: 240,
        }}
      >
        {/* Header */}
        <p style={{
          color: rolling ? '#818cf8' : '#c7d2fe',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}>
          {rolling ? '🎲 מטיל קוביות...' : '🎰 התוצאה!'}
        </p>

        {/* Dice */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <BigDie value={d1} rolling={rolling} size={90} />
          <span style={{ color: '#475569', fontSize: 28, fontWeight: 900 }}>+</span>
          <BigDie
            value={d2}
            rolling={rolling}
            size={90}
            color={!rolling && isDouble ? '#f59e0b' : '#6366f1'}
          />
        </div>

        {/* Result */}
        {!rolling && d1 && (
          <div style={{ textAlign: 'center' }}>
            {isDouble ? (
              <p style={{ color: '#fbbf24', fontWeight: 900, fontSize: 22 }}>
                🎰 זוג! {d1}+{d2}={d1 + d2}
              </p>
            ) : (
              <p style={{ color: 'white', fontWeight: 900, fontSize: 26 }}>
                {d1} + {d2} ={' '}
                <span style={{ color: '#818cf8', fontSize: 32 }}>{d1 + d2}</span>
              </p>
            )}
          </div>
        )}

        {/* Rolling spinner bar */}
        {rolling && (
          <div style={{ width: '100%', height: 4, backgroundColor: '#1e293b', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              backgroundColor: '#6366f1',
              borderRadius: 2,
              animation: 'rollProgress 3s linear forwards',
            }}/>
          </div>
        )}
      </div>

      <style>{`
        @keyframes rollProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
