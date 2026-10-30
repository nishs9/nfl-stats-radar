import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const dataApiBaseUrl = process.env.DATA_API_BASE_URL;
    //const dataApiAccessKey = process.env.DATA_API_ACCESS_KEY

    if (!dataApiBaseUrl) {
      console.error("Data API configuration is missing!");
      return NextResponse.json(
        {error: "Data API not configured!"}, 
        {status: 500}
      );
    }

    const dataApiEndpoint = new URL(
      `/api/search/${encodeURIComponent(query)}`,
      dataApiBaseUrl,
    );

    console.log(dataApiEndpoint);

    const response = await fetch(dataApiEndpoint, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })

    const responseBody = await response.text();
  
    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        'Content-Type':
          response.headers.get('content-type') ?? 'application-json',
      },
    });
  } catch (error) {
    console.error('Data API search request failed:', error);
    return NextResponse.json(
      { error: 'Data service is unavailable' },
      { status: 502 },
    );
  }
}