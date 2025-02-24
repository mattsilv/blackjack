-- Drop existing constraints if they exist
do $$ 
declare
  drop_commands text;
begin
  drop_commands := (
    select string_agg('alter table public.games drop constraint if exists ' || quote_ident(conname) || ';', E'\n')
    from pg_constraint
    where conrelid = 'public.games'::regclass
    and conname like 'valid_%'
  );
  
  if drop_commands is not null then
    execute drop_commands;
  end if;
end $$;

-- Drop existing triggers if they exist
drop trigger if exists validate_game_state_trigger on public.games;
drop function if exists validate_game_state();
drop function if exists is_valid_card();

-- Enable JSONB operations
create extension if not exists "pg_stat_statements";

-- Drop existing indices to recreate
drop index if exists idx_games_deck;
drop index if exists idx_games_hands;
drop index if exists idx_games_log;

-- Add JSONB indices for better query performance
create index idx_games_deck on public.games using gin (deck);
create index idx_games_hands on public.games using gin (host_hand, friend_hand, dealer_hand);
create index idx_games_log on public.games using gin (log);

-- Add type coercion for game state updates with validation
alter table public.games
  alter column deck set data type jsonb using deck::jsonb,
  alter column host_hand set data type jsonb using host_hand::jsonb,
  alter column friend_hand set data type jsonb using friend_hand::jsonb,
  alter column dealer_hand set data type jsonb using dealer_hand::jsonb,
  alter column log set data type jsonb using log::jsonb;

-- Add validation constraints
alter table public.games
  add constraint valid_jsonb_arrays 
  check (
    jsonb_typeof(deck) = 'array' and
    jsonb_typeof(host_hand) = 'array' and
    jsonb_typeof(friend_hand) = 'array' and
    jsonb_typeof(dealer_hand) = 'array' and
    jsonb_typeof(log) = 'array'
  );

-- Add function for validating card objects
create function is_valid_card(card jsonb)
returns boolean
language plpgsql
immutable
as $$
begin
  return (
    jsonb_typeof(card) = 'object' and
    card ? 'rank' and
    card ? 'suit'
  );
end;
$$;

-- Add trigger for validating cards before insert/update
create function validate_game_state()
returns trigger
language plpgsql
as $$
begin
  -- Validate all cards in deck and hands
  if not (
    (select bool_and(is_valid_card(card)) from jsonb_array_elements(new.deck) card) and
    (select bool_and(is_valid_card(card)) from jsonb_array_elements(new.host_hand) card) and
    (select bool_and(is_valid_card(card)) from jsonb_array_elements(new.friend_hand) card) and
    (select bool_and(is_valid_card(card)) from jsonb_array_elements(new.dealer_hand) card)
  ) then
    raise exception 'Invalid card format';
  end if;
  return new;
end;
$$;

create trigger validate_game_state_trigger
  before insert or update on public.games
  for each row
  execute function validate_game_state();

-- Add comments for documentation
comment on table public.games is 'Stores blackjack game states with JSONB card data';
comment on column public.games.deck is 'Array of remaining cards in deck';
comment on column public.games.host_hand is 'Array of cards in host player''s hand';
comment on column public.games.friend_hand is 'Array of cards in guest player''s hand';
comment on column public.games.dealer_hand is 'Array of cards in dealer''s hand';
comment on column public.games.log is 'Array of game actions and events'; 