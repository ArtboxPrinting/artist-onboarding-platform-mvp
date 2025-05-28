import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Create proper server-side Supabase client
    const supabase = await createClient()
    
    // Get search parameters
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    console.log('Server-side artists query with params:', { search, status, page, limit })

    // Query the artists table with proper server client
    let artistsQuery = supabase
      .from('artists')
      .select('*')

    // Apply filters
    if (search) {
      artistsQuery = artistsQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (status && status !== 'all') {
      artistsQuery = artistsQuery.eq('status', status)
    }

    // Apply pagination and ordering
    artistsQuery = artistsQuery
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    const { data: artists, error: artistsError, count } = await artistsQuery

    if (artistsError) {
      console.error('Database query error:', artistsError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database query failed', 
          details: artistsError
        }, 
        { status: 500 }
      )
    }

    console.log('Found artists in database:', artists?.length || 0)

    // Transform data for admin dashboard
    const transformedData = artists?.map(artist => ({
      id: artist.id || artist.artist_id,
      firstName: artist.first_name || artist.full_name?.split(' ')[0] || 'Unknown',
      lastName: artist.last_name || artist.full_name?.split(' ').slice(1).join(' ') || '',
      fullName: artist.full_name || `${artist.first_name} ${artist.last_name}`.trim(),
      studioName: artist.studio_name || artist.business_name || 'Studio Not Set',
      email: artist.email || '',
      phone: artist.phone || '',
      location: artist.location || '',
      status: artist.status || 'draft',
      completedSections: [1], // Default to section 1 complete
      artworkCount: artist.artwork_count || 0,
      variantCount: artist.variant_count || 0,
      lastUpdated: artist.updated_at || artist.created_at,
      submissionDate: artist.created_at,
      completionPercentage: 25, // Default for section 1
      rawData: artist // Keep raw data for debugging
    })) || []

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      debug: {
        dataSource: 'REAL_DATABASE_SERVER_CLIENT',
        artistsFound: artists?.length || 0,
        sampleColumns: artists?.[0] ? Object.keys(artists[0]) : [],
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Server-side API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: {
          message: error instanceof Error ? error.message : 'Unknown error',
          client: 'SERVER_CLIENT'
        }
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('artists')
      .insert(body)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to create artist', details: error }, 
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Artist created successfully'
    }, { status: 201 })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}