/*
  # Fix Security Issues

  1. Removed Unused Indexes
    - Removed `idx_rooms_room_code` - room_code column is already UNIQUE, which creates an index automatically
    - Removed `idx_game_turns_room_id` - foreign key relationships have automatic indexes

  2. Fixed Function Search Path
    - Updated `generate_room_code` function to use IMMUTABLE and SET search_path for security
    - Prevents search path manipulation attacks
*/

DROP INDEX IF EXISTS public.idx_rooms_room_code;
DROP INDEX IF EXISTS public.idx_game_turns_room_id;

CREATE OR REPLACE FUNCTION public.generate_room_code()
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;