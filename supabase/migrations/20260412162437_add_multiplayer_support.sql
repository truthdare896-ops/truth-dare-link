/*
  # Add Multiplayer Support for Friendly Mode

  ## Summary
  Adds support for up to 5 players in friendly mode rooms.

  ## Changes

  ### Modified Tables
  - `rooms`
    - Added `players` (jsonb): Array of player names for multi-player games
    - Added `max_players` (int): Maximum players allowed (2-5), defaults to 2
    - Existing `player1_name` and `player2_name` columns remain for backward compatibility

  ## Notes
  - For friendly mode with 3-5 players, the `players` column holds the full list
  - For 2-player games (crush/adult), existing columns are still used
  - Turn rotation uses `players` array ordering when populated
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rooms' AND column_name = 'players'
  ) THEN
    ALTER TABLE rooms ADD COLUMN players jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rooms' AND column_name = 'max_players'
  ) THEN
    ALTER TABLE rooms ADD COLUMN max_players integer DEFAULT 2;
  END IF;
END $$;
