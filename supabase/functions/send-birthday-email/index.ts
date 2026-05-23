import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const PROD_RECIPIENTS = ['grtkhushee@gmail.com', 'schoudhary11256@gmail.com'];
const TEST_RECIPIENTS = ['griexgamer@gmail.com'];

const SITE_URL = 'https://khushi-birthday-orpin.vercel.app/';
const CAKE_GIF = 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExMm56eHNqODd2MHByYmNhOWg1MGxuYm4zcmo0dWduMGFleWRpYmU2ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/eedT0Gs9T8nIHfIvXy/giphy.gif';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FUNCTION_PUBLIC_URL = `${SUPABASE_URL}/functions/v1/send-birthday-email`;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// 1x1 transparent gif
const PIXEL_BYTES = Uint8Array.from([
  0x47,0x49,0x46,0x38,0x39,0x61,0x01,0x00,0x01,0x00,0x80,0x00,0x00,0xff,0xff,0xff,
  0x00,0x00,0x00,0x21,0xf9,0x04,0x01,0x00,0x00,0x00,0x00,0x2c,0x00,0x00,0x00,0x00,
  0x01,0x00,0x01,0x00,0x00,0x02,0x02,0x44,0x01,0x00,0x3b,
]);

// Personal-style HTML (low promo signals) with subtle CSS animations
// where supported. Plain-text alternative is provided to boost inbox placement.
const buildHtml = (trackingUrl: string) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Happy Birthday Pookie 🎂</title>
<style>
  @keyframes float { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-6px) } }
  @keyframes pop   { 0%{ transform: scale(.9); opacity:.6 } 100%{ transform: scale(1); opacity:1 } }
  @keyframes spin  { 0%{ transform: rotate(-6deg) } 50%{ transform: rotate(6deg) } 100%{ transform: rotate(-6deg) } }
  @keyframes beat  { 0%,100%{ transform: scale(1) } 25%{ transform: scale(1.15) } 50%{ transform: scale(1) } 75%{ transform: scale(1.1) } }
  @keyframes wiggle{ 0%,100%{ transform: rotate(-3deg)} 50%{ transform: rotate(3deg)} }
  .float { animation: float 3s ease-in-out infinite; display:inline-block; }
  .spin  { animation: spin  3.5s ease-in-out infinite; display:inline-block; transform-origin: 50% 80%; }
  .beat  { animation: beat  1.6s ease-in-out infinite; display:inline-block; }
  .pop   { animation: pop   .9s ease-out both; display:inline-block; }
  .wiggle{ animation: wiggle 2s ease-in-out infinite; display:inline-block; }
