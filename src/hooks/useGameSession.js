import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export function useGameSession() {
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get("gameId");
  const role = searchParams.get("role");
  const [playerName, setPlayerName] = useState("");

  // Generate game URLs
  const generateGameUrls = (hostName, friendName, gameId) => {
    const hostUrl = `/blackjack?gameId=${gameId}&role=host`;
    const guestUrl = `/blackjack?gameId=${gameId}&role=guest`;

    return {
      hostUrl: `${window.location.origin}${hostUrl}`,
      guestUrl: `${window.location.origin}${guestUrl}`,
      localHostUrl: hostUrl,
      displayMessage: `
Game created!

Host URL (for ${hostName}):
${window.location.origin}${hostUrl}

Guest URL (for ${friendName}):
${window.location.origin}${guestUrl}
      `,
    };
  };

  // Update player name based on role and game state
  const updatePlayerName = (gameState) => {
    if (gameState && role) {
      if (role === "host") {
        setPlayerName(gameState.host);
      } else if (role === "guest") {
        setPlayerName(gameState.friend);
      }
    }
  };

  // Check if current player is host
  const isHost = (gameState) => {
    return gameState?.host === playerName;
  };

  // Get opponent's name
  const getOpponentName = (gameState) => {
    if (!gameState) return "";
    return isHost(gameState) ? gameState.friend : gameState.host;
  };

  // Get current player's balance
  const getPlayerBalance = (gameState) => {
    if (!gameState) return 0;
    return isHost(gameState)
      ? gameState.host_balance
      : gameState.friend_balance;
  };

  // Get current player's hand
  const getPlayerHand = (gameState) => {
    if (!gameState) return [];
    return isHost(gameState) ? gameState.host_hand : gameState.friend_hand;
  };

  // Check if it's current player's turn
  const isPlayerTurn = (gameState) => {
    if (!gameState) return false;
    return gameState.current_turn === (isHost(gameState) ? "host" : "friend");
  };

  return {
    gameId,
    role,
    playerName,
    setPlayerName,
    generateGameUrls,
    updatePlayerName,
    isHost,
    getOpponentName,
    getPlayerBalance,
    getPlayerHand,
    isPlayerTurn,
  };
}
