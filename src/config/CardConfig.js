import shapes from "./shapes.js";

const CardConfig = {
  palette: {
    red: "#FF0000",
    black: "#222222",
    white: "#FFFFFF",
    cardBackground: "#FFFFFF",
    cardBorder: "#888888",
  },

  cardWidth: 128,
  cardHeight: 160,

  symbols: {
    ...shapes,
    2: [
      ["X", "X", "X", "X", null],
      [null, null, null, "X", "X"],
      [null, null, "X", "X", null],
      [null, "X", "X", null, null],
      ["X", "X", "X", "X", "X"],
    ],
    3: [
      ["X", "X", "X", "X", null],
      [null, null, null, "X", "X"],
      [null, "X", "X", "X", null],
      [null, null, null, "X", "X"],
      ["X", "X", "X", "X", null],
    ],
    4: [
      ["X", null, null, "X", null],
      ["X", null, null, "X", null],
      ["X", "X", "X", "X", "X"],
      [null, null, null, "X", null],
      [null, null, null, "X", null],
    ],
    5: [
      ["X", "X", "X", "X", "X"],
      ["X", null, null, null, null],
      ["X", "X", "X", "X", null],
      [null, null, null, "X", "X"],
      ["X", "X", "X", "X", null],
    ],
    6: [
      [null, "X", "X", "X", null],
      ["X", null, null, null, null],
      ["X", "X", "X", "X", null],
      ["X", null, null, "X", "X"],
      [null, "X", "X", "X", null],
    ],
    7: [
      ["X", "X", "X", "X", "X"],
      [null, null, null, "X", null],
      [null, null, "X", null, null],
      [null, null, "X", null, null],
      [null, null, "X", null, null],
    ],
    8: [
      [null, "X", "X", "X", null],
      ["X", null, null, "X", "X"],
      [null, "X", "X", "X", null],
      ["X", null, null, "X", "X"],
      [null, "X", "X", "X", null],
    ],
    9: [
      [null, "X", "X", "X", null],
      ["X", null, null, "X", "X"],
      [null, "X", "X", "X", "X"],
      [null, null, null, "X", "X"],
      [null, "X", "X", "X", null],
    ],
    10: [
      ["X", null, "X", "X", "X"],
      ["X", null, "X", null, "X"],
      ["X", null, "X", null, "X"],
      ["X", null, "X", null, "X"],
      ["X", null, "X", "X", "X"],
    ],
    J: [
      [null, null, "X", "X", "X"],
      [null, null, null, "X", null],
      ["X", null, null, "X", null],
      ["X", null, null, "X", null],
      [null, "X", "X", null, null],
    ],
    Q: [
      [null, "X", "X", "X", null],
      ["X", null, null, "X", "X"],
      ["X", null, null, "X", "X"],
      ["X", null, null, "X", null],
      [null, "X", "X", null, "X"],
    ],
    K: [
      ["X", null, null, "X", "X"],
      ["X", null, "X", "X", null],
      ["X", "X", "X", null, null],
      ["X", null, "X", "X", null],
      ["X", null, null, "X", "X"],
    ],
    A: [
      [null, "X", "X", "X", null],
      ["X", null, null, "X", "X"],
      ["X", "X", "X", "X", "X"],
      ["X", null, null, "X", "X"],
      ["X", null, null, "X", "X"],
    ],
    backTile: [
      ["X", "X", null, null],
      ["X", null, "X", null],
      [null, "X", null, "X"],
      [null, null, "X", "X"],
    ],
  },
};

export default CardConfig;
