import { useEffect, useRef, useState, createContext, useContext } from 'react';
import { useMultiplayerStore } from '../store/multiplayerStore';
import { Hand } from './Hand';
import { MultiplayerControls } from './MultiplayerControls';
import { SoundToggle } from './SoundToggle';
import { soundManager } from '../utils/soundManager';

// Context for card selection state
interface CardSelectionContextType {
  selectedCardIndex: number | null;
  setSelectedCardIndex: (index: number | null) => void;
  isSpecialChanceMode: boolean;
  setIsSpecialChanceMode: (mode: boolean) => void;
}

const CardSelectionContext = createContext<CardSelectionContextType | null>(null);

export const useCardSelection = () => {
  const context = useContext(CardSelectionContext);
  if (!context) {
    throw new Error('useCardSelection must be used within MultiplayerGameBoard');
  }
  return context;
};

export const MultiplayerGameBoard = () => {
  const { gameState, playerId, playerName, isConnected } = useMultiplayerStore();
  const prevGameStateRef = useRef<typeof gameState>(null);
  const prevPlayerHandsRef = useRef<Record<string, number>>({});
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [isSpecialChanceMode, setIsSpecialChanceMode] = useState(false);
  const [showSpecialChanceNotification, setShowSpecialChanceNotification] = useState<Record<string, boolean>>({});

  // Play sounds based on game state changes
  // IMPORTANT: This hook must be called before any early returns to follow Rules of Hooks
  useEffect(() => {
    if (!gameState) return;

    const prevState = prevGameStateRef.current;

    // Play sound when dealing starts
    if (prevState?.gameStatus !== 'dealing' && gameState.gameStatus === 'dealing') {
      soundManager.playCardDeal();
    }

    // Play sound when cards are dealt (check if dealer or player hands increased)
    if (prevState) {
      // Check dealer hand
      if (gameState.dealerHand.length > (prevState.dealerHand?.length || 0)) {
        soundManager.playCardDeal();
      }

      // Check player hands
      gameState.players.forEach((player) => {
        const prevHandLength = prevPlayerHandsRef.current[player.id] || 0;
        if (player.hand.length > prevHandLength) {
          // Only play sound for current player's cards or if it's a hit
          if (player.id === playerId && gameState.gameStatus === 'playing') {
            soundManager.playCardHit();
          } else if (gameState.gameStatus === 'dealing') {
            soundManager.playCardDeal();
          }
        }
        prevPlayerHandsRef.current[player.id] = player.hand.length;
      });
    }

    // Play sounds when game finishes
    if (prevState?.gameStatus !== 'finished' && gameState.gameStatus === 'finished') {
      const myPlayer = gameState.players.find(p => p.id === playerId);
      if (myPlayer) {
        setTimeout(() => {
          switch (myPlayer.result) {
            case 'blackjack':
              soundManager.playBlackjack();
              break;
            case 'bust':
              soundManager.playBust();
              break;
            case 'win':
              soundManager.playWin();
              break;
            case 'lose':
              soundManager.playLose();
              break;
            default:
              // Push or other - play a neutral sound
              break;
          }
        }, 300);
      }
    }

    // Detect when a player uses special chance and show notification
    if (prevState) {
      gameState.players.forEach((player) => {
        const prevPlayer = prevState.players.find(p => p.id === player.id);
        if (prevPlayer) {
          const prevWasUsing = prevPlayer.isUsingSpecialChance || false;
          const currentlyUsing = player.isUsingSpecialChance || false;

          // If it went from true to false, that means the replacement just completed
          if (prevWasUsing && !currentlyUsing) {
            // Show notification for this player
            setShowSpecialChanceNotification(prev => ({ ...prev, [player.id]: true }));
            // Hide notification after 3 seconds
            setTimeout(() => {
              setShowSpecialChanceNotification(prev => {
                const newState = { ...prev };
                delete newState[player.id];
                return newState;
              });
            }, 3000);
          }
        }
      });
    }

    prevGameStateRef.current = gameState;
  }, [gameState, playerId]);

  // Early return AFTER all hooks
  if (!isConnected || !gameState) {
    return null;
  }

  const hideDealerCard = gameState.gameStatus === 'playing' ||
                         gameState.gameStatus === 'dealing' ||
                         gameState.gameStatus === 'waiting';

  const isWaiting = gameState.gameStatus === 'waiting';

  const cardSelectionValue = {
    selectedCardIndex,
    setSelectedCardIndex,
    isSpecialChanceMode,
    setIsSpecialChanceMode,
  };

  return (
    <CardSelectionContext.Provider value={cardSelectionValue}>
    <div className={`min-h-screen bg-dark-bg p-2 md:p-4 pb-24 md:pb-28 ${isWaiting ? 'flex flex-col' : ''}`}>
      <div className={`mx-auto w-full ${isWaiting ? 'flex flex-col flex-1 justify-center' : ''}`}>
        {/* Compact Header */}
        <div className={`text-center ${isWaiting ? 'mb-4 md:mb-6' : 'mb-3 md:mb-4'}`}>
          <h1 className="text-2xl md:text-4xl font-pixel text-neon-green glow mb-4">
            BLACKJACK
          </h1>
          <div className="flex items-center justify-center gap-3 text-xs md:text-sm text-gray-500 font-pixel">
            {!isWaiting && gameState.deck.length > 0 && (
              <>
                <span>Cards: {gameState.deck.length}</span>
                <span>•</span>
              </>
            )}
            <span>Players: {gameState.players.length}/3</span>
            <span>•</span>
            <span>You: <span className="text-neon-green">{playerName}</span></span>
          </div>
        </div>

        {/* Dealer Hand - Compact */}
        {!isWaiting && (
          <div className="mb-4 md:mb-6">
            <Hand
              cards={gameState.dealerHand}
              title="DEALER"
              score={gameState.dealerScore}
              isDealer={true}
              hideFirstCard={hideDealerCard}
              result={null}
            />
          </div>
        )}

        {/* Game Status - Compact */}
        {gameState.gameStatus === 'waiting' && (
          <div className="text-center mb-4 md:mb-12">
            <p className="text-sm md:text-lg font-pixel text-yellow-400">
              Waiting for players... ({gameState.players.length}/3)
            </p>
          </div>
        )}

        {gameState.gameStatus === 'dealing' && (
          <div className="text-center mb-3">
            <p className="text-sm md:text-lg font-pixel text-neon-green">
              Dealing cards...
            </p>
          </div>
        )}

        {gameState.gameStatus === 'dealer-turn' && (
          <div className="text-center mb-3">
            <p className="text-sm md:text-lg font-pixel text-yellow-400">
              Dealer's turn...
            </p>
          </div>
        )}

        {gameState.disconnectMessage && (
          <div className="text-center mb-3">
            <p className="text-sm md:text-lg font-pixel text-red-500 bg-red-900/30 px-4 py-2 rounded border border-red-500 inline-block">
              {gameState.disconnectMessage}
            </p>
          </div>
        )}

        {/* Players - Grid layout: 1 column on small / 3 columns on xl */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 md:gap-4 xl:gap-6">
          {gameState.players.map((player) => {
            const isMyHand = player.id === playerId;
            const isFinished = gameState.gameStatus === 'finished';
            const specialChancesRemaining = 2 - (player.specialChancesUsed || 0);
            // Check if we should show the special chance notification for this player
            const shouldShowNotification = showSpecialChanceNotification[player.id] || false;
            // Check if this player just completed using special chance (for effects)
            const prevState = prevGameStateRef.current;
            const prevPlayer = prevState?.players.find(p => p.id === player.id);
            const wasUsingSpecialChance = prevPlayer?.isUsingSpecialChance || false;
            const currentlyUsingSpecialChance = player.isUsingSpecialChance || false;
            const justUsedSpecialChance = wasUsingSpecialChance && !currentlyUsingSpecialChance;

            return (
              <div key={player.id} className={`w-full relative ${justUsedSpecialChance ? 'special-chance-player-effect' : ''}`}>
                {shouldShowNotification && (
                  <>
                    <div className="absolute inset-0 special-chance-ring pointer-events-none"></div>
                    {/* Special Chance Notification - positioned above player's hand */}
                    <div className="w-80 absolute bottom-14 left-1/2 -translate-x-1/2 z-50 special-chance-notification">
                      <div className="relative bg-gradient-to-r from-purple-900 via-purple-700 to-purple-900 px-4 md:px-6 py-2 md:py-3 rounded-xl border-4 border-purple-400 shadow-2xl overflow-hidden special-chance-notification-glow">
                        <div className="relative flex items-center justify-center gap-2 md:gap-3 z-10">
                          <p className="text-sm md:text-base font-pixel text-white drop-shadow-lg">
                            <span className="text-yellow-300 font-bold glow-yellow">REPLACE CARD</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <Hand
                  cards={player.hand}
                  title={player.name}
                  score={player.score}
                  isDealer={false}
                  isCurrentPlayer={player.isCurrentPlayer && !isFinished}
                  isMyHand={isMyHand}
                  isFinished={isFinished}
                  result={player.result}
                  isWaiting={isWaiting}
                  balance={player.balance}
                  bet={player.bet}
                  specialChancesRemaining={specialChancesRemaining}
                  isUsingSpecialChance={player.isUsingSpecialChance || false}
                  onCardSelect={isMyHand && isSpecialChanceMode && player.isCurrentPlayer && !isFinished ? (index) => setSelectedCardIndex(index) : undefined}
                  selectedCardIndex={isMyHand ? selectedCardIndex : null}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Controls at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-dark-bg/95 border-t-4 border-neon-green p-3 md:p-4 z-50">
        <MultiplayerControls />
      </div>

      {/* Sound Toggle - Bottom Right */}
      <SoundToggle />
    </div>
    </CardSelectionContext.Provider>
  );
};
