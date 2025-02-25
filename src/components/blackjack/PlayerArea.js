import React from "react";
import Hand from "../Hand.js";
import BettingControls from "./BettingControls.js";
import GameControls from "./GameControls.js";
import { calculateHandValue } from "../../utils/blackjackLogic.js";

const PlayerArea = ({
  playerName,
  playerBalance,
  playerHand,
  currentBet,
  gameState,
  isCurrentTurn,
  isPlayerRole,
  role,
  hasPendingBet,
  getPendingBetAmount,
  selectedBet,
  setSelectedBet,
  handleBet,
  handleHit,
  handleStand,
  handleDouble,
  handleSplit,
  loading,
}) => {
  return (
    <div
      className={`w-1/2 max-w-xs px-3 py-2 mx-1 rounded-lg ${
        isCurrentTurn ? "border-2 border-yellow-400" : ""
      }`}
    >
      {/* Player info */}
      <div className="flex justify-between items-center mb-1">
        <div className="font-medium text-base">{playerName}</div>
        <div className="text-yellow-300 text-base">♦ {playerBalance}</div>
      </div>

      {/* Bet indicator - show current bet or pending bet */}
      {currentBet > 0 && gameState.state !== "waiting" ? (
        <div className="flex justify-center items-center mb-2">
          <div className="bg-yellow-600 rounded-full w-14 h-14 flex items-center justify-center text-base font-bold shadow-md">
            ${currentBet}
          </div>
        </div>
      ) : hasPendingBet(gameState) && isPlayerRole ? (
        <div className="flex justify-center items-center mb-2">
          <div className="bg-yellow-600 bg-opacity-70 rounded-full w-14 h-14 flex items-center justify-center text-base font-bold shadow-md border-2 border-dashed border-white">
            ${getPendingBetAmount(gameState)}
          </div>
          <div className="absolute mt-16 text-xs text-yellow-300">
            Waiting for opponent...
          </div>
        </div>
      ) : null}

      {/* Cards */}
      {playerHand.length > 0 ? (
        <Hand cards={playerHand} />
      ) : (
        <div className="h-12 flex items-center justify-center text-gray-400 text-xs">
          No cards yet
        </div>
      )}

      {playerHand.length > 0 && (
        <div className="text-center mt-1">
          Total: {calculateHandValue(playerHand)}
        </div>
      )}

      {/* Controls */}
      {isPlayerRole && (
        <div className="mt-2">
          {gameState.state === "waiting" && (
            <BettingControls
              selectedBet={selectedBet}
              setSelectedBet={setSelectedBet}
              handleBet={handleBet}
              loading={loading}
              hasPendingBet={hasPendingBet}
              gameState={gameState}
              getPendingBetAmount={getPendingBetAmount}
            />
          )}
          {gameState.state === "playing" && isCurrentTurn && (
            <GameControls
              handleHit={handleHit}
              handleStand={handleStand}
              handleDouble={handleDouble}
              handleSplit={handleSplit}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerArea;
