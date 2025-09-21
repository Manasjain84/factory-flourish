-- Recreate all RLS policies

-- USER ROLES policies
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

-- Bootstrap policy allows first admin or users without roles to set roles
CREATE POLICY "Bootstrap admin creation" ON public.user_roles
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND (
    -- Allow if no admin exists (bootstrap case)
    NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') OR
    -- Allow if user has no role yet
    NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid())
  )
);

-- Authorized users can manage all roles
CREATE POLICY "Authorized users can manage roles" ON public.user_roles
FOR ALL USING (is_authorized_user())
WITH CHECK (is_authorized_user());

-- WORKERS table policies
CREATE POLICY "Authorized users can view workers" ON public.workers
FOR SELECT USING (is_authorized_user());

CREATE POLICY "Authorized users can create workers" ON public.workers
FOR INSERT WITH CHECK (is_authorized_user());

CREATE POLICY "Authorized users can update workers" ON public.workers
FOR UPDATE USING (is_authorized_user());

CREATE POLICY "Authorized users can delete workers" ON public.workers
FOR DELETE USING (is_authorized_user());

-- MONTHLY WAGES table policies
CREATE POLICY "Authorized users can view monthly wages" ON public.monthly_wages
FOR SELECT USING (is_authorized_user());

CREATE POLICY "Authorized users can create monthly wages" ON public.monthly_wages
FOR INSERT WITH CHECK (is_authorized_user());

CREATE POLICY "Authorized users can update monthly wages" ON public.monthly_wages
FOR UPDATE USING (is_authorized_user());

CREATE POLICY "Authorized users can delete monthly wages" ON public.monthly_wages
FOR DELETE USING (is_authorized_user());