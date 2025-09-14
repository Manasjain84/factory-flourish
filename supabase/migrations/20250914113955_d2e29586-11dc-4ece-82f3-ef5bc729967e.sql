-- Fix critical security vulnerability: Remove public access to sensitive payroll data
-- Replace existing overly permissive RLS policies with authentication-required policies

-- Drop existing policies for workers table (all variations)
DROP POLICY IF EXISTS "Anyone can create workers" ON public.workers;
DROP POLICY IF EXISTS "Anyone can delete workers" ON public.workers;
DROP POLICY IF EXISTS "Anyone can update workers" ON public.workers;
DROP POLICY IF EXISTS "Workers are viewable by everyone" ON public.workers;
DROP POLICY IF EXISTS "Authenticated users can view workers" ON public.workers;
DROP POLICY IF EXISTS "Authenticated users can create workers" ON public.workers;
DROP POLICY IF EXISTS "Authenticated users can update workers" ON public.workers;
DROP POLICY IF EXISTS "Authenticated users can delete workers" ON public.workers;

-- Drop existing policies for monthly_wages table (all variations)
DROP POLICY IF EXISTS "Anyone can create monthly wages" ON public.monthly_wages;
DROP POLICY IF EXISTS "Anyone can delete monthly wages" ON public.monthly_wages;
DROP POLICY IF EXISTS "Anyone can update monthly wages" ON public.monthly_wages;
DROP POLICY IF EXISTS "Monthly wages are viewable by everyone" ON public.monthly_wages;
DROP POLICY IF EXISTS "Authenticated users can view monthly wages" ON public.monthly_wages;
DROP POLICY IF EXISTS "Authenticated users can create monthly wages" ON public.monthly_wages;
DROP POLICY IF EXISTS "Authenticated users can update monthly wages" ON public.monthly_wages;
DROP POLICY IF EXISTS "Authenticated users can delete monthly wages" ON public.monthly_wages;

-- Create secure policies for workers table (requires authentication)
CREATE POLICY "Secure: View workers (auth required)" 
ON public.workers 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Secure: Create workers (auth required)" 
ON public.workers 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Secure: Update workers (auth required)" 
ON public.workers 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Secure: Delete workers (auth required)" 
ON public.workers 
FOR DELETE 
TO authenticated
USING (true);

-- Create secure policies for monthly_wages table (requires authentication)
CREATE POLICY "Secure: View monthly wages (auth required)" 
ON public.monthly_wages 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Secure: Create monthly wages (auth required)" 
ON public.monthly_wages 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Secure: Update monthly wages (auth required)" 
ON public.monthly_wages 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Secure: Delete monthly wages (auth required)" 
ON public.monthly_wages 
FOR DELETE 
TO authenticated
USING (true);