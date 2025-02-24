-- Function to check current schema
create or replace function check_games_schema()
returns jsonb
language plpgsql
as $$
declare
  schema_info jsonb;
begin
  select jsonb_build_object(
    'table_exists', exists (
      select 1 from information_schema.tables 
      where table_schema = 'public' and table_name = 'games'
    ),
    'columns', (
      select jsonb_object_agg(column_name, jsonb_build_object(
        'data_type', data_type,
        'is_nullable', is_nullable
      ))
      from information_schema.columns
      where table_schema = 'public' and table_name = 'games'
    ),
    'constraints', (
      select jsonb_agg(jsonb_build_object(
        'name', conname,
        'type', contype,
        'definition', pg_get_constraintdef(oid)
      ))
      from pg_constraint
      where conrelid = 'public.games'::regclass
    ),
    'triggers', (
      select jsonb_agg(jsonb_build_object(
        'name', tgname,
        'function', proname
      ))
      from pg_trigger t
      join pg_proc p on p.oid = t.tgfoid
      where tgrelid = 'public.games'::regclass
    ),
    'indices', (
      select jsonb_agg(jsonb_build_object(
        'name', indexname,
        'definition', indexdef
      ))
      from pg_indexes
      where schemaname = 'public' and tablename = 'games'
    )
  ) into schema_info;

  return schema_info;
end;
$$;

-- Run the check and display results
select check_games_schema(); 