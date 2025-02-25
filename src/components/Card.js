import React from "react";

const Card = ({ value, suit, hidden }) => {
  // Convert suit symbols if needed
  const getSuitSymbol = (suit) => {
    if (suit === "hearts") return "♥";
    if (suit === "diamonds") return "♦";
    if (suit === "clubs") return "♣";
    if (suit === "spades") return "♠";
    return suit;
  };

  const isRed =
    getSuitSymbol(suit) === "♥" ||
    getSuitSymbol(suit) === "♦" ||
    suit === "hearts" ||
    suit === "diamonds";

  return (
    <div
      className="relative w-16 h-24 md:w-20 md:h-28 bg-white rounded-xl shadow-lg flex items-center justify-center border border-gray-100 overflow-hidden transition-transform duration-200 hover:shadow-xl"
      style={{
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      }}
    >
      {hidden ? (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-blue-500 bg-opacity-30 flex items-center justify-center">
            <span className="text-white text-2xl font-light">?</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <span
            className={`text-3xl font-semibold ${
              isRed ? "text-red-600" : "text-gray-800"
            }`}
            style={{
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
          >
            {value}
          </span>
          <span
            className={`text-2xl mt-1 ${
              isRed ? "text-red-600" : "text-gray-800"
            }`}
          >
            {getSuitSymbol(suit)}
          </span>
        </div>
      )}

      {/* Corner indicators for value and suit */}
      {!hidden && (
        <>
          <div className="absolute top-1 left-1 flex flex-col items-center">
            <span
              className={`text-xs font-medium ${
                isRed ? "text-red-600" : "text-gray-800"
              }`}
            >
              {value}
            </span>
            <span
              className={`text-xs ${isRed ? "text-red-600" : "text-gray-800"}`}
            >
              {getSuitSymbol(suit)}
            </span>
          </div>
          <div className="absolute bottom-1 right-1 flex flex-col items-center rotate-180">
            <span
              className={`text-xs font-medium ${
                isRed ? "text-red-600" : "text-gray-800"
              }`}
            >
              {value}
            </span>
            <span
              className={`text-xs ${isRed ? "text-red-600" : "text-gray-800"}`}
            >
              {getSuitSymbol(suit)}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default Card;
