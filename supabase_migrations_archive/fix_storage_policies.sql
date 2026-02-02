-- Instructions:
-- Run this in Supabase SQL Editor to make the storage bucket publicly readable.
-- This ensures images (like profile photos) can be seen by the website.

-- 1. Create the bucket if it doesn't exist (fails silently if exists usually, but good to ensure)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('talent-media', 'talent-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Media is publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own media" ON storage.objects;

-- 3. Create Policy: Public Read Access (Anyone can view images)
CREATE POLICY "Media is publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'talent-media' );

-- 4. Create Policy: Authenticated Upload (Users can upload to their own folder)
-- We enforce folder structure via the path check: user_id/*
CREATE POLICY "Users can upload their own media"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'talent-media' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Create Policy: Authenticated Update
CREATE POLICY "Users can update their own media"
ON storage.objects FOR UPDATE
WITH CHECK (
    bucket_id = 'talent-media' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. Create Policy: Authenticated Delete
CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'talent-media' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
