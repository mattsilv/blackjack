import React from "react";
import { calculateHandValue } from "../../utils/blackjackLogic.js";

const GameStatus = ({
  gameState,
  hasPendingBet,
  getPendingBetAmount,
  getOpponentName,
  isPlayerTurn,
  getPlayerHand,
  isHost,
}) => {
  const getGameStatusText = () => {
    if (!gameState) return "";
    switch (gameState.state) {
      case "waiting":
        if (hasPendingBet(gameState)) {
          return `You placed a $${getPendingBetAmount(
            gameState
          )} bet. Waiting for ${getOpponentName(gameState)} to bet...`;
        } else {
          // Check if opponent has bet
          const opponentName = getOpponentName(gameState);
          const opponentHasBet = gameState.log.some(
            (entry) => entry.action === "bet" && entry.player === opponentName
          );

          if (opponentHasBet) {
            return `${opponentName} has placed a bet. Your turn to bet!`;
          }
          return "Place your bet to start the game";
        }
      case "playing":
        if (isPlayerTurn(gameState)) {
          return "Your turn to play";
        } else {
          return `Waiting for ${getOpponentName(gameState)} to play`;
        }
      case "finished":
        const { host_hand, friend_hand, dealer_hand } = gameState;
        const playerHand = getPlayerHand(gameState);
        const playerScore = calculateHandValue(playerHand);
        const dealerScore = calculateHandValue(dealer_hand);
        const currentIsHost = isHost(gameState);

        // Check if player busted
        if (playerScore > 21) {
          return "Bust! You went over 21";
        }

        // Check if opponent busted
        const opponentHand = currentIsHost ? friend_hand : host_hand;
        const opponentScore = calculateHandValue(opponentHand);
        if (opponentScore > 21) {
          return `${getOpponentName(gameState)} busted with ${opponentScore}`;
        }

        // Check dealer bust
        if (dealerScore > 21) {
          return "Dealer busts! You win";
        }

        // Compare scores
        if (playerScore > dealerScore) {
          return `You win! ${playerScore} beats dealer's ${dealerScore}`;
        } else if (playerScore < dealerScore) {
          return `Dealer wins with ${dealerScore} against your ${playerScore}`;
        } else {
          return `Push! Both you and dealer have ${playerScore}`;
        }
      default:
        return "";
    }
  };

  return (
    <div className="bg-black bg-opacity-50 py-1 text-center font-medium text-base">
      {getGameStatusText()}
    </div>
  );
};

export default GameStatus;
