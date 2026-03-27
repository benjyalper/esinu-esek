/**
 * /game/[id] — Main game page with step-by-step avatar movement and board zoom
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { getSocket } from '../../lib/socketClient';

const Board        = dynamic(() => import('../../components/Board/Board'),        { ssr: false });
const PlayerPanel  = dynamic(() => import('../../components/Game/PlayerPanel'),   { ssr: false });
const ActionPanel  = dynamic(() => import('../../components/Game/ActionPanel'),   { ssr: false });
const EventLog     = dynamic(() => import('../../components/Game/EventLog'),      { ssr: false });
const CardModal    = dynamic(() => import('../../components/Game/CardModal'),     { ssr: false });
const TradeModal   = dynamic(() => import('../../components/Game/TradeModal'),    { ssr: false });
const PropertyModal= dynamic(() => import('../../components/Game/PropertyModal'), { ssr: false });
const Chat         = dynamic(() => import('../../components/UI/Chat'),            { ssr: false });
const WinnerModal  = dynamic(() => import('../../components/Game/WinnerModal'),   { ssr: false });
const Dice         = dynamic(() => import('../../components/Game/Dice'),          { ssr: false });

const ROLL_DURATION   = 2000;  // ms — must match Dice component
const STEP_DURATION   = 250;   // ms per tile during movement
const ZOOM_IN_SCALE   = 1.2;
const ZOOM_TRANSITION = '0.4s ease';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export default function GamePage() {
  const router = useRouter();
  const { id } = router.query;

  const [room,           setRoom]           = useState(null);
  const [myId,           setMyId]           = useState('');
  const [diceResult,     setDiceResult]     = useState(null);
  const [diceRolling,    setDiceRolling]    = useState(false);
  const [chatMessages,   setChatMessages]   = useState([]);
  const [selectedTile,   setSelectedTile]   = useState(null);
  const [tradeOpen,      setTradeOpen]      = useState(false);
  const [chatOpen,       setChatOpen]       = useState(false);

  // ── Animation state ────────────────────────────────────────────────────────
  const [displayPositions, setDisplayPositions] = useState({});
  const [movingPlayerId,   setMovingPlayerId]   = useState(null);
  const [boardZoom,        setBoardZoom]        = useState(1);

  // Ref to track previous positions (survives re-renders without triggering effects)
  const prevPositionsRef = useRef({});
  const animatingRef     = useRef(false);
  const myIdRef          = useRef('');

  // ── Socket setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    const socket     = getSocket();
    const playerName = sessionStorage.getItem('playerName');

    socket.on('room_update', (updatedRoom) => {
      setRoom(updatedRoom);
      myIdRef.current = updatedRoom.myId;
      setMyId(updatedRoom.myId);

      const prev = prevPositionsRef.current;

      // First load — init display positions without animation
      if (Object.keys(prev).length === 0) {
        const init = {};
        updatedRoom.players.forEach(p => { init[p.id] = p.position; });
        setDisplayPositions(init);
        updatedRoom.players.forEach(p => { prev[p.id] = p.position; });
        return;
      }

      // Detect moved players and animate them
      updatedRoom.players.forEach(p => {
        const wasAt = prev[p.id];
        if (wasAt !== undefined && wasAt !== p.position && !animatingRef.current) {
          animateMove(p.id, wasAt, p.position);
        } else if (wasAt === undefined) {
          // New player joined mid-game
          setDisplayPositions(dp => ({ ...dp, [p.id]: p.position }));
        }
        prev[p.id] = p.position;
      });
    });

    socket.on('dice_result', ({ d1, d2, total, isDouble, playerId }) => {
      // Start 2-second dice animation immediately
      setDiceRolling(true);
      setDiceResult({ d1, d2, total, isDouble, playerId });
      setTimeout(() => setDiceRolling(false), ROLL_DURATION);
    });

    socket.on('turn_changed', () => {});

    socket.on('chat_message', (msg) => {
      setChatMessages(prev => [...prev.slice(-99), msg]);
    });

    socket.emit('get_room', { roomId: id, playerName }, (res) => {
      if (res.ok) {
        setRoom(res.room);
        myIdRef.current = res.room.myId;
        setMyId(res.room.myId);
        const init = {};
        res.room.players.forEach(p => { init[p.id] = p.position; });
        setDisplayPositions(init);
        res.room.players.forEach(p => { prevPositionsRef.current[p.id] = p.position; });
        if (res.room.gameState === 'lobby') router.push(`/lobby/${id}`);
      } else {
        router.push('/');
      }
    });

    return () => {
      socket.off('room_update');
      socket.off('dice_result');
      socket.off('turn_changed');
      socket.off('chat_message');
    };
  }, [id]);

  // ── Step-by-step movement animation ────────────────────────────────────────
  async function animateMove(playerId, fromPos, toPos) {
    if (animatingRef.current) {
      // If already animating, just snap the new player to destination
      setDisplayPositions(dp => ({ ...dp, [playerId]: toPos }));
      return;
    }

    const steps = (toPos - fromPos + 40) % 40;
    if (steps === 0) return;

    // If jump is > 12 tiles it's likely a card/jail teleport — snap instantly
    if (steps > 12) {
      setDisplayPositions(dp => ({ ...dp, [playerId]: toPos }));
      return;
    }

    animatingRef.current = true;
    setMovingPlayerId(playerId);

    // Wait for dice animation to finish before moving (dice rolls 2 sec)
    await sleep(ROLL_DURATION + 100);

    // Zoom in
    setBoardZoom(ZOOM_IN_SCALE);

    // Step through each tile
    for (let i = 1; i <= steps; i++) {
      const nextPos = (fromPos + i) % 40;
      await sleep(STEP_DURATION);
      setDisplayPositions(dp => ({ ...dp, [playerId]: nextPos }));
    }

    // Brief pause on landing tile, then zoom out
    await sleep(300);
    setBoardZoom(1);
    setMovingPlayerId(null);
    animatingRef.current = false;
  }

  // ── Derived state ───────────────────────────────────────────────────────────
  const socket  = getSocket();
  const me      = room?.players.find(p => p.id === myId);
  const current = room?.players[room?.currentTurn];
  const isMyTurn= current?.id === myId;

  // ── Actions ─────────────────────────────────────────────────────────────────
  const rollDice = useCallback(() => {
    if (!isMyTurn || room?.diceRolled) return;
    socket.emit('roll_dice', { roomId: id });
  }, [isMyTurn, room?.diceRolled, id]);

  const buyProperty  = useCallback(() => {
    const tileId = room?.pendingAction?.tileId;
    if (tileId == null) return;
    socket.emit('buy_property', { roomId: id, tileId });
  }, [room?.pendingAction, id]);

  const declineBuy   = useCallback(() => socket.emit('decline_buy',   { roomId: id }), [id]);
  const endTurn      = useCallback(() => socket.emit('end_turn',      { roomId: id }), [id]);
  const payJailFine  = useCallback(() => socket.emit('pay_jail_fine', { roomId: id }), [id]);
  const useJailCard  = useCallback(() => socket.emit('use_jail_card', { roomId: id }), [id]);

  const upgradeProperty  = useCallback((tileId) => socket.emit('upgrade_property',   { roomId: id, tileId }), [id]);
  const sellHouse        = useCallback((tileId) => socket.emit('sell_house',          { roomId: id, tileId }), [id]);
  const mortgageProperty = useCallback((tileId) => socket.emit('mortgage_property',   { roomId: id, tileId }), [id]);
  const unmortgageProperty = useCallback((tileId) => socket.emit('unmortgage_property', { roomId: id, tileId }), [id]);

  const sendTrade  = useCallback((targetId, offer) => {
    socket.emit('trade_offer', { roomId: id, targetId, offer });
    setTradeOpen(false);
  }, [id]);

  const respondTrade = useCallback((accepted) => socket.emit('trade_response', { roomId: id, accepted }), [id]);
  const sendChat     = useCallback((text) => socket.emit('chat_message', { roomId: id, text }), [id]);

  const pendingTradeForMe = room?.pendingAction?.type === 'trade' &&
                            room?.pendingAction?.targetId === myId;

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl animate-spin-slow mb-4">🎲</div>
          <p className="text-slate-400">טוען משחק...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head><title>עשינו עסק 🎲 — {id}</title></Head>

      <div className="min-h-screen flex flex-col bg-slate-900 overflow-hidden">

        {/* Top bar */}
        <header className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎲</span>
            <span className="font-black text-white text-lg">עשינו עסק</span>
            <span className="text-slate-500 text-sm">חדר: {id}</span>
          </div>
          <div className="flex items-center gap-3">
            {current && (
              <span className={`px-3 py-1 rounded-full text-sm font-bold
                ${isMyTurn ? 'bg-indigo-600 text-white animate-pulse-fast' : 'bg-slate-700 text-slate-300'}`}>
                {isMyTurn ? '🎯 התור שלך!' : `⏳ תור ${current.name}`}
              </span>
            )}
            <button onClick={() => setChatOpen(o => !o)}
                    className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-xl">
              💬
            </button>
          </div>
        </header>

        {/* Main layout */}
        <div className="flex flex-1 overflow-hidden">

          {/* Board area with zoom wrapper */}
          <div className="flex-1 flex flex-col items-center justify-center p-2 overflow-auto">
            <div
              style={{
                transform: `scale(${boardZoom})`,
                transformOrigin: 'center center',
                transition: `transform ${ZOOM_TRANSITION}`,
                willChange: 'transform',
              }}
            >
              <Board
                room={room}
                myId={myId}
                displayPositions={displayPositions}
                movingPlayerId={movingPlayerId}
                onTileClick={(tileId) => setSelectedTile(tileId)}
              />
            </div>

            {/* Dice below board */}
            <div className="mt-4" style={{ transition: `transform ${ZOOM_TRANSITION}`, transform: `scale(${1 / boardZoom})` }}>
              <Dice
                d1={diceResult?.d1}
                d2={diceResult?.d2}
                rolling={diceRolling}
                isDouble={diceResult?.isDouble}
              />
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-72 flex flex-col border-r border-slate-700 overflow-hidden">
            <div className="flex-shrink-0">
              <ActionPanel
                room={room}
                myId={myId}
                isMyTurn={isMyTurn}
                onRoll={rollDice}
                onBuy={buyProperty}
                onDecline={declineBuy}
                onEndTurn={endTurn}
                onPayJailFine={payJailFine}
                onUseJailCard={useJailCard}
                onOpenTrade={() => setTradeOpen(true)}
              />
            </div>
            <div className="flex-1 overflow-auto">
              <PlayerPanel
                room={room}
                myId={myId}
                onSelectTile={setSelectedTile}
                onUpgrade={upgradeProperty}
                onSellHouse={sellHouse}
                onMortgage={mortgageProperty}
                onUnmortgage={unmortgageProperty}
              />
            </div>
            <div className="flex-shrink-0 h-36 overflow-auto border-t border-slate-700">
              <EventLog events={room.eventLog}/>
            </div>
          </div>
        </div>

        {/* Modals */}
        {pendingTradeForMe && (
          <TradeModal room={room} myId={myId}
            onAccept={() => respondTrade(true)}
            onDecline={() => respondTrade(false)}/>
        )}
        {tradeOpen && !pendingTradeForMe && (
          <TradeModal room={room} myId={myId} mode="offer"
            onSend={sendTrade} onClose={() => setTradeOpen(false)}/>
        )}
        {selectedTile !== null && (
          <PropertyModal
            tileId={selectedTile} room={room} myId={myId}
            onClose={() => setSelectedTile(null)}
            onUpgrade={upgradeProperty} onSellHouse={sellHouse}
            onMortgage={mortgageProperty} onUnmortgage={unmortgageProperty}/>
        )}
        {room.gameState === 'finished' && (
          <WinnerModal room={room} myId={myId}/>
        )}
        {chatOpen && (
          <Chat messages={chatMessages} myId={myId} players={room.players}
                onSend={sendChat} onClose={() => setChatOpen(false)}/>
        )}
      </div>
    </>
  );
}
