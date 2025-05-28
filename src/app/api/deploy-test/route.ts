import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'DEPLOYMENT_TEST',
    timestamp: new Date().toISOString(),
    message: 'Testing if Vercel auto-deployment is working',
    version: '2025-05-28-23:25'
  })
}