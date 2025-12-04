I want you to generate a complete Blackjack (Xì Dách) game using modern frontend practices.

### Requirements
- Use React + TypeScript + Vite.
- Use TailwindCSS for styling.
- Architecture should be clean and modular (components, hooks, utils).
- Game rules follow standard Blackjack:
  - Dealer hits until 17 or higher.
  - Player can Hit, Stand, Double.
  - Detect Bust, Blackjack, Push, Win, Lose.
  - Auto reshuffle when deck is low.
- Handle game state cleanly using React state or Zustand.
- Show player hand, dealer hand, deck, and score.
- Animate card dealing (simple fade/slide).
- Use clean retro UI style: pixel-style rounded cards, thick borders, shadow, neon glow.
- Include sound effects (optional stub).
- Keep assets simple (SVG or Tailwind-styled div cards).
- Make the UI responsive for mobile and desktop.

### Deliverables
1. Folder structure recommendation.
2. All component files (Card, Hand, Controls, GameBoard, etc.).
3. Game logic utilities (deck generation, shuffle, scoring, isBlackjack).
4. Zustand or React state store for the game.
5. Main App.tsx connecting everything.
6. Instructions on how to run the project.

### UI Style
- Retro arcade style
- Neon green highlights
- Dark background (#0d0d0d)
- Rounded cards with white borders
- Pixel-style font (e.g., Press Start 2P or similar)
- Slight card drop shadows

### Additional Notes
- The code should run immediately after `npm install` and `npm run dev`.
- Avoid unnecessary complexity. Keep it clean and maintainable.
