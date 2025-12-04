# Xì Dách - Multiplayer Blackjack Game

A modern, retro-styled multiplayer Blackjack (Xì Dách) game built with React, TypeScript, Vite, TailwindCSS, and Socket.io.

## Features

- 🎮 Classic Blackjack gameplay with standard rules
- 👥 **Multiplayer support** - Up to 3 players can join from different browsers
- 🔄 **Real-time synchronization** - WebSocket-based game state sync
- 🎨 Retro arcade-style UI with neon green highlights
- 📱 Fully responsive design (mobile and desktop)
- 🎯 Clean, modular architecture
- 🃏 Smooth card dealing animations
- 🎲 Auto-reshuffle when deck is low
- ⚡ Fast and performant with Vite

## Game Rules

- Dealer hits until 17 or higher
- Player can Hit, Stand, or Double
- Automatic detection of:
  - Blackjack (21 with 2 cards)
  - Bust (over 21)
  - Win/Lose/Push
- Uses 6 decks shuffled together
- Auto-reshuffles when less than 20 cards remain

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **Zustand** - State management
- **Socket.io** - Real-time multiplayer communication
- **Express** - Backend server
- **Press Start 2P** - Pixel-style font

## Project Structure

```
xidach-game/
├── server/
│   └── index.js         # Socket.io server for multiplayer
├── src/
│   ├── components/       # React components
│   │   ├── Card.tsx     # Individual card component
│   │   ├── Hand.tsx     # Hand display component
│   │   ├── Controls.tsx # Single-player controls
│   │   ├── GameBoard.tsx # Single-player game board
│   │   ├── PlayerJoin.tsx # Player join/login screen
│   │   ├── MultiplayerGameBoard.tsx # Multiplayer game board
│   │   └── MultiplayerControls.tsx # Multiplayer controls
│   ├── store/
│   │   ├── gameStore.ts # Single-player Zustand store
│   │   └── multiplayerStore.ts # Multiplayer Zustand store
│   ├── utils/
│   │   ├── deck.ts      # Deck creation and shuffling
│   │   └── scoring.ts   # Hand value calculation and game logic
│   ├── types/
│   │   └── index.ts     # TypeScript type definitions
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles and TailwindCSS
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the Multiplayer Game

The game requires both a backend server and frontend to run:

**Option 1: Run both together (recommended)**
```bash
npm run dev:all
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend on `http://localhost:5173`

**Option 2: Run separately**

Terminal 1 - Backend server:
```bash
npm run dev:server
```

Terminal 2 - Frontend:
```bash
npm run dev
```

### Configuration

The frontend connects to the backend server. By default, it connects to `http://localhost:3001`.

To change the server URL, create a `.env` file:
```env
VITE_SOCKET_URL=http://localhost:3001
```

### Playing Multiplayer

1. Open the game in your browser: `http://localhost:5173`
2. Enter your name and click "JOIN GAME"
3. Up to 3 players can join from different browsers/devices
4. Once players have joined, any player can click "DEAL CARDS"
5. Players take turns in order (Player 1, Player 2, Player 3, then Dealer)
6. Each player can Hit, Stand, or Double (on first turn only)
7. After all players finish, the dealer plays automatically
8. Results are shown for each player
9. Click "NEW GAME" to start another round

### Building for Production

Build the production bundle:
```bash
pnpm build
```

Preview the production build:
```bash
pnpm preview
```

## How to Play (Multiplayer)

1. **Join the game**: Enter your name and click "JOIN GAME"
2. **Wait for players**: Up to 3 players can join (minimum 1 player needed)
3. **Deal cards**: Once players are ready, any player can click "DEAL CARDS"
4. **Take your turn**: When it's your turn, you'll see "(YOUR TURN)" next to your name
5. **Choose your action**:
   - **HIT** - Draw another card
   - **STAND** - End your turn (next player's turn)
   - **DOUBLE** - Double your bet and take exactly one more card (only available on first turn with 2 cards)
6. **Wait for others**: Watch other players take their turns
7. **Dealer plays**: After all players finish, the dealer plays automatically
8. **See results**: Each player's result is shown (Win, Lose, Push, Blackjack, or Bust)
9. **New game**: Click "NEW GAME" to start another round

## Game States

- **Waiting** - Waiting for players to join and ready to deal cards
- **Dealing** - Cards are being dealt to all players
- **Playing** - Players are taking turns
- **Dealer Turn** - Dealer is playing (automatic)
- **Finished** - Game over, showing results for all players

## Multiplayer Features

- **Real-time synchronization**: All players see the same game state
- **Turn-based gameplay**: Players take turns in order
- **Player identification**: Each player has a unique name and ID
- **Connection handling**: Players can join/leave at any time
- **Error handling**: Clear error messages for invalid actions
- **Cross-browser**: Works across different browsers and devices

## Styling

The game uses a retro arcade aesthetic:
- Dark background (#0d0d0d)
- Neon green highlights (#39ff14)
- Pixel-style font (Press Start 2P)
- Rounded cards with white borders
- Card drop shadows
- Smooth animations on card dealing

## License

MIT
