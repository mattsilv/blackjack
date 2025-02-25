import React from "react";
import { Link } from "react-router-dom";

const GameHeader = ({ gameId, error }) => {
  return (
    <>
      {/* Header */}
      <div className="bg-green-900 py-2 px-4 flex justify-between items-center">
        <Link to="/" className="text-lg font-bold">
          <span className="text-white bg-green-700 px-2 py-1 rounded">
            Blackjack
          </span>
        </Link>
        {gameId && <div className="text-sm text-white">Game #{gameId}</div>}
      </div>

      {error && (
        <div className="bg-red-800 text-white p-2 text-center">{error}</div>
      )}
    </>
  );
};

export default GameHeader;
