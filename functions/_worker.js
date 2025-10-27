export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
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

        if (url.pathname === '/api/generate/title') {
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

        } else if (url.pathname === '/api/generate/rationale') {
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
        }
      } catch (e) {
        return new Response('Error processing request', { status: 500 });
      }
    }
    // Let Cloudflare Pages handle the static asset serving.
    return env.ASSETS.fetch(request);
  },
};
