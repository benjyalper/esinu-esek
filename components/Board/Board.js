/**
 * Board component — renders the 11×11 Monopoly board
 */
import { BOARD_TILES, PROPERTY_GROUPS, getBoardLayout } from '../../lib/boardData';
import BoardTile from './BoardTile';

const TOKENS = ['🍔','🪼','🧊','⛏️','💎','⭐','🐟','🧽'];

export default function Board({ room, myId, onTileClick }) {
  const grid = getBoardLayout(); // 11×11 array of tileIds

  // Map: tileId -> [{player, tokenEmoji, color}]
  const tokensByTile = {};
  (room?.players || []).forEach((p, i) => {
    if (!p.isBankrupt) {
      if (!tokensByTile[p.position]) tokensByTile[p.position] = [];
      tokensByTile[p.position].push({ ...p, tokenEmoji: TOKENS[i % TOKENS.length] });
    }
  });

  // Board is 11×11; center (rows 1-9, cols 1-9) is info area
  const TILE_SIZE = 56; // px
  const CORNER_SIZE = TILE_SIZE * 1.6;

  return (
    <div
      className="relative bg-emerald-950 border-4 border-emerald-800 rounded-xl shadow-2xl overflow-hidden"
      style={{
        display: 'grid',
        gridTemplateColumns: `${CORNER_SIZE}px repeat(9, ${TILE_SIZE}px) ${CORNER_SIZE}px`,
        gridTemplateRows:    `${CORNER_SIZE}px repeat(9, ${TILE_SIZE}px) ${CORNER_SIZE}px`,
        width:  CORNER_SIZE * 2 + TILE_SIZE * 9,
        height: CORNER_SIZE * 2 + TILE_SIZE * 9,
      }}
    >
      {grid.map((row, r) =>
        row.map((tileId, c) => {
          if (tileId === null) {
            // Center area
            if (r === 0 || r === 10 || c === 0 || c === 10) return null;
            return (
              <div key={`${r}-${c}`}
                   style={{ gridArea: `${r + 1} / ${c + 1}` }}
                   className="bg-emerald-900" />
            );
          }

          const tile    = BOARD_TILES[tileId];
          const tokens  = tokensByTile[tileId] || [];
          const isCorner= (r === 0 || r === 10) && (c === 0 || c === 10);

          // Determine rotation for side tiles (so text faces the center)
          let rotation = 0;
          if (!isCorner) {
            if (r === 0)  rotation = 180; // top row — flip
            if (c === 0)  rotation = 90;  // left col — rotate
            if (c === 10) rotation = -90; // right col — rotate
            // bottom row (r===10) stays 0
          }

          const owned   = room?.propertyOwners?.[tileId];
          const owner   = owned ? room.players.find(p => p.id === owned) : null;
          const ownerIdx= owner ? room.players.indexOf(owner) : -1;
          const upgrades= room?.propertyUpgrades?.[tileId] || 0;
          const mortgaged= room?.mortgaged?.[tileId] || false;

          return (
            <div
              key={`${r}-${c}`}
              style={{ gridArea: `${r + 1} / ${c + 1}` }}
              onClick={() => tile && onTileClick(tileId)}
            >
              <BoardTile
                tile={tile}
                tokens={tokens}
                myId={myId}
                rotation={rotation}
                isCorner={isCorner}
                ownerColor={ownerIdx >= 0 ? room.players[ownerIdx]?.color : null}
                upgrades={upgrades}
                mortgaged={mortgaged}
                isCurrent={room?.players[room?.currentTurn]?.position === tileId}
              />
            </div>
          );
        })
      )}

      {/* Center info panel */}
      <div style={{
        gridArea: '2 / 2 / 11 / 11',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}>
        <div className="text-center select-none">
          <p className="text-5xl mb-2">🎲</p>
          <p className="text-2xl font-black gradient-title">עשינו עסק</p>
          <p className="text-slate-400 text-xs mt-1">
            {room?.gameState === 'playing' ? `תור ${room?.players[room?.currentTurn]?.name}` : ''}
          </p>
          {room?.houseRules?.freeParkingBonus && room?.freeParkingPot > 0 && (
            <div className="mt-2 bg-yellow-900 rounded-xl px-4 py-2">
              <p className="text-yellow-300 text-xs font-bold">🅿️ חניה חופשית</p>
              <p className="text-yellow-200 font-black text-lg">₪{room.freeParkingPot}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
