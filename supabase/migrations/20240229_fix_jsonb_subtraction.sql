-- Fix for "operator does not exist: jsonb - jsonb" error
-- Create a function to handle JSONB array difference
CREATE OR REPLACE FUNCTION jsonb_array_difference(array1 jsonb, array2 jsonb)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  result jsonb := '[]'::jsonb;
  item jsonb;
BEGIN
  -- For each item in array1, add it to result if it's not in array2
  FOR item IN SELECT * FROM jsonb_array_elements(array1)
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(array2) WHERE value = item
    ) THEN
      result := result || jsonb_build_array(item);
    END IF;
  END LOOP;
  
  RETURN result;
END;
$$;

-- Update the game history trigger to use the new function
CREATE OR REPLACE FUNCTION public.update_game_history()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only track history when a round is finished
  IF (new.state = 'finished' AND old.state = 'playing') THEN
    -- Add round result to history
    new.game_history = jsonb_build_array(
      jsonb_build_object(
        'round_number', new.round_number,
        'host_hand', new.host_hand,
        'friend_hand', new.friend_hand,
        'dealer_hand', new.dealer_hand,
        'bet_amount', new.current_bet,
        'winner', (
          CASE
            WHEN new.log->-1->>'action' = 'win' THEN new.log->-1->>'player'
            WHEN new.log->-1->>'action' = 'bust' THEN 'dealer'
            WHEN new.log->-1->>'action' = 'tie' THEN 'tie'
            ELSE 'dealer'
          END
        ),
        'timestamp', extract(epoch FROM now())
      )
    ) || new.game_history;

    -- Update player statistics
    IF (new.log->-1->>'action' = 'win') THEN
      new.player_stats = jsonb_set(
        new.player_stats,
        array[(CASE WHEN new.log->-1->>'player' = new.host THEN 'host' ELSE 'guest' END), 'wins'],
        (COALESCE((new.player_stats->(CASE WHEN new.log->-1->>'player' = new.host THEN 'host' ELSE 'guest' END)->>'wins')::int, 0) + 1)::text::jsonb
      );
    ELSIF (new.log->-1->>'action' = 'bust') THEN
      new.player_stats = jsonb_set(
        new.player_stats,
        array[(CASE WHEN new.log->-1->>'player' = new.host THEN 'host' ELSE 'guest' END), 'busts'],
        (COALESCE((new.player_stats->(CASE WHEN new.log->-1->>'player' = new.host THEN 'host' ELSE 'guest' END)->>'busts')::int, 0) + 1)::text::jsonb
      );
    END IF;

    -- Increment round number
    new.round_number = new.round_number + 1;
  END IF;

  -- Track used cards - FIXED to use jsonb_array_difference function
  IF (new.state = 'playing' AND old.state = 'waiting') THEN
    new.used_cards = new.host_hand || new.friend_hand || new.dealer_hand;
  ELSE
    -- Use our custom function instead of the unsupported - operator
    new.used_cards = new.used_cards || 
      jsonb_array_difference(new.host_hand, old.host_hand) || 
      jsonb_array_difference(new.friend_hand, old.friend_hand) || 
      jsonb_array_difference(new.dealer_hand, old.dealer_hand);
  END IF;

  RETURN new;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION jsonb_array_difference(jsonb, jsonb) IS 'Custom function to find difference between two JSONB arrays'; 