/**
 * ActionPanel — main controls for the current player's turn
 */
import { BOARD_TILES } from '../../lib/boardData';

export default function ActionPanel({
  room, myId, isMyTurn,
  onRoll, onBuy, onDecline, onEndTurn,
  onPayJailFine, onUseJailCard, onOpenTrade,
}) {
  const me      = room?.players.find(p => p.id === myId);
  const current = room?.players[room?.currentTurn];
  const pending = room?.pendingAction;

  if (!me || me.isBankrupt) {
    return (
      <div className="p-3 bg-slate-800 border-b border-slate-700 text-center text-slate-400 text-sm">
        💀 פשטת את הרגל
      </div>
    );
  }

  const canRoll    = isMyTurn && !room?.diceRolled && room?.gameState === 'playing';
  const canEndTurn = isMyTurn && room?.diceRolled && room?.gameState === 'playing'
                     && pending?.type !== 'offer_buy';

  const offerBuyPending = pending?.type === 'offer_buy' && pending?.playerId === myId;
  const offerTile = offerBuyPending ? BOARD_TILES[pending.tileId] : null;

  return (
    <div className="bg-slate-800 border-b border-slate-700 p-3 space-y-2">
      {/* Current player + cash */}
      <div className="flex items-center justify-between">
        <span className="text-slate-300 text-sm font-bold truncate">
          {isMyTurn ? '🎯 התור שלך' : `⏳ תור ${current?.name}`}
        </span>
        <span className="text-emerald-400 font-black text-sm">₪{me?.cash?.toLocaleString()}</span>
      </div>

      {/* Jail options */}
      {isMyTurn && me?.inJail && !room?.diceRolled && (
        <div className="space-y-1">
          <p className="text-red-400 text-xs text-center">🔒 אתה בכלא (תור {me.jailTurns}/3)</p>
          <div className="flex gap-1">
            {me.getOutOfJailCards > 0 && (
              <button onClick={onUseJailCard}
                      className="flex-1 py-1.5 text-xs bg-purple-700 hover:bg-purple-600 rounded-lg text-white font-bold">
                🔑 השתמש בכרטיס
              </button>
            )}
            {me.cash >= 50 && (
              <button onClick={onPayJailFine}
                      className="flex-1 py-1.5 text-xs bg-orange-700 hover:bg-orange-600 rounded-lg text-white font-bold">
                💸 שלם ₪50
              </button>
            )}
            <button onClick={onRoll}
                    className="flex-1 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold">
              🎲 נסה זוג
            </button>
          </div>
        </div>
      )}

      {/* Buy offer */}
      {offerBuyPending && offerTile && (
        <div className="bg-indigo-900 rounded-xl p-2 border border-indigo-600">
          <p className="text-white text-xs font-bold text-center mb-1">
            {offerTile.emoji} {offerTile.name}
          </p>
          <p className="text-indigo-300 text-xs text-center mb-2">₪{offerTile.price}</p>
          <div className="flex gap-2">
            <button onClick={onBuy}
                    className="flex-1 py-2 text-xs bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-black">
              ✅ קנה!
            </button>
            <button onClick={onDecline}
                    className="flex-1 py-2 text-xs bg-red-700 hover:bg-red-600 rounded-lg text-white font-bold">
              ❌ דחה
            </button>
          </div>
        </div>
      )}

      {/* Roll dice */}
      {isMyTurn && !me?.inJail && (
        <button
          onClick={onRoll}
          disabled={!canRoll}
          className={`w-full py-3 rounded-xl font-black text-base transition-all
            ${canRoll
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transform hover:scale-105 shadow-lg'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
        >
          {room?.diceRolled ? '✅ הטלת קוביות' : '🎲 הטל קוביות!'}
        </button>
      )}

      {/* End Turn */}
      <button
        onClick={onEndTurn}
        disabled={!canEndTurn}
        className={`w-full py-2 rounded-xl font-bold text-sm transition-all
          ${canEndTurn
            ? 'bg-slate-600 hover:bg-slate-500 text-white'
            : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
      >
        ➡️ סיים תור
      </button>

      {/* Trade button */}
      {room?.gameState === 'playing' && (
        <button onClick={onOpenTrade}
                className="w-full py-2 rounded-xl text-xs bg-teal-800 hover:bg-teal-700 text-teal-200 font-bold">
          🤝 הצע עסקה
        </button>
      )}
    </div>
  );
}
