import React from "react";
import Hand from "../Hand.js";
import { calculateHandValue } from "../../utils/blackjackLogic.js";

const DealerArea = ({ dealerHand, gameState }) => {
  return (
    <div className="mt-2 mb-2">
      <div className="text-center text-sm mb-1">Dealer</div>
      <Hand cards={dealerHand} />
      {gameState.state === "finished" && (
        <div className="text-center mt-1">
          Dealer's Total: {calculateHandValue(dealerHand)}
        </div>
      )}
    </div>
  );
};

export default DealerArea;
