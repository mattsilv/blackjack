import React from "react";
import { useGameSession } from "../hooks/useGameSession.js";
import { useBlackjackGame } from "../hooks/useBlackjackGame.js";

// Import components
import DealerArea from "./blackjack/DealerArea.js";
import PlayerArea from "./blackjack/PlayerArea.js";
import GameStatus from "./blackjack/GameStatus.js";
import GameHeader from "./blackjack/GameHeader.js";
import GameLinks from "./blackjack/GameLinks.js";
import GameActions from "./blackjack/GameActions.js";
import CountdownTimer from "./blackjack/CountdownTimer.js";
import GameCreation from "./blackjack/GameCreation.js";

function BlackjackGame() {
  const {
    gameId,
    role,
    playerName,
    setPlayerName,
    updatePlayerName,
    isHost,
    getOpponentName,
    getPlayerHand,
    isPlayerTurn,
  } = useGameSession();

  const {
    gameState,
    loading,
    error,
    setError,
    autoDealPaused,
    countdown,
    selectedBet,
    setSelectedBet,
    createGame: createGameAction,
    handleBet,
    handleHit,
    handleStand,
    handleDouble,
    handleSplit,
    handleManualDeal,
    handleCreateNewGame,
    hasPendingBet,
    getPendingBetAmount,
  } = useBlackjackGame(gameId, role, playerName, updatePlayerName);

  const createGame = async (friendName) => {
    try {
      await createGameAction(friendName);
    } catch (err) {
      setError(err.message);
    }
  };

  const startNewGame = async () => {
    try {
      await handleCreateNewGame();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!gameId) {
    return (
      <>
        <GameHeader gameId={gameId} error={error} />
        <GameCreation
          playerName={playerName}
          setPlayerName={setPlayerName}
          createGame={createGame}
          loading={loading}
          error={error}
        />
      </>
    );
  }

  return (
    <div className="bg-green-800 min-h-screen text-white flex flex-col">
      <GameHeader gameId={gameId} error={error} />

      {!gameState ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-xl">Loading game state...</div>
        </div>
      ) : (
        <>
          <DealerArea
            dealerHand={gameState.dealer_hand}
            gameState={gameState}
          />

          <GameStatus
            gameState={gameState}
            hasPendingBet={hasPendingBet}
            getPendingBetAmount={getPendingBetAmount}
            getOpponentName={getOpponentName}
            isPlayerTurn={isPlayerTurn}
            getPlayerHand={getPlayerHand}
            isHost={isHost}
          />

          {gameState.state === "finished" && (
            <CountdownTimer
              countdown={countdown}
              onContinue={handleManualDeal}
              isHost={isHost(gameState)}
            />
          )}

          <div className="flex-1 flex items-start pt-2">
            <div className="w-full px-1">
              <div className="flex justify-around">
                {/* Host player area */}
                <PlayerArea
                  playerName={gameState.host}
                  playerBalance={gameState.host_balance}
                  playerHand={gameState.host_hand}
                  currentBet={gameState.current_bet}
                  gameState={gameState}
                  isCurrentTurn={gameState.current_turn === "host"}
                  isPlayerRole={role === "host"}
                  role={role}
                  hasPendingBet={hasPendingBet}
                  getPendingBetAmount={getPendingBetAmount}
                  selectedBet={selectedBet}
                  setSelectedBet={setSelectedBet}
                  handleBet={handleBet}
                  handleHit={handleHit}
                  handleStand={handleStand}
                  handleDouble={handleDouble}
                  handleSplit={handleSplit}
                  loading={loading}
                />

                {/* Guest player area */}
                <PlayerArea
                  playerName={gameState.friend}
                  playerBalance={gameState.friend_balance}
                  playerHand={gameState.friend_hand}
                  currentBet={gameState.current_bet}
                  gameState={gameState}
                  isCurrentTurn={gameState.current_turn === "friend"}
                  isPlayerRole={role === "guest"}
                  role={role}
                  hasPendingBet={hasPendingBet}
                  getPendingBetAmount={getPendingBetAmount}
                  selectedBet={selectedBet}
                  setSelectedBet={setSelectedBet}
                  handleBet={handleBet}
                  handleHit={handleHit}
                  handleStand={handleStand}
                  handleDouble={handleDouble}
                  handleSplit={handleSplit}
                  loading={loading}
                />
              </div>
            </div>
          </div>

          <GameLinks gameState={gameState} gameId={gameId} />

          <GameActions
            isHost={isHost}
            gameState={gameState}
            autoDealPaused={autoDealPaused}
            handleManualDeal={handleManualDeal}
            handleCreateNewGame={startNewGame}
            error={error}
            loading={loading}
          />
        </>
      )}
    </div>
  );
}

export default BlackjackGame;
