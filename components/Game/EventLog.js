/**
 * EventLog — scrollable list of recent game events
 */
export default function EventLog({ events = [] }) {
  return (
    <div className="p-2 flex flex-col gap-1">
      <p className="text-slate-500 text-xs font-bold">📋 יומן אירועים</p>
      {events.length === 0 && (
        <p className="text-slate-600 text-xs italic">אין אירועים עדיין...</p>
      )}
      {events.map((e, i) => (
        <div key={i}
             className={`text-xs text-slate-300 leading-snug py-0.5 px-2 rounded
               ${i === 0 ? 'bg-slate-700 text-white' : ''}`}>
          {e.text}
        </div>
      ))}
    </div>
  );
}
