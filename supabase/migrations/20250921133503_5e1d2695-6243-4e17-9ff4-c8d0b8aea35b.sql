-- Drop all policies that depend on is_authorized_user() function
-- Workers table policies
DROP POLICY IF EXISTS "Admin: View workers" ON public.workers;
DROP POLICY IF EXISTS "Admin: Create workers" ON public.workers;
DROP POLICY IF EXISTS "Admin: Update workers" ON public.workers;
DROP POLICY IF EXISTS "Admin: Delete workers" ON public.workers;

-- Monthly wages table policies
DROP POLICY IF EXISTS "Admin: View monthly wages" ON public.monthly_wages;
DROP POLICY IF EXISTS "Admin: Create monthly wages" ON public.monthly_wages;
DROP POLICY IF EXISTS "Admin: Update monthly wages" ON public.monthly_wages;
DROP POLICY IF EXISTS "Admin: Delete monthly wages" ON public.monthly_wages;

-- User roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Role management with bootstrap" ON public.user_roles;

-- Now drop and recreate the function
DROP FUNCTION IF EXISTS public.is_authorized_user() CASCADE;

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

-- Recreate user_roles policies without recursion
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

-- Bootstrap policy for first admin
CREATE POLICY "Bootstrap admin creation" ON public.user_roles
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND 
  NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
);

-- Policy for authorized users to manage roles  
CREATE POLICY "Authorized users can manage roles" ON public.user_roles
FOR ALL USING (is_authorized_user())
WITH CHECK (is_authorized_user());

-- Recreate workers table policies
CREATE POLICY "Admin: View workers" ON public.workers
FOR SELECT USING (is_authorized_user());

CREATE POLICY "Admin: Create workers" ON public.workers
FOR INSERT WITH CHECK (is_authorized_user());

CREATE POLICY "Admin: Update workers" ON public.workers
FOR UPDATE USING (is_authorized_user());

CREATE POLICY "Admin: Delete workers" ON public.workers
FOR DELETE USING (is_authorized_user());

-- Recreate monthly wages policies
CREATE POLICY "Admin: View monthly wages" ON public.monthly_wages
FOR SELECT USING (is_authorized_user());

CREATE POLICY "Admin: Create monthly wages" ON public.monthly_wages
FOR INSERT WITH CHECK (is_authorized_user());

CREATE POLICY "Admin: Update monthly wages" ON public.monthly_wages
FOR UPDATE USING (is_authorized_user());

CREATE POLICY "Admin: Delete monthly wages" ON public.monthly_wages
FOR DELETE USING (is_authorized_user());