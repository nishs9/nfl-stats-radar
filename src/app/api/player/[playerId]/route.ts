import { NextRequest, NextResponse } from 'next/server';

// Correct the type definition for the second argument using destructuring
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const fullParams = await params;
    const playerId = fullParams.playerId;
    const dataApiBaseUrl = process.env.DATA_API_BASE_URL;
    // const dataApiAccessKey = process.env.DATA_API_ACCESS_KEY;

    if (!playerId) {
      const errMsg = "Player ID is a required input!";
      console.error(errMsg);
      return NextResponse.json(
        {error: errMsg},
        {status: 400}
      );
    }
    
    if (!dataApiBaseUrl) {
      const errMsg = "Data API configuration is missing";
      console.error(errMsg);
      return NextResponse.json(
        {error: errMsg},
        {status: 500}
      );
    }
    
    const rawQueryString = request.url.split("?")[1];
    let dataApiEndpoint = null;
    console.log(request.url)
    console.log(rawQueryString);
    if (!rawQueryString || rawQueryString.length === 0) {
      dataApiEndpoint = new URL(`/api/player/${playerId}`, dataApiBaseUrl);
    } else {
      dataApiEndpoint = new URL(`/api/player/${playerId}?${rawQueryString}`, dataApiBaseUrl);
    }
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
    console.error('Player fetch error:', error);
    return NextResponse.json({ error: 'An error occurred fetching player data' }, { status: 500 });
  }
}