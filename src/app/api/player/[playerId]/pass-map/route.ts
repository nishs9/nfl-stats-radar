import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
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

    const fullParams = await params;
    const playerId = fullParams.playerId;
    if (!playerId) {
      const errMsg = "Player ID is a required input!";
      console.error(errMsg);
      return NextResponse.json(
        {error: errMsg},
        {status: 400}
      );
    }

    const rawQueryString = request.url.split("?")[1];
    let dataApiEndpoint = null;
    console.log(rawQueryString);
    if (!rawQueryString || rawQueryString.length === 0) {
      const errMsg = "Query string should not be empty/undefined!";
      console.error(errMsg);
      return NextResponse.json(
        {error: errMsg},
        {status: 400}
      );
    } else {
      dataApiEndpoint = new URL(`/api/player/${playerId}/pass-map?${rawQueryString}`, dataApiBaseUrl);
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
    const errMsg = "Unexpected error encountered while retrieving player pass map: " + error;
    console.error(errMsg);
    return NextResponse.json({error: errMsg},{status:500});
  }
}

