/**
 * WinnerModal — game over screen
 */
import { useRouter } from 'next/router';

const TOKENS = ['🍔','🪼','🧊','⛏️','💎','⭐','🐟','🧽'];

export default function WinnerModal({ room, myId }) {
  const router  = useRouter();
  const winner  = room?.players.find(p => p.id === room.winner);
  const isWinner= winner?.id === myId;
  const winnerIdx = room?.players.indexOf(winner) || 0;

  // Sort by cash for leaderboard
  const sorted = [...(room?.players || [])].sort((a, b) => (b.cash || 0) - (a.cash || 0));

  return (
    <div className="modal-backdrop">
      <div className="bg-slate-800 rounded-3xl p-8 w-96 text-center border border-slate-600 shadow-2xl">
        <div className="text-7xl mb-4">{isWinner ? '🏆' : '😢'}</div>
        <h1 className="text-3xl font-black text-white mb-2">
          {isWinner ? 'ניצחת! כל הכבוד!' : 'המשחק נגמר!'}
        </h1>
        <p className="text-slate-400 text-lg mb-6">
          {winner ? (
            <>
              <span className="text-2xl">{TOKENS[winnerIdx % TOKENS.length]}</span>
              <span className="text-white font-bold mr-2">{winner.name}</span>
              ניצח!
            </>
          ) : 'אין מנצח'}
        </p>

        {/* Leaderboard */}
        <div className="bg-slate-700 rounded-2xl p-4 mb-6 text-right">
          <p className="text-slate-400 text-sm font-bold mb-3">🏅 טבלת תוצאות</p>
          {sorted.map((p, i) => (
            <div key={p.id}
                 className={`flex items-center gap-2 py-1.5 px-2 rounded-xl mb-1
                   ${p.id === myId ? 'bg-indigo-900 bg-opacity-50' : ''}`}>
              <span className="text-slate-400 text-sm w-5">{i + 1}.</span>
              <span className="text-lg">{TOKENS[room.players.indexOf(p) % TOKENS.length]}</span>
              <span className="flex-1 font-bold text-white text-sm">{p.name}</span>
              <span className={`font-black text-sm ${p.isBankrupt ? 'text-red-400' : 'text-emerald-400'}`}>
                {p.isBankrupt ? '💀' : `₪${(p.cash || 0).toLocaleString()}`}
              </span>
            </div>
          ))}
        </div>

        <button onClick={() => { sessionStorage.clear(); router.push('/'); }}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500
                           rounded-2xl text-white font-black text-lg">
          🏠 חזור לדף הבית
        </button>
      </div>
    </div>
  );
}
