export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      // Handle API requests
      return new Response('API request received', { status: 200 });
    }
    // Let Cloudflare Pages handle the static asset serving.
    return env.ASSETS.fetch(request);
  },
};
