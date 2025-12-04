import { Card } from '../types';

export const getCardValue = (card: Card): number => {
  if (card.rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(card.rank)) return 10;
  return parseInt(card.rank);
};

export const calculateHandValue = (hand: Card[]): number => {
  let value = 0;
  let aces = 0;

  hand.forEach((card) => {
    if (card.rank === 'A') {
      aces++;
      value += 11;
    } else {
      value += getCardValue(card);
    }
  });

  // Adjust for aces
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
};

export const isBlackjack = (hand: Card[]): boolean => {
  return hand.length === 2 && calculateHandValue(hand) === 21;
};

export const isBust = (hand: Card[]): boolean => {
  return calculateHandValue(hand) > 21;
};

export const determineWinner = (
  playerHand: Card[],
  dealerHand: Card[],
  playerBust: boolean,
  dealerBust: boolean
): 'blackjack' | 'bust' | 'win' | 'lose' | 'push' | null => {
  const playerValue = calculateHandValue(playerHand);
  const dealerValue = calculateHandValue(dealerHand);
  const playerBJ = isBlackjack(playerHand);
  const dealerBJ = isBlackjack(dealerHand);

  if (playerBust) return 'bust';
  if (playerBJ && !dealerBJ) return 'blackjack';
  if (dealerBust) return 'win';
  if (dealerBJ && !playerBJ) return 'lose';
  if (playerBJ && dealerBJ) return 'push';
  if (playerValue > dealerValue) return 'win';
  if (playerValue < dealerValue) return 'lose';
  return 'push';
};
