import { NextRequest, NextResponse } from "next/server"
import { saveProductVariant, getProductVariants, deleteProductVariant } from "@/lib/supabase/artists"
import { section4Schema } from "@/lib/validations/section4-schema"

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
    const validatedData = section4Schema.parse(formData)

    // Save pricing configuration - this will handle multiple product variants
    const results = []
    const errors = []

    // Save each product variant
    for (const variant of validatedData.productVariants) {
      try {
        const result = await saveProductVariant(artistId, {
          ...variant,
          pricingStrategy: validatedData.pricingStrategy,
          markupConfig: validatedData.markupConfig,
          wholesalePricing: validatedData.wholesalePricing,
          commissionPricing: validatedData.commissionPricing,
          specialPricing: validatedData.specialPricing,
          skuGeneration: validatedData.skuGeneration,
          priceDisplay: validatedData.priceDisplay,
        })

        if (result.error) {
          errors.push(`Error saving variant ${variant.sku}: ${result.error}`)
        } else {
          results.push(result.data)
        }
      } catch (error) {
        errors.push(`Error processing variant ${variant.sku}: ${error}`)
      }
    }

    if (errors.length > 0 && results.length === 0) {
      return NextResponse.json(
        { success: false, error: errors.join("; ") },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        savedVariants: results,
        errors: errors.length > 0 ? errors : undefined,
        pricingConfig: {
          strategy: validatedData.pricingStrategy,
          markup: validatedData.markupConfig,
          wholesale: validatedData.wholesalePricing,
          commission: validatedData.commissionPricing,
        }
      },
      message: `Pricing configuration saved successfully${errors.length > 0 ? ` with ${errors.length} warnings` : ""}`
    })

  } catch (error) {
    console.error("Error in pricing API:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to save pricing configuration" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const artistId = searchParams.get("artistId")
    const variantId = searchParams.get("variantId")

    if (!artistId && !variantId) {
      return NextResponse.json(
        { success: false, error: "Artist ID or Variant ID is required" },
        { status: 400 }
      )
    }

    const result = await getProductVariants(artistId, variantId)

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
    console.error("Error in pricing GET:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch pricing data" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { artistId, variantId, formData } = body

    if (!artistId && !variantId) {
      return NextResponse.json(
        { success: false, error: "Artist ID or Variant ID is required" },
        { status: 400 }
      )
    }

    // If updating entire pricing configuration
    if (artistId && formData.productVariants) {
      const validatedData = section4Schema.parse(formData)
      
      const results = []
      const errors = []

      for (const variant of validatedData.productVariants) {
        try {
          const result = await saveProductVariant(artistId, {
            ...variant,
            pricingStrategy: validatedData.pricingStrategy,
            markupConfig: validatedData.markupConfig,
            wholesalePricing: validatedData.wholesalePricing,
            commissionPricing: validatedData.commissionPricing,
            specialPricing: validatedData.specialPricing,
            skuGeneration: validatedData.skuGeneration,
            priceDisplay: validatedData.priceDisplay,
          })

          if (result.error) {
            errors.push(`Error updating variant ${variant.sku}: ${result.error}`)
          } else {
            results.push(result.data)
          }
        } catch (error) {
          errors.push(`Error processing variant ${variant.sku}: ${error}`)
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          updatedVariants: results,
          errors: errors.length > 0 ? errors : undefined,
        },
        message: `Pricing configuration updated successfully${errors.length > 0 ? ` with ${errors.length} warnings` : ""}`
      })
    }

    // If updating single variant
    if (variantId) {
      const result = await saveProductVariant(artistId, formData)

      if (result.error) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        data: result.data,
        message: "Product variant updated successfully"
      })
    }

    return NextResponse.json(
      { success: false, error: "Invalid request parameters" },
      { status: 400 }
    )

  } catch (error) {
    console.error("Error in pricing PUT:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to update pricing configuration" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const variantId = searchParams.get("variantId")

    if (!variantId) {
      return NextResponse.json(
        { success: false, error: "Variant ID is required" },
        { status: 400 }
      )
    }

    const result = await deleteProductVariant(variantId)

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Product variant deleted successfully"
    })

  } catch (error) {
    console.error("Error in pricing DELETE:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete product variant" },
      { status: 500 }
    )
  }
}
