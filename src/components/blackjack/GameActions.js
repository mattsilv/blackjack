import React from "react";

const GameActions = ({
  isHost,
  gameState,
  autoDealPaused,
  handleManualDeal,
  handleCreateNewGame,
  error,
  loading,
}) => {
  return (
    <>
      {/* Reset game button for host */}
      {isHost(gameState) &&
        gameState.state === "finished" &&
        autoDealPaused && (
          <div className="fixed bottom-4 left-4 flex gap-2">
            <button
              onClick={handleManualDeal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md text-white font-semibold transition-colors"
            >
              Deal Next Hand
            </button>
            <button
              onClick={handleCreateNewGame}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg shadow-md text-white transition-colors"
            >
              New Game
            </button>
          </div>
        )}

      {/* Add a New Game button that's always visible when there's an error */}
      {error && (
        <div className="fixed bottom-4 left-4">
          <button
            onClick={handleCreateNewGame}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition-colors"
            disabled={loading}
          >
            {loading ? "Creating..." : "Start New Game"}
          </button>
        </div>
      )}

      {/* Chat/Info button */}
      <div className="fixed bottom-4 right-4">
        <button className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow-lg transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      </div>
    </>
  );
};

export default GameActions;
