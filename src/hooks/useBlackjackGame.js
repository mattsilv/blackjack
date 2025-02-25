import { useState, useCallback, useEffect } from "react";
import { supabase } from "../supabaseClient.js";
import {
  createDeck,
  shuffleDeck,
  shouldDealerHit,
} from "../utils/blackjackLogic.js";
import {
  handleBetAction,
  handleHitAction,
  handleStandAction,
  updateGameState,
  resetGame,
} from "../utils/gameActions.js";

export const useBlackjackGame = (
  gameId,
  role,
  playerName,
  updatePlayerName
) => {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoDealPaused, setAutoDealPaused] = useState(false);
  const [betAmount, setBetAmount] = useState(25);
  const [countdown, setCountdown] = useState(5);
  const [selectedBet, setSelectedBet] = useState(25);

  // Helper functions that were previously passed as parameters
  const isHost = useCallback((state) => role === "host", [role]);

  const getOpponentName = useCallback(
    (state) => {
      return role === "host" ? state.friend : state.host;
    },
    [role]
  );

  const getPlayerHand = useCallback(
    (state) => {
      return role === "host" ? state.host_hand : state.friend_hand;
    },
    [role]
  );

  const isPlayerTurn = useCallback(
    (state) => {
      return (
        (role === "host" && state.current_turn === "host") ||
        (role === "guest" && state.current_turn === "friend")
      );
    },
    [role]
  );

  const getPlayerBalance = useCallback(
    (state) => {
      return role === "host" ? state.host_balance : state.friend_balance;
    },
    [role]
  );

  // Pre-defined bet options
  const betOptions = [25, 50, 100, 250];

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
  }, [gameId, gameState, isHost]);

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

  // Countdown timer effect
  useEffect(() => {
    let timer;

    // Only start the countdown when the game state is "finished"
    if (gameState?.state === "finished") {
      // Always set initial countdown value when state first changes to finished
      if (countdown === 0) {
        setCountdown(5);
      }

      // Start the countdown timer
      timer = setInterval(() => {
        setCountdown((prev) => {
          // When countdown reaches 0, clear the interval and trigger the reset
          if (prev <= 1) {
            clearInterval(timer);
            // Only the host can reset the game
            if (isHost(gameState)) {
              handleReset();
            }
            return 0;
          }
          // Decrement the countdown
          return prev - 1;
        });
      }, 1000);
    } else {
      // Reset countdown when game state is not "finished"
      setCountdown(5);
    }

    // Clean up the timer when the component unmounts or dependencies change
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [gameState?.state, handleReset, isHost, gameState, countdown]);

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
      return null;
    } else {
      return id;
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

    // Check if player has already bet
    if (hasPendingBet(gameState)) {
      setError("You've already placed a bet. Waiting for opponent.");
      return;
    }

    try {
      setLoading(true);
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
        // Clear any previous errors
        setError(null);
        // Reset selected bet to default after successful bet
        setSelectedBet(25);
      }
    } catch (err) {
      console.error("Bet error:", err);
      setError(`Error placing bet: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleHit = async () => {
    try {
      if (!gameState) {
        setError("Game state not loaded yet. Please wait or refresh the page.");
        return;
      }

      if (!gameState.deck) {
        setError("Game deck is missing. Try creating a new game.");
        return;
      }

      if (!Array.isArray(gameState.deck) || gameState.deck.length === 0) {
        setError("No cards left in deck. Try creating a new game.");
        return;
      }

      const currentIsHost = isHost(gameState);
      console.log("Hitting with game state:", {
        gameId,
        isHost: currentIsHost,
        playerName,
        deckLength: gameState.deck.length,
        currentHand: getPlayerHand(gameState),
      });

      const updates = handleHitAction(gameState, currentIsHost, playerName);
      const { error, data } = await updateGameState(gameId, updates);

      if (error) {
        console.error("Error during hit:", error);
        setError(`Error hitting: ${error.message || "Unknown error"}`);
      } else {
        console.log("Hit successful:", data);
        // Clear any previous errors on success
        setError(null);
      }
    } catch (err) {
      console.error("Exception during hit:", err);
      setError(`Hit failed: ${err.message}`);
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

  const handleDouble = async () => {
    // Implement double down functionality
    if (!gameState || !gameState.deck.length) return;

    const currentIsHost = isHost(gameState);
    const playerHand = getPlayerHand(gameState);

    // Can only double on first two cards
    if (playerHand.length !== 2) {
      setError("Can only double down on your first two cards");
      return;
    }

    // Need to have enough balance to double the bet
    const currentBet = gameState.current_bet;
    const balance = getPlayerBalance(gameState);

    if (balance < currentBet) {
      setError("Not enough balance to double down");
      return;
    }

    try {
      // First, update the player's balance
      const balanceUpdate = {
        [currentIsHost ? "host_balance" : "friend_balance"]:
          balance - currentBet,
        log: [
          ...gameState.log,
          {
            action: "double",
            player: playerName,
            amount: currentBet,
            timestamp: new Date().toISOString(),
          },
        ],
      };

      await updateGameState(gameId, balanceUpdate);

      // Then, deal one card and stand
      const deck = [...gameState.deck];
      const card = deck.shift();
      const updatedHand = [...playerHand, card];

      const updates = {
        deck,
        [currentIsHost ? "host_hand" : "friend_hand"]: updatedHand,
        current_turn: currentIsHost ? "friend" : "host",
        log: [
          ...gameState.log,
          {
            action: "hit",
            player: playerName,
            card,
            timestamp: new Date().toISOString(),
          },
          {
            action: "stand",
            player: playerName,
            timestamp: new Date().toISOString(),
          },
        ],
      };

      // Check if other player has already played
      const otherPlayerAction = gameState.log.some(
        (entry) =>
          (entry.action === "stand" || entry.action === "bust") &&
          entry.player !== playerName
      );

      // If other player has already played, finish the game
      if (otherPlayerAction) {
        updates.state = "finished";

        // Deal cards to dealer
        let dealerHand = [...gameState.dealer_hand];
        let currentDeck = [...deck];

        while (currentDeck.length > 0 && shouldDealerHit(dealerHand)) {
          dealerHand.push(currentDeck.shift());
        }

        updates.dealer_hand = dealerHand;
        updates.deck = currentDeck;
      }

      const { error } = await updateGameState(gameId, updates);

      if (error) {
        setError("Error doubling down");
        console.error("Error during double down:", error);
      }
    } catch (err) {
      console.error("Double down error:", err);
      setError(`Error doubling down: ${err.message}`);
    }
  };

  const handleSplit = async () => {
    // Placeholder for split functionality
    setError("Split functionality not implemented yet");
  };

  const handleManualDeal = () => {
    // The host check is now handled in the UI
    handleReset();
  };

  const handleCreateNewGame = async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate a new game ID
      const newGameId = Math.random().toString(36).substring(2, 15);

      // Create a fresh deck
      const initialDeck = shuffleDeck(createDeck());

      // Create a new game with the same players
      const initialGame = {
        id: newGameId,
        host: gameState?.host || playerName,
        friend: gameState?.friend || "Guest",
        deck: initialDeck,
        state: "waiting",
        host_balance: 1000,
        friend_balance: 1000,
        current_bet: 0,
        host_hand: [],
        friend_hand: [],
        dealer_hand: [],
        current_turn: "host",
        log: [{ action: "new_game", timestamp: new Date().toISOString() }],
      };

      const { error } = await supabase.from("games").insert([initialGame]);

      if (error) {
        console.error("Error creating new game:", error);
        setError(`Failed to create new game: ${error.message}`);
        return null;
      } else {
        return newGameId;
      }
    } catch (err) {
      console.error("Error in handleCreateNewGame:", err);
      setError(`Failed to create new game: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const hasPendingBet = useCallback(
    (gameState) => {
      if (!gameState || !gameState.log) return false;
      const currentIsHost = isHost(gameState);
      const currentPlayer = currentIsHost ? gameState.host : gameState.friend;

      // Check if current player has placed a bet in the current round
      return (
        gameState.state === "waiting" &&
        gameState.log.some(
          (entry) => entry.action === "bet" && entry.player === currentPlayer
        )
      );
    },
    [isHost]
  );

  const getPendingBetAmount = useCallback(
    (gameState) => {
      if (!gameState || !gameState.log) return 0;
      const currentIsHost = isHost(gameState);
      const currentPlayer = currentIsHost ? gameState.host : gameState.friend;

      // Find the most recent bet by the current player
      const betEntry = [...gameState.log]
        .reverse()
        .find(
          (entry) => entry.action === "bet" && entry.player === currentPlayer
        );

      return betEntry ? betEntry.amount : 0;
    },
    [isHost]
  );

  return {
    gameState,
    loading,
    error,
    setError,
    autoDealPaused,
    setAutoDealPaused,
    betAmount,
    setBetAmount,
    countdown,
    setCountdown,
    selectedBet,
    setSelectedBet,
    betOptions,
    createGame,
    handleBet,
    handleHit,
    handleStand,
    handleDouble,
    handleSplit,
    handleManualDeal,
    handleCreateNewGame,
    hasPendingBet,
    getPendingBetAmount,
    isHost,
    getOpponentName,
    getPlayerHand,
    isPlayerTurn,
    getPlayerBalance,
  };
};
