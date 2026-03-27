/**
 * CardModal — displays a drawn Chance or Community Chest card
 * This is shown briefly after a card is drawn via the event log.
 * The actual card effect is applied server-side; this is display-only.
 */
export default function CardModal({ card, type, onClose }) {
  if (!card) return null;

  const isChance = type === 'chance';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="rounded-3xl p-8 w-80 text-center shadow-2xl card-flip border-2 cursor-pointer"
        style={{
          background: isChance
            ? 'linear-gradient(135deg,#1e1b4b,#312e81)'
            : 'linear-gradient(135deg,#1a2e1a,#14532d)',
          borderColor: isChance ? '#6366f1' : '#22c55e',
        }}
        onClick={onClose}
      >
        <div className="text-5xl mb-3">{card.emoji || (isChance ? '❓' : '📦')}</div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3"
           style={{ color: isChance ? '#818cf8' : '#4ade80' }}>
          {isChance ? 'קלף הזדמנות' : 'קלף אוצר'}
        </p>
        <p className="text-white text-lg font-bold leading-snug mb-6">{card.text}</p>
        <button
          className="px-6 py-2 rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: isChance ? '#4f46e5' : '#16a34a' }}
        >
          הבנתי!
        </button>
      </div>
    </div>
  );
}
