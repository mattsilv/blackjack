import React from "react";
import PixelCard from "./components/PixelCard";
import SymbolDesigner from "./components/SymbolDesigner";
import "./App.css";

function App() {
  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      <h1>Pixel Art Playing Cards Demo</h1>

      <SymbolDesigner />

      <h2>Card Examples</h2>
      <h3>Thumbnail View</h3>
      <div style={{ display: "flex", gap: 10, marginBottom: 40 }}>
        <div>
          <PixelCard rank="2" suit="hearts" width={100} />
          <div style={{ fontSize: 12, marginTop: 5 }}>2 of Hearts</div>
        </div>
        <div>
          <PixelCard rank="A" suit="spades" width={100} />
          <div style={{ fontSize: 12, marginTop: 5 }}>A of Spades</div>
        </div>
        <div>
          <PixelCard faceDown={true} width={100} />
          <div style={{ fontSize: 12, marginTop: 5 }}>Card Back</div>
        </div>
      </div>

      <h3>Full Size View</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 20,
          alignItems: "start",
        }}
      >
        <div>
          <PixelCard rank="2" suit="hearts" width={250} />
          <div style={{ marginTop: 10 }}>2 of Hearts</div>
        </div>
        <div>
          <PixelCard rank="A" suit="spades" width={250} />
          <div style={{ marginTop: 10 }}>A of Spades</div>
        </div>
        <div>
          <PixelCard faceDown={true} width={250} />
          <div style={{ marginTop: 10 }}>Card Back</div>
        </div>
      </div>
    </div>
  );
}

export default App;
