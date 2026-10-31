import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const week = searchParams.get('week');
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

    if (week) {
      const dataApiEndpoint = new URL(
        `/api/power-rankings?week=${encodeURIComponent(week)}`,
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
    } else {
      const dataApiEndpoint = new URL(
        `/api/power-rankings`,
        dataApiBaseUrl,
      );
      console.log(dataApiEndpoint);

      const response = await fetch(dataApiEndpoint, {
        cache: 'no-store',
        signal: AbortSignal.timeout(5_000),
      })
  
      const responseBody = await response.text();
    
      return new NextResponse(responseBody, {
        status: response.status,
        headers: {
          'Content-Type':
            response.headers.get('content-type') ?? 'application-json',
        },
      });
    }
  } catch (error) {
    console.error('Power rankings fetch error:', error);
    return NextResponse.json({ error: 'An error occurred fetching power rankings' }, { status: 500 });
  }
}

