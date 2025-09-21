-- Recreate all RLS policies now that the function is fixed

-- User roles policies (non-recursive)
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Bootstrap admin creation" ON public.user_roles
FOR INSERT WITH CHECK (
  -- Allow if this is the first admin (no admin exists yet) OR user has no role yet
  auth.uid() = user_id AND (
    NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') OR
    NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Authorized users can manage roles" ON public.user_roles
FOR ALL USING (is_authorized_user())
WITH CHECK (is_authorized_user());

-- Workers table policies
CREATE POLICY "Admin: View workers" ON public.workers
FOR SELECT USING (is_authorized_user());

CREATE POLICY "Admin: Create workers" ON public.workers
FOR INSERT WITH CHECK (is_authorized_user());

CREATE POLICY "Admin: Update workers" ON public.workers
FOR UPDATE USING (is_authorized_user());

CREATE POLICY "Admin: Delete workers" ON public.workers
FOR DELETE USING (is_authorized_user());

-- Monthly wages policies
CREATE POLICY "Admin: View monthly wages" ON public.monthly_wages
FOR SELECT USING (is_authorized_user());

CREATE POLICY "Admin: Create monthly wages" ON public.monthly_wages
FOR INSERT WITH CHECK (is_authorized_user());

CREATE POLICY "Admin: Update monthly wages" ON public.monthly_wages
FOR UPDATE USING (is_authorized_user());

CREATE POLICY "Admin: Delete monthly wages" ON public.monthly_wages
FOR DELETE USING (is_authorized_user());