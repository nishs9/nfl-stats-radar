import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const dataApiBaseUrl = process.env.DATA_API_BASE_URL;
    //constDataApiAccessKey = process.env.DATA_API_ACCESS_KEY;

    if (!dataApiBaseUrl) {
      const errMsg = "Data API configuration is missing";
      console.error(errMsg);
      return NextResponse.json(
        {error: errMsg},
        {status: 500}
      );
    }

    const rawQueryString = request.url.split("?")[1];
    if (!rawQueryString) {
      const errMsg = "Teams need to be supplied with the request!"
      console.error(errMsg);
      return NextResponse.json(
        {error:errMsg},
        {status:500}
      );
    }

    const dataApiEndpoint = new URL(`/api/power-rankings/historical?${rawQueryString}`, dataApiBaseUrl);
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
    console.error('Historical power rankings fetch error:', error);
    return NextResponse.json({ error: 'An error occurred fetching historical power rankings' }, { status: 500 });
  }
}

