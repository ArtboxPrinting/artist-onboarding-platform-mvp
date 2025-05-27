import { NextRequest, NextResponse } from "next/server"
import { saveProductConfiguration, getProductConfiguration } from "@/lib/supabase/artists"
import { section3Schema } from "@/lib/validations/section3-schema"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formData, artistId } = body

    if (!artistId) {
      return NextResponse.json(
        { success: false, error: "Artist ID is required" },
        { status: 400 }
      )
    }

    // Validate the form data
    const validatedData = section3Schema.parse(formData)

    const result = await saveProductConfiguration(artistId, validatedData)

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Product configuration saved successfully"
    })

  } catch (error) {
    console.error("Error in product-configuration API:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to save product configuration" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const artistId = searchParams.get("artistId")

    if (!artistId) {
      return NextResponse.json(
        { success: false, error: "Artist ID is required" },
        { status: 400 }
      )
    }

    const result = await getProductConfiguration(artistId)

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })

  } catch (error) {
    console.error("Error in product-configuration GET:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch product configuration" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { artistId, formData } = body

    if (!artistId) {
      return NextResponse.json(
        { success: false, error: "Artist ID is required" },
        { status: 400 }
      )
    }

    // Validate the form data
    const validatedData = section3Schema.parse(formData)

    const result = await saveProductConfiguration(artistId, validatedData)

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Product configuration updated successfully"
    })

  } catch (error) {
    console.error("Error in product-configuration PUT:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to update product configuration" },
      { status: 500 }
    )
  }
}
