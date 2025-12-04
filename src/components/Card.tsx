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
        className="w-20 h-28 md:w-24 md:h-36 bg-gradient-to-br from-neon-green to-green-600 rounded-lg border-4 border-white shadow-card flex items-center justify-center card-animation"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className="text-2xl md:text-4xl font-pixel text-dark-bg">?</div>
      </div>
    );
  }

  const suitSymbol = suitSymbols[card.suit];
  const suitColor = suitColors[card.suit];

  return (
    <div
      className="w-20 h-28 md:w-24 md:h-36 bg-white rounded-lg border-4 border-white shadow-card flex flex-col items-center justify-center p-2 card-animation relative"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Rank in top-left */}
      <div className={`absolute top-1 left-1 text-base md:text-xl font-bold ${suitColor} font-pixel leading-tight`}>
        {card.rank}
      </div>
      {/* Rank in bottom-right (rotated) */}
      <div className={`absolute bottom-1 right-1 text-base md:text-xl font-bold ${suitColor} font-pixel leading-tight rotate-180`}>
        {card.rank}
      </div>
      {/* Suit symbol in center */}
      <div className={`text-3xl md:text-5xl ${suitColor} font-bold leading-none`}>
        {suitSymbol}
      </div>
    </div>
  );
};
