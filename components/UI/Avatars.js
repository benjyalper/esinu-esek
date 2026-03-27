/**
 * Original cartoon avatars — inspired by SpongeBob, Roblox, Minecraft & Brawl Stars worlds.
 * All artwork is original SVG — no copyrighted assets used.
 */

/* ── SpongeBob-world: "ספוגצ'יק" ───────────────────────────────────────── */
export function SpongeyAvatar({ size = 48 }) {
  return (
    <svg viewBox="0 0 60 80" width={size} height={size} style={{ display: 'block' }}>
      {/* Body */}
      <rect x="8" y="10" width="44" height="52" rx="6" fill="#FFD93D" stroke="#D4A800" strokeWidth="2"/>
      {/* Sponge holes */}
      <circle cx="16" cy="20" r="3"   fill="#D4A800" opacity="0.45"/>
      <circle cx="30" cy="15" r="2"   fill="#D4A800" opacity="0.45"/>
      <circle cx="45" cy="23" r="3"   fill="#D4A800" opacity="0.45"/>
      <circle cx="12" cy="38" r="2"   fill="#D4A800" opacity="0.45"/>
      <circle cx="49" cy="42" r="2"   fill="#D4A800" opacity="0.45"/>
      <circle cx="22" cy="52" r="2.5" fill="#D4A800" opacity="0.45"/>
      <circle cx="42" cy="50" r="2"   fill="#D4A800" opacity="0.45"/>
      {/* Eyes */}
      <ellipse cx="22" cy="32" rx="7" ry="8" fill="white" stroke="#555" strokeWidth="1.5"/>
      <ellipse cx="38" cy="32" rx="7" ry="8" fill="white" stroke="#555" strokeWidth="1.5"/>
      <circle cx="24" cy="34" r="4"   fill="#4A90D9"/>
      <circle cx="40" cy="34" r="4"   fill="#4A90D9"/>
      <circle cx="25" cy="33" r="2"   fill="#111"/>
      <circle cx="41" cy="33" r="2"   fill="#111"/>
      <circle cx="26" cy="31" r="1"   fill="white"/>
      <circle cx="42" cy="31" r="1"   fill="white"/>
      {/* Nose */}
      <path d="M27 42 Q30 47 33 42" stroke="#B8860B" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Smile + buck teeth */}
      <path d="M16 51 Q30 62 44 51" stroke="#555" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <rect x="24" y="51" width="6" height="7" rx="1" fill="white" stroke="#ccc" strokeWidth="0.5"/>
      <rect x="31" y="51" width="6" height="7" rx="1" fill="white" stroke="#ccc" strokeWidth="0.5"/>
      {/* Pants & belt */}
      <rect x="8"  y="54" width="44" height="8" rx="3" fill="#5C3010"/>
      <rect x="8"  y="54" width="44" height="4" rx="2" fill="#8B4513"/>
      {/* Red tie */}
      <polygon points="30,44 27,53 30,57 33,53" fill="#DD0000"/>
    </svg>
  );
}

/* ── Roblox-world: "בלוקי" ──────────────────────────────────────────────── */
export function BlockyAvatar({ size = 48 }) {
  return (
    <svg viewBox="0 0 60 80" width={size} height={size} style={{ display: 'block' }}>
      {/* Head block */}
      <rect x="9" y="5" width="42" height="42" rx="4" fill="#FFE4B5" stroke="#C9922C" strokeWidth="2"/>
      {/* Hair block */}
      <rect x="9"  y="5"  width="42" height="14" rx="4"  fill="#2348A2"/>
      <rect x="9"  y="14" width="42" height="5"         fill="#2348A2"/>
      {/* Eyes (pixelated squares) */}
      <rect x="16" y="24" width="11" height="10" rx="2" fill="white"/>
      <rect x="33" y="24" width="11" height="10" rx="2" fill="white"/>
      <rect x="19" y="27" width="5"  height="5"  rx="1" fill="#111"/>
      <rect x="36" y="27" width="5"  height="5"  rx="1" fill="#111"/>
      <rect x="21" y="27" width="2"  height="2"         fill="white"/>
      <rect x="38" y="27" width="2"  height="2"         fill="white"/>
      {/* Mouth */}
      <rect x="20" y="38" width="20" height="5" rx="2" fill="#CC8877"/>
      {/* Body – blue shirt */}
      <rect x="11" y="48" width="38" height="28" rx="4" fill="#1E90FF" stroke="#1060BB" strokeWidth="1.5"/>
      {/* Arms */}
      <rect x="2"  y="48" width="10" height="22" rx="3" fill="#1E90FF" stroke="#1060BB" strokeWidth="1"/>
      <rect x="48" y="48" width="10" height="22" rx="3" fill="#1E90FF" stroke="#1060BB" strokeWidth="1"/>
      {/* Big "R" badge */}
      <text x="21" y="72" fontSize="18" fontWeight="900" fill="white" fontFamily="Arial, sans-serif">R</text>
    </svg>
  );
}

