import { NextRequest, NextResponse } from 'next/server'
import { getArtist, saveOnboardingSession } from '@/lib/supabase/artists'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { artistId, sectionData, completedSections } = body
    
    if (!artistId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Artist ID is required' 
        }, 
        { status: 400 }
      )
    }

    // Verify artist exists
    const artistResult = await getArtist(artistId)
    if (artistResult.error) {
      console.error('Error verifying artist:', artistResult.error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Artist not found', 
          details: artistResult.error 
        }, 
        { status: 404 }
      )
    }

    // Save final onboarding session with completion status
    const sessionResult = await saveOnboardingSession(
      artistId,
      4, // Final section
      {
        ...sectionData,
        completedSections,
        submittedAt: new Date().toISOString(),
        isComplete: true
      }
    )

    if (sessionResult.error) {
      console.error('Error saving completed session:', sessionResult.error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to complete onboarding', 
          details: sessionResult.error 
        }, 
        { status: 500 }
      )
    }

    // TODO: Here you could trigger additional actions like:
    // - Send notification emails
    // - Update artist status to 'submitted'
    // - Generate initial e-commerce site data
    // - Add to admin review queue

    return NextResponse.json({ 
      success: true, 
      data: {
        message: 'Onboarding completed successfully!',
        artistId: artistId,
        sessionId: sessionResult.data?.id,
        completedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Unexpected error completing onboarding:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error completing onboarding' 
      }, 
      { status: 500 }
    )
  }
}