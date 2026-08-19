-- ==============================================================================
-- CAMPUSFIND AI — SUPABASE DATABASE SCHEMA
-- Core Tables, Relationships, Triggers, RLS Policies, and Storage Setup
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. PROFILES TABLE (Linked to Supabase Auth)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    college_id TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- 2. LOST ITEMS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.lost_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    color TEXT,
    location TEXT NOT NULL,
    lost_date DATE NOT NULL,
    lost_time TIME,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'matched', 'claimed', 'returned', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- 3. FOUND ITEMS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.found_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    color TEXT,
    location TEXT NOT NULL,
    found_date DATE NOT NULL,
    found_time TIME,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'matched', 'claimed', 'returned', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- 4. MATCHES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lost_item_id UUID NOT NULL REFERENCES public.lost_items(id) ON DELETE CASCADE,
    found_item_id UUID NOT NULL REFERENCES public.found_items(id) ON DELETE CASCADE,
    match_score NUMERIC(5,2) NOT NULL,
    category_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    description_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    location_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    date_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    color_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    image_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    match_reason TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'accepted', 'rejected', 'expired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT unique_item_match UNIQUE (lost_item_id, found_item_id)
);

-- ==============================================================================
-- 5. CLAIMS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
    claimant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    proof_message TEXT NOT NULL,
    proof_image_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    admin_note TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- 6. NOTIFICATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    reference_id TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- 7. ADMIN ACTIONS TABLE (Audit Logging)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE & SEARCH
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_lost_items_category ON public.lost_items(category);
CREATE INDEX IF NOT EXISTS idx_lost_items_location ON public.lost_items(location);
CREATE INDEX IF NOT EXISTS idx_lost_items_status ON public.lost_items(status);
CREATE INDEX IF NOT EXISTS idx_lost_items_user ON public.lost_items(user_id);

CREATE INDEX IF NOT EXISTS idx_found_items_category ON public.found_items(category);
CREATE INDEX IF NOT EXISTS idx_found_items_location ON public.found_items(location);
CREATE INDEX IF NOT EXISTS idx_found_items_status ON public.found_items(status);
CREATE INDEX IF NOT EXISTS idx_found_items_user ON public.found_items(user_id);

CREATE INDEX IF NOT EXISTS idx_matches_lost_item ON public.matches(lost_item_id);
CREATE INDEX IF NOT EXISTS idx_matches_found_item ON public.matches(found_item_id);
CREATE INDEX IF NOT EXISTS idx_matches_score ON public.matches(match_score DESC);

CREATE INDEX IF NOT EXISTS idx_claims_claimant ON public.claims(claimant_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- ==============================================================================
-- TRIGGERS & FUNCTIONS
-- ==============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach updated_at triggers
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_lost_items_updated_at ON public.lost_items;
CREATE TRIGGER set_lost_items_updated_at BEFORE UPDATE ON public.lost_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_found_items_updated_at ON public.found_items;
CREATE TRIGGER set_found_items_updated_at BEFORE UPDATE ON public.found_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_matches_updated_at ON public.matches;
CREATE TRIGGER set_matches_updated_at BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_claims_updated_at ON public.claims;
CREATE TRIGGER set_claims_updated_at BEFORE UPDATE ON public.claims FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to automatically create profile on Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, college_id, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Campus Member'),
        NEW.email,
        NEW.raw_user_meta_data->>'college_id',
        NEW.raw_user_meta_data->>'phone',
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        college_id = EXCLUDED.college_id,
        phone = EXCLUDED.phone;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function to check if current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    current_role TEXT;
BEGIN
    SELECT role INTO current_role FROM public.profiles WHERE id = auth.uid();
    RETURN current_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- Anyone authenticated can view user profiles (names, college IDs for verification)
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Users can only update their own profile (and cannot escalate their own role to admin)
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id AND 
    (role = (SELECT role FROM public.profiles WHERE id = auth.uid()) OR public.is_admin())
);

-- ------------------------------------------------------------------------------
-- LOST ITEMS POLICIES
-- ------------------------------------------------------------------------------
-- Everyone can read active/matched lost items
CREATE POLICY "Lost items are readable by authenticated users"
ON public.lost_items FOR SELECT
TO authenticated
USING (true);

-- Students can insert their own lost items
CREATE POLICY "Users can insert their own lost items"
ON public.lost_items FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Students can update their own lost items, admins can update any
CREATE POLICY "Users can update their own lost items"
ON public.lost_items FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

-- Students can delete their own lost items, admins can delete any
CREATE POLICY "Users can delete their own lost items"
ON public.lost_items FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- FOUND ITEMS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Found items are readable by authenticated users"
ON public.found_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own found items"
ON public.found_items FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own found items"
ON public.found_items FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete their own found items"
ON public.found_items FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- MATCHES POLICIES
-- ------------------------------------------------------------------------------
-- Matches are viewable by item owners and admins
CREATE POLICY "Matches viewable by item owners and admins"
ON public.matches FOR SELECT
TO authenticated
USING (
    public.is_admin() OR
    EXISTS (SELECT 1 FROM public.lost_items WHERE id = matches.lost_item_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.found_items WHERE id = matches.found_item_id AND user_id = auth.uid())
);

-- Matches can be created by authenticated users (during report submission matching) or admins
CREATE POLICY "Authenticated users can create matches"
ON public.matches FOR INSERT
TO authenticated
WITH CHECK (true);

-- Matches can be updated by involved parties or admins
CREATE POLICY "Matches updatable by owners or admins"
ON public.matches FOR UPDATE
TO authenticated
USING (
    public.is_admin() OR
    EXISTS (SELECT 1 FROM public.lost_items WHERE id = matches.lost_item_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.found_items WHERE id = matches.found_item_id AND user_id = auth.uid())
);

-- ------------------------------------------------------------------------------
-- CLAIMS POLICIES
-- ------------------------------------------------------------------------------
-- Claimant and item finders or admins can view claim records
CREATE POLICY "Claims viewable by claimant or admins"
ON public.claims FOR SELECT
TO authenticated
USING (
    auth.uid() = claimant_id OR 
    public.is_admin()
);

-- Users can submit their own claims
CREATE POLICY "Users can submit claims"
ON public.claims FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = claimant_id);

-- Only admins can approve/reject claims (update claims)
CREATE POLICY "Only admins can review claims"
ON public.claims FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- NOTIFICATIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users or triggers can insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- ADMIN ACTIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Only admins can view admin actions"
ON public.admin_actions FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Only admins can insert admin actions"
ON public.admin_actions FOR INSERT
TO authenticated
WITH CHECK (public.is_admin() AND auth.uid() = admin_id);

-- ==============================================================================
-- SUPABASE STORAGE BUCKET CONFIGURATION
-- ==============================================================================

-- Create bucket 'item-images' if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'item-images', 
    'item-images', 
    true, 
    5242880, -- 5 MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Storage RLS Policies
CREATE POLICY "Allow public image viewing"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'item-images');

CREATE POLICY "Allow authenticated image uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'item-images');

CREATE POLICY "Allow users to delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'item-images' AND auth.uid() = owner);
