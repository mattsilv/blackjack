-- Create a function to execute SQL statements from the client
-- This is needed for our migration script to work
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Add RLS policy to allow authenticated users to execute SQL
-- In a production environment, you would want to restrict this further
CREATE POLICY "Allow authenticated users to execute SQL"
  ON pg_catalog.pg_proc
  FOR EXECUTE
  TO authenticated
  USING (proname = 'exec_sql');

-- Grant execute permission to anon role for our migration script
GRANT EXECUTE ON FUNCTION exec_sql(text) TO anon;

-- Add comment for documentation
COMMENT ON FUNCTION exec_sql(text) IS 'Execute SQL statements from client - USE WITH CAUTION'; 