# Blackjack Game

A web-based multiplayer blackjack game built with React and Supabase.

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the environment template:
   ```
   cp .env.example .env
   ```
4. Fill in your Supabase and Ngrok credentials in the `.env` file
5. Start the development server:
   ```
   npm start
   ```

## Environment Variables

The following environment variables are required:

- `REACT_APP_SUPABASE_URL`: Your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `REACT_APP_SUPABASE_SERVICE_KEY`: Your Supabase service role key
- `NGROK_AUTH_TOKEN`: Your Ngrok authentication token (for tunneling)

**Important**: Never commit your `.env` file to version control!

## Key Files and Components

### Core Game Components

- `src/components/BlackjackGame.js` - Main game component that orchestrates all other components
- `src/hooks/useBlackjackGame.js` - Custom hook containing all game logic and state management
- `src/hooks/useGameSession.js` - Manages game session, player roles, and player information

### Game UI Components

- `src/components/blackjack/PlayerArea.js` - Displays player information, cards, and controls
- `src/components/blackjack/DealerArea.js` - Displays dealer cards and information
- `src/components/blackjack/GameStatus.js` - Shows game status messages and results
- `src/components/blackjack/BettingControls.js` - UI for placing and managing bets
- `src/components/blackjack/GameControls.js` - Game action buttons (hit, stand, double, split)
- `src/components/blackjack/GameActions.js` - Game management buttons (deal next hand, new game)
- `src/components/blackjack/CountdownTimer.js` - Timer for auto-dealing next hand
- `src/components/blackjack/GameCreation.js` - UI for creating a new game
- `src/components/blackjack/GameLinks.js` - Displays shareable game links
- `src/components/blackjack/GameHeader.js` - Game header with title and game ID

### Game Logic

- `src/utils/blackjackLogic.js` - Core blackjack game logic (card values, hand calculation)
- `src/utils/gameActions.js` - Game action handlers (bet, hit, stand, etc.)

### Card Components

- `src/components/Card.js` - Individual card component
- `src/components/Hand.js` - Component for displaying a hand of cards

### Database Integration

- `src/supabaseClient.js` - Supabase client configuration for database operations

## Game Rules

This is a simplified version of Blackjack:

1. The goal is to get a hand value as close to 21 as possible without going over.
2. Number cards are worth their face value, face cards (J, Q, K) are worth 10, and Aces are worth 11 or 1.
3. Players place bets before receiving cards.
4. Each player receives two cards, and the dealer receives one card face up.
5. Players can "hit" to receive additional cards or "stand" to keep their current hand.
6. If a player's hand exceeds 21, they "bust" and lose their bet.
7. After all players have completed their actions, the dealer draws cards until reaching a value of 17 or higher.
8. The player with the higher hand value wins, unless they bust.

## Features

- Real-time multiplayer gameplay
- Persistent game state using Supabase
- Responsive design for desktop and mobile
- Automatic dealer play
- Betting system with multiple bet options
- Game history and log

## Technologies Used

- React
- Tailwind CSS
- Supabase (PostgreSQL database with real-time subscriptions)

## Troubleshooting

If you encounter any issues:

1. Check that your Supabase credentials are correct in the `.env` file
2. Ensure you have the latest version of Node.js installed
3. Clear your browser cache if you see stale game states
4. Check the browser console for any error messages
