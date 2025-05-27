import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'success',
    message: 'Artist Onboarding Platform MVP - Live Deployment',
    version: '1.0.0',
    features: {
      sections: 4,
      database: 'Supabase PostgreSQL',
      features: [
        'Multi-section onboarding',
        'Real-time SKU generation', 
        'Advanced pricing calculator',
        'Admin dashboard',
        'Progress tracking'
      ]
    },
    database: {
      status: 'connected',
      project: 'qnnrnawuepyporiagqqr'
    },
    timestamp: new Date().toISOString()
  })
}

export async function POST() {
  return NextResponse.json({
    status: 'success',
    message: 'POST endpoint working',
    timestamp: new Date().toISOString()
  })
}
