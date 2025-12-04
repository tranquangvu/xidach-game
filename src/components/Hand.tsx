import { Card as CardType } from '../types';
import { Card } from './Card';
import { calculateHandValue } from '../utils/scoring';

interface HandProps {
  cards: CardType[];
  title: string;
  score: number;
  isDealer?: boolean;
  hideFirstCard?: boolean;
}

export const Hand = ({ cards, title, score, isDealer = false, hideFirstCard = false }: HandProps) => {
  const displayScore = isDealer && hideFirstCard ? '?' : score;
  const isBust = score > 21;
  const isBlackjack = cards.length === 2 && score === 21;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg md:text-2xl font-pixel text-neon-green glow">{title}</h2>
        <div className="text-base md:text-xl font-pixel">
          Score: <span className={isBust ? 'text-red-500' : isBlackjack ? 'text-yellow-400' : 'text-white'}>
            {displayScore}
          </span>
          {isBust && <span className="text-red-500 ml-2">BUST!</span>}
          {isBlackjack && <span className="text-yellow-400 ml-2">BLACKJACK!</span>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
        {cards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            isHidden={isDealer && hideFirstCard && index === 0}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};
