import { Card as CardType } from '../types';

interface CardProps {
  card: CardType;
  isHidden?: boolean;
  index?: number;
}

const suitSymbols: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const suitColors: Record<string, string> = {
  hearts: 'text-red-600',
  diamonds: 'text-red-600',
  clubs: 'text-black',
  spades: 'text-black',
};

export const Card = ({ card, isHidden = false, index = 0 }: CardProps) => {
  if (isHidden) {
    return (
      <div
        className="w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36 bg-gradient-to-br from-neon-green to-green-600 rounded-lg border-4 border-white shadow-card flex items-center justify-center card-animation"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className="text-xl sm:text-2xl md:text-4xl font-pixel text-dark-bg">?</div>
      </div>
    );
  }

  const suitSymbol = suitSymbols[card.suit];
  const suitColor = suitColors[card.suit];

  return (
    <div
      className="w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36 bg-white rounded-lg border-4 border-white shadow-card flex flex-col items-center justify-center p-1 md:p-2 card-animation relative"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Rank in top-left */}
      <div className={`absolute top-0.5 left-0.5 md:top-1 md:left-1 text-xs sm:text-sm md:text-xl font-bold ${suitColor} font-pixel leading-tight`}>
        {card.rank}
      </div>
      {/* Rank in bottom-right (rotated) */}
      <div className={`absolute bottom-0.5 right-0.5 md:bottom-1 md:right-1 text-xs sm:text-sm md:text-xl font-bold ${suitColor} font-pixel leading-tight rotate-180`}>
        {card.rank}
      </div>
      {/* Suit symbol in center */}
      <div className={`text-xl sm:text-2xl md:text-5xl ${suitColor} font-bold leading-none`}>
        {suitSymbol}
      </div>
    </div>
  );
};
