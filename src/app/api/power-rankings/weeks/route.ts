import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const dataApiBaseUrl = process.env.DATA_API_BASE_URL;
    const dataApiAccessKey = process.env.DATA_API_ACCESS_KEY;

    if (!dataApiBaseUrl || !dataApiAccessKey) {
      const errMsg = "Data API configuration is missing";
      console.error(errMsg);
      return NextResponse.json(
        {error: errMsg},
        {status: 500}
      );
    }

    const dataApiEndpoint = new URL('/api/power-rankings/weeks', dataApiBaseUrl);
    const response = await fetch(dataApiEndpoint, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
      headers: { Authorization: `Bearer ${dataApiAccessKey}` }
    })

    const responseBody = await response.text();
  
    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') ?? 'application-json'
      },
    });
  } catch (error) {
    console.error('Error fetching available weeks:', error);
    return NextResponse.json({ error: 'An error occurred fetching available weeks' }, { status: 500 });
  }
}

