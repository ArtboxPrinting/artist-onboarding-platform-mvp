import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Test database connection by querying a simple table
    const { data: artists, error: artistsError } = await supabase
      .from('artists')
      .select('id, full_name, email, status, created_at')
      .limit(5)

    const { data: sessions, error: sessionsError } = await supabase
      .from('onboarding_sessions')
      .select('id, artist_id, current_section, created_at')
      .limit(5)

    return NextResponse.json({
      success: true,
      database: !artistsError && !sessionsError,
      timestamp: new Date().toISOString(),
      data: {
        artists: {
          count: artists?.length || 0,
          error: artistsError?.message || null,
          sample: artists?.map(a => ({
            id: a.id,
            name: a.full_name,
            email: a.email,
            status: a.status
          })) || []
        },
        sessions: {
          count: sessions?.length || 0,
          error: sessionsError?.message || null,
          sample: sessions?.map(s => ({
            id: s.id,
            artist_id: s.artist_id,
            section: s.current_section
          })) || []
        }
      }
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({
      success: false,
      database: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}