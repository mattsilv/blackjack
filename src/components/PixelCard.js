import React, { useRef, useEffect } from "react";
import CardConfig from "../config/CardConfig.js";
import {
  createBackGrid,
  createCardPattern,
  renderGridToCanvas,
} from "../utils/cardHelpers.js";

function PixelCard({
  rank = "A",
  suit = "hearts",
  faceDown = false,
  width = 250,
}) {
  const { cardWidth, cardHeight, palette, symbols } = CardConfig;
  const canvasRef = useRef(null);

  const aspectRatio = cardHeight / cardWidth;
  const canvasHeight = Math.round(width * aspectRatio);

  useEffect(() => {
    if (canvasRef.current) {
      const cardGrid = faceDown
        ? createBackGrid(cardWidth, cardHeight, palette, symbols.backTile)
        : createCardPattern(
            cardWidth,
            cardHeight,
            palette,
            symbols,
            rank,
            suit
          );
      renderGridToCanvas(cardGrid, canvasRef.current);
    }
  }, [rank, suit, faceDown, cardWidth, cardHeight, palette, symbols]);

  return (
    <canvas
      ref={canvasRef}
      width={cardWidth}
      height={cardHeight}
      style={{
        width: `${width}px`,
        height: `${canvasHeight}px`,
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        imageRendering: "pixelated",
        WebkitImageRendering: "pixelated",
        MozImageRendering: "crisp-edges",
      }}
    />
  );
}

export default PixelCard;
