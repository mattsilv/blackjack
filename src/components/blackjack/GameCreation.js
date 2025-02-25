import React from "react";

const GameCreation = ({
  playerName,
  setPlayerName,
  createGame,
  loading,
  error,
}) => {
  return (
    <div className="bg-green-800 min-h-screen text-white p-4 flex items-center justify-center">
      <div className="w-80 mx-auto bg-green-900/90 p-6 rounded-lg shadow-xl border border-green-700">
        <h2 className="text-xl font-bold mb-4 text-center">
          Create a Blackjack Game
        </h2>
        {error && (
          <div className="text-red-300 mb-4 p-2 bg-red-900/50 rounded">
            {error}
          </div>
        )}
        <form className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Your Name</label>
            <input
              className="w-full px-3 py-2 bg-green-700 rounded border border-green-600 text-white placeholder-green-300"
              type="text"
              placeholder="Your Name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Friend's Name</label>
            <input
              className="w-full px-3 py-2 bg-green-700 rounded border border-green-600 text-white placeholder-green-300"
              type="text"
              placeholder="Friend's Name"
              id="friendName"
            />
          </div>
          <button
            className="w-full py-2 bg-blue-600 rounded font-medium shadow-md"
            onClick={(e) => {
              e.preventDefault();
              const friendName = document.getElementById("friendName").value;
              if (playerName && friendName) {
                createGame(friendName);
              } else {
                alert("Please enter both names");
              }
            }}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Game"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GameCreation;
