import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log('=== SUPABASE DIAGNOSTIC ===')
    console.log('URL exists:', !!supabaseUrl)
    console.log('Key exists:', !!supabaseKey) 
    console.log('URL preview:', supabaseUrl?.substring(0, 30))

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Missing environment variables',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      })
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test 1: Check artists table
    console.log('Testing artists table...')
    const { data: artists, error: artistsError } = await supabase
      .from('artists')
      .select('*')
      .limit(10)

    // Test 2: Check onboarding_sessions table  
    console.log('Testing onboarding_sessions table...')
    const { data: sessions, error: sessionsError } = await supabase
      .from('onboarding_sessions')
      .select('*')
      .limit(10)

    console.log('Artists result:', { count: artists?.length, error: artistsError?.message })
    console.log('Sessions result:', { count: sessions?.length, error: sessionsError?.message })

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      endpoint: 'DIAGNOSTIC_2025',
      environment: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        project: supabaseUrl.match(/https:\/\/([^.]+)/)?.1
      },
      database: {
        artists: {
          count: artists?.length || 0,
          error: artistsError?.message || null,
          data: artists || [],
          firstRecord: artists?.[0] || null
        },
        sessions: {
          count: sessions?.length || 0, 
          error: sessionsError?.message || null,
          data: sessions || [],
          firstRecord: sessions?.[0] || null
        }
      },
      success: !artistsError && !sessionsError
    })

  } catch (error) {
    console.error('Diagnostic error:', error)
    return NextResponse.json({
      error: 'Exception occurred',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 })
  }
}