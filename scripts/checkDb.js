import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "dotenv";
import { checkDatabaseSchema } from "../src/utils/dbCheck.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env
config({ path: join(__dirname, "..", ".env") });

async function main() {
  // Set environment variables manually if not loaded from .env
  process.env.REACT_APP_SUPABASE_URL =
    process.env.REACT_APP_SUPABASE_URL ||
    "https://vtlpherjnorxdeprtwfv.supabase.co";
  process.env.REACT_APP_SUPABASE_ANON_KEY =
    process.env.REACT_APP_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bHBoZXJqbm9yeGRlcHJ0d2Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4NTc4NTUsImV4cCI6MjA1NDQzMzg1NX0.RgScT384h0rWs-QNlHsa3H04H1EgaVfIUcdPdJEzF3g";

  console.log("Checking database schema...");
  const result = await checkDatabaseSchema();
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
