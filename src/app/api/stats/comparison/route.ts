import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const dataApiBaseUrl = process.env.DATA_API_BASE_URL;
    // const dataApiAccessKey = process.env.DATA_API_ACCESS_KEY;
    
    if (!dataApiBaseUrl) {
      const errMsg = "Data API configuration is missing";
      console.error(errMsg);
      return NextResponse.json(
        {error: errMsg},
        {status: 500}
      );
    }
    
    const queryString = request.url.split("?")[1];
    const dataApiEndpoint = new URL(`/api/stats/comparison?${queryString}`, dataApiBaseUrl);
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
    console.error('Error in stats comparison:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 