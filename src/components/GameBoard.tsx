import { useGameStore } from '../store/gameStore';
import { Hand } from './Hand';
import { Controls } from './Controls';

export const GameBoard = () => {
  const {
    playerHand,
    dealerHand,
    gameStatus,
    result,
    playerScore,
    dealerScore,
    deck,
  } = useGameStore();

  const hideDealerCard = gameStatus === 'player-turn' || gameStatus === 'waiting';

  const getResultMessage = () => {
    switch (result) {
      case 'blackjack':
        return { text: 'BLACKJACK!', color: 'text-yellow-400' };
      case 'bust':
        return { text: 'YOU BUSTED!', color: 'text-red-500' };
      case 'win':
        return { text: 'YOU WIN!', color: 'text-neon-green' };
      case 'lose':
        return { text: 'YOU LOSE!', color: 'text-red-500' };
      case 'push':
        return { text: 'PUSH!', color: 'text-yellow-400' };
      default:
        return null;
    }
  };

  const resultMessage = getResultMessage();

  return (
    <div className="min-h-screen bg-dark-bg p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-pixel text-neon-green glow mb-2">
            XÌ DÁCH
          </h1>
          <p className="text-sm md:text-base text-gray-400 font-pixel">
            BLACKJACK
          </p>
        </div>

        {/* Deck Info */}
        <div className="text-center mb-6">
          <p className="text-xs md:text-sm text-gray-500 font-pixel">
            Cards Remaining: {deck.length}
          </p>
        </div>

        {/* Dealer Hand */}
        <div className="mb-12">
          <Hand
            cards={dealerHand}
            title="DEALER"
            score={dealerScore}
            isDealer={true}
            hideFirstCard={hideDealerCard}
          />
        </div>

        {/* Result Message */}
        {resultMessage && (
          <div className="text-center mb-8">
            <p className={`text-2xl md:text-4xl font-pixel ${resultMessage.color} glow`}>
              {resultMessage.text}
            </p>
          </div>
        )}

        {/* Player Hand */}
        <div className="mb-8">
          <Hand
            cards={playerHand}
            title="PLAYER"
            score={playerScore}
            isDealer={false}
          />
        </div>

        {/* Controls */}
        <Controls />
      </div>
    </div>
  );
};
