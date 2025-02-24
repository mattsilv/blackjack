import { supabase } from "../supabaseClient.js";

export const checkDatabaseSchema = async () => {
  try {
    // Check if games table exists and get its structure
    const { data: tableInfo, error: tableError } = await supabase
      .from("games")
      .select("*")
      .limit(1);

    if (tableError) {
      console.error("Error checking table:", tableError);
      return { error: tableError };
    }

    // Get column names and types
    const columns = tableInfo ? Object.keys(tableInfo[0] || {}) : [];

    // Check for required columns
    const requiredColumns = [
      "id",
      "host",
      "friend",
      "deck",
      "state",
      "host_balance",
      "friend_balance",
      "current_bet",
      "host_hand",
      "friend_hand",
      "dealer_hand",
      "current_turn",
      "log",
      "round_number",
      "game_history",
      "used_cards",
      "round_results",
      "player_stats",
    ];

    const missingColumns = requiredColumns.filter(
      (col) => !columns.includes(col)
    );

    // Check JSONB columns
    const jsonbColumns = [
      "deck",
      "host_hand",
      "friend_hand",
      "dealer_hand",
      "log",
    ];
    const { data: sample, error: sampleError } = await supabase
      .from("games")
      .select(jsonbColumns.join(","))
      .limit(1)
      .single();

    if (sampleError && sampleError.code !== "PGRST116") {
      // Ignore "no rows returned" error
      console.error("Error checking JSONB columns:", sampleError);
    }

    return {
      tableExists: !!tableInfo,
      columns,
      missingColumns,
      jsonbColumnsPresent: sample
        ? jsonbColumns.every((col) => Array.isArray(sample[col]))
        : null,
      sample,
    };
  } catch (err) {
    console.error("Error checking schema:", err);
    return { error: err };
  }
};
