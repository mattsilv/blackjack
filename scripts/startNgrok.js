import ngrok from "ngrok";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

async function startNgrok() {
  try {
    console.log("🔄 Starting ngrok tunnel...");

    // Ensure ngrok is initialized with auth token
    await ngrok.authtoken(process.env.NGROK_AUTH_TOKEN);

    // Kill any existing ngrok processes
    await ngrok.kill();

    // Start new tunnel
    const url = await ngrok.connect({
      proto: "http",
      addr: 3000,
      authtoken: process.env.NGROK_AUTH_TOKEN,
    });

    // Log the URL in a visible way
    console.log("\n========================================");
    console.log("\x1b[32m%s\x1b[0m", `🚀 Ngrok URL: ${url}`);
    console.log(
      "\x1b[36m%s\x1b[0m",
      "👉 Share this URL to play the game remotely!"
    );
    console.log("========================================\n");

    // Keep the process alive
    process.stdin.resume();

    // Handle cleanup
    process.on("SIGINT", async () => {
      console.log("\n👋 Closing ngrok tunnel...");
      try {
        await ngrok.disconnect(url);
        await ngrok.kill();
      } catch (err) {
        // Ignore cleanup errors
      }
      process.exit(0);
    });
  } catch (err) {
    console.error("\x1b[31m%s\x1b[0m", "❌ Ngrok Error:", err.message);
    process.exit(1);
  }
}

// Start the tunnel
startNgrok();
