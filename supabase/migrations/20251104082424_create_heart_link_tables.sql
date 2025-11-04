/*
  # Create Heart Link Game Tables

  1. New Tables
    - `players` - Store player profiles
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `username` (text)
      - `created_at` (timestamp)
    
    - `game_rooms` - Store game sessions
      - `id` (uuid, primary key)
      - `room_code` (text, unique)
      - `player1_id` (uuid, foreign key)
      - `player2_id` (uuid, foreign key, nullable)
      - `status` (text) - 'waiting', 'playing', 'completed'
      - `created_at` (timestamp)
      - `completed_at` (timestamp, nullable)
    
    - `game_sessions` - Store individual game rounds
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key)
      - `player1_score` (integer)
      - `player2_score` (integer)
      - `winner_id` (uuid, foreign key, nullable)
      - `created_at` (timestamp)
    
    - `game_answers` - Store player answers during game
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `player_id` (uuid, foreign key)
      - `question_id` (integer)
      - `answer` (text)
      - `is_correct` (boolean)
      - `created_at` (timestamp)
    
    - `player_stats` - Store aggregated statistics
      - `id` (uuid, primary key)
      - `player_id` (uuid, foreign key)
      - `total_games` (integer, default 0)
      - `wins` (integer, default 0)
      - `losses` (integer, default 0)
      - `total_score` (integer, default 0)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Players can read/write only their own data
    - Game data accessible to players in that room
    - Stats accessible to own user only
*/

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  username text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read own profile"
  ON players FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Players can update own profile"
  ON players FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can insert player profile"
  ON players FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create game_rooms table
CREATE TABLE IF NOT EXISTS game_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code text UNIQUE NOT NULL,
  player1_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  player2_id uuid REFERENCES players(id) ON DELETE SET NULL,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'completed')),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view rooms they're in"
  ON game_rooms FOR SELECT
  TO authenticated
  USING (
    player1_id = auth.uid() OR player2_id = auth.uid()
  );

CREATE POLICY "Players can create rooms"
  ON game_rooms FOR INSERT
  TO authenticated
  WITH CHECK (player1_id = auth.uid());

CREATE POLICY "Players can update rooms they're in"
  ON game_rooms FOR UPDATE
  TO authenticated
  USING (player1_id = auth.uid() OR player2_id = auth.uid())
  WITH CHECK (player1_id = auth.uid() OR player2_id = auth.uid());

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  player1_score integer DEFAULT 0,
  player2_score integer DEFAULT 0,
  winner_id uuid REFERENCES players(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view sessions in their rooms"
  ON game_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM game_rooms
      WHERE game_rooms.id = game_sessions.room_id
      AND (game_rooms.player1_id = auth.uid() OR game_rooms.player2_id = auth.uid())
    )
  );

CREATE POLICY "Players can create sessions in their rooms"
  ON game_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_rooms
      WHERE game_rooms.id = room_id
      AND (game_rooms.player1_id = auth.uid() OR game_rooms.player2_id = auth.uid())
    )
  );

CREATE POLICY "Players can update sessions in their rooms"
  ON game_sessions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM game_rooms
      WHERE game_rooms.id = game_sessions.room_id
      AND (game_rooms.player1_id = auth.uid() OR game_rooms.player2_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_rooms
      WHERE game_rooms.id = game_sessions.room_id
      AND (game_rooms.player1_id = auth.uid() OR game_rooms.player2_id = auth.uid())
    )
  );

-- Create game_answers table
CREATE TABLE IF NOT EXISTS game_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  question_id integer NOT NULL,
  answer text NOT NULL,
  is_correct boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE game_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view answers in their sessions"
  ON game_answers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM game_sessions
      INNER JOIN game_rooms ON game_rooms.id = game_sessions.room_id
      WHERE game_sessions.id = game_answers.session_id
      AND (game_rooms.player1_id = auth.uid() OR game_rooms.player2_id = auth.uid())
    )
  );

CREATE POLICY "Players can insert their own answers"
  ON game_answers FOR INSERT
  TO authenticated
  WITH CHECK (
    player_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM game_sessions
      INNER JOIN game_rooms ON game_rooms.id = game_sessions.room_id
      WHERE game_sessions.id = session_id
      AND (game_rooms.player1_id = auth.uid() OR game_rooms.player2_id = auth.uid())
    )
  );

-- Create player_stats table
CREATE TABLE IF NOT EXISTS player_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid UNIQUE NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  total_games integer DEFAULT 0,
  wins integer DEFAULT 0,
  losses integer DEFAULT 0,
  total_score integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view own stats"
  ON player_stats FOR SELECT
  TO authenticated
  USING (player_id = auth.uid());

CREATE POLICY "Players can update own stats"
  ON player_stats FOR UPDATE
  TO authenticated
  USING (player_id = auth.uid())
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "System can create stats"
  ON player_stats FOR INSERT
  TO authenticated
  WITH CHECK (player_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_rooms_player1_id ON game_rooms(player1_id);
CREATE INDEX IF NOT EXISTS idx_game_rooms_player2_id ON game_rooms(player2_id);
CREATE INDEX IF NOT EXISTS idx_game_rooms_status ON game_rooms(status);
CREATE INDEX IF NOT EXISTS idx_game_sessions_room_id ON game_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_game_answers_session_id ON game_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_game_answers_player_id ON game_answers(player_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_player_id ON player_stats(player_id);
