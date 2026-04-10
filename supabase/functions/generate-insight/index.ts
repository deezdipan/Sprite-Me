import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { profile, stats } = await req.json()

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY')

    const ageContext = profile.age
      ? `The user is ${profile.age} years old (${profile.gender}).`
      : 'Age not provided.'

    // Age-based recommended daily soda guideline
    let recommendation = ''
    if (profile.age) {
      if (profile.age < 13) {
        recommendation = 'For children under 13, health experts recommend avoiding soda entirely or limiting it to very rare occasions.'
      } else if (profile.age < 18) {
        recommendation = 'For teenagers, health experts recommend no more than 8 oz of soda per day.'
      } else if (profile.age < 65) {
        recommendation = 'For adults, health experts generally recommend limiting soda to 8–12 oz per day or fewer.'
      } else {
        recommendation = 'For older adults, experts recommend limiting soda due to sugar and caffeine sensitivity — ideally under 8 oz per day.'
      }
    }

    const prompt = `You are a friendly, witty health advisor with a fun Sprite-branded personality.
${ageContext}
${recommendation}

Here are their Sprite drinking stats:
- Total drinks logged all-time: ${stats.totalDrinks}
- Today's intake: ${stats.todayOz} oz
- Average daily intake (last 7 days): ${stats.avgDailyOz} oz
- Total log entries: ${stats.totalLogs}

Give a personalized, friendly insight (3–4 sentences max) about their Sprite intake.
- Reference their age-based recommendation naturally
- Be encouraging and non-judgmental
- Add a tiny bit of Sprite/soda humor
- End with one practical tip
- Address them by name if available: ${profile.name || 'there'}
Do NOT use markdown formatting or bullet points. Just plain conversational text.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 200
          }
        })
      }
    )

    const geminiData = await response.json()

    if (!response.ok) {
      throw new Error(geminiData.error?.message || 'Gemini API error')
    }

    const insight = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No insight generated.'

    return new Response(
      JSON.stringify({ insight }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
