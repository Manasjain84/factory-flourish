-- First, let's create a new table for monthly wage records
CREATE TABLE public.monthly_wages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2000),
  advance NUMERIC NOT NULL DEFAULT 0,
  dues NUMERIC NOT NULL DEFAULT 0,
  net_wage NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(worker_id, month, year)
);

-- Enable RLS on monthly_wages
ALTER TABLE public.monthly_wages ENABLE ROW LEVEL SECURITY;

-- Create policies for monthly_wages
CREATE POLICY "Monthly wages are viewable by everyone" 
ON public.monthly_wages 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create monthly wages" 
ON public.monthly_wages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update monthly wages" 
ON public.monthly_wages 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete monthly wages" 
ON public.monthly_wages 
FOR DELETE 
USING (true);

-- Add trigger for automatic timestamp updates on monthly_wages
CREATE TRIGGER update_monthly_wages_updated_at
BEFORE UPDATE ON public.monthly_wages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update workers table to keep only base salary (rename salary to base_salary for clarity)
ALTER TABLE public.workers RENAME COLUMN salary TO base_salary;

-- Remove advance, dues, and net_wage columns from workers table as they'll be tracked monthly
ALTER TABLE public.workers DROP COLUMN IF EXISTS advance;
ALTER TABLE public.workers DROP COLUMN IF EXISTS dues;
ALTER TABLE public.workers DROP COLUMN IF EXISTS net_wage;