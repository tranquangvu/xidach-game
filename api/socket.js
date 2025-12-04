import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

// Game utilities
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Game state - stored in memory (will reset on serverless function restart)
let gameState = {
  deck: [],
  dealerHand: [],
  players: new Map(),
  gameStatus: 'waiting',
  currentPlayerIndex: 0,
  maxPlayers: 3,
};

function createDeck() {
  const deck = [];
  SUITS.forEach((suit) => {
    RANKS.forEach((rank) => {
      deck.push({
        suit,
        rank,
        id: `${suit}-${rank}-${Math.random().toString(36).slice(2, 11)}`,
      });
    });
  });
  return shuffleDeck(deck);
}

function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createMultipleDecks(numDecks = 1) {
  const deck = [];
  for (let i = 0; i < numDecks; i++) {
    const singleDeck = createDeck();
    deck.push(...singleDeck);
  }
  return shuffleDeck(deck);
}

function drawCard(deck) {
  if (deck.length === 0) {
    throw new Error('Deck is empty');
  }
  const card = deck[0];
  const remainingDeck = deck.slice(1);
  return { card, remainingDeck };
}

function calculateHandValue(hand) {
  let value = 0;
  let aces = 0;

  hand.forEach((card) => {
    if (card.rank === 'A') {
      aces++;
      value += 11;
    } else if (['J', 'Q', 'K'].includes(card.rank)) {
      value += 10;
    } else {
      value += parseInt(card.rank);
    }
  });

  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
}

function isBlackjack(hand) {
  return hand.length === 2 && calculateHandValue(hand) === 21;
}

function isBust(hand) {
  return calculateHandValue(hand) > 21;
}

function checkAndReshuffle() {
  if (gameState.deck.length < 10) {
    gameState.deck = createMultipleDecks(1);
  }
}

function getPlayerArray() {
  return Array.from(gameState.players.values());
}

function getCurrentPlayer() {
  const players = getPlayerArray();
  if (players.length === 0) return null;
  return players[gameState.currentPlayerIndex] || null;
}

function nextPlayer() {
  const players = getPlayerArray();
  if (players.length === 0) return;

  let foundNextPlayer = false;
  let attempts = 0;
  const maxAttempts = players.length;

  while (!foundNextPlayer && attempts < maxAttempts) {
    gameState.currentPlayerIndex++;
    if (gameState.currentPlayerIndex >= players.length) {
      gameState.currentPlayerIndex = 0;
    }

    const nextPlayer = players[gameState.currentPlayerIndex];
    if (nextPlayer && nextPlayer.status !== 'finished') {
      nextPlayer.status = 'playing';
      gameState.gameStatus = 'playing';
      foundNextPlayer = true;
      broadcastGameState();
      return;
    }

    attempts++;
  }

  gameState.currentPlayerIndex = 0;
  gameState.gameStatus = 'dealer-turn';
  dealerPlay();
}

function dealerPlay() {
  let currentDealerHand = [...gameState.dealerHand];

  while (calculateHandValue(currentDealerHand) < 17) {
    checkAndReshuffle();
    const { card, remainingDeck } = drawCard(gameState.deck);
    currentDealerHand.push(card);
    gameState.deck = remainingDeck;
    broadcastGameState();
  }

  gameState.dealerHand = currentDealerHand;
  const dealerValue = calculateHandValue(currentDealerHand);
  const dealerBust = isBust(currentDealerHand);

  const players = getPlayerArray();
  players.forEach((player) => {
    const playerValue = calculateHandValue(player.hand);
    const playerBust = isBust(player.hand);
    const playerBJ = isBlackjack(player.hand);
    const dealerBJ = isBlackjack(currentDealerHand);

    if (playerBust) {
      player.result = 'bust';
      // Player loses bet (already deducted)
    } else if (playerBJ && !dealerBJ) {
      player.result = 'blackjack';
      // Blackjack pays 3:2 (1.5x bet)
      player.balance += Math.floor(player.bet * 2.5);
    } else if (dealerBust) {
      player.result = 'win';
      // Win pays 1:1 (2x bet)
      player.balance += player.bet * 2;
    } else if (dealerBJ && !playerBJ) {
      player.result = 'lose';
      // Player loses bet (already deducted)
    } else if (playerBJ && dealerBJ) {
      player.result = 'push';
      // Push returns bet
      player.balance += player.bet;
    } else if (playerValue > dealerValue) {
      player.result = 'win';
      // Win pays 1:1 (2x bet)
      player.balance += player.bet * 2;
    } else if (playerValue < dealerValue) {
      player.result = 'lose';
      // Player loses bet (already deducted)
    } else {
      player.result = 'push';
      // Push returns bet
      player.balance += player.bet;
    }
    player.status = 'finished';
  });

  gameState.gameStatus = 'finished';
  broadcastGameState();
}

