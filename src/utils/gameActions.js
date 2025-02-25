import { supabase } from "../supabaseClient.js";
import {
  isBlackjack,
  isBust,
  shouldDealerHit,
  determineWinner,
  createDeck,
  shuffleDeck,
  calculateHandValue,
} from "./blackjackLogic.js";

/**
 * Handles the betting action for a player
 * @param {Object} gameState - Current game state
 * @param {number} amount - Bet amount
 * @param {boolean} isHost - Whether the current player is host
 * @param {string} playerName - Name of the current player
 * @returns {Object} Updates to apply to the game state
 */
export const handleBetAction = (gameState, amount, isHost, playerName) => {
  console.log("Bet Action Debug:", {
    currentState: gameState,
    betAmount: amount,
    isHost,
    playerName,
  });

  // Start with basic updates
  const updates = {
    [isHost ? "host_balance" : "friend_balance"]:
      (isHost ? gameState.host_balance : gameState.friend_balance) - amount,
    log: [...gameState.log, { action: "bet", player: playerName, amount }],
  };

  // Check if other player has bet by looking at the log
  const otherPlayerBet = gameState.log.find(
    (entry) => entry.action === "bet" && entry.player !== playerName
  );

  if (otherPlayerBet) {
    const newDeck = [...gameState.deck];
    const hostHand = [newDeck.shift(), newDeck.shift()];
    const friendHand = [newDeck.shift(), newDeck.shift()];
    const dealerHand = [newDeck.shift()];

    updates.state = "playing";
    updates.deck = newDeck;
    updates.host_hand = hostHand;
    updates.friend_hand = friendHand;
    updates.dealer_hand = dealerHand;
    updates.current_bet = Math.max(amount, otherPlayerBet.amount);
    updates.current_turn = "host"; // Host always starts after bets

    // Check for blackjack
    const playerHand = isHost ? hostHand : friendHand;
    if (isBlackjack(playerHand)) {
      updates.state = "finished";
      updates.dealer_hand = [...dealerHand, newDeck.shift()];
      const winnings = Math.floor(amount * 2.5);
      updates[isHost ? "host_balance" : "friend_balance"] += winnings;
      updates.log.push({ action: "blackjack", player: playerName, winnings });
    }
  } else {
    updates.state = "waiting"; // Stay in waiting state until both bet
  }

  console.log("Updates to be applied:", updates);
  return updates;
};

/**
 * Handles the hit action for a player
 * @param {Object} gameState - Current game state
 * @param {boolean} isHost - Whether the current player is host
 * @param {string} playerName - Name of the current player
 * @returns {Object} Updates to apply to the game state
 */
export const handleHitAction = (gameState, isHost, playerName) => {
  // Create new arrays instead of mutating
  const deck = [...gameState.deck];
  const card = deck[0]; // Get first card
  const remainingDeck = deck.slice(1); // Get rest of deck

  // Get current hand and add new card
  const currentHand = isHost ? gameState.host_hand : gameState.friend_hand;
  const updatedHand = [...currentHand, card];

  const updates = {
    deck: remainingDeck,
    [isHost ? "host_hand" : "friend_hand"]: updatedHand,
    log: [
      ...gameState.log,
      {
        action: "hit",
        player: playerName,
        card,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  // Check for bust or exactly 21
  const handValue = calculateHandValue(updatedHand);
  if (isBust(updatedHand) || handValue === 21) {
    updates.state = "finished";
    // Reveal dealer's second card without mutating arrays
    const dealerCard = remainingDeck[0];
    const finalDeck = remainingDeck.slice(1);
    updates.deck = finalDeck;
    updates.dealer_hand = [...gameState.dealer_hand, dealerCard];
    updates.log.push({
      action: isBust(updatedHand) ? "bust" : "twenty-one",
      player: playerName,
      timestamp: new Date().toISOString(),
    });
  }

  return updates;
};

/**
 * Handles the stand action for a player
 * @param {Object} gameState - Current game state
 * @param {boolean} isHost - Whether the current player is host
 * @param {string} playerName - Name of the current player
 * @param {boolean} isPlayerTurn - Whether it's the player's turn
 * @returns {Object} Updates to apply to the game state
 */
export const handleStandAction = (
  gameState,
  isHost,
  playerName,
  isPlayerTurn
) => {
  let dealerHand = [...gameState.dealer_hand];
  const deck = [...gameState.deck];

  const updates = {
    current_turn: isHost ? "friend" : "host",
    deck,
    dealer_hand: dealerHand,
    log: [...gameState.log, { action: "stand", player: playerName }],
  };

  // If both players have stood, dealer plays
  if (isPlayerTurn) {
    while (shouldDealerHit(dealerHand)) {
      dealerHand.push(deck.shift());
    }

    const playerHand = isHost ? gameState.host_hand : gameState.friend_hand;
    const winner = determineWinner(playerHand, dealerHand);
    const bet = gameState.current_bet;
    const currentBalance = isHost
      ? gameState.host_balance
      : gameState.friend_balance;

    if (winner === "player") {
      const winnings = bet * 2;
      updates[isHost ? "host_balance" : "friend_balance"] =
        currentBalance + winnings;
      updates.log.push({ action: "win", player: playerName, winnings });
    } else if (winner === "tie") {
      const refund = bet;
      updates[isHost ? "host_balance" : "friend_balance"] =
        currentBalance + refund;
      updates.log.push({ action: "tie", player: playerName, refund });
    }

    updates.dealer_hand = dealerHand;
    updates.state = "finished";
  }

  return updates;
};

/**
 * Updates the game state in the database
 * @param {string} gameId - Game ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Result of the update operation
 */
export const updateGameState = async (gameId, updates) => {
  console.log("Updating game state:", { gameId, updates });

  try {
    // Add explicit filters and use single() for better query plan
    const { data, error } = await supabase
      .from("games")
      .update(updates)
      .eq("id", gameId) // Explicit filter for better performance
      .select(
        `
        id,
        host,
        friend,
        state,
        host_balance,
        friend_balance,
        current_bet,
        current_turn,
        deck,
        host_hand,
        friend_hand,
        dealer_hand,
        log,
        round_number,
        game_history,
        used_cards,
        round_results,
        player_stats
      `
      ) // Explicit column selection
      .single(); // Use single() for better query plan

    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }

    return { data, error: null };
  } catch (err) {
    console.error("Error updating game state:", err);
    return { data: null, error: err };
  }
};

/**
 * Resets the game to initial state
 * @param {string} hostName - Name of the host player
 * @param {string} friendName - Name of the guest player
 * @returns {Object} Initial game state
 */
export const resetGame = () => {
  const initialDeck = shuffleDeck(createDeck());
  return {
    deck: initialDeck,
    state: "waiting",
    host_balance: 1000,
    friend_balance: 1000,
    current_bet: 0,
    host_hand: [],
    friend_hand: [],
    dealer_hand: [],
    current_turn: "host",
    log: [{ action: "reset", timestamp: new Date().toISOString() }],
    round_number: 1,
    game_history: [],
    used_cards: [],
    round_results: [],
    player_stats: {
      host: {
        wins: 0,
        losses: 0,
        blackjacks: 0,
        busts: 0,
        total_bets: 0,
        total_winnings: 0,
      },
      guest: {
        wins: 0,
        losses: 0,
        blackjacks: 0,
        busts: 0,
        total_bets: 0,
        total_winnings: 0,
      },
    },
  };
};
