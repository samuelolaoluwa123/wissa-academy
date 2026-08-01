// app/api/ai/generate-quiz/route.js
// Server-only route — the ANTHROPIC_API_KEY never reaches the browser.
// Requires ANTHROPIC_API_KEY to be set in your project's environment variables
// (.env.local for dev, and your hosting provider's env settings for production).

export async function POST(req) {
  try {
    const { lessonContent, topic, numQuestions } = await req.json()

    if (!lessonContent || lessonContent.trim().length < 20) {
      return Response.json(
        { error: 'Please provide more lesson content to generate meaningful questions from (at least a few sentences).' },
        { status: 400 }
      )
    }

    const count = Math.min(Math.max(parseInt(numQuestions) || 20, 1), 30)

    const systemPrompt = `You are an assistant that writes multiple-choice quiz questions for an online bootcamp course.
Given lesson content, generate exactly ${count} multiple-choice questions that test understanding of that material.

Rules:
- Each question must have exactly 4 answer options.
- Exactly one option must be correct.
- Include a short explanation (1-2 sentences) for why the correct answer is right.
- Questions should be clear, unambiguous, and appropriate for a beginner-to-intermediate learner.
- Do not include questions that require seeing an image, diagram, or code the student cannot see.
- Vary question difficulty and phrasing style across the set.
- Respond with ONLY a JSON array, no prose, no markdown code fences, no explanation outside the JSON.

Format exactly like this:
[
  {
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "correct_index": 0,
    "explanation": "string"
  }
]`

    const userPrompt = `Topic: ${topic || 'General lesson content'}\n\nLesson content:\n${lessonContent}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Anthropic API error:', errText)
      return Response.json({ error: 'The AI service returned an error. Please try again.' }, { status: 502 })
    }

    const data = await response.json()
    const rawText = data.content?.find(b => b.type === 'text')?.text || ''

    // Strip markdown code fences if the model added them despite instructions
    const cleaned = rawText.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '')

    let questions
    try {
      questions = JSON.parse(cleaned)
    } catch (parseErr) {
      console.error('Failed to parse AI response as JSON:', cleaned)
      return Response.json({ error: 'The AI response could not be read. Please try generating again.' }, { status: 502 })
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return Response.json({ error: 'The AI did not return any usable questions. Please try again.' }, { status: 502 })
    }

    // Basic shape validation — drop any malformed entries rather than failing the whole batch
    const validQuestions = questions.filter(q =>
      q && typeof q.question === 'string' &&
      Array.isArray(q.options) && q.options.length === 4 &&
      typeof q.correct_index === 'number' && q.correct_index >= 0 && q.correct_index <= 3
    )

    if (validQuestions.length === 0) {
      return Response.json({ error: 'The AI response did not contain valid questions. Please try again.' }, { status: 502 })
    }

    return Response.json({ questions: validQuestions })
  } catch (err) {
    console.error('generate-quiz route error:', err)
    return Response.json({ error: 'Something went wrong generating questions. Please try again.' }, { status: 500 })
  }
}