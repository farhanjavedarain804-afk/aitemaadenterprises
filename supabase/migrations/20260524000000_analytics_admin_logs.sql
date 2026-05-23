-- Visitor analytics (public site tracking)
CREATE TABLE public.analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  location TEXT,
  device TEXT,
  browser TEXT,
  page_url TEXT,
  stay_time_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics" ON public.analytics
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update analytics" ON public.analytics
  FOR UPDATE TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can view analytics" ON public.analytics
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_analytics_last_active ON public.analytics(last_active_at DESC);

-- Admin audit trail
CREATE TABLE public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  action_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can insert admin_logs" ON public.admin_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view admin_logs" ON public.admin_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_admin_logs_created_at ON public.admin_logs(created_at DESC);
