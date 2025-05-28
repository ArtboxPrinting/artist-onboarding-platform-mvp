import { NextRequest, NextResponse } from 'next/server'

// Seed data for testing admin dashboard
const SEED_ARTISTS = [
  {
    id: 'ART-001',
    artist_id: 'ART-001',
    firstName: 'Alan',
    lastName: 'Moss',
    full_name: 'Alan Moss',
    studioName: 'Moss Creative Studio',
    email: 'alan@artboxprinting.com',
    phone: '+1-555-0123',
    location: 'Victoria, BC',
    status: 'draft',
    completedSections: [1],
    artworkCount: 0,
    variantCount: 0,
    completionPercentage: 25,
    lastUpdated: '2025-05-28T21:30:00Z',
    submissionDate: '2025-05-28T20:15:00Z',
    created_at: '2025-05-28T20:15:00Z',
    updated_at: '2025-05-28T21:30:00Z'
  },
  {
    id: 'ART-002',
    artist_id: 'ART-002',
    firstName: 'Sarah',
    lastName: 'Chen',
    full_name: 'Sarah Chen',
    studioName: 'Ethereal Designs',
    email: 'sarah@etherealdesigns.com',
    phone: '+1-555-0124',
    location: 'Vancouver, BC',
    status: 'active',
    completedSections: [1, 2, 3, 4],
    artworkCount: 15,
    variantCount: 45,
    completionPercentage: 100,
    lastUpdated: '2025-05-27T14:22:00Z',
    submissionDate: '2025-05-25T09:30:00Z',
    created_at: '2025-05-25T09:30:00Z',
    updated_at: '2025-05-27T14:22:00Z'
  },
  {
    id: 'ART-003',
    artist_id: 'ART-003',
    firstName: 'Marcus',
    lastName: 'Rodriguez',
    full_name: 'Marcus Rodriguez',
    studioName: 'Urban Canvas Co.',
    email: 'marcus@urbancanvas.co',
    phone: '+1-555-0125',
    location: 'Toronto, ON',
    status: 'in_review',
    completedSections: [1, 2, 3],
    artworkCount: 8,
    variantCount: 24,
    completionPercentage: 75,
    lastUpdated: '2025-05-28T16:45:00Z',
    submissionDate: '2025-05-26T11:15:00Z',
    created_at: '2025-05-26T11:15:00Z',
    updated_at: '2025-05-28T16:45:00Z'
  },
  {
    id: 'ART-004',
    artist_id: 'ART-004',
    firstName: 'Emily',
    lastName: 'Thompson',
    full_name: 'Emily Thompson',
    studioName: 'Botanical Expressions',
    email: 'emily@botanicalart.com',
    phone: '+1-555-0126',
    location: 'Calgary, AB',
    status: 'ready',
    completedSections: [1, 2, 3, 4],
    artworkCount: 12,
    variantCount: 36,
    completionPercentage: 100,
    lastUpdated: '2025-05-28T10:30:00Z',
    submissionDate: '2025-05-24T15:45:00Z',
    created_at: '2025-05-24T15:45:00Z',
    updated_at: '2025-05-28T10:30:00Z'
  },
  {
    id: 'ART-005',
    artist_id: 'ART-005',
    firstName: 'David',
    lastName: 'Kim',
    full_name: 'David Kim',
    studioName: 'Minimalist Studios',
    email: 'david@minimaliststudios.com',
    phone: '+1-555-0127',
    location: 'Montreal, QC',
    status: 'draft',
    completedSections: [1, 2],
    artworkCount: 3,
    variantCount: 9,
    completionPercentage: 50,
    lastUpdated: '2025-05-28T19:15:00Z',
    submissionDate: '2025-05-27T13:20:00Z',
    created_at: '2025-05-27T13:20:00Z',
    updated_at: '2025-05-28T19:15:00Z'
  },
  {
    id: 'ART-006',
    artist_id: 'ART-006',
    firstName: 'Isabella',
    lastName: 'Foster',
    full_name: 'Isabella Foster',
    studioName: 'Whimsical Wonders',
    email: 'isabella@whimsicalwonders.art',
    phone: '+1-555-0128',
    location: 'Halifax, NS',
    status: 'active',
    completedSections: [1, 2, 3, 4],
    artworkCount: 22,
    variantCount: 66,
    completionPercentage: 100,
    lastUpdated: '2025-05-28T08:45:00Z',
    submissionDate: '2025-05-23T16:30:00Z',
    created_at: '2025-05-23T16:30:00Z',
    updated_at: '2025-05-28T08:45:00Z'
  },
  {
    id: 'ART-007',
    artist_id: 'ART-007',
    firstName: 'James',
    lastName: 'Wilson',
    full_name: 'James Wilson',
    studioName: 'Abstract Visions',
    email: 'james@abstractvisions.net',
    phone: '+1-555-0129',
    location: 'Winnipeg, MB',
    status: 'in_review',
    completedSections: [1, 2],
    artworkCount: 6,
    variantCount: 18,
    completionPercentage: 50,
    lastUpdated: '2025-05-28T12:00:00Z',
    submissionDate: '2025-05-27T10:45:00Z',
    created_at: '2025-05-27T10:45:00Z',
    updated_at: '2025-05-28T12:00:00Z'
  },
  {
    id: 'ART-008',
    artist_id: 'ART-008',
    firstName: 'Priya',
    lastName: 'Patel',
    full_name: 'Priya Patel',
    studioName: 'Cultural Fusion Arts',
    email: 'priya@culturalfusion.ca',
    phone: '+1-555-0130',
    location: 'Surrey, BC',
    status: 'draft',
    completedSections: [1],
    artworkCount: 1,
    variantCount: 3,
    completionPercentage: 25,
    lastUpdated: '2025-05-28T22:00:00Z',
    submissionDate: '2025-05-28T21:45:00Z',
    created_at: '2025-05-28T21:45:00Z',
    updated_at: '2025-05-28T22:00:00Z'
  }
]

