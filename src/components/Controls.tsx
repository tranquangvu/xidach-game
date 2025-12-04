import { useGameStore } from '../store/gameStore';

export const Controls = () => {
  const { gameStatus, canDouble, playerHit, playerStand, playerDouble, dealInitialCards, startNewGame } = useGameStore();

  const isPlayerTurn = gameStatus === 'player-turn';
  const isWaiting = gameStatus === 'waiting';
  const isFinished = gameStatus === 'finished';

  return (
    <div className="flex flex-col items-center space-y-4 mt-8">
      {isWaiting && (
        <button
          onClick={dealInitialCards}
          className="px-8 py-4 bg-neon-green text-dark-bg font-pixel text-base md:text-lg rounded-lg border-4 border-white shadow-neon hover:scale-105 transition-transform cursor-pointer"
        >
          DEAL CARDS
        </button>
      )}

      {isPlayerTurn && (
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={playerHit}
            className="px-6 py-3 bg-blue-600 text-white font-pixel text-sm md:text-base rounded-lg border-4 border-white shadow-lg hover:scale-105 transition-transform cursor-pointer"
          >
            HIT
          </button>
          <button
            onClick={playerStand}
            className="px-6 py-3 bg-red-600 text-white font-pixel text-sm md:text-base rounded-lg border-4 border-white shadow-lg hover:scale-105 transition-transform cursor-pointer"
          >
            STAND
          </button>
          {canDouble && (
            <button
              onClick={playerDouble}
              className="px-6 py-3 bg-yellow-600 text-white font-pixel text-sm md:text-base rounded-lg border-4 border-white shadow-lg hover:scale-105 transition-transform cursor-pointer"
            >
              DOUBLE
            </button>
          )}
        </div>
      )}

      {isFinished && (
        <button
          onClick={startNewGame}
          className="px-8 py-4 bg-neon-green text-dark-bg font-pixel text-base md:text-lg rounded-lg border-4 border-white shadow-neon hover:scale-105 transition-transform cursor-pointer"
        >
          NEW GAME
        </button>
      )}
    </div>
  );
};
