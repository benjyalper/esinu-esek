/**
 * Chat sidebar component
 */
import { useState, useEffect, useRef } from 'react';

const TOKENS = ['🍔','🪼','🧊','⛏️','💎','⭐','🐟','🧽'];

export default function Chat({ messages, myId, players, onSend, onClose }) {
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function send() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  }

  function getToken(playerId) {
    const idx = players?.findIndex(p => p.id === playerId) ?? 0;
    return TOKENS[idx % TOKENS.length];
  }

  return (
    <div className="fixed left-0 top-0 bottom-0 w-72 bg-slate-800 border-r border-slate-700 flex flex-col z-40 shadow-2xl">
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
        <span className="font-bold text-white">💬 צ׳אט</span>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
      </div>

      <div className="flex-1 overflow-auto p-2 flex flex-col gap-1">
        {messages.length === 0 && (
          <p className="text-slate-600 text-sm italic text-center mt-4">אין הודעות עדיין...</p>
        )}
        {messages.map((msg, i) => (
          <div key={i}
               className={`flex gap-2 ${msg.playerId === myId ? 'flex-row-reverse' : ''}`}>
            <span className="text-lg flex-shrink-0">{getToken(msg.playerId)}</span>
            <div className={`rounded-xl px-3 py-2 text-sm max-w-48
              ${msg.playerId === myId
                ? 'bg-indigo-700 text-white rounded-tr-none'
                : 'bg-slate-700 text-slate-200 rounded-tl-none'}`}>
              <p className="text-xs text-slate-400 mb-0.5">{msg.playerName}</p>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-2 border-t border-slate-700 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="הכנס הודעה..."
          maxLength={200}
          className="flex-1 bg-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none border border-slate-600 focus:border-indigo-500 placeholder-slate-500"
        />
        <button onClick={send}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-sm font-bold">
          ➤
        </button>
      </div>
    </div>
  );
}
