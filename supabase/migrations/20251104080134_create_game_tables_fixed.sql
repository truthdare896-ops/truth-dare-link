/*
  # Create game tables for Truth or Dare

  1. New Tables
    - `rooms`: Stores game session information
      - `id` (uuid, primary key)
      - `room_code` (text, unique) - 6-character code for joining
      - `game_mode` (text) - 'friendly', 'crush', or 'adult'
      - `player1_name` (text) - Host player name
      - `player2_name` (text, nullable) - Second player name
      - `status` (text) - 'waiting', 'playing', or 'finished'
      - `created_at` (timestamp)
      - `started_at` (timestamp, nullable)
    
    - `game_turns`: Tracks each question and answer in the game
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key to rooms)
      - `turn_number` (integer) - Sequential turn number
      - `player_name` (text) - Player answering the question
      - `question_type` (text) - 'truth' or 'dare'
      - `question` (text) - The question text
      - `answer` (text, nullable) - Player's answer
      - `answered_at` (timestamp, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Policies allow public access (game is public, no authentication needed)
    - Function uses secure search_path and VOLATILE for random generation
    
  3. Features
    - Realtime subscriptions enabled
    - Helper function to generate unique room codes
*/

CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT UNIQUE NOT NULL,
  game_mode TEXT NOT NULL CHECK (game_mode IN ('friendly', 'crush', 'adult')),
  player1_name TEXT NOT NULL,
  player2_name TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.game_turns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  player_name TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('truth', 'dare')),
  question TEXT NOT NULL,
  answer TEXT,
  answered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_turns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read rooms"
  ON public.rooms FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create rooms"
  ON public.rooms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update rooms"
  ON public.rooms FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can read game turns"
  ON public.game_turns FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create game turns"
  ON public.game_turns FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update game turns"
  ON public.game_turns FOR UPDATE
  USING (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'game_turns'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.game_turns;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.generate_room_code()
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
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