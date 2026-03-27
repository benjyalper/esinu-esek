/**
 * TradeModal — offer or respond to a trade between players
 */
import { useState } from 'react';
import { BOARD_TILES } from '../../lib/boardData';

const TOKENS = ['🍔','🪼','🧊','⛏️','💎','⭐','🐟','🧽'];

export default function TradeModal({ room, myId, mode = 'respond', onSend, onAccept, onDecline, onClose }) {
  const me      = room?.players.find(p => p.id === myId);
  const pending = room?.pendingAction; // type: 'trade'
  const sender  = pending ? room.players.find(p => p.id === pending.senderId) : null;

  const otherPlayers = (room?.players || []).filter(p => p.id !== myId && !p.isBankrupt);

  const [targetId,    setTargetId]    = useState(otherPlayers[0]?.id || '');
  const [cashGive,    setCashGive]    = useState(0);
  const [cashWant,    setCashWant]    = useState(0);
  const [giveProps,   setGiveProps]   = useState([]);
  const [wantProps,   setWantProps]   = useState([]);

  const myProps = [...(me?.properties || []), ...(me?.railroads || []), ...(me?.utilities || [])];
  const target  = room?.players.find(p => p.id === targetId);
  const targetProps = [...(target?.properties || []), ...(target?.railroads || []), ...(target?.utilities || [])];

  function toggleProp(list, setList, id) {
    setList(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function send() {
    if (!targetId) return;
    onSend?.(targetId, { cashGive: +cashGive, cashWant: +cashWant, propertiesGive: giveProps, propertiesWant: wantProps });
  }

  // ── Respond mode ──────────────────────────────────────────────────────────
  if (mode === 'respond' && pending?.type === 'trade') {
    const offer = pending.offer;
    return (
      <div className="modal-backdrop">
        <div className="bg-slate-800 rounded-2xl p-5 w-80 border border-slate-700 shadow-2xl card-flip">
          <h2 className="text-white font-black text-lg text-center mb-3">
            🤝 הצעת עסקה מ-{sender?.name}
          </h2>

          <div className="space-y-2 mb-4">
            {offer.cashGive > 0 && <p className="text-emerald-400 text-sm">💰 נותן לך: ₪{offer.cashGive}</p>}
            {offer.cashWant > 0 && <p className="text-red-400 text-sm">💸 רוצה מך: ₪{offer.cashWant}</p>}
            {(offer.propertiesGive || []).map(id => (
              <p key={id} className="text-blue-400 text-sm">🏠 נותן: {BOARD_TILES[id]?.name}</p>
            ))}
            {(offer.propertiesWant || []).map(id => (
              <p key={id} className="text-orange-400 text-sm">📋 רוצה: {BOARD_TILES[id]?.name}</p>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={onAccept}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-black">
              ✅ קבל
            </button>
            <button onClick={onDecline}
                    className="flex-1 py-3 bg-red-700 hover:bg-red-600 rounded-xl text-white font-black">
              ❌ דחה
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Offer mode ────────────────────────────────────────────────────────────
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl p-5 w-80 max-h-[90vh] overflow-auto border border-slate-700 shadow-2xl"
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-black text-lg">🤝 הצע עסקה</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
        </div>

        {/* Target player */}
        <div className="mb-3">
          <label className="text-slate-400 text-xs block mb-1">שלח ל:</label>
          <select value={targetId} onChange={e => { setTargetId(e.target.value); setWantProps([]); }}
                  className="w-full bg-slate-700 text-white rounded-xl px-3 py-2 outline-none border border-slate-600">
            {otherPlayers.map((p, i) => (
              <option key={p.id} value={p.id}>{TOKENS[room.players.indexOf(p) % TOKENS.length]} {p.name}</option>
            ))}
          </select>
        </div>

        {/* Cash */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-slate-400 text-xs block mb-1">אני נותן ₪</label>
            <input type="number" value={cashGive} onChange={e => setCashGive(e.target.value)} min={0}
                   max={me?.cash || 0}
                   className="w-full bg-slate-700 text-white rounded-xl px-2 py-1.5 outline-none border border-slate-600 text-sm" />
          </div>
          <div>
            <label className="text-slate-400 text-xs block mb-1">אני רוצה ₪</label>
            <input type="number" value={cashWant} onChange={e => setCashWant(e.target.value)} min={0}
                   className="w-full bg-slate-700 text-white rounded-xl px-2 py-1.5 outline-none border border-slate-600 text-sm" />
          </div>
        </div>

        {/* My properties to give */}
        {myProps.length > 0 && (
          <div className="mb-3">
            <label className="text-slate-400 text-xs block mb-1">נכסים שאני נותן:</label>
            <div className="flex flex-wrap gap-1">
              {myProps.map(id => (
                <button key={id} onClick={() => toggleProp(giveProps, setGiveProps, id)}
                        className={`px-2 py-1 rounded-lg text-xs transition-all
                          ${giveProps.includes(id) ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                  {BOARD_TILES[id]?.emoji} {BOARD_TILES[id]?.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Target's properties to want */}
        {targetProps.length > 0 && (
          <div className="mb-3">
            <label className="text-slate-400 text-xs block mb-1">נכסים שאני רוצה:</label>
            <div className="flex flex-wrap gap-1">
              {targetProps.map(id => (
                <button key={id} onClick={() => toggleProp(wantProps, setWantProps, id)}
                        className={`px-2 py-1 rounded-lg text-xs transition-all
                          ${wantProps.includes(id) ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                  {BOARD_TILES[id]?.emoji} {BOARD_TILES[id]?.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <button onClick={send}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-white font-black">
          🚀 שלח הצעה
        </button>
      </div>
    </div>
  );
}
