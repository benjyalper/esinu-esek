/**
 * Board — renders the 11×11 Monopoly board.
 * Accepts displayPositions so token animation can be driven externally.
 */
import { BOARD_TILES, PROPERTY_GROUPS, getBoardLayout } from '../../lib/boardData';
import { AvatarToken } from '../UI/Avatars';
import BoardTile from './BoardTile';

export default function Board({ room, myId, onTileClick, displayPositions = {}, movingPlayerId = null }) {
  const grid = getBoardLayout();

  // Map: tileId -> [{ player, avatarKey, color }]
  const tokensByTile = {};
  (room?.players || []).forEach((p) => {
    if (p.isBankrupt) return;
    // Use animated display position if available, otherwise real position
    const pos = displayPositions[p.id] ?? p.position;
    if (!tokensByTile[pos]) tokensByTile[pos] = [];
    tokensByTile[pos].push(p);
  });

  const TILE_SIZE   = 56;
  const CORNER_SIZE = Math.floor(TILE_SIZE * 1.6);

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
            if (r === 0 || r === 10 || c === 0 || c === 10) return null;
            return <div key={`${r}-${c}`} style={{ gridArea:`${r+1}/${c+1}` }} className="bg-emerald-900"/>;
          }

          const tile     = BOARD_TILES[tileId];
          const tokens   = tokensByTile[tileId] || [];
          const isCorner = (r === 0 || r === 10) && (c === 0 || c === 10);

          let rotation = 0;
          if (!isCorner) {
            if (r === 0)  rotation = 180;   // top row  → face down
            if (c === 0)  rotation = -90;  // visual right col → face left (toward center)
            if (c === 10) rotation = 90;   // visual left col  → face right (toward center)
          }

          const ownerId  = room?.propertyOwners?.[tileId];
          const owner    = ownerId ? room.players.find(p => p.id === ownerId) : null;
          const upgrades = room?.propertyUpgrades?.[tileId] || 0;
          const mortgaged= room?.mortgaged?.[tileId] || false;
          const isCurrent= room?.players[room?.currentTurn]?.position === tileId;

          return (
            <div key={`${r}-${c}`} style={{ gridArea:`${r+1}/${c+1}` }}
                 onClick={() => tile && onTileClick(tileId)}>
              <BoardTile
                tile={tile}
                tokens={tokens}
                myId={myId}
                rotation={rotation}
                isCorner={isCorner}
                ownerColor={owner?.color || null}
                upgrades={upgrades}
                mortgaged={mortgaged}
                isCurrent={isCurrent}
                movingPlayerId={movingPlayerId}
              />
            </div>
          );
        })
      )}

      {/* Center info */}
      <div style={{ gridArea:'2/2/11/11' }}
           className="flex flex-col items-center justify-center text-center select-none">
        <p className="text-5xl mb-2">🎲</p>
        <p className="text-2xl font-black gradient-title">עשינו עסק</p>
        <p className="text-slate-400 text-xs mt-1">
          {room?.gameState === 'playing' ? `תור ${room.players[room.currentTurn]?.name}` : ''}
        </p>
        {room?.houseRules?.freeParkingBonus && room?.freeParkingPot > 0 && (
          <div className="mt-2 bg-yellow-900 rounded-xl px-4 py-2">
            <p className="text-yellow-300 text-xs font-bold">🅿️ חניה חופשית</p>
            <p className="text-yellow-200 font-black text-lg">₪{room.freeParkingPot}</p>
          </div>
        )}
      </div>
    </div>
  );
}
