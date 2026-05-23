
-- Table to track email reads via tracking pixel
CREATE TABLE IF NOT EXISTS public.email_reads (
  email TEXT PRIMARY KEY,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  open_count INTEGER NOT NULL DEFAULT 1
);

ALTER TABLE public.email_reads ENABLE ROW LEVEL SECURITY;

-- No public access; only service role / edge function uses this
CREATE POLICY "no_public_select" ON public.email_reads FOR SELECT USING (false);

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove existing jobs if re-running
DO $$
DECLARE j record;
BEGIN
  FOR j IN SELECT jobid FROM cron.job WHERE jobname IN (
    'daily-test-birthday-email',
    'birthday-email-2026-07-10',
    'birthday-email-resend-2026-07-10'
  ) LOOP
    PERFORM cron.unschedule(j.jobid);
  END LOOP;
END $$;

-- Daily test email at 7:00 AM IST = 01:30 UTC
SELECT cron.schedule(
  'daily-test-birthday-email',
  '30 1 * * *',
  $$
  SELECT net.http_post(
    url := 'https://atnnnakuezzoxsdvcvwp.supabase.co/functions/v1/send-birthday-email',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0bm5uYWt1ZXp6b3hzZHZjdndwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NzI3MzEsImV4cCI6MjA4NzI0ODczMX0.waTDHzb6261GLnOj0OalN8iiCMEVl1ln78RScJVfV4E"}'::jsonb,
    body := '{"test": true}'::jsonb
  );
  $$
);

-- Real birthday: every 10 min on 10 July 2026 between 01:30 UTC (7:00 IST) and 18:30 UTC (00:00 IST next day)
-- Function itself skips recipients who already opened the email.
SELECT cron.schedule(
  'birthday-email-resend-2026-07-10',
  '*/10 1-18 10 7 *',
  $$
  SELECT net.http_post(
    url := 'https://atnnnakuezzoxsdvcvwp.supabase.co/functions/v1/send-birthday-email',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0bm5uYWt1ZXp6b3hzZHZjdndwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NzI3MzEsImV4cCI6MjA4NzI0ODczMX0.waTDHzb6261GLnOj0OalN8iiCMEVl1ln78RScJVfV4E"}'::jsonb,
    body := '{"test": false, "resend_if_unread": true, "not_before_utc": "2026-07-10T01:30:00Z"}'::jsonb
  );
  $$
);
