-- Add shift and overtime fields to workers table
ALTER TABLE public.workers 
ADD COLUMN shift_hours INTEGER NOT NULL DEFAULT 8,
ADD COLUMN overtime_rate_per_hour NUMERIC NOT NULL DEFAULT 0;

-- Add attendance and overtime fields to monthly_wages table
ALTER TABLE public.monthly_wages 
ADD COLUMN days_worked INTEGER NOT NULL DEFAULT 0,
ADD COLUMN total_days_in_month INTEGER NOT NULL DEFAULT 30,
ADD COLUMN overtime_hours NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN base_wage_calculated NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN overtime_wage NUMERIC NOT NULL DEFAULT 0;

-- Add comments for clarity
COMMENT ON COLUMN public.workers.shift_hours IS 'Regular shift hours per day (e.g., 8 for 8-hour shift)';
COMMENT ON COLUMN public.workers.overtime_rate_per_hour IS 'Additional rate per overtime hour';
COMMENT ON COLUMN public.monthly_wages.days_worked IS 'Actual days worked in the month';
COMMENT ON COLUMN public.monthly_wages.total_days_in_month IS 'Total working days in the month';
COMMENT ON COLUMN public.monthly_wages.overtime_hours IS 'Total overtime hours worked';
COMMENT ON COLUMN public.monthly_wages.base_wage_calculated IS 'Base wage calculated based on days worked';
COMMENT ON COLUMN public.monthly_wages.overtime_wage IS 'Additional wage from overtime';