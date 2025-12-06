import { useState } from 'react';
import { useMultiplayerStore } from '../store/multiplayerStore';
import { soundManager } from '../utils/soundManager';

export const BettingControls = () => {
  const { gameState, getCurrentPlayer, placeBet, error } = useMultiplayerStore();
  const [betAmount, setBetAmount] = useState(5);

  if (!gameState) return null;

  const myPlayer = getCurrentPlayer();
  if (!myPlayer) return null;

  const hasPlacedBet = myPlayer.hasPlacedBet || false;
  const balance = myPlayer.balance || 0;
  const minBet = 5;
  const maxBet = Math.min(20, balance);
  const allPlayersBetted = gameState.players.every((p) => p.hasPlacedBet && p.bet >= 5);

  const handleBet = () => {
    if (betAmount >= minBet && betAmount <= maxBet && betAmount <= balance) {
      soundManager.playBet();
      placeBet(betAmount);
    }
  };

  const quickBetAmounts = [5, 10, 15, 20].filter((amount) => amount <= maxBet);

  return (
    <div className="w-3xl flex flex-col items-center">
      <div className="mb-4 text-center">
        <p className="text-xs font-pixel text-gray-400 mb-1">
          Your Balance
        </p>
        <p className="text-base md:text-lg font-pixel text-neon-green glow">
          ${balance}
        </p>
      </div>

      {!hasPlacedBet ? (
        <>
          <div className="w-full">
            <label className="block text-xs font-pixel text-gray-400 mb-2 text-center">
              Place Your Bet (${minBet} - ${maxBet})
            </label>
            <div className="flex gap-2 mb-3 justify-center">
              {quickBetAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 font-pixel text-xs md:text-sm rounded-full border-2 transition-all ${
                    betAmount === amount
                      ? 'bg-neon-green text-dark-bg border-neon-green shadow-neon'
                      : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-gray-400'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min={minBet}
                max={maxBet}
                value={betAmount}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (value >= minBet && value <= maxBet && value <= balance) {
                    setBetAmount(value);
                  }
                }}
                className="flex-1 px-3 md:px-4 py-2 md:py-2.5 bg-gray-800 text-white font-pixel text-sm md:text-base rounded-full border-2 border-gray-600 focus:border-neon-green focus:outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={handleBet}
                disabled={betAmount < minBet || betAmount > maxBet || betAmount > balance}
                className="px-4 md:px-6 py-2 md:py-2.5 bg-neon-green text-dark-bg font-pixel text-xs md:text-sm rounded-full border-2 border-white shadow-neon hover:scale-105 transition-transform cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                BET
              </button>
            </div>
          </div>
          {error && (
            <div className="text-red-500 font-pixel text-xs md:text-sm text-center bg-red-900/30 px-3 py-1.5 md:px-4 md:py-2 rounded border border-red-500 w-full">
              {error}
            </div>
          )}
        </>
      ) : (
        <div className="text-center">
          <p className="text-xs md:text-sm font-pixel text-neon-green mb-1">
            Your Bet: ${myPlayer.bet}
          </p>
          {!allPlayersBetted && (
            <p className="text-xs md:text-sm font-pixel text-gray-400">
              Waiting for other players to bet...
            </p>
          )}
        </div>
      )}
    </div>
  );
};
