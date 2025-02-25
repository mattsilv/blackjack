export function createEmptyGrid(width, height, fillColor) {
  const grid = [];
  for (let y = 0; y < height; y++) {
    grid[y] = [];
    for (let x = 0; x < width; x++) {
      grid[y][x] = fillColor;
    }
  }
  return grid;
}

export function drawSymbol(
  cardGrid,
  symbolPattern,
  offsetX,
  offsetY,
  color,
  scale = 1
) {
  if (!symbolPattern || !symbolPattern.length) return;

  const patternHeight = symbolPattern.length;
  const patternWidth = symbolPattern[0].length;

  // Use Math.floor for consistent scaling
  const intScale = Math.max(1, Math.floor(scale));

  for (let y = 0; y < patternHeight; y++) {
    for (let x = 0; x < patternWidth; x++) {
      if (symbolPattern[y][x] === "X") {
        for (let sy = 0; sy < intScale; sy++) {
          for (let sx = 0; sx < intScale; sx++) {
            const yy = offsetY + y * intScale + sy;
            const xx = offsetX + x * intScale + sx;
            if (
              yy >= 0 &&
              yy < cardGrid.length &&
              xx >= 0 &&
              xx < cardGrid[0].length
            ) {
              cardGrid[yy][xx] = color;
            }
          }
        }
      }
    }
  }
}

export function createBackGrid(cardWidth, cardHeight, palette, backTile) {
  const grid = createEmptyGrid(cardWidth, cardHeight, palette.cardBackground);
  const tileH = backTile.length;
  const tileW = backTile[0].length;

  for (let y = 2; y < cardHeight - 2; y += tileH) {
    for (let x = 2; x < cardWidth - 2; x += tileW) {
      drawSymbol(grid, backTile, x, y, palette.black);
    }
  }

  addCardBorder(grid, palette.cardBorder);
  return grid;
}

export function addCardBorder(grid, borderColor) {
  const height = grid.length;
  const width = grid[0].length;
  const borderWidth = 1;

  // Top and bottom borders
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < borderWidth; y++) {
      grid[y][x] = borderColor;
      grid[height - 1 - y][x] = borderColor;
    }
  }

  // Left and right borders
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < borderWidth; x++) {
      grid[y][x] = borderColor;
      grid[y][width - 1 - x] = borderColor;
    }
  }
}

export function createCardPattern(
  cardWidth,
  cardHeight,
  palette,
  symbols,
  rank,
  suit
) {
  const cardGrid = createEmptyGrid(
    cardWidth,
    cardHeight,
    palette.cardBackground
  );

  const color =
    suit === "hearts" || suit === "diamonds" ? palette.red : palette.black;
  const suitPattern = symbols[suit] || [];
  const rankPattern = symbols[rank] || [];

  // Draw rank in top-left corner with appropriate scaling
  const rankScale = 3; // Keep at 3 for balanced size
  const rankX = 8;
  const rankY = 8;
  drawSymbol(cardGrid, rankPattern, rankX, rankY, color, rankScale);

  // Draw small suit below top rank
  const smallSuitScale = 1;
  const smallSuitX =
    rankX +
    Math.floor(
      (rankPattern[0].length * rankScale -
        suitPattern[0].length * smallSuitScale) /
        2
    );
  const smallSuitY = rankY + rankPattern.length * rankScale + 3;
  drawSymbol(
    cardGrid,
    suitPattern,
    smallSuitX,
    smallSuitY,
    color,
    smallSuitScale
  );

  // Draw center suit with larger scale
  const centerSuitScale = 2;
  const centerSuitX = Math.floor(
    (cardWidth - suitPattern[0].length * centerSuitScale) / 2
  );
  const centerSuitY = Math.floor(
    (cardHeight - suitPattern.length * centerSuitScale) / 2
  );
  drawSymbol(
    cardGrid,
    suitPattern,
    centerSuitX,
    centerSuitY,
    color,
    centerSuitScale
  );

  // Draw bottom-right rank and suit (inverted)
  const bottomRankX = cardWidth - rankPattern[0].length * rankScale - 8;
  const bottomRankY = cardHeight - rankPattern.length * rankScale - 8;
  drawSymbol(cardGrid, rankPattern, bottomRankX, bottomRankY, color, rankScale);

  // Center the suit above the rank
  const suitWidth = suitPattern[0].length * smallSuitScale;
  const rankWidth = rankPattern[0].length * rankScale;
  const bottomSuitX = bottomRankX + Math.floor((rankWidth - suitWidth) / 2);
  const bottomSuitY = bottomRankY - suitPattern.length * smallSuitScale - 3;
  drawSymbol(
    cardGrid,
    suitPattern,
    bottomSuitX,
    bottomSuitY,
    color,
    smallSuitScale
  );

  addCardBorder(cardGrid, palette.cardBorder);
  return cardGrid;
}

export function renderGridToCanvas(grid, canvas) {
  const ctx = canvas.getContext("2d");
  const rows = grid.length;
  const cols = grid[0].length;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Disable image smoothing for all browsers
  ctx.imageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.mozImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;

  // Calculate full pixel sizes
  const pixelWidth = Math.floor(canvas.width / cols);
  const pixelHeight = Math.floor(canvas.height / rows);

  // Render each pixel with precise placement
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[y][x]) {
        ctx.fillStyle = grid[y][x];
        // Ensure we draw on exact pixel boundaries
        const pixelX = Math.floor(x * pixelWidth);
        const pixelY = Math.floor(y * pixelHeight);
        ctx.fillRect(pixelX, pixelY, pixelWidth, pixelHeight);
      }
    }
  }
}
