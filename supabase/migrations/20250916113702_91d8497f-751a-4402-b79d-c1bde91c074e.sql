-- Create user roles table and admin-only access control
-- First, create an enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'hr', 'manager');

-- Create user_roles table to manage who can access the payroll system
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role user_role NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

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

-- Create policies for user_roles table
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL USING (public.is_authorized_user());

-- Create trigger for updating timestamps
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial admin role for the current user (you'll need to run this manually with your user ID)
-- This is commented out because we need the actual user ID
-- INSERT INTO public.user_roles (user_id, role) VALUES ('YOUR_USER_ID_HERE', 'admin');