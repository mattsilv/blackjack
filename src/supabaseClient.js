import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL ||
  import.meta?.env?.REACT_APP_SUPABASE_URL;
const supabaseKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  import.meta?.env?.REACT_APP_SUPABASE_ANON_KEY;

// Debug environment variables (without exposing sensitive data)
console.log("Environment variables check:", {
  hasUrl: !!supabaseUrl,
  hasAnonKey: !!supabaseKey,
  urlFirstChars: supabaseUrl?.substring(0, 10),
  keyLength: supabaseKey?.length,
  urlEndsWithCo: supabaseUrl?.endsWith(".co"),
  keyStartsWith: supabaseKey?.substring(0, 20),
  envKeys: Object.keys(process.env).filter((key) =>
    key.startsWith("REACT_APP_")
  ),
});

if (!supabaseUrl || !supabaseKey) {
  throw new Error(`Missing required environment variables:
    ${!supabaseUrl ? "REACT_APP_SUPABASE_URL" : ""}
    ${!supabaseKey ? "REACT_APP_SUPABASE_ANON_KEY" : ""}
  `);
}

// Create a single instance that can be reused
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    storageKey: "blackjack-auth-token",
    storage: typeof window !== "undefined" ? window.localStorage : null,
  },
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (
  error,
  fallbackMessage = "Database operation failed"
) => {
  console.error("Supabase error:", error);
  return {
    error: {
      message: error?.message || fallbackMessage,
      details: error?.details || "No additional details",
      code: error?.code || "UNKNOWN_ERROR",
    },
  };
};

// Test the connection and check table structure
const testConnection = async () => {
  try {
    // First test basic connection
    const { data, error } = await supabase.from("games").select("id").limit(1);

    if (error) {
      console.error("Connection test error:", error);
      return;
    }
    console.log("Connection successful, found games:", !!data);

    // Now check table structure
    const { data: game, error: structureError } = await supabase
      .from("games")
      .select(
        `
        id,
        host,
        friend,
        host_balance,
        friend_balance,
        current_bet,
        current_turn,
        state,
        deck,
        host_hand,
        friend_hand,
        dealer_hand,
        log
      `
      )
      .limit(1)
      .single();

    if (structureError) {
      console.error("Table structure error:", structureError);
    } else {
      console.log("Table structure check:", {
        hasRequiredColumns:
          game && "current_bet" in game && "current_turn" in game,
        columns: Object.keys(game),
      });
    }
  } catch (err) {
    console.error("Connection test failed:", err);
  }
};

// Test connection on load
testConnection();

export { supabase };
