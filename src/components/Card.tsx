import { Card as CardType } from '../types';

interface CardProps {
  card: CardType;
  isHidden?: boolean;
  index?: number;
  onClick?: () => void;
  isSelected?: boolean;
  isReplacing?: boolean;
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

export const Card = ({ card, isHidden = false, index = 0, onClick, isSelected = false, isReplacing = false }: CardProps) => {
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

  const borderColor = isReplacing
    ? 'border-purple-500 shadow-purple-500'
    : isSelected
      ? 'border-purple-400 shadow-purple-400'
      : 'border-white';

  const cardClasses = `w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36 bg-white rounded-lg border-4 ${borderColor} shadow-card flex flex-col items-center justify-center p-1 md:p-2 card-animation relative ${
    onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''
  } ${isReplacing ? 'special-chance-replace' : ''}`;

  return (
    <div
      className={cardClasses}
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={onClick}
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
      {isReplacing && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/40 to-purple-700/40 rounded-lg flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-purple-400/20 animate-ping"></div>
          <div className="relative text-xs md:text-sm font-pixel text-white font-bold drop-shadow-lg z-10">
            REPLACING...
          </div>
        </div>
      )}
    </div>
  );
};
