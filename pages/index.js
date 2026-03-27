import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const EMOJIS = ['🍔','🪼','🧊','⛏️','💎','⭐','🐟','🧽'];

export default function Home() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [roomCode,   setRoomCode]   = useState('');
  const [mode,       setMode]       = useState(null); // 'create' | 'join'
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);

  function go(action) {
    const name = playerName.trim();
    if (!name) { setError('הכנס שם שחקן!'); return; }
    if (action === 'join' && !roomCode.trim()) { setError('הכנס קוד חדר!'); return; }

    setLoading(true);
    // Store name in sessionStorage so lobby/game can read it
    sessionStorage.setItem('playerName', name);
    if (action === 'create') {
      router.push('/room?action=create');
    } else {
      router.push(`/room?action=join&code=${roomCode.trim().toUpperCase()}`);
    }
  }

  return (
    <>
      <Head><title>עשינו עסק 🎲</title></Head>

      <div className="min-h-screen flex flex-col items-center justify-center p-4"
           style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)' }}>

        {/* Floating emojis */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
          {EMOJIS.map((e, i) => (
            <span key={i} className="absolute text-4xl opacity-10 animate-bounce-slow"
                  style={{ left: `${(i * 13) % 90}%`, top: `${(i * 17) % 80}%`,
                           animationDelay: `${i * 0.4}s`, animationDuration: `${2 + i * 0.3}s` }}>
              {e}
            </span>
          ))}
        </div>

        {/* Title */}
        <div className="text-center mb-8 z-10">
          <div className="text-7xl mb-4 animate-bounce-slow">🎲</div>
          <h1 className="text-6xl font-black gradient-title mb-2">עשינו עסק</h1>
          <p className="text-slate-400 text-xl">משחק לוח מרובה שחקנים בעולמות פופ-קלצ׳ר</p>
          <div className="flex gap-2 justify-center mt-3 text-2xl">
            {['🧽','🎮','⭐','⛏️','🐠'].map((e, i) => (
              <span key={i} className="animate-bounce-slow" style={{ animationDelay: `${i * 0.2}s` }}>{e}</span>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-800 bg-opacity-90 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-700 z-10">
          {/* Name input */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-300 mb-2">שם שחקן</label>
            <input
              type="text"
              value={playerName}
              onChange={e => { setPlayerName(e.target.value); setError(''); }}
              placeholder="הכנס את שמך..."
              maxLength={20}
              className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 text-lg outline-none
                         border-2 border-transparent focus:border-indigo-500 transition-colors placeholder-slate-500"
            />
          </div>

          {error && (
            <div className="bg-red-900 bg-opacity-50 border border-red-600 rounded-xl p-3 mb-4 text-red-300 text-center">
              {error}
            </div>
          )}

          {/* Mode selection */}
          {!mode && (
            <div className="flex flex-col gap-3">
              <button onClick={() => setMode('create')}
                      className="btn-primary w-full py-4 text-xl font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all transform hover:scale-105 shadow-lg">
                🏠 צור חדר חדש
              </button>
              <button onClick={() => setMode('join')}
                      className="btn-secondary w-full py-4 text-xl font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-all transform hover:scale-105 shadow-lg">
                🚪 הצטרף לחדר
              </button>
            </div>
          )}

          {mode === 'create' && (
            <div className="flex flex-col gap-3">
              <p className="text-slate-400 text-center text-sm">
                יוצרים חדר חדש — תקבלו קוד לשיתוף עם חברים
              </p>
              <button onClick={() => go('create')} disabled={loading}
                      className="w-full py-4 text-xl font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all transform hover:scale-105 disabled:opacity-50">
                {loading ? '⏳ יוצר...' : '🎮 יצור חדר!'}
              </button>
              <button onClick={() => setMode(null)} className="text-slate-500 text-sm hover:text-slate-300 text-center">← חזרה</button>
            </div>
          )}

          {mode === 'join' && (
            <div className="flex flex-col gap-3">
              <label className="block text-sm font-bold text-slate-300">קוד חדר</label>
              <input
                type="text"
                value={roomCode}
                onChange={e => { setRoomCode(e.target.value.toUpperCase()); setError(''); }}
                placeholder="הכנס קוד חדר..."
                maxLength={5}
                className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 text-xl text-center tracking-widest font-mono
                           outline-none border-2 border-transparent focus:border-emerald-500 transition-colors placeholder-slate-500"
              />
              <button onClick={() => go('join')} disabled={loading}
                      className="w-full py-4 text-xl font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-all transform hover:scale-105 disabled:opacity-50">
                {loading ? '⏳ מצטרף...' : '🚀 הצטרף!'}
              </button>
              <button onClick={() => setMode(null)} className="text-slate-500 text-sm hover:text-slate-300 text-center">← חזרה</button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-slate-600 text-sm mt-6 z-10">2–8 שחקנים · ממולץ 45–90 דקות</p>
      </div>
    </>
  );
}
