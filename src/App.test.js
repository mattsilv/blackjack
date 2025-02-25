import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders blackjack game", () => {
  render(<App />);
  const titleElement = screen.getByText(/Blackjack/i);
  expect(titleElement).toBeInTheDocument();
});
