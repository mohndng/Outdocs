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
    const { keywords } = requestData;

    if (!keywords || keywords.length === 0) {
      return new Response('Missing keywords', { status: 400 });
    }

    const prompt = `Generate exactly 5 academic thesis titles for a study in the Philippines about: ${keywords.join(', ')}. The titles should be formal and suitable for a university thesis. Return only a numbered list of the titles, with no introductory text, explanations, or conversational filler.`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const geminiData = await geminiResponse.json();

    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      let errorMessage = 'The AI did not return a valid response.';
      if (geminiData.promptFeedback && geminiData.promptFeedback.blockReason) {
        errorMessage = `The AI response was blocked. Reason: ${geminiData.promptFeedback.blockReason}. Please try rephrasing your keywords.`;
      }
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const generatedText = geminiData.candidates[0].content.parts[0].text;
    const potential_titles = generatedText.split('\n').filter(line => line.trim());
    const cleaned_titles = potential_titles.map(title => {
      let cleaned_title = title.replace(/^\s*\d+\.\s*|\*\s*/, '');
      cleaned_title = cleaned_title.trim('\'"');
      return cleaned_title;
    }).filter(title => title.length > 20);

    return new Response(JSON.stringify({ titles: cleaned_titles }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response('Error processing request', { status: 500 });
  }
}
