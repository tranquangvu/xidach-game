import { Card } from '../types';

export const getCardValue = (card: Card): number | null => {
  if (card.rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(card.rank)) return 10;
  if (card.rank === 'JOKER') return null; // Joker value depends on dealer
  return parseInt(card.rank);
};

export const calculateHandValue = (hand: Card[], dealerHand: Card[] | null = null): number => {
  let value = 0;
  let aces = 0;
  let jokers: Card[] = [];

  // First pass: collect jokers and calculate other cards
  hand.forEach((card) => {
    if (card.rank === 'JOKER') {
      jokers.push(card);
    } else if (card.rank === 'A') {
      aces++;
      value += 11;
    } else {
      const cardValue = getCardValue(card);
      if (cardValue !== null) {
        value += cardValue;
      }
    }
  });

  // Calculate Joker values based on dealer's face down card
  if (jokers.length > 0 && dealerHand && dealerHand.length > 0) {
    // Find dealer's face down card
    const dealerFaceDownCard = dealerHand.find(c => c.isFaceDown === true);

    if (dealerFaceDownCard) {
      // If dealer's face down card is also a Joker, use dealer's face up card
      if (dealerFaceDownCard.rank === 'JOKER') {
        const dealerFaceUpCard = dealerHand.find(c => c.isFaceDown === false);
        if (dealerFaceUpCard) {
          const jokerValue = getCardValue(dealerFaceUpCard);
          if (jokerValue !== null) {
            value += jokerValue * jokers.length;
          }
        }
      } else {
        // Use dealer's face down card value
        const jokerValue = getCardValue(dealerFaceDownCard);
        if (jokerValue !== null) {
          value += jokerValue * jokers.length;
        }
      }
    }
  }

  // Adjust for aces
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
};

export const isBlackjack = (hand: Card[], dealerHand: Card[] | null = null): boolean => {
  return hand.length === 2 && calculateHandValue(hand, dealerHand) === 21;
};

export const isBust = (hand: Card[], dealerHand: Card[] | null = null): boolean => {
  return calculateHandValue(hand, dealerHand) > 21;
};

export const determineWinner = (
  playerHand: Card[],
  dealerHand: Card[],
  playerBust: boolean,
  dealerBust: boolean
): 'blackjack' | 'bust' | 'win' | 'lose' | 'push' | null => {
  const playerValue = calculateHandValue(playerHand, dealerHand);
  const dealerValue = calculateHandValue(dealerHand);
  const playerBJ = isBlackjack(playerHand, dealerHand);
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