let io = null;

function broadcastGameState(disconnectMessage = null) {
  if (!io) return;

  const state = {
    deck: { length: gameState.deck.length },
    dealerHand: gameState.dealerHand,
    dealerScore: calculateHandValue(gameState.dealerHand),
    players: getPlayerArray().map((p) => ({
      id: p.id,
      name: p.name,
      hand: p.hand,
      score: p.score,
      status: p.status,
      result: p.result,
      isCurrentPlayer: p.id === getCurrentPlayer()?.id,
      balance: p.balance,
      bet: p.bet,
      hasPlacedBet: p.hasPlacedBet,
    })),
    gameStatus: gameState.gameStatus,
    currentPlayerIndex: gameState.currentPlayerIndex,
    disconnectMessage: disconnectMessage,
  };
  io.emit('gameState', state);
}

function setupSocketIO(server) {
  if (io) return io;

  io = new Server(server, {
    path: '/api/socket',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    socket.on('joinGame', ({ playerName }) => {
      const players = getPlayerArray();

      if (players.length >= gameState.maxPlayers) {
        socket.emit('error', { message: 'Game is full. Maximum 3 players.' });
        return;
      }

      if (gameState.players.has(socket.id)) {
        socket.emit('error', { message: 'You are already in the game.' });
        return;
      }

      // Check for unique player name (case-insensitive)
      const trimmedName = playerName ? playerName.trim() : '';
      if (trimmedName) {
        const nameExists = players.some(
          (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (nameExists) {
          socket.emit('error', { message: 'This name is already taken. Please choose a different name.' });
          return;
        }
      }

      const finalName = trimmedName || `Player ${players.length + 1}`;

      const player = {
        id: socket.id,
        name: finalName,
        hand: [],
        score: 0,
        status: 'waiting',
        result: null,
        balance: 1000, // Starting balance
        bet: 0,
        hasPlacedBet: false,
      };

      gameState.players.set(socket.id, player);
      console.log(`Player ${player.name} joined. Total players: ${gameState.players.size}`);

      socket.emit('joined', { playerId: socket.id, playerName: player.name });
      broadcastGameState();
    });

    socket.on('placeBet', ({ betAmount }) => {
      const player = gameState.players.get(socket.id);
      if (!player) {
        socket.emit('error', { message: 'You are not in the game.' });
        return;
      }

      if (gameState.gameStatus !== 'waiting') {
        socket.emit('error', { message: 'Cannot place bet. Game is in progress.' });
        return;
      }

      const bet = parseInt(betAmount);
      if (isNaN(bet) || bet < 5 || bet > 20) {
        socket.emit('error', { message: 'Bet must be between $5 and $20.' });
        return;
      }

      if (bet > player.balance) {
        socket.emit('error', { message: 'Insufficient balance.' });
        return;
      }

      player.bet = bet;
      player.hasPlacedBet = true;
      player.balance -= bet;
      broadcastGameState();
    });

    socket.on('dealCards', () => {
      if (gameState.gameStatus !== 'waiting') {
        socket.emit('error', { message: 'Game is already in progress.' });
        return;
      }

      const players = getPlayerArray();
      if (players.length !== gameState.maxPlayers) {
        socket.emit('error', { message: `Need exactly ${gameState.maxPlayers} players to start. Currently ${players.length} player(s).` });
        return;
      }

      // Check if all players have placed bets
      const allPlayersBetted = players.every((p) => p.hasPlacedBet && p.bet >= 5);
      if (!allPlayersBetted) {
        socket.emit('error', { message: 'All players must place a bet before dealing cards.' });
        return;
      }

      gameState.deck = createMultipleDecks(1);
      gameState.dealerHand = [];
      gameState.currentPlayerIndex = 0;
      gameState.gameStatus = 'dealing';

      players.forEach((player) => {
        player.hand = [];
        player.score = 0;
        player.status = 'waiting';
        player.result = null;
      });

      players.forEach((player) => {
        for (let i = 0; i < 2; i++) {
          checkAndReshuffle();
          const { card, remainingDeck } = drawCard(gameState.deck);
          player.hand.push(card);
          gameState.deck = remainingDeck;
        }
        player.score = calculateHandValue(player.hand);

        if (isBlackjack(player.hand)) {
          player.status = 'finished';
          player.result = 'blackjack';
        } else {
          player.status = 'waiting';
        }
      });

      for (let i = 0; i < 2; i++) {
        checkAndReshuffle();
        const { card, remainingDeck } = drawCard(gameState.deck);
        gameState.dealerHand.push(card);
        gameState.deck = remainingDeck;
      }

      const allBlackjack = players.every((p) => p.status === 'finished');
      if (allBlackjack) {
        dealerPlay();
      } else {
        gameState.gameStatus = 'playing';
        const firstActivePlayer = players.find((p) => p.status !== 'finished');
        if (firstActivePlayer) {
          firstActivePlayer.status = 'playing';
          gameState.currentPlayerIndex = players.indexOf(firstActivePlayer);
        }
        broadcastGameState();
      }
    });

    socket.on('playerHit', () => {
      const player = gameState.players.get(socket.id);
      if (!player) {
        socket.emit('error', { message: 'You are not in the game.' });
        return;
      }

      if (gameState.gameStatus !== 'playing' || player.status !== 'playing') {
        socket.emit('error', { message: 'It is not your turn.' });
        return;
      }

      checkAndReshuffle();
      const { card, remainingDeck } = drawCard(gameState.deck);
      player.hand.push(card);
      gameState.deck = remainingDeck;
      player.score = calculateHandValue(player.hand);

      if (isBust(player.hand)) {
        player.status = 'finished';
        player.result = 'bust';
        nextPlayer();
      } else {
        broadcastGameState();
      }
    });

    socket.on('playerStand', () => {
      const player = gameState.players.get(socket.id);
      if (!player) {
        socket.emit('error', { message: 'You are not in the game.' });
        return;
      }

      if (gameState.gameStatus !== 'playing' || player.status !== 'playing') {
        socket.emit('error', { message: 'It is not your turn.' });
        return;
      }

      player.status = 'finished';
      nextPlayer();
    });

    socket.on('playerDouble', () => {
      const player = gameState.players.get(socket.id);
      if (!player) {
        socket.emit('error', { message: 'You are not in the game.' });
        return;
      }

      if (gameState.gameStatus !== 'playing' || player.status !== 'playing') {
        socket.emit('error', { message: 'It is not your turn.' });
        return;
      }

      if (player.hand.length !== 2) {
        socket.emit('error', { message: 'You can only double on your first turn.' });
        return;
      }

      // Double the bet
      if (player.bet * 2 > player.balance) {
        socket.emit('error', { message: 'Insufficient balance to double.' });
        return;
      }

      player.balance -= player.bet; // Deduct additional bet
      player.bet *= 2; // Double the bet

      checkAndReshuffle();
      const { card, remainingDeck } = drawCard(gameState.deck);
      player.hand.push(card);
      gameState.deck = remainingDeck;
      player.score = calculateHandValue(player.hand);
      player.status = 'finished';

      if (isBust(player.hand)) {
        player.result = 'bust';
      }

      nextPlayer();
    });

    socket.on('newGame', () => {
      gameState.deck = [];
      gameState.dealerHand = [];
      gameState.currentPlayerIndex = 0;
      gameState.gameStatus = 'waiting';

      const players = getPlayerArray();
      players.forEach((player) => {
        player.hand = [];
        player.score = 0;
        player.status = 'waiting';
        player.result = null;
        player.bet = 0;
        player.hasPlacedBet = false;
      });

      // Check if all players have placed bets before auto-dealing
      const allPlayersBetted = players.every((p) => p.hasPlacedBet && p.bet >= 5);
      if (players.length === gameState.maxPlayers && allPlayersBetted) {
        gameState.deck = createMultipleDecks(1);
        gameState.dealerHand = [];
        gameState.currentPlayerIndex = 0;
        gameState.gameStatus = 'dealing';

        players.forEach((player) => {
          for (let i = 0; i < 2; i++) {
            checkAndReshuffle();
            const { card, remainingDeck } = drawCard(gameState.deck);
            player.hand.push(card);
            gameState.deck = remainingDeck;
          }
          player.score = calculateHandValue(player.hand);

          if (isBlackjack(player.hand)) {
            player.status = 'finished';
            player.result = 'blackjack';
          } else {
            player.status = 'waiting';
          }
        });

        for (let i = 0; i < 2; i++) {
          checkAndReshuffle();
          const { card, remainingDeck } = drawCard(gameState.deck);
          gameState.dealerHand.push(card);
          gameState.deck = remainingDeck;
        }

        const allBlackjack = players.every((p) => p.status === 'finished');
        if (allBlackjack) {
          dealerPlay();
        } else {
          gameState.gameStatus = 'playing';
          const firstActivePlayer = players.find((p) => p.status !== 'finished');
          if (firstActivePlayer) {
            firstActivePlayer.status = 'playing';
            gameState.currentPlayerIndex = players.indexOf(firstActivePlayer);
          }
          broadcastGameState();
        }
      } else {
        broadcastGameState();
      }
    });

    socket.on('disconnect', () => {
      console.log('Player disconnected:', socket.id);
      const disconnectedPlayer = gameState.players.get(socket.id);

      // Only process disconnect if the player was actually in the game
      if (!disconnectedPlayer) {
        console.log('Disconnected player was not in the game, ignoring.');
        return;
      }

      const disconnectedPlayerName = disconnectedPlayer.name;
      const gameInProgress = gameState.gameStatus !== 'waiting' && gameState.gameStatus !== 'finished';

      gameState.players.delete(socket.id);

      if (gameInProgress && gameState.players.size > 0) {
        const players = getPlayerArray();

        players.forEach((player) => {
          player.status = 'finished';
          if (!player.result) {
            player.result = null;
          }
          // Return bet money to all remaining players
          if (player.bet > 0) {
            player.balance += player.bet;
            player.bet = 0;
            player.hasPlacedBet = false;
          }
        });

        gameState.gameStatus = 'finished';
        gameState.currentPlayerIndex = 0;

        broadcastGameState(`${disconnectedPlayerName} disconnected. Game ended. All bets have been returned.`);
      } else if (gameState.players.size === 0) {
        gameState.gameStatus = 'waiting';
        gameState.deck = [];
        gameState.dealerHand = [];
        gameState.currentPlayerIndex = 0;
        broadcastGameState();
      } else {
        const players = getPlayerArray();
        if (gameState.currentPlayerIndex >= players.length) {
          gameState.currentPlayerIndex = 0;
        }
        broadcastGameState();
      }
    });
  });

  return io;
}

// Vercel serverless function handler
export default function handler(req, res) {
  // Check if Socket.io is already initialized
  if (!res.socket.server.io) {
    const httpServer = createServer();
    setupSocketIO(httpServer);
    httpServer.listen(0); // Let Vercel assign port
    res.socket.server.io = io;
  } else {
    io = res.socket.server.io;
  }
  res.end();
}

// Local development - run Express server if file is executed directly
// Check if this file is being run directly (not imported by Vercel)
const isMainModule = process.argv[1] && process.argv[1].endsWith('api/socket.js');

if (isMainModule) {
  const app = express();
  app.use(cors());

  const httpServer = createServer(app);
  setupSocketIO(httpServer);

  const PORT = process.env.PORT || 3001;
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.io server ready for connections`);
    console.log(`Connect to: http://localhost:${PORT}/api/socket`);
  });
}
