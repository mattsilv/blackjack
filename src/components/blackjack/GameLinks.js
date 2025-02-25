import React from "react";

const GameLinks = ({ gameState, gameId }) => {
  return (
    <div className="bg-green-900 p-3 text-sm">
      <p className="mb-1">Share these links:</p>
      <div className="flex flex-col gap-1">
        <div className="flex items-center">
          <span className="mr-2">Host URL for {gameState.host}:</span>
          <input
            className="flex-1 bg-green-700 px-2 py-1 rounded text-white text-xs"
            type="text"
            readOnly
            value={`${window.location.origin}/blackjack?gameId=${gameId}&role=host`}
            onClick={(e) => e.target.select()}
          />
        </div>
        <div className="flex items-center">
          <span className="mr-2">Guest URL for {gameState.friend}:</span>
          <input
            className="flex-1 bg-green-700 px-2 py-1 rounded text-white text-xs"
            type="text"
            readOnly
            value={`${window.location.origin}/blackjack?gameId=${gameId}&role=guest`}
            onClick={(e) => e.target.select()}
          />
        </div>
      </div>
    </div>
  );
};

export default GameLinks;
