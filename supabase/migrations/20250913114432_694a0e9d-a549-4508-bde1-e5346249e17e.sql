-- Create workers table for factory wage management
CREATE TABLE public.workers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  salary NUMERIC(10,2) NOT NULL DEFAULT 0,
  advance NUMERIC(10,2) NOT NULL DEFAULT 0, 
  dues NUMERIC(10,2) NOT NULL DEFAULT 0,
  net_wage NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you may want to add authentication later)
CREATE POLICY "Workers are viewable by everyone" 
ON public.workers 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create workers" 
ON public.workers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update workers" 
ON public.workers 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete workers" 
ON public.workers 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_workers_updated_at
  BEFORE UPDATE ON public.workers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live updates
ALTER TABLE public.workers REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workers;