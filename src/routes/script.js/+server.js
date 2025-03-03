export async function GET() {
    const externalUrl = 'https://cloud.umami.is/script.js';
  
    const response = await fetch(externalUrl);
  
    if (!response.ok) {
      return new Response('Failed to fetch the script', { status: 500 });
    }
  
    return new Response(response.body, {
      headers: {
        'Content-Type': 'application/javascript',
      },
    });
  }