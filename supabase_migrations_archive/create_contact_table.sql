-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile TEXT, -- Optional or Required? User asked to ADD mobile.
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Super Admin can select
CREATE POLICY "Super Admins can view contact submissions" 
    ON contact_submissions FOR SELECT 
    USING (
        auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'super_admin'
        )
    );

-- Policy: Super Admin can delete
CREATE POLICY "Super Admins can delete contact submissions" 
    ON contact_submissions FOR DELETE 
    USING (
        auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'super_admin'
        )
    );

-- Policy: Public/Anon can insert
CREATE POLICY "Anyone can insert contact submissions" 
    ON contact_submissions FOR INSERT 
    WITH CHECK (true);
