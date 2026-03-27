/**
 * BoardTile — a single tile on the board.
 * Renders avatar tokens instead of plain emoji.
 */
import { PROPERTY_GROUPS } from '../../lib/boardData';
import { AvatarToken } from '../UI/Avatars';

const GROUP_COLORS = {
  brown:      '#8B4513',
  light_blue: '#87CEEB',
  pink:       '#FF69B4',
  orange:     '#FF8C00',
  red:        '#DC143C',
  yellow:     '#FFD700',
  green:      '#228B22',
  dark_blue:  '#00008B',
};

function UpgradeIndicator({ count }) {
  if (!count) return null;
  if (count === 5) return <span className="text-xs">🏨</span>;
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-1.5 h-1.5 bg-red-400 rounded-sm"/>
      ))}
    </div>
  );
}

export default function BoardTile({
  tile, tokens, myId, rotation, isCorner,
  ownerColor, upgrades, mortgaged, isCurrent, movingPlayerId,
}) {
  if (!tile) return <div className="bg-emerald-900"/>;

  const groupColor = tile.group ? GROUP_COLORS[tile.group] : null;
  const isSpecial  = ['go','jail','go_to_jail','free_parking'].includes(tile.type);

  const inner = (
    <div
      className={`w-full h-full flex flex-col items-center justify-start overflow-hidden cursor-pointer
        border border-emerald-700 relative
        ${isSpecial  ? 'bg-emerald-800' : 'bg-slate-800'}
        ${isCurrent  ? 'ring-2 ring-yellow-400 ring-inset' : ''}
        ${mortgaged  ? 'opacity-50' : ''}
        hover:brightness-125 transition-all`}
    >
      {/* Color group band */}
      {groupColor && !isCorner && (
        <div className="w-full flex-shrink-0" style={{ height:'20%', backgroundColor: groupColor }}>
          {ownerColor && (
            <div className="w-full h-full opacity-70" style={{ backgroundColor: ownerColor }}/>
          )}
        </div>
      )}

      {/* Owner dot for railroads/utilities */}
      {ownerColor && !groupColor && tile.type !== 'go' && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full border border-white"
             style={{ backgroundColor: ownerColor }}/>
      )}

      {/* Emoji */}
      <div className={`${isCorner ? 'text-2xl' : 'text-base'} leading-none mt-1 flex-shrink-0`}>
        {tile.emoji}
      </div>

      {/* Name */}
      <div className="text-center leading-tight font-bold px-0.5 text-slate-200"
           style={{ fontSize: isCorner ? '10px' : '7px' }}>
        {tile.name}
      </div>

      {/* Price / tax */}
      {tile.price && !isCorner && (
        <div className="text-emerald-400 font-bold" style={{ fontSize:'7px' }}>₪{tile.price}</div>
      )}
      {tile.amount && !isCorner && (
        <div className="text-red-400 font-bold" style={{ fontSize:'7px' }}>₪{tile.amount}</div>
      )}

      {/* Upgrade pips */}
      {upgrades > 0 && !isCorner && (
        <div className="mt-0.5"><UpgradeIndicator count={upgrades}/></div>
      )}

      {/* Mortgage overlay */}
      {mortgaged && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <span style={{ fontSize:'8px' }} className="text-red-400 font-bold rotate-45">משכון</span>
        </div>
      )}

      {/* Player avatar tokens */}
      {tokens.length > 0 && (
        <div className="absolute bottom-0 right-0 left-0 flex flex-wrap justify-center gap-0.5 p-0.5">
          {tokens.map((p) => {
            const isMovingThis = p.id === movingPlayerId;
            return (
              <div
                key={p.id}
                className={isMovingThis ? 'token-bounce' : ''}
                title={p.name}
              >
                <AvatarToken
                  avatarKey={p.avatar || 'spongey'}
                  size={isCorner ? 28 : 20}
                  isMe={p.id === myId}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (rotation === 0) return inner;
  return (
    <div className="w-full h-full relative overflow-hidden">
      <div style={{
        position:'absolute', inset:0,
        transform:`rotate(${rotation}deg)`,
        transformOrigin:'center center',
      }}>
        {inner}
      </div>
    </div>
  );
}
