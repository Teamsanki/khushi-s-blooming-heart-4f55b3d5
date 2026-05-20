CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule: 10 July IST 00:00 = 9 July 18:30 UTC (annual, fires every year on Khushi's birthday)
SELECT cron.schedule(
  'khushi-birthday-email',
  '30 18 9 7 *',
  $$
  SELECT net.http_post(
    url := 'https://atnnnakuezzoxsdvcvwp.supabase.co/functions/v1/send-birthday-email',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0bm5uYWt1ZXp6b3hzZHZjdndwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NzI3MzEsImV4cCI6MjA4NzI0ODczMX0.waTDHzb6261GLnOj0OalN8iiCMEVl1ln78RScJVfV4E"}'::jsonb,
    body := '{"trigger":"cron"}'::jsonb
  );
  $$
);