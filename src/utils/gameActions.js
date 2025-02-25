import { supabase, handleSupabaseError } from "../supabaseClient.js";
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
  try {
    // Validate inputs
    if (
      !gameState ||
      !gameState.deck ||
      !Array.isArray(gameState.deck) ||
      gameState.deck.length === 0
    ) {
      console.error("Invalid game state or empty deck:", gameState?.deck);
      throw new Error("Cannot hit: deck is empty or invalid");
    }

    // Create new arrays instead of mutating
    const deck = [...gameState.deck];
    const card = deck[0]; // Get first card

    // Validate card object
    if (!card || typeof card !== "object" || !card.rank || !card.suit) {
      console.error("Invalid card object:", card);
      throw new Error("Cannot hit: invalid card in deck");
    }

    const remainingDeck = deck.slice(1); // Get rest of deck

    // Get current hand and add new card
    const currentHand = isHost ? gameState.host_hand : gameState.friend_hand;

    // Validate current hand
    if (!Array.isArray(currentHand)) {
      console.error("Invalid hand:", currentHand);
      throw new Error("Cannot hit: player hand is invalid");
    }

    const updatedHand = [...currentHand, card];

    const updates = {
      deck: remainingDeck,
      [isHost ? "host_hand" : "friend_hand"]: updatedHand,
      log: [
        ...(Array.isArray(gameState.log) ? gameState.log : []),
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
      // If player busts, move to next player's turn instead of ending the game
      if (isBust(updatedHand)) {
        updates.current_turn = isHost ? "friend" : "host";
        updates.log.push({
          action: "bust",
          player: playerName,
          timestamp: new Date().toISOString(),
        });

        // Check if other player has already played
        const otherPlayerAction = gameState.log.some(
          (entry) =>
            (entry.action === "stand" || entry.action === "bust") &&
            entry.player !== playerName
        );

        // If other player has already played or this is the guest player, finish the game
        if (otherPlayerAction || !isHost) {
          updates.state = "finished";

          // Deal cards to dealer if needed
          if (remainingDeck.length > 0) {
            const dealerCard = remainingDeck[0];
            const finalDeck = remainingDeck.slice(1);
            updates.deck = finalDeck;
            updates.dealer_hand = [
              ...(Array.isArray(gameState.dealer_hand)
                ? gameState.dealer_hand
                : []),
              dealerCard,
            ];

            // Let dealer draw until 17 or higher
            let dealerHand = [...updates.dealer_hand];
            let currentDeck = [...finalDeck];

            while (shouldDealerHit(dealerHand) && currentDeck.length > 0) {
              dealerHand.push(currentDeck.shift());
            }

            updates.dealer_hand = dealerHand;
            updates.deck = currentDeck;
          }
        }
      } else if (handValue === 21) {
        // If player hits 21, move to next player's turn
        updates.current_turn = isHost ? "friend" : "host";
        updates.log.push({
          action: "twenty-one",
          player: playerName,
          timestamp: new Date().toISOString(),
        });

        // Check if other player has already played
        const otherPlayerAction = gameState.log.some(
          (entry) =>
            (entry.action === "stand" ||
              entry.action === "bust" ||
              entry.action === "twenty-one") &&
            entry.player !== playerName
        );

        // If other player has already played or this is the guest player, finish the game
        if (otherPlayerAction || !isHost) {
          updates.state = "finished";

          // Deal cards to dealer
          if (remainingDeck.length > 0) {
            let dealerHand = [...gameState.dealer_hand, remainingDeck[0]];
            let currentDeck = [...remainingDeck.slice(1)];

            while (shouldDealerHit(dealerHand) && currentDeck.length > 0) {
              dealerHand.push(currentDeck.shift());
            }

            updates.dealer_hand = dealerHand;
            updates.deck = currentDeck;
          }
        }
      }
    }

    return updates;
  } catch (error) {
    console.error("Error in handleHitAction:", error);
    // Return minimal updates to avoid breaking the game
    return {
      log: [
        ...(Array.isArray(gameState?.log) ? gameState.log : []),
        {
          action: "error",
          message: error.message,
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }
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

  // Check if both players have stood or if it's a single player game
  const otherPlayerStood = gameState.log.some(
    (entry) => entry.action === "stand" && entry.player !== playerName
  );

  // Only finish the game if both players have stood or if it's the second player standing
  if (otherPlayerStood || (!isHost && isPlayerTurn)) {
    // Dealer plays
    while (shouldDealerHit(dealerHand)) {
      dealerHand.push(deck.shift());
    }

    // Determine winners for both players
    const hostHand = gameState.host_hand;
    const friendHand = gameState.friend_hand;
    const hostWinner = determineWinner(hostHand, dealerHand);
    const friendWinner = determineWinner(friendHand, dealerHand);
    const bet = gameState.current_bet;

    // Handle host winnings
    if (hostWinner === "player") {
      const winnings = bet * 2;
      updates.host_balance = gameState.host_balance + winnings;
      updates.log.push({
        action: "win",
        player: gameState.host,
        winnings,
      });
    } else if (hostWinner === "tie") {
      const refund = bet;
      updates.host_balance = gameState.host_balance + refund;
      updates.log.push({
        action: "tie",
        player: gameState.host,
        refund,
      });
    }

    // Handle friend winnings
    if (friendWinner === "player") {
      const winnings = bet * 2;
      updates.friend_balance = gameState.friend_balance + winnings;
      updates.log.push({
        action: "win",
        player: gameState.friend,
        winnings,
      });
    } else if (friendWinner === "tie") {
      const refund = bet;
      updates.friend_balance = gameState.friend_balance + refund;
      updates.log.push({
        action: "tie",
        player: gameState.friend,
        refund,
      });
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
  try {
    if (!gameId) {
      return { error: { message: "Game ID is required" } };
    }

    // Log the update for debugging
    console.log(`Updating game ${gameId} with:`, updates);

    const { data, error } = await supabase
      .from("games")
      .update(updates)
      .eq("id", gameId)
      .select()
      .single();

    if (error) {
      return handleSupabaseError(error, "Failed to update game state");
    }

    return { data };
  } catch (err) {
    return handleSupabaseError(err, "Unexpected error updating game state");
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
