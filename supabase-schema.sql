-- ============================================================================
-- AURAEX ENTERPRISE — SUPABASE DATABASE SCHEMA
-- ----------------------------------------------------------------------------
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your Auraex Project -> Click on "SQL Editor" on the left menu.
-- 3. Click "New Query", paste this entire SQL script, and click "RUN".
-- ============================================================================

-- 1. USER LOGINS TABLE
-- Tracks every user who signs in (Google OAuth, Email/Password, or Guest)
CREATE TABLE IF NOT EXISTS public.user_logins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  auth_method TEXT DEFAULT 'email-password',
  logged_in_at TIMESTAMPTZ DEFAULT now(),
  user_agent TEXT
);

-- 2. CONTACT & COLLABORATION INQUIRIES TABLE
-- Tracks all messages, briefs, and collaboration requests submitted via the website
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT,
  budget TEXT,
  services TEXT,
  message TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Optional Alias View for "collaborations"
CREATE OR REPLACE VIEW public.collaborations AS
SELECT * FROM public.contact_submissions;

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
-- Enables anonymous visitors and authenticated users to safely insert records
-- while protecting the data from unauthorized modifications.

ALTER TABLE public.user_logins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running script
DROP POLICY IF EXISTS "Allow public insert to user_logins" ON public.user_logins;
DROP POLICY IF EXISTS "Allow public insert to contact_submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Allow owner read to user_logins" ON public.user_logins;
DROP POLICY IF EXISTS "Allow owner read to contact_submissions" ON public.contact_submissions;

-- Allow website visitors to insert their login and inquiry data
CREATE POLICY "Allow public insert to user_logins"
  ON public.user_logins
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public insert to contact_submissions"
  ON public.contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated project members / dashboard to read all data
CREATE POLICY "Allow owner read to user_logins"
  ON public.user_logins
  FOR SELECT
  TO authenticated, service_role
  USING (true);

CREATE POLICY "Allow owner read to contact_submissions"
  ON public.contact_submissions
  FOR SELECT
  TO authenticated, service_role
  USING (true);

-- Indexes for lightning fast searching and sorting in Supabase Studio
CREATE INDEX IF NOT EXISTS idx_user_logins_email ON public.user_logins(email);
CREATE INDEX IF NOT EXISTS idx_user_logins_time ON public.user_logins(logged_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON public.contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_time ON public.contact_submissions(submitted_at DESC);
