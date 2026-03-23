export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return cors(null, 204);
    }

    if (request.method !== 'POST') {
      return cors(JSON.stringify({ error: 'Method not allowed' }), 405);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return cors(JSON.stringify({ error: 'Invalid JSON' }), 400);
    }

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    return cors(text, upstream.status);
  },
};

function cors(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
