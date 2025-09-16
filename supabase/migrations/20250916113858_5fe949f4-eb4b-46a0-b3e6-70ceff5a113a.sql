-- Create security definer function to check if user has admin/hr/manager role
CREATE OR REPLACE FUNCTION public.is_authorized_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop existing insecure policies for workers table
DROP POLICY IF EXISTS "Secure: Create workers (auth required)" ON public.workers;
DROP POLICY IF EXISTS "Secure: View workers (auth required)" ON public.workers;
DROP POLICY IF EXISTS "Secure: Update workers (auth required)" ON public.workers;
DROP POLICY IF EXISTS "Secure: Delete workers (auth required)" ON public.workers;

-- Create new secure policies for workers table - only authorized users
CREATE POLICY "Admin: View workers" ON public.workers
    FOR SELECT USING (public.is_authorized_user());

CREATE POLICY "Admin: Create workers" ON public.workers
    FOR INSERT WITH CHECK (public.is_authorized_user());

CREATE POLICY "Admin: Update workers" ON public.workers
    FOR UPDATE USING (public.is_authorized_user());

CREATE POLICY "Admin: Delete workers" ON public.workers
    FOR DELETE USING (public.is_authorized_user());

-- Drop existing insecure policies for monthly_wages table
DROP POLICY IF EXISTS "Secure: Create monthly wages (auth required)" ON public.monthly_wages;
DROP POLICY IF EXISTS "Secure: View monthly wages (auth required)" ON public.monthly_wages;
DROP POLICY IF EXISTS "Secure: Update monthly wages (auth required)" ON public.monthly_wages;
DROP POLICY IF EXISTS "Secure: Delete monthly wages (auth required)" ON public.monthly_wages;

-- Create new secure policies for monthly_wages table - only authorized users
CREATE POLICY "Admin: View monthly wages" ON public.monthly_wages
    FOR SELECT USING (public.is_authorized_user());

CREATE POLICY "Admin: Create monthly wages" ON public.monthly_wages
    FOR INSERT WITH CHECK (public.is_authorized_user());

CREATE POLICY "Admin: Update monthly wages" ON public.monthly_wages
    FOR UPDATE USING (public.is_authorized_user());

CREATE POLICY "Admin: Delete monthly wages" ON public.monthly_wages
    FOR DELETE USING (public.is_authorized_user());