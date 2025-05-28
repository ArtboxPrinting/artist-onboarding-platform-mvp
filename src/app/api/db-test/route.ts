import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlPrefix: supabaseUrl?.substring(0, 30)
    })

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        env: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey
        }
      })
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test 1: Check if we can connect at all
    const { data: connectionTest, error: connectionError } = await supabase
      .from('artists')
      .select('count', { count: 'exact', head: true })

    if (connectionError) {
      return NextResponse.json({
        success: false,
        step: 'connection_test',
        error: connectionError.message,
        details: connectionError
      })
    }

    // Test 2: Get actual data
    const { data: artists, error: dataError } = await supabase
      .from('artists')
      .select('*')
      .limit(10)

    if (dataError) {
      return NextResponse.json({
        success: false,
        step: 'data_fetch',
        error: dataError.message,
        details: dataError
      })
    }

    // Test 3: Check table structure
    const sampleArtist = artists?.[0]
    const columns = sampleArtist ? Object.keys(sampleArtist) : []

    return NextResponse.json({
      success: true,
      connection: 'OK',
      database: {
        project: supabaseUrl.match(/https:\/\/([^.]+)/)?.1,
        artistCount: artists?.length || 0,
        columns: columns,
        sampleData: sampleArtist,
        allArtists: artists?.map(a => ({
          id: a.id,
          name: a.full_name || a.first_name || 'No name',
          email: a.email || 'No email',
          created: a.created_at
        }))
      }
    })

  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown'
      }
    }, { status: 500 })
  }
}