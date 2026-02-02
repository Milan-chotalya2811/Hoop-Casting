-- Create a table for logging admin actions specifically for sensitive operations
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id uuid REFERENCES public.users(id),
    target_user_id uuid REFERENCES public.users(id),
    action_type text NOT NULL, -- 'password_reset_link', 'set_temp_password', etc.
    details text,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Only Admins can insert/view logs
CREATE POLICY "Admins can view and insert logs"
ON public.admin_logs FOR ALL
USING ( is_admin() );
