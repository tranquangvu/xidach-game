import { useMultiplayerStore } from '../store/multiplayerStore';
import { Hand } from './Hand';
import { MultiplayerControls } from './MultiplayerControls';

export const MultiplayerGameBoard = () => {
  const { gameState, playerId, playerName, isConnected } = useMultiplayerStore();

  if (!isConnected || !gameState) {
    return null;
  }

  const hideDealerCard = gameState.gameStatus === 'playing' ||
                         gameState.gameStatus === 'dealing' ||
                         gameState.gameStatus === 'waiting';

  const isWaiting = gameState.gameStatus === 'waiting';

  return (
    <div className={`min-h-screen bg-dark-bg p-2 md:p-4 pb-24 md:pb-28 ${isWaiting ? 'flex flex-col' : ''}`}>
      <div className={`max-w-7xl mx-auto w-full ${isWaiting ? 'flex flex-col flex-1 justify-center' : ''}`}>
        {/* Compact Header */}
        <div className={`text-center ${isWaiting ? 'mb-4 md:mb-6' : 'mb-3 md:mb-4'}`}>
          <h1 className="text-2xl md:text-4xl font-pixel text-neon-green glow mb-1">
            XÌ DÁCH
          </h1>
          <div className="flex items-center justify-center gap-3 text-xs md:text-sm text-gray-500 font-pixel">
            {!isWaiting && gameState.deck.length > 0 && (
              <>
                <span>Cards Remaining: {gameState.deck.length}</span>
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
          <div className="text-center mb-4 md:mb-6">
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

        {/* Players - Grid layout: vertical on waiting, 1 column on small / 3 columns on xl during game */}
        <div className={`grid ${isWaiting ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-3'} gap-3 md:gap-4 xl:gap-6 ${isWaiting ? '' : 'mb-20'}`}>
          {gameState.players.map((player) => {
            const isMyHand = player.id === playerId;
            const isFinished = gameState.gameStatus === 'finished';
            return (
              <div key={player.id} className="w-full">
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
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Controls at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-dark-bg/95 border-t-4 border-neon-green p-3 md:p-4 z-50">
        <div className="max-w-7xl mx-auto">
          <MultiplayerControls />
        </div>
      </div>
    </div>
  );
};
