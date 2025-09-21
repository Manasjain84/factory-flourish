-- Fix infinite recursion by creating a security definer function
-- that bypasses RLS to check user authorization

-- Drop the problematic function
DROP FUNCTION IF EXISTS public.is_authorized_user();

-- Create a new security definer function that bypasses RLS
CREATE OR REPLACE FUNCTION public.is_authorized_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Use SECURITY DEFINER to bypass RLS when checking authorization
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'manager')
  );
END;
$$;

-- Drop all existing policies on user_roles to start fresh
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Role management with bootstrap" ON public.user_roles;

-- Create simple policies that don't cause recursion
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

-- Create bootstrap policy for initial admin setup
CREATE POLICY "Bootstrap admin creation" ON public.user_roles
FOR INSERT WITH CHECK (
  -- Allow if this is the first admin (no admin exists yet)
  auth.uid() = user_id AND (
    NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') OR
    NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid())
  )
);

-- Create policy for authorized users to manage roles
CREATE POLICY "Authorized users can manage roles" ON public.user_roles
FOR ALL USING (is_authorized_user())
WITH CHECK (is_authorized_user());