-- Create rooms table for game sessions
CREATE TABLE public.rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT UNIQUE NOT NULL,
  game_mode TEXT NOT NULL CHECK (game_mode IN ('friendly', 'crush', 'adult')),
  player1_name TEXT NOT NULL,
  player2_name TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE
);

-- Create game turns table for tracking questions and answers
CREATE TABLE public.game_turns (
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

-- Enable Row Level Security
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_turns ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read and write rooms (public game, no auth required)
CREATE POLICY "Anyone can read rooms"
  ON public.rooms FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create rooms"
  ON public.rooms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update rooms"
  ON public.rooms FOR UPDATE
  USING (true);

-- Allow anyone to read and write game turns
CREATE POLICY "Anyone can read game turns"
  ON public.game_turns FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create game turns"
  ON public.game_turns FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update game turns"
  ON public.game_turns FOR UPDATE
  USING (true);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_turns;

-- Create index for faster lookups
CREATE INDEX idx_rooms_room_code ON public.rooms(room_code);
CREATE INDEX idx_game_turns_room_id ON public.game_turns(room_id);

-- Function to generate unique 6-character room codes
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;