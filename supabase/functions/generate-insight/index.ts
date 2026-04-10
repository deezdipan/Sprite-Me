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

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')
    if (!OPENROUTER_API_KEY) throw new Error('Missing OPENROUTER_API_KEY')

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

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sprite-me.vercel.app',
        'X-Title': 'Sprite-Me'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b:free',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 200
      })
    })

    const orData = await response.json()

    if (!response.ok) {
      throw new Error(orData.error?.message || 'OpenRouter API error')
    }

    const insight = orData.choices?.[0]?.message?.content ?? 'No insight generated.'

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