/* ── Minecraft-world: "קראפטי" ──────────────────────────────────────────── */
export function CraftyAvatar({ size = 48 }) {
  /* Pixel face grid (8×8) */
  const PX = 5;
  const face = [
    ['#7A4F2E','#7A4F2E','#7A4F2E','#7A4F2E','#7A4F2E','#7A4F2E','#7A4F2E','#7A4F2E'],
    ['#7A4F2E','#C68642','#C68642','#C68642','#C68642','#C68642','#C68642','#7A4F2E'],
    ['#C68642','#C68642','#C68642','#C68642','#C68642','#C68642','#C68642','#C68642'],
    ['#C68642','#4169E1','#4169E1','#C68642','#C68642','#4169E1','#4169E1','#C68642'],
    ['#C68642','#4169E1','#4169E1','#C68642','#C68642','#4169E1','#4169E1','#C68642'],
    ['#C68642','#C68642','#C68642','#C68642','#C68642','#C68642','#C68642','#C68642'],
    ['#C68642','#9E3D1E','#C68642','#C68642','#C68642','#C68642','#9E3D1E','#C68642'],
    ['#C68642','#C68642','#9E3D1E','#9E3D1E','#9E3D1E','#9E3D1E','#C68642','#C68642'],
  ];
  return (
    <svg viewBox="0 0 60 80" width={size} height={size} style={{ display: 'block' }}>
      {face.map((row, ri) =>
        row.map((color, ci) => (
          <rect key={`${ri}-${ci}`} x={10 + ci * PX} y={3 + ri * PX}
                width={PX} height={PX} fill={color}/>
        ))
      )}
      {/* Blue/teal shirt body */}
      <rect x="10" y="44" width="40" height="30" rx="2" fill="#1E8B8B" stroke="#136868" strokeWidth="1.5"/>
      {/* Arms */}
      <rect x="1"  y="44" width="10" height="24" rx="2" fill="#C68642" stroke="#A56830" strokeWidth="1"/>
      <rect x="49" y="44" width="10" height="24" rx="2" fill="#C68642" stroke="#A56830" strokeWidth="1"/>
      {/* Pickaxe in hand */}
      <line x1="4" y1="56" x2="12" y2="48" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
      <rect x="10" y="44" width="5" height="5" rx="1" fill="#888"/>
    </svg>
  );
}

