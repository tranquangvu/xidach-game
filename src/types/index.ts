export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

export type GameStatus = 'waiting' | 'player-turn' | 'dealer-turn' | 'finished';
export type GameResult = 'blackjack' | 'bust' | 'win' | 'lose' | 'push' | null;

export interface GameState {
  deck: Card[];
  playerHand: Card[];
  dealerHand: Card[];
  gameStatus: GameStatus;
  result: GameResult;
  playerScore: number;
  dealerScore: number;
  canDouble: boolean;
}
