import React from "react";

const BettingControls = ({
  selectedBet,
  setSelectedBet,
  handleBet,
  loading,
  hasPendingBet,
  gameState,
  getPendingBetAmount,
  betOptions = [25, 50, 100, 250],
}) => {
  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="text-center mb-2">
        <div className="text-lg font-bold">Selected Bet: ${selectedBet}</div>
        <div className="flex justify-center mt-2">
          <div className="bg-yellow-600 rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold shadow-md">
            ${selectedBet}
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-2">
        {betOptions.map((option) => (
          <button
            key={option}
            className={`w-12 h-12 ${
              selectedBet === option
                ? "bg-green-600 ring-2 ring-yellow-300"
                : "bg-blue-600"
            } text-white rounded-full text-sm font-medium shadow-md transition-all`}
            onClick={() => setSelectedBet(option)}
            disabled={loading || hasPendingBet(gameState)}
          >
            ${option}
          </button>
        ))}
      </div>
      <div className="flex space-x-4">
        <button
          className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium shadow-md hover:bg-green-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
          onClick={() => handleBet(selectedBet)}
          disabled={loading || hasPendingBet(gameState)}
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : hasPendingBet(gameState) ? (
            "Bet Placed"
          ) : (
            "Place Bet"
          )}
        </button>
        <button
          className="px-5 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium shadow-md hover:bg-gray-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
          onClick={() => setSelectedBet(25)}
          disabled={loading || hasPendingBet(gameState)}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default BettingControls;
