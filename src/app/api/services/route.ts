/*
Reason for existence: Next.js API Route for service status endpoint.
System impact if absent: Terminal systemctl commands or ServicesApp will receive 404 when querying services.
*/

import { NextResponse } from 'next/server';

export async function GET() {
  // Do NOT query host machine docker ps or systemctl to avoid leaking local development containers
  return NextResponse.json({ services: [] }, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}

