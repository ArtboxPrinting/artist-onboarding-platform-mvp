import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('=== USING SERVER CLIENT ===')
    
    // Create proper server-side Supabase client
    const supabase = await createClient()
    
    console.log('Server client created successfully')

    // Test database queries
    const { data: artists, error: artistsError } = await supabase
      .from('artists')
      .select('*')
      .limit(10)

    const { data: sessions, error: sessionsError } = await supabase
      .from('onboarding_sessions')
      .select('*')
      .limit(10)

    console.log('Query results:', {
      artists: { count: artists?.length, error: artistsError?.message },
      sessions: { count: sessions?.length, error: sessionsError?.message }
    })

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      client: 'SERVER_CLIENT_FIXED',
      database: {
        artists: {
          count: artists?.length || 0,
          error: artistsError?.message || null,
          data: artists || [],
          columns: artists?.[0] ? Object.keys(artists[0]) : []
        },
        sessions: {
          count: sessions?.length || 0,
          error: sessionsError?.message || null,
          data: sessions || [],
          columns: sessions?.[0] ? Object.keys(sessions[0]) : []
        }
      },
      success: !artistsError && !sessionsError
    })

  } catch (error) {
    console.error('Server client error:', error)
    return NextResponse.json({
      error: 'Server client failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      client: 'SERVER_CLIENT_ERROR'
    }, { status: 500 })
  }
}