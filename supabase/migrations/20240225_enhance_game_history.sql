-- Add columns for tracking game history
alter table public.games
  -- Track rounds within a game
  add column round_number integer not null default 1,
  -- Track complete game history
  add column game_history jsonb not null default '[]'::jsonb,
  -- Track used cards to prevent duplicates
  add column used_cards jsonb not null default '[]'::jsonb,
  -- Track round results
  add column round_results jsonb not null default '[]'::jsonb,
  -- Track player statistics
  add column player_stats jsonb not null default '{
    "host": {
      "wins": 0,
      "losses": 0,
      "blackjacks": 0,
      "busts": 0,
      "total_bets": 0,
      "total_winnings": 0
    },
    "guest": {
      "wins": 0,
      "losses": 0,
      "blackjacks": 0,
      "busts": 0,
      "total_bets": 0,
      "total_winnings": 0
    }
  }'::jsonb;

-- Create a function to update game history
create or replace function public.update_game_history()
returns trigger
language plpgsql
as $$
begin
  -- Only track history when a round is finished
  if (new.state = 'finished' and old.state = 'playing') then
    -- Add round result to history
    new.game_history = jsonb_build_array(
      jsonb_build_object(
        'round_number', new.round_number,
        'host_hand', new.host_hand,
        'friend_hand', new.friend_hand,
        'dealer_hand', new.dealer_hand,
        'bet_amount', new.current_bet,
        'winner', (
          case
            when new.log->-1->>'action' = 'win' then new.log->-1->>'player'
            when new.log->-1->>'action' = 'bust' then 'dealer'
            when new.log->-1->>'action' = 'tie' then 'tie'
            else 'dealer'
          end
        ),
        'timestamp', extract(epoch from now())
      )
    ) || new.game_history;

    -- Update player statistics
    if (new.log->-1->>'action' = 'win') then
      new.player_stats = jsonb_set(
        new.player_stats,
        array[(case when new.log->-1->>'player' = new.host then 'host' else 'guest' end), 'wins'],
        (coalesce((new.player_stats->(case when new.log->-1->>'player' = new.host then 'host' else 'guest' end)->>'wins')::int, 0) + 1)::text::jsonb
      );
    elsif (new.log->-1->>'action' = 'bust') then
      new.player_stats = jsonb_set(
        new.player_stats,
        array[(case when new.log->-1->>'player' = new.host then 'host' else 'guest' end), 'busts'],
        (coalesce((new.player_stats->(case when new.log->-1->>'player' = new.host then 'host' else 'guest' end)->>'busts')::int, 0) + 1)::text::jsonb
      );
    end if;

    -- Increment round number
    new.round_number = new.round_number + 1;
  end if;

  -- Track used cards
  if (new.state = 'playing' and old.state = 'waiting') then
    new.used_cards = new.host_hand || new.friend_hand || new.dealer_hand;
  elsif (new.state = 'playing') then
    new.used_cards = new.used_cards || 
      (new.host_hand - old.host_hand) || 
      (new.friend_hand - old.friend_hand) || 
      (new.dealer_hand - old.dealer_hand);
  end if;

  return new;
end;
$$;

-- Create trigger for game history
create trigger track_game_history
  before update
  on public.games
  for each row
  execute function public.update_game_history();

-- Add index for faster game history queries
create index idx_games_history on public.games using gin (game_history);

comment on column public.games.game_history is 'Complete history of all rounds played in this game';
comment on column public.games.used_cards is 'Track all cards that have been dealt to prevent duplicates';
comment on column public.games.round_results is 'Results of each round including hands and winners';
comment on column public.games.player_stats is 'Player statistics including wins, losses, blackjacks, etc';
comment on column public.games.round_number is 'Current round number in the game'; 