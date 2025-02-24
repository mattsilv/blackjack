import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient.js";
import {
  createDeck,
  shuffleDeck,
  calculateHandValue,
  determineWinner,
} from "../utils/blackjackLogic.js";
import {
  handleBetAction,
  handleHitAction,
  handleStandAction,
  updateGameState,
  resetGame,
} from "../utils/gameActions.js";
import { useGameSession } from "../hooks/useGameSession.js";
import PixelCard from "./PixelCard.js";
import "./BlackjackGame.css";

function BlackjackGame() {
  const {
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
  } = useGameSession();

  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoDealPaused, setAutoDealPaused] = useState(false);
  const [betAmount, setBetAmount] = useState(25);
  const [countdown, setCountdown] = useState(5);

  const fetchGame = useCallback(async () => {
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .eq("id", gameId)
      .single();

    if (error) {
      setError("Error fetching game");
      console.error("Error fetching game:", error);
    } else {
      setGameState(data);
      updatePlayerName(data);
    }
  }, [gameId, updatePlayerName]);

  const handleReset = useCallback(async () => {
    if (!gameState || !isHost(gameState)) return;

    try {
      const updates = resetGame();
      const { error: updateError } = await updateGameState(gameId, updates);

      if (updateError) {
        console.error("Error resetting game:", updateError);
        setError("Error resetting game");
      } else {
        console.log("Game reset successfully");
      }
    } catch (err) {
      console.error("Reset error:", err);
      setError(`Error resetting game: ${err.message}`);
    }
  }, [gameState, gameId, isHost]);

  useEffect(() => {
    if (gameId) {
      const subscription = supabase
        .channel(`game_${gameId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "games",
            filter: `id=eq.${gameId}`,
          },
          (payload) => {
            setGameState(payload.new);
          }
        )
        .subscribe();

      fetchGame();
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [gameId, fetchGame]);

  useEffect(() => {
    let timer;
    if (gameState?.state === "finished" && !autoDealPaused) {
      setCountdown(5);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (isHost(gameState)) {
              handleReset();
            }
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (autoDealPaused) {
      setCountdown(5);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [gameState?.state, autoDealPaused, handleReset, isHost, gameState]);

  const createGame = async (friendName) => {
    setLoading(true);
    setError(null);

    const id = Math.random().toString(36).substring(2, 15);
    const initialDeck = shuffleDeck(createDeck());

    const initialGame = {
      id,
      host: playerName,
      friend: friendName,
      deck: initialDeck,
      state: "waiting",
      host_balance: 1000,
      friend_balance: 1000,
      current_bet: 0,
      host_hand: [],
      friend_hand: [],
      dealer_hand: [],
      current_turn: "host",
      log: [],
    };

    const { error } = await supabase.from("games").insert([initialGame]);

    setLoading(false);

    if (error) {
      setError("Error creating game");
      console.error("Error creating game:", error);
    } else {
      const urls = generateGameUrls(playerName, friendName, id);
      window.location.href = urls.localHostUrl;
    }
  };

  const handleBet = async (amount) => {
    if (!gameState) {
      console.error("No game state available");
      setError("Game state not loaded");
      return;
    }

    const currentIsHost = isHost(gameState);
    const balance = getPlayerBalance(gameState);
    console.log("Placing bet:", {
      amount,
      currentIsHost,
      balance,
      gameState,
    });

    if (amount > balance) {
      setError("Insufficient funds");
      return;
    }

    try {
      const updates = handleBetAction(
        gameState,
        amount,
        currentIsHost,
        playerName
      );
      const { error: updateError, data } = await updateGameState(
        gameId,
        updates
      );

      if (updateError) {
        console.error("Error details:", updateError);
        setError(`Error placing bet: ${updateError.message}`);
      } else {
        console.log("Bet placed successfully:", data);
      }
    } catch (err) {
      console.error("Bet error:", err);
      setError(`Error placing bet: ${err.message}`);
    }
  };

  const handleHit = async () => {
    if (!gameState || !gameState.deck.length) return;

    const currentIsHost = isHost(gameState);
    const updates = handleHitAction(gameState, currentIsHost, playerName);
    const { error } = await updateGameState(gameId, updates);

    if (error) {
      setError("Error hitting");
      console.error("Error during hit:", error);
    }
  };

  const handleStand = async () => {
    if (!gameState) return;

    const currentIsHost = isHost(gameState);
    const updates = handleStandAction(
      gameState,
      currentIsHost,
      playerName,
      isPlayerTurn(gameState)
    );
    const { error } = await updateGameState(gameId, updates);

    if (error) {
      setError("Error standing");
      console.error("Error during stand:", error);
    }
  };

  const adjustBet = (amount) => {
    const newBet = Math.max(
      1,
      Math.min(getPlayerBalance(gameState), betAmount + amount)
    );
    setBetAmount(newBet);
  };

  const getGameStatusText = () => {
    if (!gameState) return "";
    switch (gameState.state) {
      case "waiting": {
        const hostBet = gameState.log.find(
          (entry) => entry.action === "bet" && entry.player === gameState.host
        );
        const guestBet = gameState.log.find(
          (entry) => entry.action === "bet" && entry.player === gameState.friend
        );
        return `Waiting for bets - ${gameState.host}: ${
          hostBet ? "✓" : "..."
        } | ${gameState.friend}: ${guestBet ? "✓" : "..."}`;
      }
      case "playing":
        return `Current turn: ${
          gameState.current_turn === "host" ? gameState.host : gameState.friend
        }`;
      case "finished": {
        const playerHand = getPlayerHand(gameState);
        const winner = determineWinner(playerHand, gameState.dealer_hand);
        const lastAction = gameState.log[gameState.log.length - 1];
        let message = "";

        if (winner === "player") {
          const winAmount = lastAction.winnings || gameState.current_bet * 2;
          message = `You won $${winAmount}!`;
        } else if (winner === "dealer") {
          message = `Dealer won - you lost $${gameState.current_bet}`;
        } else {
          const refund = lastAction.refund || gameState.current_bet;
          message = `It's a tie! Your bet of $${refund} was returned`;
        }

        if (!autoDealPaused) {
          message += ` (Next hand in ${countdown}s...)`;
        }
        return message;
      }
      default:
        return "";
    }
  };

  const handleManualDeal = () => {
    if (isHost(gameState)) {
      handleReset();
    }
  };

  return (
    <div className="blackjack-game">
      {error && <div className="error">{error}</div>}

      {!gameId ? (
        <div className="game-setup">
          <h2>Create a Blackjack Game</h2>
          <input
            type="text"
            placeholder="Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <input type="text" placeholder="Friend's Name" id="friendName" />
          <button
            onClick={() => {
              const friendName = document.getElementById("friendName").value;
              if (playerName && friendName) {
                createGame(friendName);
              } else {
                setError("Please enter both names");
              }
            }}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Game"}
          </button>
        </div>
      ) : (
        <div className="game-board">
          <h2>Blackjack Game: {gameId}</h2>
          {gameState ? (
            <>
              <div className="player-info">
                <div>
                  Playing as: <strong>{playerName}</strong>
                </div>
                <div>
                  Role: <strong>{role === "host" ? "Host" : "Guest"}</strong>
                </div>
                <div>
                  Other Player: <strong>{getOpponentName(gameState)}</strong>
                </div>
                <div className="balance">
                  Balance: ${getPlayerBalance(gameState)}
                </div>
              </div>

              <div className={`game-status ${gameState.state}`}>
                {getGameStatusText()}
              </div>

              {gameState.state === "finished" && (
                <div className="auto-deal-controls">
                  <button onClick={() => setAutoDealPaused(!autoDealPaused)}>
                    {autoDealPaused ? "Resume Auto-Deal" : "Pause Auto-Deal"}
                  </button>
                  {autoDealPaused && isHost(gameState) && (
                    <button onClick={handleManualDeal} className="deal-button">
                      Deal Next Hand
                    </button>
                  )}
                </div>
              )}

              <div className="dealer-area">
                <h3>Dealer's Cards</h3>
                <div className="cards">
                  {gameState.dealer_hand.map((card, idx) => (
                    <PixelCard
                      key={idx}
                      rank={card.rank}
                      suit={card.suit}
                      width={120}
                      faceDown={gameState.state === "playing"}
                    />
                  ))}
                  {gameState.state === "playing" &&
                    gameState.dealer_hand.length === 1 && (
                      <PixelCard width={120} faceDown={true} />
                    )}
                </div>
                {gameState.state === "finished" && (
                  <div>
                    Dealer's Total: {calculateHandValue(gameState.dealer_hand)}
                  </div>
                )}
              </div>

              <div className="player-area">
                {gameState.state === "playing" && isPlayerTurn(gameState) && (
                  <div className="actions">
                    <button onClick={handleHit}>Hit</button>
                    <button onClick={handleStand}>Stand</button>
                  </div>
                )}

                <h3>{playerName}'s Cards</h3>
                <div className="cards">
                  {getPlayerHand(gameState).map((card, idx) => (
                    <PixelCard
                      key={idx}
                      rank={card.rank}
                      suit={card.suit}
                      width={120}
                    />
                  ))}
                </div>
                <div>
                  Your Total: {calculateHandValue(getPlayerHand(gameState))}
                </div>

                <h3>{getOpponentName(gameState)}'s Cards</h3>
                <div className="cards">
                  {(isHost(gameState)
                    ? gameState.friend_hand
                    : gameState.host_hand
                  ).map((card, idx) => (
                    <PixelCard
                      key={idx}
                      rank={card.rank}
                      suit={card.suit}
                      width={120}
                    />
                  ))}
                </div>
                <div>
                  {getOpponentName(gameState)}'s Total:{" "}
                  {calculateHandValue(
                    isHost(gameState)
                      ? gameState.friend_hand
                      : gameState.host_hand
                  )}
                </div>

                {gameState.state === "waiting" && (
                  <div className="betting">
                    <div className="bet-controls">
                      <button onClick={() => adjustBet(-5)}>-5</button>
                      <input
                        type="number"
                        value={betAmount}
                        onChange={(e) =>
                          setBetAmount(parseInt(e.target.value) || 1)
                        }
                        min="1"
                        max={getPlayerBalance(gameState)}
                        step="5"
                      />
                      <button onClick={() => adjustBet(5)}>+5</button>
                    </div>
                    <button
                      onClick={() => handleBet(betAmount)}
                      className="place-bet-button"
                    >
                      Place Bet
                    </button>
                  </div>
                )}
              </div>

              <div className="game-urls">
                <h4>Game URLs</h4>
                <div className="url-box">
                  <div>
                    <strong>Host URL (for {gameState.host}):</strong>
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/blackjack?gameId=${gameId}&role=host`}
                      onClick={(e) => e.target.select()}
                    />
                  </div>
                  <div>
                    <strong>Guest URL (for {gameState.friend}):</strong>
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/blackjack?gameId=${gameId}&role=guest`}
                      onClick={(e) => e.target.select()}
                    />
                  </div>
                </div>
              </div>

              {isHost(gameState) && (
                <div className="host-controls">
                  <button onClick={handleReset} className="reset-button">
                    Reset Game
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="loading">Loading game state...</div>
          )}
        </div>
      )}
    </div>
  );
}

export default BlackjackGame;
