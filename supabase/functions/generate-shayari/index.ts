import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "shayari") {
      systemPrompt = "Tum ek Hindi shayari poet ho. Sirf ek chhoti si 2-3 line ki shayari likho behen ke birthday ke liye. Pyaar, dua, aur khushi ka theme rakho. Hinglish mein likho (Hindi words in English letters). Koi greeting ya explanation mat do, sirf shayari likho. Emojis use karo.";
      userPrompt = "Ek nayi unique birthday shayari likho behen ke liye. Bahut chhoti rakho, 2-3 lines max.";
    } else if (type === "ending") {
      systemPrompt = "Tum ek Hindi message writer ho. Ek emotional birthday message likho behen ke liye. Hinglish mein likho. 3-4 lines ka message hona chahiye jo dil ko chhoo le. Sirf message likho, koi greeting prefix mat do. Emojis use karo end mein.";
      userPrompt = "Ek emotional aur pyaara birthday message likho junior behen Khushi ke liye jo college mein hai. Bahut khaas insaan hai wo.";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "Happy Birthday Khushi! 🎂💖";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    const fallback = "Khushi, tu sabse pyaari hai, teri hasi mein duniya basi hai 💖🎂";
    return new Response(JSON.stringify({ text: fallback }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
