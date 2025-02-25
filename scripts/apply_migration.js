import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env
config({ path: join(__dirname, "..", ".env") });

async function main() {
  // Set environment variables manually if not loaded from .env
  const supabaseUrl =
    process.env.REACT_APP_SUPABASE_URL ||
    "https://vtlpherjnorxdeprtwfv.supabase.co";
  const supabaseKey =
    process.env.REACT_APP_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bHBoZXJqbm9yeGRlcHJ0d2Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4NTc4NTUsImV4cCI6MjA1NDQzMzg1NX0.RgScT384h0rWs-QNlHsa3H04H1EgaVfIUcdPdJEzF3g";

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log("Applying migration to fix JSONB subtraction issue...");

    // Read the migration file
    const migrationPath = join(
      __dirname,
      "..",
      "supabase",
      "migrations",
      "20240229_fix_jsonb_subtraction.sql"
    );
    const migrationSql = readFileSync(migrationPath, "utf8");

    // Execute the SQL directly using the REST API
    const { error } = await supabase.rpc("exec_sql", { sql: migrationSql });

    if (error) {
      console.error("Error applying migration:", error);
      process.exit(1);
    }

    console.log("Migration applied successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Unexpected error:", err);
    process.exit(1);
  }
}

main();
