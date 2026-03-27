/**
 * Dice component — animated dice that roll for 2 seconds before showing the result
 */
import { useState, useEffect, useRef } from 'react';

const DOTS = {
  1: [[50,50]],
  2: [[25,25],[75,75]],
  3: [[25,25],[50,50],[75,75]],
  4: [[25,25],[75,25],[25,75],[75,75]],
  5: [[25,25],[75,25],[50,50],[25,75],[75,75]],
  6: [[25,25],[75,25],[25,50],[75,50],[25,75],[75,75]],
};

const ROLL_DURATION = 3000; // ms — 3 full seconds of animation

function DieFace({ value, rolling, color = '#6366f1' }) {
  const [display, setDisplay] = useState(value || 1);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (rolling) {
      // Randomise rapidly during the first 1.85s, then lock to value at ~1.9s
      intervalRef.current = setInterval(() => {
        setDisplay(Math.floor(Math.random() * 6) + 1);
      }, 60);

      // Snap to final value near the end of the 3-second window
      const snapTimer = setTimeout(() => {
        clearInterval(intervalRef.current);
        setDisplay(value || 1);
      }, ROLL_DURATION - 120);

      return () => {
        clearInterval(intervalRef.current);
        clearTimeout(snapTimer);
      };
    } else {
      if (value) setDisplay(value);
    }
  }, [rolling, value]);

  const dots = DOTS[display] || DOTS[1];

  return (
    <div
      className={`relative rounded-xl border-2 select-none ${rolling ? 'dice-rolling' : ''}`}
      style={{
        width: 58, height: 58,
        backgroundColor: '#1e293b',
        borderColor: color,
        boxShadow: rolling
          ? `0 0 20px ${color}90, 0 0 40px ${color}40`
          : `0 0 10px ${color}50`,
        transition: 'box-shadow 0.3s ease',
      }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        {dots.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={11} fill={color}/>
        ))}
      </svg>
    </div>
  );
}

export default function Dice({ d1, d2, rolling, isDouble }) {
  // Show placeholder when no dice have been rolled yet
  if (!d1 && !d2 && !rolling) {
    return (
      <div className="flex gap-3 opacity-25 select-none">
        <DieFace value={1} />
        <DieFace value={1} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-3">
        <DieFace value={d1} rolling={rolling} />
        <DieFace
          value={d2}
          rolling={rolling}
          color={!rolling && isDouble ? '#f59e0b' : '#6366f1'}
        />
      </div>

      {rolling && (
        <span className="text-indigo-400 text-xs font-bold animate-pulse-fast">
          🎲 מטיל...
        </span>
      )}

      {!rolling && d1 && (
        <div className="text-center">
          {isDouble ? (
            <span className="text-yellow-400 text-xs font-bold animate-pulse-fast">
              🎰 זוג! הטל שוב!
            </span>
          ) : (
            <span className="text-slate-400 text-xs">
              {d1} + {d2} = {d1 + d2}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
