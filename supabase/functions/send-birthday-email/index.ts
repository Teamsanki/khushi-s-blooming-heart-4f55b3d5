import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const RECIPIENTS = ['grtkhushee@gmail.com', 'schoudhary11256@gmail.com'];

const buildHtml = () => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Happy Birthday Khushi 🎂</title>
</head>
<body style="margin:0;padding:0;background:#fff5f8;font-family:'Segoe UI',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#ffe0ec 0%,#fff5e6 50%,#ffe0ec 100%);padding:40px 16px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:24px;box-shadow:0 20px 60px rgba(232,93,138,0.25);overflow:hidden;">

      <!-- Header banner -->
      <tr><td align="center" style="background:linear-gradient(135deg,#ff6b9d 0%,#ffa07a 50%,#ffd93d 100%);padding:48px 24px 32px;position:relative;">
        <div style="font-size:72px;line-height:1;animation:bounce 2s infinite;">🎁</div>
        <h1 style="margin:16px 0 8px;color:#fff;font-size:36px;font-weight:800;letter-spacing:1px;text-shadow:0 2px 10px rgba(0,0,0,0.15);">
          Happy Birthday Khushi! 🎂
        </h1>
        <p style="margin:0;color:#fff;font-size:16px;opacity:0.95;">✨ 10 July 2026 ✨</p>
      </td></tr>

      <!-- Floating emojis row -->
      <tr><td align="center" style="background:#fff;padding:20px 16px 0;">
        <div style="font-size:28px;letter-spacing:8px;">🎈 💖 🌸 🦋 💝 🎀 ✨</div>
      </td></tr>

      <!-- Main message -->
      <tr><td style="padding:32px 40px;">
        <h2 style="margin:0 0 16px;color:#e85d8a;font-size:24px;font-weight:700;text-align:center;">
          Meri Pyari Behna 💕
        </h2>
        <p style="margin:0 0 16px;color:#444;font-size:16px;line-height:1.7;text-align:center;">
          Aaj tera special day hai, aur duniya ki sabse pyari pookie ko bhaut saara pyaar aur dher saari wishes 🌷
        </p>
        <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.8;text-align:center;font-style:italic;">
          "Tu meri zindagi ki sabse khoobsurat khushi hai 🌸<br/>
          Tere bina har din adhura sa lagta hai 💫<br/>
          God bless you with infinite happiness, success aur pyaar 💖<br/>
          Tu hamesha muskurati rahe, chamakti rahe aur khush rahe ✨"
        </p>
      </td></tr>

      <!-- Gift box card -->
      <tr><td align="center" style="padding:8px 40px 32px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#fff0f5 0%,#fff8e7 100%);border-radius:20px;padding:28px 24px;border:2px dashed #ff6b9d;width:100%;">
          <tr><td align="center">
            <div style="font-size:64px;line-height:1;margin-bottom:8px;">🎁✨</div>
            <p style="margin:8px 0 0;color:#e85d8a;font-size:18px;font-weight:700;">
              Tera Surprise Ready Hai! 🎉
            </p>
            <p style="margin:8px 0 0;color:#777;font-size:14px;">
              Bhai ne tere liye kuch special banaya hai 💝
            </p>
          </td></tr>
        </table>
      </td></tr>

      <!-- CTA Button -->
      <tr><td align="center" style="padding:0 40px 40px;">
        <a href="https://id-preview--79ebd4d6-688e-48ff-b833-a022260710f6.lovable.app"
           style="display:inline-block;background:linear-gradient(135deg,#ff6b9d 0%,#ff8e53 100%);color:#fff;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:16px;font-weight:700;box-shadow:0 8px 20px rgba(255,107,157,0.4);letter-spacing:0.5px;">
          🌸 Open Your Surprise 🌸
        </a>
      </td></tr>

      <!-- Footer -->
      <tr><td align="center" style="background:linear-gradient(135deg,#fff0f5 0%,#fff8e7 100%);padding:24px;">
        <p style="margin:0 0 6px;color:#999;font-size:13px;">made with 💖 by</p>
        <p style="margin:0;color:#e85d8a;font-size:15px;font-weight:700;">Sumit urf Tera Sanki 😎</p>
        <div style="margin-top:12px;font-size:20px;letter-spacing:6px;">🌷 💕 🦋 💝 🌸</div>
      </td></tr>

    </table>
    <p style="margin:20px 0 0;color:#bbb;font-size:11px;">This is an automated birthday surprise 🎂</p>
  </td></tr>
</table>
</body>
</html>`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured');

    const html = buildHtml();
    const results: Array<{ to: string; ok: boolean; data?: unknown; error?: string }> = [];

    for (const to of RECIPIENTS) {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Tera Sanki <onboarding@resend.dev>',
          to: [to],
          subject: '🎂 Happy Birthday Khushi — A Special Surprise For You! 🎁✨',
          html,
        }),
      });
      const data = await r.json();
      results.push({ to, ok: r.ok, ...(r.ok ? { data } : { error: JSON.stringify(data) }) });
    }

    return new Response(JSON.stringify({ sent_at: new Date().toISOString(), results }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});