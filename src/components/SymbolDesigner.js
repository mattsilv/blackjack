import React, { useState, useRef } from "react";
import PixelCard from "./PixelCard";
import CardConfig from "../config/CardConfig";
import "./SymbolDesigner.css";
import SymbolEditor from "./SymbolEditor";

function ExportModal({ isOpen, onClose, exportCode, suitName }) {
  const textAreaRef = useRef(null);

  const handleTextAreaClick = () => {
    textAreaRef.current?.select();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Updated {suitName} Symbol</h3>
        <p>
          Copy this code and replace the contents in{" "}
          <code>src/config/shapes/{suitName}.js</code>:
        </p>
        <textarea
          ref={textAreaRef}
          onClick={handleTextAreaClick}
          readOnly
          value={`export default ${exportCode};`}
          rows={20}
        />
        <button onClick={onClose}>Close</button>
        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }
          .modal-content {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            max-width: 800px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
          }
          code {
            background: #f5f5f5;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-family: monospace;
          }
          textarea {
            width: 100%;
            margin: 1rem 0;
            padding: 1rem;
            font-family: monospace;
            font-size: 14px;
            border: 1px solid #ccc;
            border-radius: 4px;
          }
          button {
            padding: 0.5rem 1rem;
            background: #333;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          button:hover {
            background: #444;
          }
        `}</style>
      </div>
    </div>
  );
}

function SymbolDesigner() {
  const [editingSuit, setEditingSuit] = useState(null);
  const [symbols, setSymbols] = useState(CardConfig.symbols);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exportCode, setExportCode] = useState("");
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

  const handleEditClick = (suit) => {
    setEditingSuit(suit);
  };

  const handleSave = (updatedGrid) => {
    // Update the local state
    setSymbols((prev) => ({
      ...prev,
      [editingSuit]: updatedGrid,
    }));

    // Update CardConfig
    CardConfig.symbols[editingSuit] = updatedGrid;

    // Generate the code to update the shape file
    const symbolArray = JSON.stringify(updatedGrid, null, 2);

    setExportCode(symbolArray);
    setIsModalOpen(true);
  };

  return (
    <div className="symbol-designer">
      <ExportModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSuit(null);
        }}
        exportCode={exportCode}
        suitName={editingSuit}
      />

      {!editingSuit ? (
        <div className="suit-selector">
          <h2>Select a suit to edit</h2>
          <div className="suit-buttons">
            {suits.map((suit) => (
              <button key={suit} onClick={() => handleEditClick(suit)}>
                Edit {suit.charAt(0).toUpperCase() + suit.slice(1)}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="editor-container">
          <h2>Editing {editingSuit}</h2>
          <SymbolEditor
            initialPattern={symbols[editingSuit]}
            onSave={handleSave}
            suit={editingSuit}
          />
          <button onClick={() => setEditingSuit(null)} className="back-button">
            Back to Suit Selection
          </button>
        </div>
      )}

      <h3>Suit Symbols</h3>
      <div className="symbols-gallery">
        {suits.map((suit) => (
          <div key={suit} className="symbol-block">
            <h4>{suit}</h4>
            {/* Grid View */}
            <div className="grid-preview">
              {symbols[suit].map((row, y) => (
                <div key={y} className="grid-row">
                  {row.map((cell, x) => (
                    <div
                      key={x}
                      className={`grid-cell ${cell === "X" ? "filled" : ""} ${
                        suit === "hearts" || suit === "diamonds"
                          ? "red"
                          : "black"
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
            {/* Card Preview */}
            <div className="card-preview">
              <PixelCard suit={suit} rank="A" width={120} />
            </div>
          </div>
        ))}
      </div>

      <h3>Full Deck Preview</h3>
      <div className="deck-gallery">
        {suits.map((suit) =>
          ranks.map((rank) => (
            <div key={`${rank}-${suit}`} className="card-block">
              <PixelCard rank={rank} suit={suit} width={100} />
              <div className="card-label">
                {rank} of {suit}
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .symbol-designer {
          padding: 2rem;
        }
        .suit-selector {
          text-align: center;
        }
        .suit-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 1rem;
        }
        .editor-container {
          max-width: 800px;
          margin: 0 auto;
        }
        .back-button {
          margin-top: 1rem;
        }
        button {
          padding: 0.5rem 1rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default SymbolDesigner;
