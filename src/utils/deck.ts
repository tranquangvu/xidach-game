import { Card, Suit, Rank } from '../types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
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
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const createMultipleDecks = (numDecks: number = 6): Card[] => {
  const deck: Card[] = [];
  for (let i = 0; i < numDecks; i++) {
    const singleDeck = createDeck();
    deck.push(...singleDeck);
  }
  return shuffleDeck(deck);
};

export const drawCard = (deck: Card[]): { card: Card; remainingDeck: Card[] } => {
  if (deck.length === 0) {
    throw new Error('Deck is empty');
  }
  const card = deck[0];
  const remainingDeck = deck.slice(1);
  return { card, remainingDeck };
};
