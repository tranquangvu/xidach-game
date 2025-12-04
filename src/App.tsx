import { MultiplayerGameBoard } from './components/MultiplayerGameBoard';
import { PlayerJoin } from './components/PlayerJoin';
import { useMultiplayerStore } from './store/multiplayerStore';

function App() {
  const { isConnected, playerId } = useMultiplayerStore();

  // Show join screen if not connected or no player ID
  if (!isConnected || !playerId) {
    return <PlayerJoin />;
  }

  return <MultiplayerGameBoard />;
}

export default App;
