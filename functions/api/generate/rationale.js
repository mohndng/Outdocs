export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const model = 'gemini-pro';
  const apiKey = env.GOOGLE_API_KEY;

  if (!apiKey) {
    return new Response('GOOGLE_API_KEY not set', { status: 500 });
  }

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const requestData = await request.json();
    const { title } = requestData;

    if (!title) {
      return new Response('Missing title', { status: 400 });
    }

    const prompt = `Generate a compelling rationale for a thesis titled '${title}'. The rationale should be well-structured, academic in tone, and suitable for a Filipino university. Explain the problem, the gap in the current research, and the significance of the study. Return only the generated text for the rationale, with no introductory or conversational text.`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const geminiData = await geminiResponse.json();
    const generatedText = geminiData.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ rationale: generatedText.trim() }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response('Error processing request', { status: 500 });
  }
}
