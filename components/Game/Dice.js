/**
 * Dice component — shows two animated dice
 */
import { useState, useEffect } from 'react';

const DOTS = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

function DieFace({ value, rolling, color = '#6366f1' }) {
  const [display, setDisplay] = useState(value || 1);
  const [rolling_, setRolling_] = useState(false);

  useEffect(() => {
    if (rolling) {
      setRolling_(true);
      const interval = setInterval(() => {
        setDisplay(Math.floor(Math.random() * 6) + 1);
      }, 80);
      setTimeout(() => {
        clearInterval(interval);
        setDisplay(value || 1);
        setRolling_(false);
      }, 600);
      return () => clearInterval(interval);
    } else {
      if (value) setDisplay(value);
    }
  }, [rolling, value]);

  const dots = DOTS[display] || DOTS[1];

  return (
    <div
      className={`relative rounded-xl border-2 shadow-lg ${rolling_ ? 'dice-rolling' : ''}`}
      style={{
        width: 52, height: 52,
        backgroundColor: '#1e293b',
        borderColor: color,
        boxShadow: `0 0 12px ${color}60`,
      }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        {dots.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={10} fill={color} />
        ))}
      </svg>
    </div>
  );
}

export default function Dice({ d1, d2, rolling, isDouble }) {
  if (!d1 && !d2 && !rolling) {
    return (
      <div className="flex gap-3 opacity-30">
        <DieFace value={1} />
        <DieFace value={1} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-3">
        <DieFace value={d1} rolling={rolling} />
        <DieFace value={d2} rolling={rolling} color={isDouble ? '#f59e0b' : '#6366f1'} />
      </div>
      {!rolling && d1 && (
        <div className="text-center">
          {isDouble ? (
            <span className="text-yellow-400 text-xs font-bold animate-pulse-fast">🎰 זוג! הטל שוב!</span>
          ) : (
            <span className="text-slate-400 text-xs">{d1} + {d2} = {d1 + d2}</span>
          )}
        </div>
      )}
    </div>
  );
}
