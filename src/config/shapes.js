/**
 * Card suit shapes for pixel art playing cards
 * Source: https://github.com/mattsilv/blackjack/tree/main/src/config/shapes
 * Each shape is maintained in a separate file for easier version control and editing
 */

import hearts from "./shapes/hearts.js";
import diamonds from "./shapes/diamonds.js";
import clubs from "./shapes/clubs.js";
import spades from "./shapes/spades.js";

const shapes = {
  hearts,
  diamonds,
  clubs,
  spades,
};

export default shapes;
