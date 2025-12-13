export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades' | 'joker';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'JOKER';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
  isFaceDown?: boolean; // Track if card is face down
}

export type GameStatus = 'waiting' | 'dealing' | 'playing' | 'dealer-turn' | 'finished';
export type GameResult = 'blackjack' | 'bust' | 'win' | 'lose' | 'push' | null;
export type PlayerStatus = 'waiting' | 'playing' | 'finished';

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  score: number;
  status: PlayerStatus;
  result: GameResult;
  isCurrentPlayer?: boolean;
  balance: number;
  bet: number;
  hasPlacedBet?: boolean;
  specialChancesUsed?: number;
  isUsingSpecialChance?: boolean;
}

export interface GameState {
  deck: { length: number };
  dealerHand: Card[];
  dealerScore: number;
  players: Player[];
  gameStatus: GameStatus;
  currentPlayerIndex: number;
  disconnectMessage?: string | null;
}

export interface SocketGameState {
  deck: { length: number };
  dealerHand: Card[];
  dealerScore: number;
  players: Player[];
  gameStatus: GameStatus;
  currentPlayerIndex: number;
}
