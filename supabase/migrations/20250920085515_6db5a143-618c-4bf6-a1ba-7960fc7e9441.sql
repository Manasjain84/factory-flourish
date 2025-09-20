-- Drop the restrictive policy and create a new one that allows bootstrap
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Create a new policy that allows users to insert their own role if:
-- 1. They don't have a role yet, OR  
-- 2. No admin exists in the system (bootstrap case)
CREATE POLICY "Users can manage roles with bootstrap" ON public.user_roles
FOR ALL USING (
  -- Allow if user is authorized (has admin/hr/manager role)
  is_authorized_user() OR
  -- Allow if this is the user's own record AND (they have no role OR no admin exists)
  (auth.uid() = user_id AND (
    NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()) OR
    NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
  ))
)
WITH CHECK (
  -- Same conditions for INSERT/UPDATE
  is_authorized_user() OR
  (auth.uid() = user_id AND (
    NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()) OR
    NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
  ))
);