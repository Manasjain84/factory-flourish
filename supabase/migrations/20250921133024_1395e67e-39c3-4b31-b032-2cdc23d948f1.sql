-- First drop all existing policies on user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;  
DROP POLICY IF EXISTS "Users can manage roles with bootstrap" ON public.user_roles;

-- Create a policy for viewing own roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

-- Create a comprehensive policy that handles the bootstrap scenario
CREATE POLICY "Role management with bootstrap" ON public.user_roles
FOR ALL USING (
  -- Allow if user is already authorized (has admin/hr/manager role)
  is_authorized_user() OR
  -- Allow if this is the user's own record AND they don't have a role yet
  (auth.uid() = user_id AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()
  )) OR
  -- Allow if no admin exists in the system (bootstrap case)
  (auth.uid() = user_id AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  ))
)
WITH CHECK (
  -- Same conditions for INSERT/UPDATE
  is_authorized_user() OR
  (auth.uid() = user_id AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()
  )) OR
  (auth.uid() = user_id AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  ))
);