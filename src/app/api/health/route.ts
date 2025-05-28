import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Test if we can access the artists table directly
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    
    // Direct query to artists table
    const { data: artists, error: artistsError } = await supabase
      .from('artists')
      .select('*')
      .limit(5)
    
    const { data: sessions, error: sessionsError } = await supabase
      .from('onboarding_sessions')
      .select('*')
      .limit(5)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      database: {
        status: "connected",
        project: "qnnrnawuepyporiagqqr"
      },
      debug: {
        artists: {
          count: artists?.length || 0,
          error: artistsError?.message || null,
          sample: artists?.[0] || null,
          allData: artists || []
        },
        sessions: {
          count: sessions?.length || 0,
          error: sessionsError?.message || null,
          sample: sessions?.[0] || null,
          allData: sessions || []
        }
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}