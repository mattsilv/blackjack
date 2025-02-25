import React from "react";

const GameControls = ({
  handleHit,
  handleStand,
  handleDouble,
  handleSplit,
}) => {
  return (
    <div className="flex justify-center flex-wrap gap-2">
      <button
        className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium shadow-md"
        onClick={handleHit}
      >
        Hit
      </button>
      <button
        className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium shadow-md"
        onClick={handleStand}
      >
        Stand
      </button>
      <button
        className="px-5 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium shadow-md"
        onClick={handleDouble}
      >
        Double
      </button>
      <button
        className="px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium shadow-md"
        onClick={handleSplit}
      >
        Split
      </button>
    </div>
  );
};

export default GameControls;
