-- Step 1: Drop all policies that depend on is_authorized_user()
-- Workers table policies
DROP POLICY IF EXISTS "Admin: View workers" ON public.workers;
DROP POLICY IF EXISTS "Admin: Create workers" ON public.workers;
DROP POLICY IF EXISTS "Admin: Update workers" ON public.workers;
DROP POLICY IF EXISTS "Admin: Delete workers" ON public.workers;

-- Monthly wages policies
DROP POLICY IF EXISTS "Admin: View monthly wages" ON public.monthly_wages;
DROP POLICY IF EXISTS "Admin: Create monthly wages" ON public.monthly_wages;
DROP POLICY IF EXISTS "Admin: Update monthly wages" ON public.monthly_wages;
DROP POLICY IF EXISTS "Admin: Delete monthly wages" ON public.monthly_wages;

-- User roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Role management with bootstrap" ON public.user_roles;
DROP POLICY IF EXISTS "Authorized users can manage roles" ON public.user_roles;

-- Step 2: Drop the function
DROP FUNCTION IF EXISTS public.is_authorized_user();

-- Step 3: Create new security definer function that bypasses RLS
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