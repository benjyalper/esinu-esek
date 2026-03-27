/**
 * /lobby/[id] — Waiting lobby before game starts
 */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getSocket } from '../../lib/socketClient';

const TOKENS = ['🍔','🪼','🧊','⛏️','💎','⭐','🐟','🧽'];

export default function LobbyPage() {
  const router   = useRouter();
  const { id }   = router.query;
  const [room,   setRoom]   = useState(null);
  const [myId,   setMyId]   = useState('');
  const [copied, setCopied] = useState(false);
  const [rules,  setRules]  = useState({
    freeParkingBonus: false,
    auctionOnDecline: false,
    startBonus: 200,
    startCash: 1500,
    shortGame: false,
  });

  useEffect(() => {
    if (!id) return;
    const socket     = getSocket();
    const playerName = sessionStorage.getItem('playerName');

    setMyId(socket.id);

    // Listen for updates
    socket.on('room_update', (updatedRoom) => {
      setRoom(updatedRoom);
      setMyId(updatedRoom.myId);
    });

    socket.on('game_started', (updatedRoom) => {
      setRoom(updatedRoom);
      router.push(`/game/${id}`);
    });

    // Try to reconnect if refreshed
    const storedRoom = sessionStorage.getItem('roomId');
    if (storedRoom && storedRoom !== id) {
      sessionStorage.setItem('roomId', id);
    }

    // Request current room state (in case we refreshed)
    socket.emit('get_room', { roomId: id, playerName }, (res) => {
      if (res.ok) {
        setRoom(res.room);
        setMyId(res.room.myId);
        if (res.room.gameState === 'playing') router.push(`/game/${id}`);
      } else {
        // Maybe we just joined and server already sent room_update
      }
    });

    return () => {
      socket.off('room_update');
      socket.off('game_started');
    };
  }, [id]);

  function startGame() {
    const socket = getSocket();
    socket.emit('start_game', { roomId: id }, (res) => {
      if (!res.ok) alert(res.error);
    });
  }

  function copyCode() {
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const isHost = room?.host === myId;

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl animate-spin-slow mb-4">🎲</div>
          <p className="text-slate-400">טוען לובי...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head><title>עשינו עסק — לובי {id}</title></Head>

      <div className="min-h-screen p-4 md:p-8"
           style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)' }}>

        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black gradient-title">עשינו עסק 🎲</h1>
            <p className="text-slate-400 mt-1">לובי המתנה</p>
          </div>

          {/* Room Code */}
          <div className="bg-slate-800 rounded-2xl p-6 mb-4 border border-slate-700 text-center">
            <p className="text-slate-400 text-sm mb-2">קוד חדר — שתפו עם חברים!</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-5xl font-mono font-black text-white tracking-widest">{id}</span>
              <button onClick={copyCode}
                      className="text-2xl p-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors"
                      title="העתק קוד">
                {copied ? '✅' : '📋'}
              </button>
            </div>
            {copied && <p className="text-emerald-400 text-sm mt-2">הקוד הועתק!</p>}
          </div>

          {/* Players */}
          <div className="bg-slate-800 rounded-2xl p-6 mb-4 border border-slate-700">
            <h2 className="text-lg font-bold mb-4 text-slate-200">
              👥 שחקנים ({room.players.length}/8)
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {room.players.map((p, i) => (
                <div key={p.id}
                     className={`flex items-center gap-3 p-3 rounded-xl border transition-colors
                       ${p.id === myId ? 'bg-indigo-900 border-indigo-500' : 'bg-slate-700 border-slate-600'}`}>
                  <span className="text-3xl">{TOKENS[i % TOKENS.length]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate text-sm">
                      {p.name}
                      {p.id === room.host && <span className="text-yellow-400 mr-1"> 👑</span>}
                      {p.id === myId && <span className="text-indigo-300 mr-1"> (אני)</span>}
                    </p>
                    <p className="text-xs text-slate-400">
                      {p.connected ? '🟢 מחובר' : '🔴 מנותק'}
                    </p>
                  </div>
                </div>
              ))}
              {/* Empty slots */}
              {Array.from({ length: Math.max(0, 2 - room.players.length) }).map((_, i) => (
                <div key={`empty-${i}`}
                     className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-700 bg-slate-900 opacity-50">
                  <span className="text-3xl">❓</span>
                  <p className="text-slate-500 text-sm">ממתין לשחקן...</p>
                </div>
              ))}
            </div>
          </div>

          {/* House Rules (host only) */}
          {isHost && (
            <div className="bg-slate-800 rounded-2xl p-6 mb-4 border border-slate-700">
              <h2 className="text-lg font-bold mb-4 text-slate-200">⚙️ חוקי בית</h2>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">🅿️ חניה חופשית עם כסף</span>
                  <input type="checkbox" checked={rules.freeParkingBonus}
                         onChange={e => setRules(r => ({ ...r, freeParkingBonus: e.target.checked }))}
                         className="w-5 h-5 accent-indigo-500" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">🔨 מכירה פומבית כשדוחים קנייה</span>
                  <input type="checkbox" checked={rules.auctionOnDecline}
                         onChange={e => setRules(r => ({ ...r, auctionOnDecline: e.target.checked }))}
                         className="w-5 h-5 accent-indigo-500" />
                </label>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-300">💰 כסף התחלתי</span>
                  <input type="number" value={rules.startCash} min={500} max={5000} step={100}
                         onChange={e => setRules(r => ({ ...r, startCash: +e.target.value }))}
                         className="w-24 bg-slate-700 rounded-lg px-3 py-1 text-white text-center outline-none border border-slate-600 focus:border-indigo-500" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-300">🏁 בונוס התחלה</span>
                  <input type="number" value={rules.startBonus} min={0} max={500} step={50}
                         onChange={e => setRules(r => ({ ...r, startBonus: +e.target.value }))}
                         className="w-24 bg-slate-700 rounded-lg px-3 py-1 text-white text-center outline-none border border-slate-600 focus:border-indigo-500" />
                </div>
              </div>
            </div>
          )}

          {/* Start Button */}
          {isHost ? (
            <button onClick={startGame} disabled={room.players.length < 2}
                    className="w-full py-5 text-2xl font-black rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600
                               hover:from-indigo-500 hover:to-purple-500 text-white transition-all transform hover:scale-105
                               shadow-xl disabled:opacity-40 disabled:cursor-not-allowed">
              {room.players.length < 2 ? '⏳ ממתין לשחקנים...' : '🚀 התחל משחק!'}
            </button>
          ) : (
            <div className="text-center p-5 bg-slate-800 rounded-2xl border border-slate-700">
              <div className="text-4xl animate-bounce mb-2">⏳</div>
              <p className="text-slate-400">ממתין שהמארח יתחיל את המשחק...</p>
            </div>
          )}

          <button onClick={() => { sessionStorage.clear(); router.push('/'); }}
                  className="w-full mt-3 py-3 text-slate-500 hover:text-slate-300 text-sm text-center transition-colors">
            ← עזוב את החדר
          </button>
        </div>
      </div>
    </>
  );
}
