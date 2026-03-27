/**
 * PropertyModal — shows detailed info about a board tile + management actions
 */
import { BOARD_TILES, PROPERTY_GROUPS } from '../../lib/boardData';

export default function PropertyModal({
  tileId, room, myId, onClose,
  onUpgrade, onSellHouse, onMortgage, onUnmortgage,
}) {
  const tile     = BOARD_TILES[tileId];
  if (!tile) return null;

  const ownerId  = room?.propertyOwners?.[tileId];
  const owner    = ownerId ? room.players.find(p => p.id === ownerId) : null;
  const isOwner  = ownerId === myId;
  const upgrades = room?.propertyUpgrades?.[tileId] || 0;
  const mortgaged= room?.mortgaged?.[tileId] || false;
  const me       = room?.players.find(p => p.id === myId);
  const groupMeta= tile.group ? PROPERTY_GROUPS[tile.group] : null;

  const groupTiles = tile.group
    ? BOARD_TILES.filter(t => t.group === tile.group)
    : [];
  const ownsAll = tile.group && groupTiles.every(t => room?.propertyOwners?.[t.id] === myId);

  const rentLabel = () => {
    if (!tile.rent) return null;
    const labels = ['בסיס','1 בית','2 בתים','3 בתים','4 בתים','מלון'];
    return tile.rent.map((r, i) => (
      <div key={i} className={`flex justify-between text-xs px-2 py-0.5 rounded
        ${i === upgrades ? 'bg-indigo-800 text-white font-bold' : 'text-slate-400'}`}>
        <span>{labels[i]}</span>
        <span>₪{r}</span>
      </div>
    ));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl p-5 w-80 max-h-screen overflow-auto border border-slate-700 shadow-2xl"
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="text-4xl">{tile.emoji}</div>
          <div>
            <h2 className="text-white font-black text-lg leading-tight">{tile.name}</h2>
            {groupMeta && (
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold mt-1"
                    style={{ backgroundColor: groupMeta.color, color: groupMeta.textColor }}>
                {groupMeta.name}
              </span>
            )}
          </div>
          <button onClick={onClose} className="mr-auto text-slate-400 hover:text-white text-xl">✕</button>
        </div>

        {/* Owner */}
        <div className="bg-slate-700 rounded-xl p-3 mb-3">
          {owner ? (
            <p className="text-sm">
              <span className="text-slate-400">בבעלות: </span>
              <span className="font-bold text-white">{owner.name}</span>
              {mortgaged && <span className="text-red-400 mr-2 text-xs"> (ממושכן)</span>}
            </p>
          ) : (
            <p className="text-sm text-slate-400">לא נקנה עדיין</p>
          )}
          {tile.price && <p className="text-emerald-400 font-bold mt-1">מחיר קנייה: ₪{tile.price}</p>}
          {tile.mortgage && <p className="text-orange-400 text-xs mt-0.5">משכנתא: ₪{tile.mortgage}</p>}
        </div>

        {/* Rent table */}
        {tile.rent && (
          <div className="bg-slate-700 rounded-xl p-3 mb-3">
            <p className="text-slate-300 text-xs font-bold mb-1">טבלת שכירות</p>
            {rentLabel()}
            {tile.housePrice && (
              <p className="text-yellow-400 text-xs mt-2 text-center">
                💰 מחיר בית/מלון: ₪{tile.housePrice}
              </p>
            )}
          </div>
        )}

        {/* Railroad / utility rent */}
        {tile.type === 'railroad' && (
          <div className="bg-slate-700 rounded-xl p-3 mb-3">
            <p className="text-slate-300 text-xs font-bold mb-1">שכירות לפי כמות תחנות</p>
            {tile.rent?.map((r, i) => (
              <div key={i} className="flex justify-between text-xs text-slate-400 px-2 py-0.5">
                <span>{i + 1} תחנות</span>
                <span>₪{r}</span>
              </div>
            ))}
          </div>
        )}

        {tile.type === 'utility' && (
          <div className="bg-slate-700 rounded-xl p-3 mb-3 text-xs text-slate-400">
            <p>1 שירות: קובייה × 4</p>
            <p>2 שירותים: קובייה × 10</p>
          </div>
        )}

        {/* Management actions (for owner only) */}
        {isOwner && (
          <div className="space-y-2">
            {tile.type === 'property' && (
              <>
                {!mortgaged && upgrades < 5 && ownsAll && (
                  <button onClick={() => { onUpgrade(tileId); onClose(); }}
                          disabled={(me?.cash || 0) < tile.housePrice}
                          className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-sm text-white font-bold disabled:opacity-40">
                    🏗️ בנה {upgrades === 4 ? 'מלון' : 'בית'} (₪{tile.housePrice})
                  </button>
                )}
                {!mortgaged && upgrades > 0 && (
                  <button onClick={() => { onSellHouse(tileId); onClose(); }}
                          className="w-full py-2 bg-orange-700 hover:bg-orange-600 rounded-xl text-sm text-white font-bold">
                    🏚️ מכור בית (₪{Math.floor(tile.housePrice / 2)})
                  </button>
                )}
              </>
            )}
            {!mortgaged && upgrades === 0 && (
              <button onClick={() => { onMortgage(tileId); onClose(); }}
                      className="w-full py-2 bg-red-800 hover:bg-red-700 rounded-xl text-sm text-white font-bold">
                📋 משכן (₪{tile.mortgage})
              </button>
            )}
            {mortgaged && (
              <button onClick={() => { onUnmortgage(tileId); onClose(); }}
                      disabled={(me?.cash || 0) < Math.floor((tile.mortgage || 0) * 1.1)}
                      className="w-full py-2 bg-green-800 hover:bg-green-700 rounded-xl text-sm text-white font-bold disabled:opacity-40">
                ✅ פדה משכנתא (₪{Math.floor((tile.mortgage || 0) * 1.1)})
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
