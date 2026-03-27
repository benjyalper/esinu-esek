/**
 * /room — Create or Join room page (then redirects to lobby)
 */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getSocket } from '../lib/socketClient';

export default function RoomPage() {
  const router  = useRouter();
  const { action, code } = router.query;
  const [status, setStatus] = useState('מתחבר...');
  const [error,  setError]  = useState('');

  useEffect(() => {
    if (!action) return; // wait for router
    const playerName   = sessionStorage.getItem('playerName');
    const playerAvatar = sessionStorage.getItem('playerAvatar') || 'spongey';
    if (!playerName) { router.push('/'); return; }

    const socket = getSocket();

    if (action === 'create') {
      setStatus('יוצר חדר...');
      socket.emit('create_room', { playerName, avatar: playerAvatar, houseRules: {} }, (res) => {
        if (res.ok) {
          sessionStorage.setItem('roomId', res.roomId);
          router.push(`/lobby/${res.roomId}`);
        } else {
          setError(res.error || 'שגיאה ביצירת חדר');
        }
      });
    } else if (action === 'join' && code) {
      setStatus('מצטרף לחדר...');
      socket.emit('join_room', { roomId: code, playerName, avatar: playerAvatar }, (res) => {
        if (res.ok) {
          sessionStorage.setItem('roomId', res.roomId);
          router.push(`/lobby/${res.roomId}`);
        } else {
          setError(res.error || 'שגיאה בהצטרפות לחדר');
        }
      });
    }
  }, [action, code]);

  return (
    <>
      <Head><title>עשינו עסק — מתחבר</title></Head>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {error ? (
            <div>
              <div className="text-5xl mb-4">😢</div>
              <p className="text-red-400 text-xl mb-6">{error}</p>
              <button onClick={() => router.push('/')}
                      className="px-6 py-3 bg-indigo-600 rounded-xl text-white font-bold hover:bg-indigo-500">
                חזור לדף הבית
              </button>
            </div>
          ) : (
            <div>
              <div className="text-5xl mb-4 animate-spin-slow">🎲</div>
              <p className="text-slate-300 text-xl">{status}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
