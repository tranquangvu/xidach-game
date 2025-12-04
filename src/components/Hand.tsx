import { Card as CardType } from '../types';
import { Card } from './Card';

interface HandProps {
  cards: CardType[];
  title: string;
  score: number;
  isDealer?: boolean;
  hideFirstCard?: boolean;
  isCurrentPlayer?: boolean;
  isMyHand?: boolean;
  isFinished?: boolean;
  result?: string | null;
}

export const Hand = ({
  cards,
  title,
  score,
  isDealer = false,
  hideFirstCard = false,
  isCurrentPlayer = false,
  isMyHand = false,
  isFinished = false,
  result = null
}: HandProps) => {
  const displayScore = isDealer && hideFirstCard ? '?' : score;
  const isBust = score > 21;
  const isBlackjack = cards.length === 2 && score === 21;

  const getResultText = () => {
    if (!result) return null;
    switch (result) {
      case 'blackjack': return 'BLACKJACK!';
      case 'bust': return 'BUST!';
      case 'win': return 'WIN!';
      case 'lose': return 'LOSE!';
      case 'push': return 'PUSH!';
      default: return null;
    }
  };

  const resultText = getResultText();

  // Highlight on result page if it's the current user's hand
  const shouldHighlight = isCurrentPlayer || (isFinished && isMyHand);

  return (
    <div className={`flex flex-col items-center space-y-2 md:space-y-3 xl:space-y-3 p-2 md:p-3 xl:p-3 rounded-lg h-full ${shouldHighlight ? 'bg-green-900/30 border-2 border-neon-green' : ''}`}>
      <div className="flex flex-col items-center space-y-1 xl:space-y-1 w-full">
        <h2 className={`text-base md:text-xl xl:text-base font-pixel ${shouldHighlight ? 'text-yellow-400 glow' : 'text-neon-green glow'}`}>
          {title}
          {isCurrentPlayer && <span className="ml-2 text-xs">(YOUR TURN)</span>}
          {isFinished && isMyHand && !isCurrentPlayer && <span className="ml-2 text-xs">(YOU)</span>}
        </h2>
        <div className="text-sm md:text-base xl:text-sm font-pixel text-center">
          Score: <span className={isBust ? 'text-red-500' : isBlackjack ? 'text-yellow-400' : 'text-white'}>
            {displayScore}
          </span>
          {isBust && <span className="text-red-500 ml-1 md:ml-2 text-xs">BUST!</span>}
          {isBlackjack && <span className="text-yellow-400 ml-1 md:ml-2 text-xs">BLACKJACK!</span>}
          {resultText && (
            <span className={`ml-1 md:ml-2 text-xs ${
              result === 'win' || result === 'blackjack' ? 'text-neon-green' :
              result === 'lose' || result === 'bust' ? 'text-red-500' :
              'text-yellow-400'
            }`}>
              {resultText}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-1 md:gap-2 justify-center w-full">
        {cards.length === 0 ? (
          <div className="text-gray-500 font-pixel text-xs">No cards</div>
        ) : (
          cards.map((card, index) => (
            <Card
              key={card.id}
              card={card}
              isHidden={isDealer && hideFirstCard && index === 0}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  );
};
