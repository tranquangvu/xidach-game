import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { GameState, Player } from '../types';

interface MultiplayerStore {
  socket: Socket | null;
  gameState: GameState | null;
  playerId: string | null;
  playerName: string;
  isConnected: boolean;
  error: string | null;

  // Actions
  connect: (playerName: string) => void;
  disconnect: () => void;
  joinGame: (playerName: string) => void;
  placeBet: (betAmount: number) => void;
  dealCards: () => void;
  playerHit: () => void;
  playerStand: () => void;
  playerDouble: () => void;
  newGame: () => void;
  getCurrentPlayer: () => Player | null;
  isMyTurn: () => boolean;
}

// Use relative path for Vercel deployment, or environment variable for custom server
const SOCKET_URL =
  (typeof import.meta !== 'undefined' &&
    // @ts-expect-error: VITE_SOCKET_URL might be defined in Vite's ImportMetaEnv
    import.meta.env && import.meta.env.VITE_SOCKET_URL)
    // @ts-expect-error: import.meta.env.PROD might exist in Vite
    ? import.meta.env.VITE_SOCKET_URL
    // @ts-expect-error: import.meta.env.PROD might exist in Vite
    : (import.meta.env && import.meta.env.PROD ? '' : 'http://localhost:3001');

export const useMultiplayerStore = create<MultiplayerStore>((set, get) => ({
  socket: null,
  gameState: null,
  playerId: null,
  playerName: '',
  isConnected: false,
  error: null,

  connect: (playerName: string) => {
    // Fix: Always use SOCKET_URL. The logic is already handled in SOCKET_URL definition.
    const socketUrl = SOCKET_URL || window.location.origin;

    const socket = io(socketUrl, {
      path: '/api/socket',
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Connected to server');
      set({ isConnected: true, error: null });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      set({ isConnected: false });
    });

    socket.on('error', (data: { message: string }) => {
      console.error('Socket error:', data.message);
      set({ error: data.message });
    });

    socket.on('joined', (data: { playerId: string; playerName: string }) => {
      console.log('Joined game:', data);
      set({ playerId: data.playerId, playerName: data.playerName });
    });

    socket.on('gameState', (state: GameState) => {
      console.log('Game state updated:', state);
      set({ gameState: state, error: null });
    });

    set({ socket, playerName });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false, playerId: null, gameState: null });
    }
  },

  joinGame: (playerName: string) => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.emit('joinGame', { playerName });
      set({ playerName });
    } else {
      set({ error: 'Not connected to server' });
    }
  },

  placeBet: (betAmount: number) => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.emit('placeBet', { betAmount });
    } else {
      set({ error: 'Not connected to server' });
    }
  },

  dealCards: () => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.emit('dealCards');
    } else {
      set({ error: 'Not connected to server' });
    }
  },

  playerHit: () => {
    const { socket, isMyTurn } = get();
    if (!isMyTurn()) {
      set({ error: 'It is not your turn' });
      return;
    }
    if (socket && socket.connected) {
      socket.emit('playerHit');
    } else {
      set({ error: 'Not connected to server' });
    }
  },

  playerStand: () => {
    const { socket, isMyTurn } = get();
    if (!isMyTurn()) {
      set({ error: 'It is not your turn' });
      return;
    }
    if (socket && socket.connected) {
      socket.emit('playerStand');
    } else {
      set({ error: 'Not connected to server' });
    }
  },

  playerDouble: () => {
    const { socket, isMyTurn, getCurrentPlayer } = get();
    if (!isMyTurn()) {
      set({ error: 'It is not your turn' });
      return;
    }
    const player = getCurrentPlayer();
    if (player && player.hand.length !== 2) {
      set({ error: 'You can only double on your first turn' });
      return;
    }
    if (socket && socket.connected) {
      socket.emit('playerDouble');
    } else {
      set({ error: 'Not connected to server' });
    }
  },

  newGame: () => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.emit('newGame');
    } else {
      set({ error: 'Not connected to server' });
    }
  },

  getCurrentPlayer: () => {
    const { gameState, playerId } = get();
    if (!gameState || !playerId) return null;
    return gameState.players.find((p) => p.id === playerId) || null;
  },

  isMyTurn: () => {
    const { gameState, playerId } = get();
    if (!gameState || !playerId) return false;
    const player = gameState.players.find((p) => p.id === playerId);
    return player?.status === 'playing' && player?.isCurrentPlayer === true;
  },
}));
