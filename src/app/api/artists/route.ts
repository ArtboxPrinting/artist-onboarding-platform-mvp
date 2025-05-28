import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Use the same environment variables that work for your health check
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        details: { hasUrl: !!supabaseUrl, hasKey: !!supabaseKey }
      }, { status: 500 })
    }

    // Create direct Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Connecting to Supabase:', supabaseUrl.substring(0, 20) + '...')

    // Simple query to get all artists from your database
    const { data: artists, error } = await supabase
      .from('artists')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: error
      }, { status: 500 })
    }

    console.log('Found artists:', artists?.length || 0)

    // Transform the data for the admin dashboard
    const transformedData = artists?.map(artist => ({
      id: artist.id || artist.artist_id,
      firstName: artist.first_name || artist.full_name?.split(' ')[0] || '',
      lastName: artist.last_name || artist.full_name?.split(' ').slice(1).join(' ') || '',
      fullName: artist.full_name || `${artist.first_name || ''} ${artist.last_name || ''}`.trim(),
      studioName: artist.studio_name || '',
      email: artist.email || '',
      phone: artist.phone || '',
      location: artist.location || '',
      status: artist.status || 'draft',
      completedSections: [1], // Default to section 1 complete
      artworkCount: 0,
      variantCount: 0,
      lastUpdated: artist.updated_at || artist.created_at,
      submissionDate: artist.created_at,
      completionPercentage: 25,
      rawData: artist // Include raw data for debugging
    })) || []

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: {
        page: 1,
        limit: 50,
        total: artists?.length || 0,
        totalPages: 1
      },
      debug: {
        dataSource: 'REAL_DATABASE',
        supabaseProject: supabaseUrl.match(/https:\/\/([^.]+)/)?.1,
        artistsFound: artists?.length || 0,
        sampleArtist: artists?.[0] || null
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack?.split('\n').slice(0, 3) : undefined
      }
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: 'POST not implemented yet' 
  })
}