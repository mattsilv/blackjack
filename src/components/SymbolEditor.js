import React, { useState } from "react";
import PixelCard from "./PixelCard.js";
import CardConfig from "../config/CardConfig.js";

function SymbolEditor({ initialPattern, onSave, suit }) {
  const DEFAULT_SIZE = 20;
  const [grid, setGrid] = useState(
    initialPattern ||
      Array.from({ length: DEFAULT_SIZE }, () =>
        Array.from({ length: DEFAULT_SIZE }, () => null)
      )
  );

  const [mirrorHorizontal, setMirrorHorizontal] = useState(true);
  const [mirrorVertical, setMirrorVertical] = useState(false);
  const [hoverCoords, setHoverCoords] = useState({ x: null, y: null });
  const [exportCode, setExportCode] = useState("");
  const [showExport, setShowExport] = useState(false);

  const clearAll = () => {
    setGrid(
      Array.from({ length: DEFAULT_SIZE }, () =>
        Array.from({ length: DEFAULT_SIZE }, () => null)
      )
    );
  };

  const handleMouseEnter = (x, y) => {
    setHoverCoords({ x, y });
  };

  const handleMouseLeave = () => {
    setHoverCoords({ x: null, y: null });
  };

  const toggleCell = (x, y) => {
    setGrid((prev) => {
      const newGrid = prev.map((row) => [...row]);
      newGrid[y][x] = newGrid[y][x] === "X" ? null : "X";

      if (mirrorHorizontal) {
        const mirroredX = newGrid[y].length - 1 - x;
        if (mirroredX !== x) {
          newGrid[y][mirroredX] = newGrid[y][mirroredX] === "X" ? null : "X";
        }
      }

      if (mirrorVertical) {
        const mirroredY = newGrid.length - 1 - y;
        if (mirroredY !== y) {
          newGrid[mirroredY][x] = newGrid[mirroredY][x] === "X" ? null : "X";
          if (mirrorHorizontal) {
            const mirroredX = newGrid[y].length - 1 - x;
            newGrid[mirroredY][mirroredX] =
              newGrid[mirroredY][mirroredX] === "X" ? null : "X";
          }
        }
      }

      // Update CardConfig in real-time for live preview
      CardConfig.symbols[suit] = newGrid;

      return newGrid;
    });
  };

  const handleSave = () => {
    onSave && onSave(grid);

    // Format the grid array as a string with proper indentation
    let gridString = "[\n";
    grid.forEach((row, rowIndex) => {
      gridString += "  [\n";
      row.forEach((cell, cellIndex) => {
        gridString += `    ${cell === null ? "null" : `"${cell}"`}`;
        if (cellIndex < row.length - 1) {
          gridString += ",";
        }
        gridString += "\n";
      });
      gridString += "  ]";
      if (rowIndex < grid.length - 1) {
        gridString += ",";
      }
      gridString += "\n";
    });
    gridString += "]";

    // Generate the export code with proper comments and format
    const suitName = suit.charAt(0).toUpperCase() + suit.slice(1);

    // Check if we should use the const format or direct export format
    let exportText;

    // For hearts and diamonds, use const format
    if (suit === "hearts" || suit === "diamonds") {
      exportText = `/**
 * ${suitName} suit pixel art pattern
 * Source: https://github.com/mattsilv/blackjack/blob/main/src/config/shapes/${suit}.js
 */

const ${suit} = ${gridString};

export default ${suit};`;
    } else {
      // For spades and clubs, use direct export format
      exportText = `/**
 * ${suitName} suit pixel art pattern
 * Source: https://github.com/mattsilv/blackjack/blob/main/src/config/shapes/${suit}.js
 */

export default ${gridString};`;
    }

    setExportCode(exportText);
    setShowExport(true);
    console.log(JSON.stringify(grid));
  };

  return (
    <div className="symbol-editor">
      <div className="controls">
        <label>
          <input
            type="checkbox"
            checked={mirrorHorizontal}
            onChange={(e) => setMirrorHorizontal(e.target.checked)}
          />
          Mirror Horizontally
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={mirrorVertical}
            onChange={(e) => setMirrorVertical(e.target.checked)}
          />
          Mirror Vertically
        </label>
        <br />
        <button onClick={handleSave}>Save / Export</button>
        <button onClick={clearAll} className="clear-button">
          Clear All
        </button>
      </div>

      <div className="editor-section">
        <div className="grid-container">
          <div className="corner-spacer" />
          <div className="top-numbers">
            {Array.from({ length: DEFAULT_SIZE }, (_, i) => (
              <div
                key={i}
                className={`coord-number ${
                  hoverCoords.x === i ? "highlight" : ""
                }`}
              >
                {i}
              </div>
            ))}
          </div>
          <div className="left-numbers">
            {Array.from({ length: DEFAULT_SIZE }, (_, i) => (
              <div
                key={i}
                className={`coord-number ${
                  hoverCoords.y === i ? "highlight" : ""
                }`}
              >
                {i}
              </div>
            ))}
          </div>
          <div className="grid">
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="grid-row">
                {row.map((cell, colIndex) => (
                  <div
                    key={colIndex}
                    onClick={() => toggleCell(colIndex, rowIndex)}
                    onMouseEnter={() => handleMouseEnter(colIndex, rowIndex)}
                    onMouseLeave={handleMouseLeave}
                    className={`grid-cell ${cell === "X" ? "filled" : ""}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="preview-section">
          <div className="preview">
            <h4>Symbol Preview</h4>
            <div className="preview-grid">
              {grid.map((row, rowIndex) => (
                <div key={rowIndex} className="preview-row">
                  {row.map((cell, colIndex) => (
                    <div
                      key={colIndex}
                      className={`preview-cell ${cell === "X" ? "filled" : ""}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="cards-preview">
            <h4>Cards Preview</h4>
            <div className="cards-grid">
              {["A", "K", "Q", "J", "10"].map((rank) => (
                <div key={rank} className="card-preview-item">
                  <PixelCard rank={rank} suit={suit} width={80} />
                  <div className="card-label">{rank}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showExport && (
        <div className="export-section">
          <h4>Export Code</h4>
          <p>Copy this code to update your shape file:</p>
          <textarea
            className="export-textarea"
            value={exportCode}
            readOnly
            onClick={(e) => e.target.select()}
          />
        </div>
      )}

      <style jsx>{`
        .symbol-editor {
          display: flex;
          gap: 2rem;
          padding: 1rem;
        }
        .controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .editor-section {
          display: flex;
          gap: 2rem;
        }
        .grid-container {
          display: grid;
          grid-template-columns: 24px 1fr;
          grid-template-rows: 24px 1fr;
          gap: 0;
        }
        .corner-spacer {
          width: 24px;
          height: 24px;
          background: #f5f5f5;
        }
        .top-numbers {
          display: grid;
          grid-template-columns: repeat(${DEFAULT_SIZE}, 20px);
          gap: 1px;
          background: #f5f5f5;
          padding: 2px 0;
        }
        .left-numbers {
          display: grid;
          grid-template-rows: repeat(${DEFAULT_SIZE}, 20px);
          gap: 1px;
          background: #f5f5f5;
          padding: 0 2px;
        }
        .coord-number {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          color: #444;
          background: #f5f5f5;
          user-select: none;
          transition: all 0.15s ease;
        }
        .coord-number.highlight {
          background: #e0e0e0;
          color: #000;
          font-weight: bold;
        }
        .grid {
          display: flex;
          flex-direction: column;
          gap: 1px;
          padding: 1px;
          background: #ccc;
        }
        .grid-row {
          display: flex;
          gap: 1px;
        }
        .grid-cell {
          width: 20px;
          height: 20px;
          border: none;
          background-color: white;
          cursor: pointer;
        }
        .grid-cell.filled {
          background-color: black;
        }
        .preview {
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          background: white;
        }
        .preview h4 {
          margin: 0 0 0.5rem 0;
        }
        .preview-grid {
          display: flex;
          flex-direction: column;
        }
        .preview-row {
          display: flex;
        }
        .preview-cell {
          width: 6px;
          height: 6px;
          border: 1px solid #eee;
          background-color: white;
        }
        .preview-cell.filled {
          background-color: black;
        }
        .clear-button {
          background-color: #ff4444;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }
        .clear-button:hover {
          background-color: #ff6666;
        }
        .preview-section {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .cards-preview {
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          background: white;
        }
        .cards-preview h4 {
          margin: 0 0 1rem 0;
        }
        .cards-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .card-preview-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .card-label {
          font-size: 12px;
          color: #666;
        }
        .export-section {
          margin-top: 2rem;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          background: white;
        }
        .export-section h4 {
          margin: 0 0 0.5rem 0;
        }
        .export-textarea {
          width: 100%;
          min-height: 300px;
          font-family: monospace;
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: #f8f8f8;
          white-space: pre;
          overflow: auto;
        }
      `}</style>
    </div>
  );
}

export default SymbolEditor;
