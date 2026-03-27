/**
 * PlayerPanel — shows all players' info and owned properties
 */
import { useState } from 'react';
import { BOARD_TILES, PROPERTY_GROUPS } from '../../lib/boardData';

const TOKENS = ['🍔','🪼','🧊','⛏️','💎','⭐','🐟','🧽'];

function PropertyBadge({ tileId, upgrades, mortgaged, isMyProperty, onUpgrade, onSellHouse, onMortgage, onUnmortgage }) {
  const tile = BOARD_TILES[tileId];
  if (!tile) return null;
  const groupColor = tile.group ? PROPERTY_GROUPS[tile.group]?.color : '#6b7280';
  const lvl = upgrades || 0;

  return (
    <div
      className={`relative px-2 py-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer
        ${mortgaged ? 'opacity-40 line-through' : ''}
        hover:ring-1 ring-white transition-all`}
      style={{ backgroundColor: groupColor + '33', borderLeft: `3px solid ${groupColor}` }}
      title={`${tile.name} — ${lvl === 5 ? 'מלון' : lvl > 0 ? `${lvl} בתים` : 'ללא בניה'} ${mortgaged ? '(ממושכן)' : ''}`}
    >
      <span>{tile.emoji}</span>
      <span className="truncate max-w-16 text-slate-200">{tile.name}</span>
      {lvl > 0 && <span className="text-yellow-300">{lvl === 5 ? '🏨' : `${'🏠'.repeat(lvl)}`}</span>}
    </div>
  );
}

export default function PlayerPanel({ room, myId, onSelectTile, onUpgrade, onSellHouse, onMortgage, onUnmortgage }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!room) return null;

  return (
    <div className="flex flex-col gap-1 p-2 overflow-auto">
      <p className="text-slate-500 text-xs font-bold px-1">👥 שחקנים</p>
      {room.players.map((p, i) => {
        const isCurrent  = room.players[room.currentTurn]?.id === p.id;
        const isMe       = p.id === myId;
        const isExpanded = expandedId === p.id;
        const allProps   = [...(p.properties || []), ...(p.railroads || []), ...(p.utilities || [])];

        return (
          <div key={p.id}
               className={`rounded-xl border transition-all
                 ${isCurrent ? 'border-yellow-400 bg-yellow-900 bg-opacity-20' : 'border-slate-700 bg-slate-800'}
                 ${p.isBankrupt ? 'opacity-40' : ''}`}>

            {/* Header row */}
            <button
              className="w-full flex items-center gap-2 p-2 text-right"
              onClick={() => setExpandedId(isExpanded ? null : p.id)}
            >
              <span className="text-xl flex-shrink-0">{TOKENS[i % TOKENS.length]}</span>
              <div className="flex-1 min-w-0 text-right">
                <div className="flex items-center gap-1">
                  {isCurrent && <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse-fast flex-shrink-0" />}
                  <span className="font-bold text-sm truncate text-slate-200">{p.name}</span>
                  {isMe && <span className="text-indigo-400 text-xs">(אני)</span>}
                  {p.isBankrupt && <span className="text-red-400 text-xs">💀</span>}
                  {!p.connected && <span className="text-orange-400 text-xs">📵</span>}
                  {p.inJail && <span className="text-red-400 text-xs">🔒</span>}
                  {p.getOutOfJailCards > 0 && <span className="text-purple-400 text-xs">🔑×{p.getOutOfJailCards}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-black text-sm">₪{(p.cash || 0).toLocaleString()}</span>
                  <span className="text-slate-500 text-xs">{allProps.length} נכסים</span>
                </div>
              </div>
              <span className="text-slate-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
            </button>

            {/* Expanded: property list */}
            {isExpanded && allProps.length > 0 && (
              <div className="px-2 pb-2 flex flex-wrap gap-1 border-t border-slate-700 pt-2">
                {allProps.map(tileId => (
                  <PropertyBadge
                    key={tileId}
                    tileId={tileId}
                    upgrades={room.propertyUpgrades?.[tileId] || 0}
                    mortgaged={room.mortgaged?.[tileId] || false}
                    isMyProperty={isMe}
                    onUpgrade={() => onUpgrade(tileId)}
                    onSellHouse={() => onSellHouse(tileId)}
                    onMortgage={() => onMortgage(tileId)}
                    onUnmortgage={() => onUnmortgage(tileId)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
