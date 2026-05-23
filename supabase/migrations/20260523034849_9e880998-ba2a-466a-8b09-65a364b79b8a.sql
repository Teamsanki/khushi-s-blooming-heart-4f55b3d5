
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove existing jobs if re-running
DO $$
DECLARE j record;
BEGIN
  FOR j IN SELECT jobid FROM cron.job WHERE jobname IN ('daily-test-birthday-email','birthday-email-2026-07-10') LOOP
    PERFORM cron.unschedule(j.jobid);
  END LOOP;
END $$;

-- Daily test email at 10:05 AM IST = 04:35 UTC
SELECT cron.schedule(
  'daily-test-birthday-email',
  '35 4 * * *',
  $$
  SELECT net.http_post(
    url := 'https://atnnnakuezzoxsdvcvwp.supabase.co/functions/v1/send-birthday-email',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0bm5uYWt1ZXp6b3hzZHZjdndwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NzI3MzEsImV4cCI6MjA4NzI0ODczMX0.waTDHzb6261GLnOj0OalN8iiCMEVl1ln78RScJVfV4E"}'::jsonb,
    body := '{"test": true}'::jsonb
  );
  $$
);

-- Real birthday email on 10 July 2026 at 10:05 AM IST = 04:35 UTC on 10 July
SELECT cron.schedule(
  'birthday-email-2026-07-10',
  '35 4 10 7 *',
  $$
  SELECT net.http_post(
    url := 'https://atnnnakuezzoxsdvcvwp.supabase.co/functions/v1/send-birthday-email',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0bm5uYWt1ZXp6b3hzZHZjdndwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NzI3MzEsImV4cCI6MjA4NzI0ODczMX0.waTDHzb6261GLnOj0OalN8iiCMEVl1ln78RScJVfV4E"}'::jsonb,
    body := '{"test": false}'::jsonb
  );
  $$
);
