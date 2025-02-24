/**
 * Creates a standard deck of 52 playing cards
 * @returns {Array} Array of card objects with rank and suit
 */
export function createDeck() {
  const suits = ["hearts", "diamonds", "clubs", "spades"];
  const ranks = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
  ];
  const deck = [];
  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      deck.push({ rank, suit });
    });
  });
  return deck;
}

/**
 * Shuffles a deck of cards using the Fisher-Yates algorithm
 * @param {Array} deck Array of card objects
 * @returns {Array} Shuffled deck
 */
export function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Calculates the value of a hand in blackjack
 * @param {Array} hand Array of card objects
 * @returns {number} Total value of the hand
 */
export function calculateHandValue(hand) {
  let value = 0;
  let aces = 0;

  hand.forEach((card) => {
    if (card.rank === "A") {
      aces += 1;
    } else if (["K", "Q", "J"].includes(card.rank)) {
      value += 10;
    } else {
      value += parseInt(card.rank);
    }
  });

  // Add aces with optimal values
  for (let i = 0; i < aces; i++) {
    if (value + 11 <= 21) {
      value += 11;
    } else {
      value += 1;
    }
  }

  return value;
}

/**
 * Checks if a hand is a blackjack (21 with exactly 2 cards)
 * @param {Array} hand Array of card objects
 * @returns {boolean} True if hand is blackjack
 */
export function isBlackjack(hand) {
  return hand.length === 2 && calculateHandValue(hand) === 21;
}

/**
 * Checks if a hand is bust (over 21)
 * @param {Array} hand Array of card objects
 * @returns {boolean} True if hand is bust
 */
export function isBust(hand) {
  return calculateHandValue(hand) > 21;
}

/**
 * Determines if dealer should hit (dealer must hit on 16 or below)
 * @param {Array} hand Dealer's hand
 * @returns {boolean} True if dealer should hit
 */
export function shouldDealerHit(hand) {
  return calculateHandValue(hand) < 17;
}

/**
 * Determines the winner between player and dealer hands
 * @param {Array} playerHand Player's hand
 * @param {Array} dealerHand Dealer's hand
 * @returns {string} "player", "dealer", or "tie"
 */
export function determineWinner(playerHand, dealerHand) {
  const playerValue = calculateHandValue(playerHand);
  const dealerValue = calculateHandValue(dealerHand);

  if (playerValue > 21) return "dealer";
  if (dealerValue > 21) return "player";
  if (playerValue > dealerValue) return "player";
  if (dealerValue > playerValue) return "dealer";
  return "tie";
}
