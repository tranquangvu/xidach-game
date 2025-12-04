import { useEffect } from 'react';
import { GameBoard } from './components/GameBoard';
import { useGameStore } from './store/gameStore';

function App() {
  const startNewGame = useGameStore((state) => state.startNewGame);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  return <GameBoard />;
}

export default App;
