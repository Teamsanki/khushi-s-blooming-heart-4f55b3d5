import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const PROD_RECIPIENTS = ['grtkhushee@gmail.com', 'schoudhary11256@gmail.com'];
const TEST_RECIPIENTS = ['griexgamer@gmail.com'];

const SITE_URL = 'https://id-preview--79ebd4d6-688e-48ff-b833-a022260710f6.lovable.app';

// Personal-style HTML (low promo signals) with subtle CSS animations
// where supported. Plain-text alternative is provided to boost inbox placement.
const buildHtml = () => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Khushi</title>
<style>
  @keyframes float { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-6px) } }
  @keyframes pop   { 0%{ transform: scale(.9); opacity:.6 } 100%{ transform: scale(1); opacity:1 } }
  @keyframes spin  { 0%{ transform: rotate(-6deg) } 50%{ transform: rotate(6deg) } 100%{ transform: rotate(-6deg) } }
  @keyframes beat  { 0%,100%{ transform: scale(1) } 25%{ transform: scale(1.15) } 50%{ transform: scale(1) } 75%{ transform: scale(1.1) } }
  .float { animation: float 3s ease-in-out infinite; display:inline-block; }
  .spin  { animation: spin  3.5s ease-in-out infinite; display:inline-block; transform-origin: 50% 80%; }
  .beat  { animation: beat  1.6s ease-in-out infinite; display:inline-block; }
  .pop   { animation: pop   .9s ease-out both; display:inline-block; }
  a.soft { color:#b14a78; text-decoration: none; border-bottom: 1px dotted #b14a78; }
</style>
</head>
<body style="margin:0;padding:0;background:#faf7f3;font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color:#2b2b2b;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Bhai ne kuch likha hai tere liye — chhota sa note ❤</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:28px 16px;">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid #efe7df;border-radius:14px;">

      <tr><td style="padding:28px 32px 8px;">
        <p style="margin:0;color:#8a8a8a;font-size:13px;">10 July 2026</p>
        <h2 style="margin:6px 0 0;font-size:22px;font-weight:600;color:#222;">
          Meri pyari behna <span class="beat" style="color:#e85d8a;">❤</span>
        </h2>
      </td></tr>

      <tr><td align="center" style="padding:14px 32px 4px;">
        <span class="spin"  style="font-size:46px;">🎁</span>
        <span class="float" style="font-size:34px;margin:0 6px;">🎈</span>
        <span class="pop"   style="font-size:40px;">🌷</span>
      </td></tr>

      <tr><td style="padding:18px 32px 4px;font-size:15.5px;line-height:1.75;color:#333;">
        <p style="margin:0 0 12px;">Khushi,</p>
        <p style="margin:0 0 12px;">
          Aaj tera din hai. Bas itna kehna tha — tu meri zindagi ki sabse pyari khushi hai.
          Jis din tu hasti hai, ghar pura chamak jata hai. ✨
        </p>
        <p style="margin:0 0 12px;">
          Tere liye ek chhota sa surprise banaya hai — saare purane photos, kuch shayari, ek
          chhota sa game, aur bahut saara pyaar. Aaram se kholna, akele baith ke dekhna.
        </p>
        <p style="margin:0 0 12px;">
          God tujhe duniya bhar ki khushiyan de. Jo bhi chahti hai, sab mile.
          Hamesha muskurati reh — ye smile mat kho dena kabhi. 🌸
        </p>
        <p style="margin:18px 0 4px;">
          Tera surprise yahan hai:<br/>
          <a class="soft" href="${SITE_URL}">${SITE_URL.replace('https://','')}</a>
        </p>
      </td></tr>

      <tr><td style="padding:22px 32px 28px;font-size:14px;color:#555;">
        Bahut pyaar,<br/>
        — Bhai <span class="float" style="display:inline-block;">🫶</span>
      </td></tr>

    </table>
    <p style="margin:14px 0 0;color:#b8b8b8;font-size:11px;">Sirf tere liye • reply kar dena padhne ke baad ❤</p>
  </td></tr>
</table>
</body>
</html>`;

const buildText = () => `Meri pyari behna ❤

10 July 2026

Khushi,

Aaj tera din hai. Bas itna kehna tha — tu meri zindagi ki sabse pyari khushi hai.
Jis din tu hasti hai, ghar pura chamak jata hai.

Tere liye ek chhota sa surprise banaya hai — purane photos, kuch shayari, ek
chhota sa game, aur bahut saara pyaar. Aaram se kholna.

God tujhe duniya bhar ki khushiyan de. Hamesha muskurati reh.

Tera surprise: ${SITE_URL}

Bahut pyaar,
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
          subject: 'Khushi, ek chhota sa note tere liye',
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