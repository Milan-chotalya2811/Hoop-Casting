-- 1. Create the form_fields table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.form_fields (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    label text NOT NULL,
    name text NOT NULL UNIQUE,
    type text NOT NULL CHECK (type IN ('text', 'number', 'dropdown', 'checkbox', 'file')),
    required boolean DEFAULT false,
    options text[], -- for dropdowns
    order_index int DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Now it is safe to enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
