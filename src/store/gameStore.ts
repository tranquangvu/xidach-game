import { create } from 'zustand';
import { Card, GameStatus, GameResult } from '../types';
import { createMultipleDecks, drawCard } from '../utils/deck';
import { calculateHandValue, isBust, isBlackjack, determineWinner } from '../utils/scoring';

interface GameStore {
  deck: Card[];
  playerHand: Card[];
  dealerHand: Card[];
  gameStatus: GameStatus;
  result: GameResult;
  playerScore: number;
  dealerScore: number;
  canDouble: boolean;

  // Actions
  startNewGame: () => void;
  dealInitialCards: () => void;
  playerHit: () => void;
  playerStand: () => void;
  playerDouble: () => void;
  dealerPlay: () => void;
  updateScores: () => void;
  checkAndReshuffle: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  deck: [],
  playerHand: [],
  dealerHand: [],
  gameStatus: 'waiting',
  result: null,
  playerScore: 0,
  dealerScore: 0,
  canDouble: true,

  startNewGame: () => {
    const newDeck = createMultipleDecks(6);
    set({
      deck: newDeck,
      playerHand: [],
      dealerHand: [],
      gameStatus: 'waiting',
      result: null,
      playerScore: 0,
      dealerScore: 0,
      canDouble: true,
    });
  },

  dealInitialCards: () => {
    let currentDeck = [...get().deck];
    const playerCards: Card[] = [];
    const dealerCards: Card[] = [];

    // Deal 2 cards to player
    for (let i = 0; i < 2; i++) {
      get().checkAndReshuffle();
      currentDeck = get().deck;
      const { card, remainingDeck } = drawCard(currentDeck);
      playerCards.push(card);
      currentDeck = remainingDeck;
      set({ deck: currentDeck });
    }

    // Deal 2 cards to dealer
    for (let i = 0; i < 2; i++) {
      get().checkAndReshuffle();
      currentDeck = get().deck;
      const { card, remainingDeck } = drawCard(currentDeck);
      dealerCards.push(card);
      currentDeck = remainingDeck;
      set({ deck: currentDeck });
    }

    const playerValue = calculateHandValue(playerCards);
    const dealerValue = calculateHandValue(dealerCards);
    const playerBJ = isBlackjack(playerCards);
    const dealerBJ = isBlackjack(dealerCards);

    // Check for immediate blackjack
    if (playerBJ || dealerBJ) {
      const result = determineWinner(playerCards, dealerCards, false, false);
      set({
        playerHand: playerCards,
        dealerHand: dealerCards,
        gameStatus: 'finished',
        result,
        playerScore: playerValue,
        dealerScore: dealerValue,
        canDouble: false,
      });
    } else {
      set({
        playerHand: playerCards,
        dealerHand: dealerCards,
        gameStatus: 'player-turn',
        playerScore: playerValue,
        dealerScore: dealerValue,
        canDouble: true,
      });
    }
  },

  playerHit: () => {
    const { playerHand } = get();
    get().checkAndReshuffle();
    const currentDeck = get().deck;
    const { card, remainingDeck } = drawCard(currentDeck);
    const newPlayerHand = [...playerHand, card];
    const playerValue = calculateHandValue(newPlayerHand);
    const bust = isBust(newPlayerHand);

    if (bust) {
      set({
        playerHand: newPlayerHand,
        deck: remainingDeck,
        gameStatus: 'finished',
        result: 'bust',
        playerScore: playerValue,
        canDouble: false,
      });
    } else {
      set({
        playerHand: newPlayerHand,
        deck: remainingDeck,
        playerScore: playerValue,
        canDouble: false,
      });
    }
  },

  playerStand: () => {
    set({ gameStatus: 'dealer-turn', canDouble: false });
    get().dealerPlay();
  },

  playerDouble: () => {
    const { playerHit, playerStand } = get();
    playerHit();
    // If not bust, automatically stand
    setTimeout(() => {
      if (get().gameStatus === 'player-turn') {
        playerStand();
      }
    }, 100);
  },

  dealerPlay: () => {
    const { dealerHand, playerHand } = get();
    let currentDeck = [...get().deck];
    let currentDealerHand = [...dealerHand];

    // Reveal dealer's hidden card (if any) and play
    while (calculateHandValue(currentDealerHand) < 17) {
      get().checkAndReshuffle();
      currentDeck = get().deck;
      const { card, remainingDeck } = drawCard(currentDeck);
      currentDealerHand.push(card);
      currentDeck = remainingDeck;
      set({ deck: currentDeck, dealerHand: currentDealerHand });
    }

    const dealerValue = calculateHandValue(currentDealerHand);
    const playerValue = calculateHandValue(playerHand);
    const dealerBust = isBust(currentDealerHand);
    const playerBust = isBust(playerHand);

    const result = determineWinner(playerHand, currentDealerHand, playerBust, dealerBust);

    set({
      dealerHand: currentDealerHand,
      dealerScore: dealerValue,
      gameStatus: 'finished',
      result,
    });
  },

  updateScores: () => {
    const { playerHand, dealerHand } = get();
    set({
      playerScore: calculateHandValue(playerHand),
      dealerScore: calculateHandValue(dealerHand),
    });
  },

  checkAndReshuffle: () => {
    const { deck } = get();
    // Reshuffle if less than 20 cards remaining
    if (deck.length < 20) {
      const newDeck = createMultipleDecks(6);
      set({ deck: newDeck });
    }
  },
}));
