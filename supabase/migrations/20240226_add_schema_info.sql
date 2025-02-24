-- Function to get schema information
create or replace function get_schema_info()
returns json
language plpgsql
security definer
as $$
declare
  result json;
begin
  select json_build_object(
    'tables', (
      select json_object_agg(table_name, columns)
      from (
        select 
          t.table_name,
          json_agg(json_build_object(
            'column_name', c.column_name,
            'data_type', c.data_type,
            'is_nullable', c.is_nullable
          )) as columns
        from information_schema.tables t
        join information_schema.columns c on c.table_name = t.table_name
        where t.table_schema = 'public'
        and t.table_type = 'BASE TABLE'
        group by t.table_name
      ) as table_info
    )
  ) into result;
  
  return result;
end;
$$; 