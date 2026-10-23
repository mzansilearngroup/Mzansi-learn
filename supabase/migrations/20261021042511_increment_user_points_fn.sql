/*
# Add increment_user_points function

1. Functions
- `increment_user_points(p_user_id uuid, p_points int)` — atomically adds points to a user and returns the new total.
- SECURITY INVOKER so RLS still applies via the calling role (anon/authenticated).
*/

DROP FUNCTION IF EXISTS increment_user_points(uuid, int);
CREATE FUNCTION increment_user_points(p_user_id uuid, p_points int)
RETURNS int
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  new_total int;
BEGIN
  UPDATE users SET points = points + p_points WHERE id = p_user_id RETURNING points INTO new_total;
  RETURN COALESCE(new_total, 0);
END;
$$;
