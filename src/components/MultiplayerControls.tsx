import { useMultiplayerStore } from '../store/multiplayerStore';

export const MultiplayerControls = () => {
  const {
    gameState,
    isMyTurn,
    getCurrentPlayer,
    playerHit,
    playerStand,
    playerDouble,
    dealCards,
    newGame,
    error
  } = useMultiplayerStore();

  if (!gameState) return null;

  const myPlayer = getCurrentPlayer();
  const isWaiting = gameState.gameStatus === 'waiting';
  const isFinished = gameState.gameStatus === 'finished';
  const gameEnded = isFinished || !!gameState.disconnectMessage;
  const canDeal = isWaiting && gameState.players.length === 3 && !gameState.disconnectMessage;
  const myTurn = isMyTurn() && !gameState.disconnectMessage;
  const canDouble = myTurn && myPlayer && myPlayer.hand.length === 2;

  return (
    <div className="flex flex-col items-center space-y-2 md:space-y-3">
      {error && (
        <div className="text-red-500 font-pixel text-xs md:text-sm text-center bg-red-900/30 px-3 py-1.5 md:px-4 md:py-2 rounded border border-red-500 w-full max-w-md">
          {error}
        </div>
      )}

      {canDeal && (
        <button
          onClick={dealCards}
          className="px-6 md:px-8 py-2 md:py-3 bg-neon-green text-dark-bg font-pixel text-sm md:text-base rounded-lg border-4 border-white shadow-neon hover:scale-105 transition-transform cursor-pointer w-full max-w-xs"
        >
          DEAL CARDS
        </button>
      )}

      {myTurn && (
        <div className="flex flex-wrap gap-2 md:gap-3 justify-center w-full">
          <button
            onClick={playerHit}
            className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white font-pixel text-xs md:text-sm rounded-lg border-4 border-white shadow-lg hover:scale-105 transition-transform cursor-pointer flex-1 min-w-[80px] max-w-[120px]"
          >
            HIT
          </button>
          <button
            onClick={playerStand}
            className="px-4 md:px-6 py-2 md:py-3 bg-red-600 text-white font-pixel text-xs md:text-sm rounded-lg border-4 border-white shadow-lg hover:scale-105 transition-transform cursor-pointer flex-1 min-w-[80px] max-w-[120px]"
          >
            STAND
          </button>
          {canDouble && (
            <button
              onClick={playerDouble}
              className="px-4 md:px-6 py-2 md:py-3 bg-yellow-600 text-white font-pixel text-xs md:text-sm rounded-lg border-4 border-white shadow-lg hover:scale-105 transition-transform cursor-pointer flex-1 min-w-[80px] max-w-[120px]"
            >
              DOUBLE
            </button>
          )}
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
          className="px-6 md:px-8 py-2 md:py-3 bg-neon-green text-dark-bg font-pixel text-sm md:text-base rounded-lg border-4 border-white shadow-neon hover:scale-105 transition-transform cursor-pointer w-full max-w-xs"
        >
          NEW GAME
        </button>
      )}
    </div>
  );
};