export async function GET(request: NextRequest) {
  try {
    // Get search parameters
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    console.log('Fetching seed artists with params:', { search, status, page, limit })

    // Filter seed data based on search and status
    let filteredArtists = SEED_ARTISTS

    if (search) {
      const searchLower = search.toLowerCase()
      filteredArtists = filteredArtists.filter(artist => 
        artist.full_name.toLowerCase().includes(searchLower) ||
        artist.studioName.toLowerCase().includes(searchLower) ||
        artist.email.toLowerCase().includes(searchLower) ||
        artist.id.toLowerCase().includes(searchLower)
      )
    }

    if (status && status !== 'all') {
      filteredArtists = filteredArtists.filter(artist => artist.status === status)
    }

    // Apply pagination
    const paginatedArtists = filteredArtists.slice(offset, offset + limit)

    // Transform data to match admin dashboard format
    const transformedData = paginatedArtists.map(artist => ({
      id: artist.id,
      firstName: artist.firstName,
      lastName: artist.lastName,
      fullName: artist.full_name,
      studioName: artist.studioName,
      email: artist.email,
      phone: artist.phone,
      location: artist.location,
      status: artist.status,
      completedSections: artist.completedSections,
      artworkCount: artist.artworkCount,
      variantCount: artist.variantCount,
      lastUpdated: artist.lastUpdated,
      submissionDate: artist.submissionDate,
      completionPercentage: artist.completionPercentage
    }))

    console.log('Returning seed data:', transformedData.length, 'artists')

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: {
        page,
        limit,
        total: filteredArtists.length,
        totalPages: Math.ceil(filteredArtists.length / limit)
      },
      debug: {
        dataSource: 'SEED_DATA',
        queryExecuted: true,
        artistsFound: transformedData.length,
        totalSeedArtists: SEED_ARTISTS.length,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error in seed artists API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: {
          message: error instanceof Error ? error.message : 'Unknown error',
          dataSource: 'SEED_DATA'
        }
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Mock POST request for seed data:', body)

    // Return success for form submissions (mock)
    return NextResponse.json({ 
      success: true, 
      message: 'Mock artist created successfully (seed data mode)',
      data: { id: `ART-${Date.now()}`, ...body }
    }, { status: 201 })

  } catch (error) {
    console.error('POST error in seed mode:', error)
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