import { useState } from 'react';
import { useMultiplayerStore } from '../store/multiplayerStore';

export const PlayerJoin = () => {
  const [name, setName] = useState('');
  const { connect, joinGame, isConnected, error } = useMultiplayerStore();

  const handleJoin = () => {
    if (!name.trim()) {
      return;
    }
    if (!isConnected) {
      connect(name);
      // Join game after connection is established
      setTimeout(() => {
        joinGame(name);
      }, 500);
    } else {
      joinGame(name);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-pixel text-neon-green glow mb-4">
            XÌ DÁCH
          </h1>
          <p className="text-sm md:text-base text-gray-400 font-pixel mb-4">
            MULTIPLAYER BLACKJACK
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg border-4 border-white p-6 space-y-4">
          <div>
            <label className="block text-sm font-pixel text-neon-green mb-2">
              ENTER YOUR NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
              className="w-full px-4 py-3 bg-dark-bg border-4 border-white rounded-lg text-white font-pixel text-base focus:outline-none focus:border-neon-green"
              placeholder="Player Name"
              maxLength={20}
            />
          </div>

          {error && (
            <div className="text-red-500 font-pixel text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleJoin}
            disabled={!name.trim() || isConnected}
            className="w-full px-8 py-4 bg-neon-green text-dark-bg font-pixel text-base md:text-lg rounded-lg border-4 border-white shadow-neon hover:scale-105 transition-transform cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isConnected ? 'CONNECTED' : 'JOIN GAME'}
          </button>

          <div className="text-center text-xs text-gray-500 font-pixel mt-4">
            Up to 3 players can join
          </div>
        </div>
      </div>
    </div>
  );
};
