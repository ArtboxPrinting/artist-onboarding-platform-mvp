import { NextRequest, NextResponse } from 'next/server'
import { createArtist, updateArtist } from '@/lib/supabase/artists'
import { section1Schema } from '@/lib/validations/section1-schema'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the form data
    const validationResult = section1Schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        }, 
        { status: 400 }
      )
    }

    const formData = validationResult.data

    // Check if artist already exists (update vs create)
    if (body.artistId) {
      // Update existing artist
      const result = await updateArtist(body.artistId, formData)
      
      if (result.error) {
        console.error('Error updating artist:', result.error)
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to update artist', 
            details: result.error 
          }, 
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        data: result.data,
        message: 'Artist updated successfully'
      })
    } else {
      // Create new artist
      const result = await createArtist(formData)
      
      if (result.error) {
        console.error('Error creating artist:', result.error)
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to create artist', 
            details: result.error 
          }, 
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        data: result.data,
        message: 'Artist created successfully'
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Unexpected error in artists API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get search parameters
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Fetch artists with their branding data
    let artistsQuery = supabase
      .from('artists')
      .select(`
        id,
        artist_id,
        full_name,
        studio_name,
        email,
        phone,
        location,
        status,
        created_at,
        updated_at,
        artist_branding (
          bio,
          tagline,
          artistic_style,
          color_palette,
          preferred_fonts,
          design_feel,
          social_links,
          domain_name
        )
      `)

    // Apply filters
    if (search) {
      artistsQuery = artistsQuery.or(`full_name.ilike.%${search}%,studio_name.ilike.%${search}%,email.ilike.%${search}%,artist_id.ilike.%${search}%`)
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
      console.error('Error fetching artists:', artistsError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch artists', 
          details: artistsError 
        }, 
        { status: 500 }
      )
    }

    // Get artwork counts for each artist
    const artistIds = artists?.map(artist => artist.id) || []
    const { data: artworkCounts } = await supabase
      .from('artworks')
      .select('artist_id')
      .in('artist_id', artistIds)

    // Get product variant counts for each artist  
    const { data: variantCounts } = await supabase
      .from('product_variants')
      .select('artist_id')
      .in('artist_id', artistIds)

    // Get onboarding sessions to determine completed sections
    const { data: sessions } = await supabase
      .from('onboarding_sessions')
      .select('artist_id, completed_sections')
      .in('artist_id', artistIds)

    // Transform data to match admin dashboard format
    const transformedData = artists?.map(artist => {
      const artworkCount = artworkCounts?.filter(ac => ac.artist_id === artist.id).length || 0
      const variantCount = variantCounts?.filter(vc => vc.artist_id === artist.id).length || 0
      const session = sessions?.find(s => s.artist_id === artist.id)
      const completedSections = session?.completed_sections || []

      return {
        id: artist.artist_id || artist.id,
        firstName: artist.full_name?.split(' ')[0] || '',
        lastName: artist.full_name?.split(' ').slice(1).join(' ') || '',
        studioName: artist.studio_name || '',
        email: artist.email,
        phone: artist.phone,
        status: artist.status,
        completedSections: Array.isArray(completedSections) ? completedSections : [],
        artworkCount,
        variantCount,
        lastUpdated: artist.updated_at,
        submissionDate: artist.created_at,
        branding: artist.artist_branding?.[0] || null,
        // Add completion percentage
        completionPercentage: Array.isArray(completedSections) ? (completedSections.length / 4) * 100 : 0
      }
    }) || []

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Unexpected error fetching artists:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      }, 
      { status: 500 }
    )
  }
}