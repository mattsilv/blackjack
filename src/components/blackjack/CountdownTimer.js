import React from "react";

const CountdownTimer = ({ countdown, onContinue, isHost }) => {
  return (
    <div className="text-center py-2 bg-black bg-opacity-30 text-yellow-300 font-bold">
      Next hand in <span className="text-xl">{countdown}</span> seconds...
      {isHost ? (
        <button
          onClick={onContinue}
          className="ml-2 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white font-semibold text-xs transition-colors"
        >
          Continue
        </button>
      ) : (
        <span className="ml-2 text-gray-300 text-xs">
          (Waiting for host to continue)
        </span>
      )}
    </div>
  );
};

export default CountdownTimer;
