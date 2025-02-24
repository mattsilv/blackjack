-- Create games table
create table public.games (
  id text primary key,
  host text not null,
  friend text not null,
  deck jsonb not null default '[]'::jsonb,
  state text not null default 'waiting',
  host_balance integer not null default 1000,
  friend_balance integer not null default 1000,
  current_bet integer not null default 0,
  host_bet integer default null,
  friend_bet integer default null,
  host_hand jsonb not null default '[]'::jsonb,
  friend_hand jsonb not null default '[]'::jsonb,
  dealer_hand jsonb not null default '[]'::jsonb,
  current_turn text not null default 'host',
  log jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.games enable row level security;

-- Allow anyone to read games
create policy "Anyone can read games"
  on public.games for select
  using (true);

-- Allow anyone to insert games (for demo purposes)
create policy "Anyone can create games"
  on public.games for insert
  with check (true);

-- Allow anyone to update games (for demo purposes)
create policy "Anyone can update games"
  on public.games for update
  using (true);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger handle_games_updated_at
  before update
  on public.games
  for each row
  execute function public.handle_updated_at(); 