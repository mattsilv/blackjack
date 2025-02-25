import React from "react";
import Card from "./Card.js";

// Hand component to display multiple cards
const Hand = ({ cards }) => (
  <div className="flex justify-center">
    <div className="flex" style={{ marginLeft: "20px" }}>
      {cards.map((card, index) => (
        <div
          key={index}
          className="transform hover:-translate-y-3 hover:z-10 transition-transform duration-200"
          style={{
            marginLeft: index === 0 ? 0 : "-20px",
            zIndex: index,
            transform: `rotate(${
              (index - Math.floor(cards.length / 2)) * 5
            }deg)`,
            transformOrigin: "bottom center",
          }}
        >
          <Card
            value={card.rank || card.value}
            suit={card.suit}
            hidden={card.value === "?" || card.rank === "?"}
          />
        </div>
      ))}
    </div>
  </div>
);

export default Hand;
