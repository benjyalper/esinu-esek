/**
 * עשינו עסק — Main Server
 * Express + Socket.IO + Next.js
 *
 * Run: node server.js
 */

const { createServer } = require('http');
const { parse }        = require('url');
const next             = require('next');

// Ensure NODE_ENV is set (Railway may not set it via the script)
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';
const { Server }       = require('socket.io');
const { v4: uuidv4 }   = require('uuid');

const { BOARD_TILES }           = require('./data/board');
const { CHANCE_CARDS, COMMUNITY_CHEST_CARDS } = require('./data/cards');

const dev  = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // needed for Railway / Docker
const port = process.env.PORT || 3010;
const app  = next({ dev });
const handle = app.getRequestHandler();

// ─── In-memory game state ────────────────────────────────────────────────────
// rooms: Map<roomId, RoomState>
const rooms = new Map();

// ─── Token choices ────────────────────────────────────────────────────────────
const TOKENS = ['🍔', '🪼', '🧊', '⛏️', '💎', '⭐', '🐟', '🧽'];
const PLAYER_COLORS = ['#EF4444','#3B82F6','#22C55E','#F59E0B','#A855F7','#EC4899','#14B8A6','#F97316'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function createPlayer(socketId, name, tokenIndex, colorIndex, avatar) {
  return {
    id:                socketId,
    name:              name || `שחקן ${tokenIndex + 1}`,
    token:             TOKENS[tokenIndex % TOKENS.length],
    avatar:            avatar || 'spongey',   // avatar key for client rendering
    color:             PLAYER_COLORS[colorIndex % PLAYER_COLORS.length],
    position:          0,
    cash:              1500,
    properties:        [],   // array of tile IDs
    railroads:         [],
    utilities:         [],
    jailTurns:         0,
    inJail:            false,
    getOutOfJailCards: 0,
    isBankrupt:        false,
    connected:         true,
  };
}

function createRoom(hostId, hostName, houseRules = {}, avatar = 'spongey') {
  const roomId = generateRoomCode();
  const playerIndex = 0;
  const room = {
    id:           roomId,
    host:         hostId,
    gameState:    'lobby',  // lobby | playing | finished
    players:      [createPlayer(hostId, hostName, playerIndex, playerIndex, avatar)],
    currentTurn:  0,        // index into players array
    diceRolled:   false,
    doublesCount: 0,
    // Board state
    propertyOwners:   {},   // tileId -> playerId
    propertyUpgrades: {},   // tileId -> 0..5  (0=no house, 5=hotel)
    mortgaged:        {},   // tileId -> bool
    freeParkingPot:   0,
    // Decks (shuffled)
    chanceDeck:    shuffle(CHANCE_CARDS),
    chestDeck:     shuffle(COMMUNITY_CHEST_CARDS),
    // UI
    eventLog:      [],
    pendingAction: null,    // { type, ... } — waiting for client response
    winner:        null,
    // House rules
    houseRules: {
      freeParkingBonus:  houseRules.freeParkingBonus  ?? false,
      auctionOnDecline:  houseRules.auctionOnDecline  ?? false,
      startBonus:        houseRules.startBonus        ?? 200,
      startCash:         houseRules.startCash         ?? 1500,
      shortGame:         houseRules.shortGame         ?? false,
      turnTimerSeconds:  houseRules.turnTimerSeconds  ?? 0,
    },
  };
  rooms.set(roomId, room);
  return room;
}

function addLog(room, text) {
  room.eventLog.unshift({ text, ts: Date.now() });
  if (room.eventLog.length > 50) room.eventLog.pop();
}

function getActivePlayers(room) {
  return room.players.filter(p => !p.isBankrupt);
}

function currentPlayer(room) {
  return room.players[room.currentTurn];
}

function advanceTurn(room) {
  const active = getActivePlayers(room);
  if (active.length <= 1) {
    room.gameState = 'finished';
    room.winner = active[0]?.id ?? null;
    return;
  }
  let next = (room.currentTurn + 1) % room.players.length;
  // skip bankrupt players
  while (room.players[next].isBankrupt) {
    next = (next + 1) % room.players.length;
  }
  room.currentTurn = next;
  room.diceRolled  = false;
  room.doublesCount = 0;
  room.pendingAction = null;
}

// Return the tileId of nearest railroad/utility from given position
function nearestOfType(pos, type) {
  for (let i = 1; i <= 40; i++) {
    const tileId = (pos + i) % 40;
    if (BOARD_TILES[tileId].type === type) return tileId;
  }
  return null;
}

// Calculate rent for a tile
function calcRent(room, tile, diceTotal) {
  const ownerId = room.propertyOwners[tile.id];
  if (!ownerId) return 0;
  if (room.mortgaged[tile.id]) return 0;

  if (tile.type === 'property') {
    const upgrades = room.propertyUpgrades[tile.id] || 0;
    // Check if owner has full color group (for base-rent doubling)
    const group = tile.group;
    const groupTiles = BOARD_TILES.filter(t => t.group === group);
    const ownsAll = groupTiles.every(t => room.propertyOwners[t.id] === ownerId && !room.mortgaged[t.id]);
    if (upgrades === 0 && ownsAll) return tile.rent[0] * 2;
    return tile.rent[upgrades] || tile.rent[0];
  }

  if (tile.type === 'railroad') {
    // Count railroads owned by same player
    const railroads = BOARD_TILES.filter(t => t.type === 'railroad');
    const owned = railroads.filter(t => room.propertyOwners[t.id] === ownerId).length;
    const rentIndex = Math.min(owned - 1, 3);
    return tile.rent[rentIndex];
  }

  if (tile.type === 'utility') {
    const utilities = BOARD_TILES.filter(t => t.type === 'utility');
    const owned = utilities.filter(t => room.propertyOwners[t.id] === ownerId).length;
    return diceTotal * (owned === 2 ? 10 : 4);
  }

  return 0;
}

// Transfer money between players (or player and bank)
// Returns false if payer goes bankrupt
function transferMoney(room, payerId, receiverId, amount) {
  const payer = room.players.find(p => p.id === payerId);
  if (!payer) return true;

  if (payer.cash >= amount) {
    payer.cash -= amount;
    if (receiverId) {
      const receiver = room.players.find(p => p.id === receiverId);
      if (receiver) receiver.cash += amount;
    } else {
      // Pay to bank — check free parking
    }
    return true;
  } else {
    // Payer can't afford — mark bankrupt for now (simplified)
    payer.cash -= amount; // Can go negative, handled by bankruptcy check
    if (receiverId) {
      const receiver = room.players.find(p => p.id === receiverId);
      if (receiver) receiver.cash += Math.max(0, payer.cash + amount);
    }
    return false;
  }
}

function checkBankruptcy(room, player) {
  if (player.cash < 0) {
    player.isBankrupt = true;
    addLog(room, `💀 ${player.name} פשט את הרגל!`);
    // Transfer properties to bank
    player.properties.forEach(tileId => {
      delete room.propertyOwners[tileId];
      delete room.propertyUpgrades[tileId];
      room.mortgaged[tileId] = false;
    });
    player.railroads.forEach(tileId => delete room.propertyOwners[tileId]);
    player.utilities.forEach(tileId => delete room.propertyOwners[tileId]);
    player.properties = [];
    player.railroads  = [];
    player.utilities  = [];
    return true;
  }
  return false;
}

// Draw and apply a card from a deck
function drawCard(room, deckType, player, io, roomId, diceTotal) {
  const deck = deckType === 'chance' ? room.chanceDeck : room.chestDeck;
  if (deck.length === 0) {
    // Reshuffle
    const source = deckType === 'chance' ? CHANCE_CARDS : COMMUNITY_CHEST_CARDS;
    deck.push(...shuffle(source));
  }
  const card = deck.shift();
  deck.push(card); // put at bottom
  addLog(room, `🃏 ${player.name} שלף: "${card.text}"`);

  // Apply card effect
  switch (card.type) {
    case 'collect_from_bank':
      player.cash += card.amount;
      break;
    case 'pay_to_bank':
      player.cash -= card.amount;
      if (room.houseRules.freeParkingBonus) room.freeParkingPot += card.amount;
      checkBankruptcy(room, player);
      break;
    case 'collect_from_players':
      room.players.forEach(p => {
        if (p.id !== player.id && !p.isBankrupt) {
          p.cash -= card.amount;
          player.cash += card.amount;
          checkBankruptcy(room, p);
        }
      });
      break;
    case 'collect_birthday':
      room.players.forEach(p => {
        if (p.id !== player.id && !p.isBankrupt) {
          p.cash -= card.amount;
          player.cash += card.amount;
          checkBankruptcy(room, p);
        }
      });
      break;
    case 'pay_to_players':
      room.players.forEach(p => {
        if (p.id !== player.id && !p.isBankrupt) {
          player.cash -= card.amount;
          p.cash += card.amount;
        }
      });
      checkBankruptcy(room, player);
      break;
    case 'move_to':
      if (card.collectGo && card.position < player.position) {
        player.cash += room.houseRules.startBonus;
        addLog(room, `🏁 ${player.name} עבר על "התחלה" וקיבל ₪${room.houseRules.startBonus}!`);
      }
      player.position = card.position;
      resolveSquare(room, player, io, roomId, 0);
      return card; // already resolved
    case 'move_steps':
      player.position = ((player.position + card.steps) + 40) % 40;
      resolveSquare(room, player, io, roomId, 0);
      return card;
    case 'go_to_jail':
      sendToJail(room, player);
      break;
    case 'get_out_of_jail':
      player.getOutOfJailCards += 1;
      break;
    case 'move_to_nearest_railroad':
      player.position = nearestOfType(player.position, 'railroad');
      resolveSquare(room, player, io, roomId, diceTotal);
      return card;
    case 'move_to_nearest_utility':
      player.position = nearestOfType(player.position, 'utility');
      resolveSquare(room, player, io, roomId, diceTotal);
      return card;
    case 'pay_per_property': {
      let total = 0;
      player.properties.forEach(tileId => {
        const lvl = room.propertyUpgrades[tileId] || 0;
        if (lvl === 5) total += card.hotelAmount;
        else if (lvl > 0) total += lvl * card.houseAmount;
      });
      player.cash -= total;
      if (room.houseRules.freeParkingBonus) room.freeParkingPot += total;
      checkBankruptcy(room, player);
      break;
    }
    default:
      break;
  }
  return card;
}

function sendToJail(room, player) {
  player.inJail    = true;
  player.jailTurns = 0;
  player.position  = 10;
  addLog(room, `🚔 ${player.name} נשלח לכלא!`);
}

// Main square-resolution logic
function resolveSquare(room, player, io, roomId, diceTotal) {
  const tile = BOARD_TILES[player.position];

  switch (tile.type) {
    case 'go':
      // passing handles bonus; landing gives extra
      player.cash += room.houseRules.startBonus;
      addLog(room, `🏁 ${player.name} נחת על "התחלה" וקיבל ₪${room.houseRules.startBonus}!`);
      break;

    case 'property':
    case 'railroad':
    case 'utility': {
      const ownerId = room.propertyOwners[tile.id];
      if (!ownerId) {
        // Offer to buy
        if (player.cash >= tile.price) {
          room.pendingAction = { type: 'offer_buy', tileId: tile.id, playerId: player.id };
        } else {
          addLog(room, `💸 ${player.name} לא יכול להרשות לעצמו לקנות את ${tile.name}.`);
          if (room.houseRules.auctionOnDecline) {
            room.pendingAction = { type: 'auction', tileId: tile.id };
          }
        }
      } else if (ownerId === player.id) {
        addLog(room, `🏠 ${player.name} נחת על הנכס שלו: ${tile.name}.`);
      } else if (room.mortgaged[tile.id]) {
        addLog(room, `💤 ${tile.name} ממושכן — אין שכירות.`);
      } else {
        // Pay rent
        const rent = calcRent(room, tile, diceTotal);
        player.cash -= rent;
        const owner = room.players.find(p => p.id === ownerId);
        if (owner) owner.cash += rent;
        addLog(room, `💸 ${player.name} שילם שכירות ₪${rent} ל-${owner?.name} עבור ${tile.name}.`);
        checkBankruptcy(room, player);
      }
      break;
    }

    case 'tax': {
      const amount = tile.amount;
      player.cash -= amount;
      if (room.houseRules.freeParkingBonus) room.freeParkingPot += amount;
      addLog(room, `💸 ${player.name} שילם מס ₪${amount} (${tile.name}).`);
      checkBankruptcy(room, player);
      break;
    }

    case 'chance':
      drawCard(room, 'chance', player, io, roomId, diceTotal);
      break;

    case 'community_chest':
      drawCard(room, 'chest', player, io, roomId, diceTotal);
      break;

    case 'go_to_jail':
      sendToJail(room, player);
      break;

    case 'free_parking':
      if (room.houseRules.freeParkingBonus && room.freeParkingPot > 0) {
        const pot = room.freeParkingPot;
        player.cash += pot;
        room.freeParkingPot = 0;
        addLog(room, `🅿️ ${player.name} קיבל ₪${pot} מהחניה החופשית!`);
      } else {
        addLog(room, `🅿️ ${player.name} נחת על חניה חופשית — נח!`);
      }
      break;

    case 'jail':
      addLog(room, `🏛️ ${player.name} ביקר בכלא (סתם ביקור).`);
      break;

    default:
      break;
  }
}

// ─── App Preparation ──────────────────────────────────────────────────────────

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  // ─── Socket.IO Events ──────────────────────────────────────────────────────

  io.on('connection', (socket) => {
    console.log(`🔌 Connected: ${socket.id}`);

    // ── Create Room ──────────────────────────────────────────────────────
    socket.on('create_room', ({ playerName, avatar, houseRules }, cb) => {
      const room = createRoom(socket.id, playerName, houseRules, avatar);
      socket.join(room.id);
      cb({ ok: true, roomId: room.id, room: sanitizeRoom(room, socket.id) });
      console.log(`🏠 Room created: ${room.id} by ${playerName}`);
    });

    // ── Join Room ────────────────────────────────────────────────────────
    socket.on('join_room', ({ roomId, playerName, avatar }, cb) => {
      const room = rooms.get(roomId.toUpperCase());
      if (!room) return cb({ ok: false, error: 'חדר לא נמצא' });
      if (room.gameState !== 'lobby') return cb({ ok: false, error: 'המשחק כבר התחיל' });
      if (room.players.length >= 8) return cb({ ok: false, error: 'החדר מלא' });

      const idx = room.players.length;
      const player = createPlayer(socket.id, playerName, idx, idx, avatar);
      room.players.push(player);
      socket.join(roomId.toUpperCase());

      addLog(room, `👋 ${playerName} הצטרף לחדר!`);
      broadcastRoomUpdate(room);
      cb({ ok: true, roomId: room.id, room: sanitizeRoom(room, socket.id) });
    });

    // ── Get Room (reconnect / page refresh) ──────────────────────────────
    socket.on('get_room', ({ roomId, playerName }, cb) => {
      const room = rooms.get(roomId?.toUpperCase());
      if (!room) return cb({ ok: false, error: 'חדר לא נמצא' });

      // Try to reconnect existing player by name
      const existing = room.players.find(p => p.name === playerName);
      if (existing) {
        const oldId = existing.id;
        existing.id        = socket.id;
        existing.connected = true;
        if (room.host === oldId) room.host = socket.id;
        // Update propertyOwners
        Object.keys(room.propertyOwners).forEach(tid => {
          if (room.propertyOwners[tid] === oldId) room.propertyOwners[tid] = socket.id;
        });
        if (room.pendingAction?.playerId === oldId) room.pendingAction.playerId = socket.id;
        socket.join(room.id);
        addLog(room, `🔄 ${playerName} התחבר מחדש!`);
        broadcastRoomUpdate(room);
        return cb({ ok: true, roomId: room.id, room: sanitizeRoom(room, socket.id) });
      }
      cb({ ok: false, error: 'שם שחקן לא נמצא בחדר' });
    });

    // ── Start Game ───────────────────────────────────────────────────────
    socket.on('start_game', ({ roomId }, cb) => {
      const room = rooms.get(roomId);
      if (!room) return cb?.({ ok: false, error: 'חדר לא נמצא' });
      if (room.host !== socket.id) return cb?.({ ok: false, error: 'רק המארח יכול להתחיל' });
      if (room.players.length < 2) return cb?.({ ok: false, error: 'צריך לפחות 2 שחקנים' });

      room.gameState    = 'playing';
      room.currentTurn  = 0;
      room.diceRolled   = false;
      room.doublesCount = 0;

      // Apply starting cash from rules
      room.players.forEach(p => { p.cash = room.houseRules.startCash; });

      addLog(room, '🎮 המשחק התחיל! בהצלחה לכולם!');
      broadcastGameStarted(room);
      cb?.({ ok: true });
    });

    // ── Roll Dice ────────────────────────────────────────────────────────
    socket.on('roll_dice', ({ roomId }, cb) => {
      const room = rooms.get(roomId);
      if (!room) return cb?.({ ok: false, error: 'חדר לא נמצא' });
      if (room.gameState !== 'playing') return cb?.({ ok: false, error: 'המשחק לא פעיל' });

      const player = currentPlayer(room);
      if (player.id !== socket.id) return cb?.({ ok: false, error: 'לא התור שלך' });
      if (room.diceRolled) return cb?.({ ok: false, error: 'כבר הטלת קוביות' });

      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const total = d1 + d2;
      const isDouble = d1 === d2;

      // Jail logic
      if (player.inJail) {
        if (isDouble) {
          player.inJail    = false;
          player.jailTurns = 0;
          addLog(room, `🔓 ${player.name} יצא מהכלא בזוג!`);
        } else {
          player.jailTurns += 1;
          if (player.jailTurns >= 3) {
            // Forced fine
            player.cash -= 50;
            if (room.houseRules.freeParkingBonus) room.freeParkingPot += 50;
            player.inJail    = false;
            player.jailTurns = 0;
            addLog(room, `💸 ${player.name} שילם ₪50 ויצא מהכלא (3 תורות).`);
          } else {
            addLog(room, `🔒 ${player.name} נשאר בכלא (תור ${player.jailTurns}/3).`);
            room.diceRolled = true;
            io.to(roomId).emit('dice_result', { d1, d2, total, isDouble, playerId: player.id });
            broadcastRoomUpdate(room);
            return cb?.({ ok: true, d1, d2 });
          }
        }
      }

      // Doubles-to-jail
      if (isDouble) {
        room.doublesCount += 1;
        if (room.doublesCount >= 3) {
          sendToJail(room, player);
          room.diceRolled  = true;
          room.doublesCount = 0;
          addLog(room, `🚔 3 זוגות ברציפות — ${player.name} לכלא!`);
          io.to(roomId).emit('dice_result', { d1, d2, total, isDouble, playerId: player.id });
          broadcastRoomUpdate(room);
          return cb?.({ ok: true, d1, d2 });
        }
      }

      // Move player
      const oldPos = player.position;
      player.position = (player.position + total) % 40;

      // Collect "Go" bonus when passing position 0
      if (player.position < oldPos && player.position !== 0) {
        player.cash += room.houseRules.startBonus;
        addLog(room, `🏁 ${player.name} עבר על "התחלה" וקיבל ₪${room.houseRules.startBonus}!`);
      }

      addLog(room, `🎲 ${player.name} הטיל ${d1}+${d2}=${total} ועבר ל: ${BOARD_TILES[player.position].name}`);

      room.diceRolled = true;
      if (!isDouble) room.doublesCount = 0;

      // Resolve the square
      resolveSquare(room, player, io, roomId, total);

      // Check if game ended due to bankruptcy
      checkGameEnd(room);

      io.to(roomId).emit('dice_result', { d1, d2, total, isDouble, playerId: player.id });
      broadcastRoomUpdate(room);
      cb?.({ ok: true, d1, d2, total });

      // If doubles and not in jail — auto-continue (client shows dice, then player can act)
      if (isDouble && !player.inJail && room.gameState === 'playing') {
        room.diceRolled   = false; // allow another roll
        room.pendingAction = null;
        addLog(room, `🎲 ${player.name} קיבל זוג — תוכל להטיל שוב!`);
        broadcastRoomUpdate(room);
      }
    });

    // ── Buy Property ─────────────────────────────────────────────────────
    socket.on('buy_property', ({ roomId, tileId }, cb) => {
      const room = rooms.get(roomId);
      if (!room) return cb?.({ ok: false });
      const player = room.players.find(p => p.id === socket.id);
      const tile   = BOARD_TILES[tileId];
      if (!player || !tile) return cb?.({ ok: false });
      if (room.propertyOwners[tileId]) return cb?.({ ok: false, error: 'כבר נקנה' });
      if (player.cash < tile.price) return cb?.({ ok: false, error: 'אין מספיק כסף' });

      player.cash -= tile.price;
      room.propertyOwners[tileId] = player.id;
      if (tile.type === 'railroad') player.railroads.push(tileId);
      else if (tile.type === 'utility') player.utilities.push(tileId);
      else player.properties.push(tileId);
      room.mortgaged[tileId] = false;
      room.propertyUpgrades[tileId] = 0;
      room.pendingAction = null;

      addLog(room, `🏠 ${player.name} קנה את ${tile.name} ב-₪${tile.price}!`);
      broadcastRoomUpdate(room);
      cb?.({ ok: true });
    });

    // ── Decline Buy ──────────────────────────────────────────────────────
    socket.on('decline_buy', ({ roomId }, cb) => {
      const room = rooms.get(roomId);
      if (!room) return cb?.({ ok: false });
      const player = currentPlayer(room);
      if (player.id !== socket.id) return cb?.({ ok: false });

      const pending = room.pendingAction;
      room.pendingAction = null;

      addLog(room, `❌ ${player.name} דחה את הקנייה של ${BOARD_TILES[pending?.tileId]?.name || ''}.`);
      if (room.houseRules.auctionOnDecline && pending?.tileId != null) {
        room.pendingAction = { type: 'auction', tileId: pending.tileId };
      }
      broadcastRoomUpdate(room);
      cb?.({ ok: true });
    });

    // ── End Turn ─────────────────────────────────────────────────────────
    socket.on('end_turn', ({ roomId }, cb) => {
      const room = rooms.get(roomId);
      if (!room) return cb?.({ ok: false });
      const player = currentPlayer(room);
      if (player.id !== socket.id) return cb?.({ ok: false, error: 'לא התור שלך' });
      if (!room.diceRolled) return cb?.({ ok: false, error: 'עדיין לא הטלת קוביות' });
      if (room.pendingAction?.type === 'offer_buy') return cb?.({ ok: false, error: 'יש פעולה ממתינה' });

      addLog(room, `✅ ${player.name} סיים את תורו.`);
      advanceTurn(room);
      checkGameEnd(room);

      broadcastRoomUpdate(room);
      const next = currentPlayer(room);
      io.to(roomId).emit('turn_changed', { playerId: next?.id, playerName: next?.name });
      cb?.({ ok: true });
    });

    // ── Upgrade Property ─────────────────────────────────────────────────
    socket.on('upgrade_property', ({ roomId, tileId }, cb) => {
      const room   = rooms.get(roomId);
      if (!room) return cb?.({ ok: false });
      const player = room.players.find(p => p.id === socket.id);
      const tile   = BOARD_TILES[tileId];
      if (!player || !tile || tile.type !== 'property') return cb?.({ ok: false });
      if (room.propertyOwners[tileId] !== socket.id) return cb?.({ ok: false, error: 'לא הנכס שלך' });
      if (room.mortgaged[tileId]) return cb?.({ ok: false, error: 'נכס ממושכן' });

      // Must own the full color group
      const group = tile.group;
      const groupTiles = BOARD_TILES.filter(t => t.group === group);
      const ownsAll = groupTiles.every(t => room.propertyOwners[t.id] === socket.id);
      if (!ownsAll) return cb?.({ ok: false, error: 'חייב לקנות את כל הקבוצה קודם' });

      const currentLevel = room.propertyUpgrades[tileId] || 0;
      if (currentLevel >= 5) return cb?.({ ok: false, error: 'כבר מלא (מלון)' });

      // Even build rule: can't build more than 1 level above siblings
      const siblings = groupTiles.filter(t => t.id !== tileId);
      const siblingMin = Math.min(...siblings.map(t => room.propertyUpgrades[t.id] || 0));
      if (currentLevel > siblingMin) return cb?.({ ok: false, error: 'בנה קודם בנכסים האחרים (בניה שווה)' });

      if (player.cash < tile.housePrice) return cb?.({ ok: false, error: 'אין מספיק כסף' });
      player.cash -= tile.housePrice;
      room.propertyUpgrades[tileId] = currentLevel + 1;

      const levelName = currentLevel + 1 === 5 ? 'מלון' : `בית ${currentLevel + 1}`;
      addLog(room, `🏗️ ${player.name} בנה ${levelName} ב-${tile.name} (₪${tile.housePrice})!`);
      broadcastRoomUpdate(room);
      cb?.({ ok: true });
    });

    // ── Sell House ───────────────────────────────────────────────────────
    socket.on('sell_house', ({ roomId, tileId }, cb) => {
      const room   = rooms.get(roomId);
      if (!room) return cb?.({ ok: false });
      const player = room.players.find(p => p.id === socket.id);
      const tile   = BOARD_TILES[tileId];
      if (!player || !tile) return cb?.({ ok: false });
      if (room.propertyOwners[tileId] !== socket.id) return cb?.({ ok: false });

      const currentLevel = room.propertyUpgrades[tileId] || 0;
      if (currentLevel === 0) return cb?.({ ok: false, error: 'אין בתים למכור' });

      // Even build: can't sell below siblings
      const group = tile.group;
      const groupTiles = BOARD_TILES.filter(t => t.group === group);
      const siblings = groupTiles.filter(t => t.id !== tileId);
      const siblingMax = Math.max(...siblings.map(t => room.propertyUpgrades[t.id] || 0));
      if (currentLevel < siblingMax) return cb?.({ ok: false, error: 'מכור קודם בנכסים האחרים (בניה שווה)' });

      room.propertyUpgrades[tileId] = currentLevel - 1;
      player.cash += Math.floor(tile.housePrice / 2);
      const levelName = currentLevel - 1 === 0 ? 'ללא בתים' : `בית ${currentLevel - 1}`;
      addLog(room, `🏚️ ${player.name} מכר בית ב-${tile.name} → ${levelName}.`);
      broadcastRoomUpdate(room);
      cb?.({ ok: true });
    });

    // ── Mortgage Property ────────────────────────────────────────────────
    socket.on('mortgage_property', ({ roomId, tileId }, cb) => {
      const room   = rooms.get(roomId);
      if (!room) return cb?.({ ok: false });
      const player = room.players.find(p => p.id === socket.id);
      const tile   = BOARD_TILES[tileId];
      if (!player || !tile) return cb?.({ ok: false });
      if (room.propertyOwners[tileId] !== socket.id) return cb?.({ ok: false });
      if (room.mortgaged[tileId]) return cb?.({ ok: false, error: 'כבר ממושכן' });
      if ((room.propertyUpgrades[tileId] || 0) > 0) return cb?.({ ok: false, error: 'מכור בתים קודם' });

      room.mortgaged[tileId] = true;
      player.cash += tile.mortgage;
      addLog(room, `📋 ${player.name} משכן את ${tile.name} וקיבל ₪${tile.mortgage}.`);
      broadcastRoomUpdate(room);
      cb?.({ ok: true });
    });

    // ── Unmortgage Property ──────────────────────────────────────────────
    socket.on('unmortgage_property', ({ roomId, tileId }, cb) => {
      const room   = rooms.get(roomId);
      if (!room) return cb?.({ ok: false });
      const player = room.players.find(p => p.id === socket.id);
      const tile   = BOARD_TILES[tileId];
      if (!player || !tile) return cb?.({ ok: false });
      if (room.propertyOwners[tileId] !== socket.id) return cb?.({ ok: false });
      if (!room.mortgaged[tileId]) return cb?.({ ok: false, error: 'לא ממושכן' });

      const cost = Math.floor(tile.mortgage * 1.1);
      if (player.cash < cost) return cb?.({ ok: false, error: `אין מספיק כסף (צריך ₪${cost})` });

      room.mortgaged[tileId] = false;
      player.cash -= cost;
      addLog(room, `✅ ${player.name} פדה משכנתא על ${tile.name} ב-₪${cost}.`);
      broadcastRoomUpdate(room);
      cb?.({ ok: true });
    });

    // ── Pay Jail Fine ────────────────────────────────────────────────────
    socket.on('pay_jail_fine', ({ roomId }, cb) => {
      const room = rooms.get(roomId);
      if (!room) return cb?.({ ok: false });
      const player = currentPlayer(room);
      if (player.id !== socket.id || !player.inJail) return cb?.({ ok: false });
      if (player.cash < 50) return cb?.({ ok: false, error: 'אין מספיק כסף לקנס' });

      player.cash -= 50;
      if (room.houseRules.freeParkingBonus) room.freeParkingPot += 50;
      player.inJail    = false;
      player.jailTurns = 0;
      addLog(room, `💸 ${player.name} שילם ₪50 ויצא מהכלא.`);
      broadcastRoomUpdate(room);
      cb?.({ ok: true });
    });

    // ── Use Get Out of Jail Card ─────────────────────────────────────────
    socket.on('use_jail_card', ({ roomId }, cb) => {
      const room = rooms.get(roomId);
      if (!room) return cb?.({ ok: false });
      const player = currentPlayer(room);
      if (player.id !== socket.id || !player.inJail) return cb?.({ ok: false });
      if (player.getOutOfJailCards < 1) return cb?.({ ok: false, error: 'אין לך כרטיס יציאה' });

      player.getOutOfJailCards -= 1;
      player.inJail    = false;
      player.jailTurns = 0;
      addLog(room, `🔑 ${player.name} השתמש בכרטיס יציאה מהכלא!`);
      broadcastRoomUpdate(room);
      cb?.({ ok: true });
    });

    // ── Trade Offer ──────────────────────────────────────────────────────
    socket.on('trade_offer', ({ roomId, targetId, offer }, cb) => {
      const room = rooms.get(roomId);
      if (!room) return cb?.({ ok: false });
      const sender = room.players.find(p => p.id === socket.id);
      const target = room.players.find(p => p.id === targetId);
      if (!sender || !target) return cb?.({ ok: false });

      room.pendingAction = {
        type:     'trade',
        senderId: socket.id,
        targetId,
        offer,    // { cashGive, cashWant, propertiesGive[], propertiesWant[] }
      };

      addLog(room, `🤝 ${sender.name} הציע עסקה ל-${target.name}!`);
      broadcastRoomUpdate(room);
      // Notify target specifically
      io.to(targetId).emit('trade_received', { senderId: socket.id, senderName: sender.name, offer });
      cb?.({ ok: true });
    });

    // ── Trade Response ───────────────────────────────────────────────────
    socket.on('trade_response', ({ roomId, accepted }, cb) => {
      const room = rooms.get(roomId);
      if (!room || room.pendingAction?.type !== 'trade') return cb?.({ ok: false });
      if (room.pendingAction.targetId !== socket.id) return cb?.({ ok: false });

      const { senderId, targetId, offer } = room.pendingAction;
      const sender = room.players.find(p => p.id === senderId);
      const target = room.players.find(p => p.id === targetId);
      room.pendingAction = null;

      if (!accepted) {
        addLog(room, `❌ ${target.name} דחה את העסקה.`);
        broadcastRoomUpdate(room);
        return cb?.({ ok: true });
      }

      // Validate and execute trade
      if (!sender || !target) return cb?.({ ok: false });
      if (sender.cash < offer.cashGive) return cb?.({ ok: false, error: 'אין מספיק כסף לשולח' });
      if (target.cash < offer.cashWant) return cb?.({ ok: false, error: 'אין מספיק כסף למקבל' });

      // Transfer cash
      sender.cash -= offer.cashGive;
      target.cash += offer.cashGive;
      target.cash -= offer.cashWant;
      sender.cash += offer.cashWant;

      // Transfer properties from sender to target
      (offer.propertiesGive || []).forEach(tileId => {
        const tile = BOARD_TILES[tileId];
        if (room.propertyOwners[tileId] === senderId) {
          room.propertyOwners[tileId] = targetId;
          sender.properties = sender.properties.filter(id => id !== tileId);
          sender.railroads  = sender.railroads.filter(id => id !== tileId);
          sender.utilities  = sender.utilities.filter(id => id !== tileId);
          if (tile.type === 'railroad') target.railroads.push(tileId);
          else if (tile.type === 'utility') target.utilities.push(tileId);
          else target.properties.push(tileId);
        }
      });

      // Transfer properties from target to sender
      (offer.propertiesWant || []).forEach(tileId => {
        const tile = BOARD_TILES[tileId];
        if (room.propertyOwners[tileId] === targetId) {
          room.propertyOwners[tileId] = senderId;
          target.properties = target.properties.filter(id => id !== tileId);
          target.railroads  = target.railroads.filter(id => id !== tileId);
          target.utilities  = target.utilities.filter(id => id !== tileId);
          if (tile.type === 'railroad') sender.railroads.push(tileId);
          else if (tile.type === 'utility') sender.utilities.push(tileId);
          else sender.properties.push(tileId);
        }
      });

      addLog(room, `🤝 ${sender.name} ו-${target.name} סגרו עסקה!`);
      broadcastRoomUpdate(room);
      cb?.({ ok: true });
    });

    // ── Chat Message ─────────────────────────────────────────────────────
    socket.on('chat_message', ({ roomId, text }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      const player = room.players.find(p => p.id === socket.id);
      if (!player) return;
      const msg = { playerId: socket.id, playerName: player.name, text, ts: Date.now() };
      io.to(roomId).emit('chat_message', msg);
    });

    // ── Disconnect ───────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`🔌 Disconnected: ${socket.id}`);
      rooms.forEach((room) => {
        const player = room.players.find(p => p.id === socket.id);
        if (player) {
          player.connected = false;
          addLog(room, `⚠️ ${player.name} התנתק. ממתינים לחזרתו...`);
          broadcastRoomUpdate(room);
        }
      });
    });

    // ── Kick Player (host only) ──────────────────────────────────────────
    socket.on('kick_player', ({ roomId, targetId }, cb) => {
      const room = rooms.get(roomId);
      if (!room || room.host !== socket.id) return cb?.({ ok: false });
      room.players = room.players.filter(p => p.id !== targetId);
      io.to(targetId).emit('kicked');
      broadcastRoomUpdate(room);
      cb?.({ ok: true });
    });
  });

  // ─── Helper: strip sensitive data / add myId ──────────────────────────
  function sanitizeRoom(room, mySocketId) {
    return {
      id:               room.id,
      host:             room.host,
      gameState:        room.gameState,
      players:          room.players,
      currentTurn:      room.currentTurn,
      diceRolled:       room.diceRolled,
      doublesCount:     room.doublesCount,
      propertyOwners:   room.propertyOwners,
      propertyUpgrades: room.propertyUpgrades,
      mortgaged:        room.mortgaged,
      freeParkingPot:   room.freeParkingPot,
      pendingAction:    room.pendingAction,
      houseRules:       room.houseRules,
      eventLog:         room.eventLog,
      winner:           room.winner,
      myId:             mySocketId,
    };
  }

  // Send a personalised room_update to every player (each gets their own myId)
  function broadcastRoomUpdate(room) {
    room.players.forEach(p => {
      io.to(p.id).emit('room_update', sanitizeRoom(room, p.id));
    });
  }

  // Send a personalised game_started to every player
  function broadcastGameStarted(room) {
    room.players.forEach(p => {
      io.to(p.id).emit('game_started', sanitizeRoom(room, p.id));
    });
  }

  function checkGameEnd(room) {
    const active = getActivePlayers(room);
    if (active.length <= 1 && room.gameState === 'playing') {
      room.gameState = 'finished';
      room.winner    = active[0]?.id ?? null;
      addLog(room, `🏆 ${active[0]?.name || 'אף אחד'} ניצח!`);
    }
  }

  httpServer.listen(port, hostname, () => {
    console.log(`🎮 עשינו עסק — שרת רץ על http://${hostname}:${port}`);
  });
});