/* ── Brawl Stars-world: "בראולי" ───────────────────────────────────────── */
export function BrawlyAvatar({ size = 48 }) {
  return (
    <svg viewBox="0 0 60 80" width={size} height={size} style={{ display: 'block' }}>
      {/* Star aura glow */}
      <polygon
        points="30,2 34,16 48,16 37,25 41,39 30,30 19,39 23,25 12,16 26,16"
        fill="#FFD700" opacity="0.25"/>
      {/* Head (round) */}
      <circle cx="30" cy="30" r="22" fill="#FF6B35" stroke="#BB3A00" strokeWidth="2"/>
      {/* Hair spikes */}
      <polygon points="30,8 26,20 34,20"  fill="#BB2200"/>
      <polygon points="18,13 17,24 26,21" fill="#BB2200"/>
      <polygon points="42,13 43,24 34,21" fill="#BB2200"/>
      {/* Eyes */}
      <ellipse cx="22" cy="28" rx="5.5" ry="5.5" fill="white"/>
      <ellipse cx="38" cy="28" rx="5.5" ry="5.5" fill="white"/>
      <circle cx="23" cy="29" r="3.5" fill="#111"/>
      <circle cx="39" cy="29" r="3.5" fill="#111"/>
      <circle cx="24" cy="27" r="1.2" fill="white"/>
      <circle cx="40" cy="27" r="1.2" fill="white"/>
      {/* Angry brows */}
      <path d="M16 22 L27 25" stroke="#BB2200" strokeWidth="3" strokeLinecap="round"/>
      <path d="M44 22 L33 25" stroke="#BB2200" strokeWidth="3" strokeLinecap="round"/>
      {/* Smile */}
      <path d="M20 38 Q30 46 40 38" stroke="#BB2200" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Body gold */}
      <rect x="12" y="52" width="36" height="24" rx="6" fill="#FFD700" stroke="#BBA000" strokeWidth="1.5"/>
      {/* Star badge on chest */}
      <polygon points="30,55 32,62 39,62 34,66 36,73 30,68 24,73 26,66 21,62 28,62"
               fill="#FF6B35" stroke="#BB3A00" strokeWidth="0.8"/>
      {/* Arms */}
      <ellipse cx="7"  cy="62" rx="7" ry="12" fill="#FF6B35" stroke="#BB3A00" strokeWidth="1.5"/>
      <ellipse cx="53" cy="62" rx="7" ry="12" fill="#FF6B35" stroke="#BB3A00" strokeWidth="1.5"/>
    </svg>
  );
}

/* ── Config array ───────────────────────────────────────────────────────── */
export const AVATARS = [
  { key: 'spongey', name: 'ספוגצ\'יק',   world: 'ביקיני בוטום',  Component: SpongeyAvatar, bgColor: '#FFD93D', dotColor: '#D4A800' },
  { key: 'blocky',  name: 'בלוקי',       world: 'עולם Roblox',   Component: BlockyAvatar,  bgColor: '#1E90FF', dotColor: '#1060BB' },
  { key: 'crafty',  name: 'קראפטי',      world: 'Minecraft',     Component: CraftyAvatar,  bgColor: '#1E8B8B', dotColor: '#136868' },
  { key: 'brawly',  name: 'בראולי',      world: 'Brawl Stars',   Component: BrawlyAvatar,  bgColor: '#FF6B35', dotColor: '#BB3A00' },
];

/** Small token badge used on the board */
export function AvatarToken({ avatarKey, size = 22, isMe = false }) {
  const def = AVATARS.find(a => a.key === avatarKey) || AVATARS[0];
  const { Component, bgColor, dotColor } = def;
  return (
    <div
      title={def.name}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: bgColor,
        border: `2px solid ${isMe ? '#ffffff' : dotColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        boxShadow: isMe ? '0 0 0 2px #6366f1' : 'none',
      }}
    >
      <Component size={size * 1.1} />
    </div>
  );
}

/** Selection card used on home page */
export function AvatarCard({ avatar, selected, onClick }) {
  const { Component, bgColor, dotColor, name, world } = avatar;
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 p-3 rounded-2xl transition-all transform hover:scale-105"
      style={{
        backgroundColor: selected ? bgColor + '33' : '#1e293b',
        border: `3px solid ${selected ? dotColor : '#334155'}`,
        outline: 'none',
      }}
    >
      <div className="rounded-full flex items-center justify-center overflow-hidden"
           style={{ backgroundColor: bgColor, width: 72, height: 72, padding: 4 }}>
        <Component size={68} />
      </div>
      <span className="text-white font-bold text-sm">{name}</span>
      <span className="text-slate-400 text-xs">{world}</span>
    </button>
  );
}