</style>
</head>
<body style="margin:0;padding:0;background:linear-gradient(135deg,#fff0f6 0%,#ffe4ec 50%,#fde8ff 100%);font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color:#2b2b2b;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Happiest birthday pookie 🎂✨ ek chhota sa surprise tere liye</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:28px 16px;">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid #fad6e6;border-radius:22px;box-shadow:0 10px 40px rgba(232,93,138,0.12);overflow:hidden;">

      <tr><td align="center" style="padding:0;background:linear-gradient(135deg,#ffb6d5 0%,#ff7eb9 50%,#c89bff 100%);">
        <div style="padding:22px 20px 14px;">
          <p style="margin:0;color:#fff;font-size:12px;letter-spacing:2px;opacity:.85;">10 • JULY • 2026</p>
          <h1 style="margin:8px 0 4px;font-size:30px;font-weight:800;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,0.1);">
            Happy Birthday <span class="wiggle">🎀</span>
          </h1>
          <p style="margin:0;color:#fff;font-size:16px;font-weight:600;letter-spacing:.5px;">my pookie ✨</p>
        </div>
      </td></tr>

      <tr><td align="center" style="padding:18px 20px 6px;background:#fff;">
        <img src="${CAKE_GIF}" alt="Birthday cake" width="220" style="display:block;border:0;outline:none;text-decoration:none;border-radius:16px;max-width:80%;height:auto;" />
      </td></tr>

      <tr><td align="center" style="padding:6px 28px 4px;">
        <span class="spin" style="font-size:30px;">🎁</span>
        <span class="float" style="font-size:26px;margin:0 8px;">🎈</span>
        <span class="beat" style="font-size:26px;">💖</span>
        <span class="float" style="font-size:26px;margin:0 8px;">🌷</span>
        <span class="spin" style="font-size:30px;">🧁</span>
      </td></tr>

      <tr><td style="padding:18px 32px 8px;font-size:16px;line-height:1.8;color:#3a2a33;text-align:center;">
        <p style="margin:0 0 10px;font-size:18px;font-weight:600;color:#e85d8a;">Heyyy pookie 🫶</p>
        <p style="margin:0 0 12px;">
          Aaj tera din hai 🎂 — meri sabse pyari, sabse cutie, sabse sweetu behna ka birthday!
        </p>
        <p style="margin:0 0 12px;">
          Tu hamesha aise hi hasti reh, chamakti reh, aur duniya ko apni smile se roshan karti reh ✨
        </p>
        <p style="margin:0 0 12px;color:#b14a78;font-style:italic;">
          "Tere bina ghar suna sa lagta hai, tu hai toh sab kuch perfect lagta hai 💕"
        </p>
      </td></tr>

      <tr><td align="center" style="padding:14px 24px 26px;">
        <a href="${SITE_URL}" style="display:inline-block;background:linear-gradient(135deg,#ff7eb9,#c89bff);color:#ffffff;text-decoration:none;padding:14px 34px;border-radius:999px;font-weight:700;font-size:15px;letter-spacing:.3px;box-shadow:0 8px 20px rgba(232,93,138,0.35);">
          🎁 Open Your Surprise
        </a>
        <p style="margin:14px 0 0;font-size:11px;color:#a98aa0;">click karke surprise khol pookie ☁</p>
      </td></tr>

      <tr><td style="padding:14px 32px 28px;font-size:14px;color:#7a5a68;text-align:center;border-top:1px dashed #fad6e6;">
        with bahut saara pyaar,<br/>
        <span style="font-size:17px;font-weight:700;color:#e85d8a;">— Bhai 🫶</span>
      </td></tr>

    </table>
    <p style="margin:14px 0 0;color:#c8a8b8;font-size:11px;">sirf tere liye • reply kar dena pookie 💌</p>
  </td></tr>
</table>
<img src="${trackingUrl}" width="1" height="1" alt="" style="display:none;border:0;outline:none;" />
</body>
</html>`;

const buildText = () => `Happy Birthday Pookie 🎂✨

10 July 2026

Heyyy pookie 🫶

Aaj tera din hai — meri sabse pyari, sabse cutie, sabse sweetu behna ka birthday!
Tu hamesha aise hi hasti reh, chamakti reh, aur duniya ko apni smile se roshan karti reh.

"Tere bina ghar suna sa lagta hai, tu hai toh sab kuch perfect lagta hai 💕"

Tera surprise yahan hai 👉 ${SITE_URL}

with bahut saara pyaar,
— Bhai
`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured');

    let test = false;
    if (req.method === 'POST') {
      try { const b = await req.json(); test = !!b?.test; } catch {}
    }
    const recipients = test ? TEST_RECIPIENTS : PROD_RECIPIENTS;

    const html = buildHtml();
    const results: Array<{ to: string; ok: boolean; data?: unknown; error?: string }> = [];

    for (const to of recipients) {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Sumit (Bhai) <bhai@heartable.site>',
          to: [to],
          reply_to: 'schoudhary11256@gmail.com',
          subject: 'Happy Birthday Pookie 🎂✨ ek surprise tere liye',
          html,
          text: buildText(),
          headers: {
            'List-Unsubscribe': '<mailto:schoudhary11256@gmail.com?subject=unsubscribe>',
          },
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