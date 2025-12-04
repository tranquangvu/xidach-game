# Xì Dách - Blackjack Game

A modern, retro-styled Blackjack (Xì Dách) game built with React, TypeScript, Vite, and TailwindCSS.

## Features

- 🎮 Classic Blackjack gameplay with standard rules
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
- **Press Start 2P** - Pixel-style font

## Project Structure

```
xidach-game/
├── src/
│   ├── components/       # React components
│   │   ├── Card.tsx     # Individual card component
│   │   ├── Hand.tsx     # Hand display component
│   │   ├── Controls.tsx # Game controls (Hit, Stand, Double)
│   │   └── GameBoard.tsx # Main game board
│   ├── store/
│   │   └── gameStore.ts # Zustand game state store
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

### Running the Game

Start the development server:
```bash
npm run dev
```

The game will be available at `http://localhost:5173` (or the port Vite assigns).

### Building for Production

Build the production bundle:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## How to Play

1. Click **"DEAL CARDS"** to start a new hand
2. You'll receive 2 cards, and the dealer receives 2 cards (one hidden)
3. Choose your action:
   - **HIT** - Draw another card
   - **STAND** - End your turn (dealer will play)
   - **DOUBLE** - Double your bet and take exactly one more card (only available on first turn)
4. The dealer will automatically play after you stand
5. The game will show the result: Win, Lose, Push, Blackjack, or Bust
6. Click **"NEW GAME"** to start another round

## Game States

- **Waiting** - Ready to deal cards
- **Player Turn** - Player can make decisions
- **Dealer Turn** - Dealer is playing (automatic)
- **Finished** - Game over, showing results

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
