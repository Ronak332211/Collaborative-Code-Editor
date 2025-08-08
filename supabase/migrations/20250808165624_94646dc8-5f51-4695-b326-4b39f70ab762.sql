-- Create coding_sessions table
CREATE TABLE public.coding_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  code TEXT DEFAULT '// Welcome to CodeCollab!\n// Start typing to begin collaborating\n\nconsole.log(''Hello, World!'');',
  language TEXT DEFAULT 'javascript',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.coding_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for sessions - anyone can read/write (for collaboration)
CREATE POLICY "Anyone can view coding sessions" 
ON public.coding_sessions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update coding sessions" 
ON public.coding_sessions 
FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can create sessions" 
ON public.coding_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Create session_participants table for tracking active users
CREATE TABLE public.session_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  user_color TEXT NOT NULL,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for participants
CREATE POLICY "Anyone can view session participants" 
ON public.session_participants 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own participation" 
ON public.session_participants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" 
ON public.session_participants 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own participation" 
ON public.session_participants 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on sessions
CREATE TRIGGER update_coding_sessions_updated_at
BEFORE UPDATE ON public.coding_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.coding_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_participants;

-- Set replica identity for realtime updates
ALTER TABLE public.coding_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.session_participants REPLICA IDENTITY FULL;