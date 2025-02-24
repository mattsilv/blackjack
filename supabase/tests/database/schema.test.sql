-- Test game table structure
begin;

-- Test required columns exist
do $$
declare
  missing_columns text[];
  required_columns text[] := array[
    'id', 'host', 'friend', 'deck', 'state', 
    'host_balance', 'friend_balance', 'current_bet',
    'host_hand', 'friend_hand', 'dealer_hand', 
    'current_turn', 'log', 'round_number',
    'game_history', 'used_cards', 'round_results', 
    'player_stats'
  ];
begin
  select array_agg(col)
  from unnest(required_columns) col
  where not exists (
    select 1 
    from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'games' 
    and column_name = col
  )
  into missing_columns;

  if array_length(missing_columns, 1) > 0 then
    raise exception 'Missing required columns: %', missing_columns;
  end if;
end;
$$;

-- Test JSONB columns have correct type
do $$
declare
  invalid_columns text[];
  jsonb_columns text[] := array['deck', 'host_hand', 'friend_hand', 'dealer_hand', 'log', 'game_history', 'used_cards', 'round_results', 'player_stats'];
begin
  select array_agg(column_name)
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'games'
    and column_name = any(jsonb_columns)
    and data_type != 'jsonb'
  into invalid_columns;

  if array_length(invalid_columns, 1) > 0 then
    raise exception 'Columns should be JSONB type: %', invalid_columns;
  end if;
end;
$$;

-- Test constraints exist
do $$
declare
  missing_constraints text[];
  required_constraints text[] := array['valid_jsonb_arrays'];
begin
  select array_agg(con)
  from unnest(required_constraints) con
  where not exists (
    select 1 
    from pg_constraint 
    where conname = con
  )
  into missing_constraints;

  if array_length(missing_constraints, 1) > 0 then
    raise exception 'Missing required constraints: %', missing_constraints;
  end if;
end;
$$;

-- Test indices exist
do $$
declare
  missing_indices text[];
  required_indices text[] := array['idx_games_deck', 'idx_games_hands', 'idx_games_log'];
begin
  select array_agg(idx)
  from unnest(required_indices) idx
  where not exists (
    select 1 
    from pg_indexes 
    where indexname = idx
  )
  into missing_indices;

  if array_length(missing_indices, 1) > 0 then
    raise exception 'Missing required indices: %', missing_indices;
  end if;
end;
$$;

rollback; 