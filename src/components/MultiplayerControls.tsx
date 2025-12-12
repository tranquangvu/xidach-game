import { useEffect } from 'react';
import { useMultiplayerStore } from '../store/multiplayerStore';
import { BettingControls } from './BettingControls';
import { soundManager } from '../utils/soundManager';
import { useCardSelection } from './MultiplayerGameBoard';

export const MultiplayerControls = () => {
  const {
    gameState,
    isMyTurn,
    getCurrentPlayer,
    playerHit,
    playerStand,
    playerDouble,
    requestSpecialChance,
    dealCards,
    newGame,
    error
  } = useMultiplayerStore();
  const { selectedCardIndex, setSelectedCardIndex, isSpecialChanceMode, setIsSpecialChanceMode } = useCardSelection();

  if (!gameState) return null;

  const myPlayer = getCurrentPlayer();
  const isWaiting = gameState.gameStatus === 'waiting';
  const isFinished = gameState.gameStatus === 'finished';
  const gameEnded = isFinished || !!gameState.disconnectMessage;
  const allPlayersBetted = gameState.players.every((p) => p.hasPlacedBet && p.bet >= 5);
  const canDeal = isWaiting && gameState.players.length === 3 && allPlayersBetted && !gameState.disconnectMessage;
  const myTurn = isMyTurn() && !gameState.disconnectMessage;
  const canDouble = myTurn && myPlayer && myPlayer.hand.length === 2;
  const specialChancesRemaining = myPlayer ? 2 - (myPlayer.specialChancesUsed || 0) : 0;
  const canUseSpecialChance = myTurn && myPlayer && specialChancesRemaining > 0 && myPlayer.hand.length > 0;

  // Reset special chance mode when it's no longer the player's turn
  useEffect(() => {
    if (!myTurn) {
      setIsSpecialChanceMode(false);
      setSelectedCardIndex(null);
    }
  }, [myTurn, setIsSpecialChanceMode, setSelectedCardIndex]);

  return (
    <div className="flex flex-col items-center space-y-2 md:space-y-3">
      {isWaiting && <BettingControls />}

      {error && !isWaiting && (
        <div className="text-red-500 font-pixel text-xs md:text-sm text-center bg-red-900/30 px-3 py-1.5 md:px-4 md:py-2 rounded border border-red-500 w-full max-w-md">
          {error}
        </div>
      )}

      {canDeal && (
        <button
          onClick={() => {
            soundManager.playCardDeal();
            dealCards();
          }}
          className="px-6 md:px-8 py-2 md:py-3 bg-neon-green text-dark-bg font-pixel text-sm md:text-base rounded-xl border-4 border-white shadow-neon hover:scale-105 transition-transform cursor-pointer w-full max-w-xs"
        >
          DEAL CARDS
        </button>
      )}

      {myTurn && !isSpecialChanceMode && (
        <div className="flex flex-wrap gap-2 md:gap-3 justify-center w-full">
          <button
            onClick={() => {
              soundManager.playCardHit();
              playerHit();
            }}
            className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white font-pixel text-xs md:text-sm rounded-xl border-4 border-white shadow-lg hover:scale-105 transition-transform cursor-pointer flex-1 min-w-[80px] max-w-[160px]"
          >
            HIT
          </button>
          <button
            onClick={() => {
              soundManager.playStand();
              playerStand();
            }}
            className="px-4 md:px-6 py-2 md:py-3 bg-red-600 text-white font-pixel text-xs md:text-sm rounded-xl border-4 border-white shadow-lg hover:scale-105 transition-transform cursor-pointer flex-1 min-w-[80px] max-w-[160px]"
          >
            STAND
          </button>
          {canDouble && (
            <button
              onClick={() => {
                soundManager.playDouble();
                playerDouble();
              }}
              className="px-4 md:px-6 py-2 md:py-3 bg-yellow-600 text-white font-pixel text-xs md:text-sm rounded-xl border-4 border-white shadow-lg hover:scale-105 transition-transform cursor-pointer flex-1 min-w-[80px] max-w-[160px]"
            >
              DOUBLE
            </button>
          )}
          {canUseSpecialChance && (
            <button
              onClick={() => {
                setIsSpecialChanceMode(true);
                soundManager.playCardDeal();
              }}
              className="px-4 md:px-6 py-2 md:py-3 bg-purple-600 text-white font-pixel text-xs md:text-sm rounded-xl border-4 border-white shadow-lg hover:scale-105 transition-transform cursor-pointer flex-1 min-w-[80px] max-w-[220px]"
            >
              REPLACE ({specialChancesRemaining})
            </button>
          )}
        </div>
      )}

      {myTurn && isSpecialChanceMode && (
        <div className="flex flex-col items-center gap-2 md:gap-3 w-full">
          <p className="text-xs md:text-sm font-pixel text-purple-400 text-center">
            Select a card to replace with the next card from deck
          </p>
          <div className="flex gap-2 md:gap-3 justify-center w-full">
            <button
              onClick={() => {
                if (selectedCardIndex !== null) {
                  requestSpecialChance(selectedCardIndex);
                  setIsSpecialChanceMode(false);
                  setSelectedCardIndex(null);
                }
              }}
              disabled={selectedCardIndex === null}
              className="px-4 md:px-6 py-2 md:py-3 bg-purple-600 text-white font-pixel text-xs md:text-sm rounded-xl border-4 border-white shadow-lg hover:scale-105 transition-transform cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              REPLACE CARD
            </button>
            <button
              onClick={() => {
                setIsSpecialChanceMode(false);
                setSelectedCardIndex(null);
              }}
              className="px-4 md:px-6 py-2 md:py-3 bg-gray-600 text-white font-pixel text-xs md:text-sm rounded-xl border-4 border-white shadow-lg hover:scale-105 transition-transform cursor-pointer"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {!myTurn && gameState.gameStatus === 'playing' && !gameState.disconnectMessage && (
        <div className="text-center">
          <p className="text-sm md:text-base font-pixel text-yellow-400">
            Waiting for other players...
          </p>
        </div>
      )}

      {gameEnded && (
        <button
          onClick={newGame}
          className="px-6 md:px-8 py-2 md:py-3 bg-neon-green text-dark-bg font-pixel text-sm md:text-base rounded-xl border-4 border-white shadow-neon hover:scale-105 transition-transform cursor-pointer w-full max-w-xs"
        >
          NEW GAME
        </button>
      )}
    </div>
  );
};
