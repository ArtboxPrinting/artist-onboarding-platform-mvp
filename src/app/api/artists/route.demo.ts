import { NextRequest, NextResponse } from 'next/server'

// Demo mode - no database required
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Return success response without database
    return NextResponse.json({
      success: true,
      data: {
        id: `demo_artist_${Date.now()}`,
        artist_id: `DEMO_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        ...body,
        status: 'demo_mode'
      },
      message: 'Artist created successfully (Demo Mode)'
    }, { status: 201 })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Demo mode error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      {
        id: 'demo_1',
        artist_id: 'DEMO_001',
        full_name: 'Demo Artist',
        studio_name: 'Demo Studio',
        email: 'demo@example.com',
        status: 'demo_mode'
      }
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1
    },
    message: 'Demo data returned'
  })
}
