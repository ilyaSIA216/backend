export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  return new Response(
    JSON.stringify({
      success: true,
      message: 'Edge Function работает!',
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
