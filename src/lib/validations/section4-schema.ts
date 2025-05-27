import { z } from "zod"

// Base pricing model schema
export const basePricingSchema = z.object({
  baseCost: z.number().min(0, "Base cost cannot be negative"),
  materialCost: z.number().min(0, "Material cost cannot be negative").default(0),
  laborCost: z.number().min(0, "Labor cost cannot be negative").default(0),
  overheadCost: z.number().min(0, "Overhead cost cannot be negative").default(0),
})

// Markup configuration schema
export const markupConfigSchema = z.object({
  defaultMarkupPercentage: z.number().min(0, "Markup cannot be negative").max(1000, "Markup too high").default(200),
  markupByProductType: z.record(z.string(), z.number().min(0).max(1000)).optional(),
  markupBySize: z.record(z.string(), z.number().min(0).max(1000)).optional(),
  markupByMaterial: z.record(z.string(), z.number().min(0).max(1000)).optional(),
  volumeDiscounts: z.array(z.object({
    quantity: z.number().int().positive(),
    discountPercentage: z.number().min(0).max(100),
  })).optional().or(z.literal([])),
})

// Product variant pricing schema
export const productVariantPricingSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  productType: z.enum([
    "unframed_print", 
    "framed_print", 
    "canvas_wrap", 
    "metal_print", 
    "acrylic_print",
    "greeting_card",
    "postcard", 
    "poster",
    "sticker",
    "custom"
  ]),
  size: z.string().min(1, "Size is required"),
  media: z.string().min(1, "Media is required"),
  frameColor: z.string().optional().or(z.literal("")),
  baseCost: z.number().min(0, "Base cost cannot be negative"),
  markupPercentage: z.number().min(0, "Markup cannot be negative").max(1000, "Markup too high"),
  finalPrice: z.number().min(0, "Final price cannot be negative"),
  isLimitedEdition: z.boolean().default(false),
  limitedEditionPrice: z.number().min(0, "Limited edition price cannot be negative").optional(),
  isSigned: z.boolean().default(false),
  signedPrice: z.number().min(0, "Signed price cannot be negative").optional(),
  isActive: z.boolean().default(true),
  specialOffers: z.array(z.object({
    name: z.string().min(1, "Offer name required"),
    discountPercentage: z.number().min(0).max(100),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isActive: z.boolean().default(true),
  })).optional().or(z.literal([])),
})

// Pricing strategy schema  
export const pricingStrategySchema = z.object({
  strategy: z.enum(["cost_plus", "market_based", "value_based", "competitive", "custom"]).default("cost_plus"),
  targetMargin: z.number().min(0, "Target margin cannot be negative").max(100, "Target margin cannot exceed 100%").default(60),
  minimumPrice: z.number().min(0, "Minimum price cannot be negative").default(25),
  maximumPrice: z.number().min(0, "Maximum price cannot be negative").optional(),
  priceRounding: z.enum(["none", "nearest_5", "nearest_10", "nearest_25", "nearest_50"]).default("nearest_5"),
  currencySymbol: z.string().default("$"),
  includesTax: z.boolean().default(false),
  taxRate: z.number().min(0, "Tax rate cannot be negative").max(100, "Tax rate cannot exceed 100%").default(0),
})

// Wholesale pricing schema
export const wholesalePricingSchema = z.object({
  offersWholesale: z.boolean().default(false),
  minimumQuantity: z.number().int().positive().default(10),
  wholesaleDiscountPercentage: z.number().min(0, "Discount cannot be negative").max(80, "Discount too high").default(30),
  wholesaleTiers: z.array(z.object({
    minQuantity: z.number().int().positive(),
    discountPercentage: z.number().min(0).max(80),
    description: z.string().optional().or(z.literal("")),
  })).optional().or(z.literal([])),
  wholesaleTerms: z.string().max(1000, "Terms too long").optional().or(z.literal("")),
  paymentTerms: z.enum(["net_15", "net_30", "net_60", "payment_on_delivery", "50_50_split"]).default("net_30"),
})

// Commission pricing schema
export const commissionPricingSchema = z.object({
  offersCommissions: z.boolean().default(true),
  baseCommissionRate: z.number().min(0, "Rate cannot be negative"),
  commissionTypes: z.array(z.object({
    type: z.string().min(1, "Commission type required"),
    description: z.string().max(500, "Description too long").optional().or(z.literal("")),
    hourlyRate: z.number().min(0, "Rate cannot be negative").optional(),
    flatRate: z.number().min(0, "Rate cannot be negative").optional(),
    markupPercentage: z.number().min(0, "Markup cannot be negative").optional(),
    minimumPrice: z.number().min(0, "Minimum price cannot be negative").optional(),
  })).optional().or(z.literal([])),
  depositPercentage: z.number().min(0, "Deposit cannot be negative").max(100, "Deposit cannot exceed 100%").default(50),
  rushOrderSurcharge: z.number().min(0, "Surcharge cannot be negative").default(25),
  revisionPolicy: z.object({
    includedRevisions: z.number().int().min(0, "Included revisions cannot be negative").default(2),
    additionalRevisionCost: z.number().min(0, "Additional revision cost cannot be negative").default(50),
  }),
})

// Section 4: Pricing & Markup Configuration validation schema
export const section4Schema = z.object({
  // Core pricing strategy
  pricingStrategy: pricingStrategySchema,
  
  // Markup configuration
  markupConfig: markupConfigSchema,
  
  // Base costs for different categories
  baseCosts: z.object({
    printing: basePricingSchema,
    framing: basePricingSchema,
    shipping: basePricingSchema,
    packaging: basePricingSchema,
    handling: basePricingSchema,
  }),

  // Product variant pricing
  productVariants: z.array(productVariantPricingSchema).min(1, "At least one product variant must be configured"),

  // Wholesale pricing
  wholesalePricing: wholesalePricingSchema,

  // Commission pricing
  commissionPricing: commissionPricingSchema,

  // Special pricing rules
  specialPricing: z.object({
    seasonalAdjustments: z.array(z.object({
      name: z.string().min(1, "Season name required"),
      startDate: z.string(), // ISO date string
      endDate: z.string(), // ISO date string
      adjustmentPercentage: z.number().min(-50).max(100), // Can be negative for discounts
      isActive: z.boolean().default(true),
    })).optional().or(z.literal([])),
    bulkDiscounts: z.array(z.object({
      minQuantity: z.number().int().positive(),
      discountPercentage: z.number().min(0).max(50),
      description: z.string().optional().or(z.literal("")),
    })).optional().or(z.literal([])),
    memberDiscounts: z.object({
      offersDiscounts: z.boolean().default(false),
      discountPercentage: z.number().min(0).max(50).default(10),
      membershipTiers: z.array(z.object({
        name: z.string().min(1, "Tier name required"),
        discountPercentage: z.number().min(0).max(50),
        requirements: z.string().optional().or(z.literal("")),
      })).optional().or(z.literal([])),
    }),
  }),

  // SKU generation settings
  skuGeneration: z.object({
    useAutoGeneration: z.boolean().default(true),
    prefix: z.string().max(10, "Prefix too long").default("ALN"),
    includeArtistInitials: z.boolean().default(true),
    includeProductCode: z.boolean().default(true),
    includeSizeCode: z.boolean().default(true),
    includeMediaCode: z.boolean().default(true),
    includeFrameCode: z.boolean().default(true),
    separator: z.string().max(1, "Separator must be single character").default("-"),
    customFormat: z.string().max(100, "Custom format too long").optional(),
  }),

  // Price display preferences
  priceDisplay: z.object({
    showPricesOnWebsite: z.boolean().default(true),
    showStartingAtPrices: z.boolean().default(true),
    showPriceRanges: z.boolean().default(false),
    hideOutOfStockPrices: z.boolean().default(false),
    showDiscountedPrices: z.boolean().default(true),
    priceFormat: z.enum(["$0.00", "$0", "$0.99", "$0,000.00"]).default("$0.00"),
  }),
})

export type Section4FormData = z.infer<typeof section4Schema>
export type ProductVariantPricing = z.infer<typeof productVariantPricingSchema>
export type PricingStrategy = z.infer<typeof pricingStrategySchema>
export type MarkupConfig = z.infer<typeof markupConfigSchema>

// Default values for the form
export const section4DefaultValues: Section4FormData = {
  pricingStrategy: {
    strategy: "cost_plus",
    targetMargin: 60,
    minimumPrice: 25,
    priceRounding: "nearest_5",
    currencySymbol: "$",
    includesTax: false,
    taxRate: 0,
  },
  markupConfig: {
    defaultMarkupPercentage: 200,
    volumeDiscounts: [],
  },
  baseCosts: {
    printing: {
      baseCost: 0,
      materialCost: 0,
      laborCost: 0,
      overheadCost: 0,
    },
    framing: {
      baseCost: 0,
      materialCost: 0,
      laborCost: 0,
      overheadCost: 0,
    },
    shipping: {
      baseCost: 0,
      materialCost: 0,
      laborCost: 0,
      overheadCost: 0,
    },
    packaging: {
      baseCost: 0,
      materialCost: 0,
      laborCost: 0,
      overheadCost: 0,
    },
    handling: {
      baseCost: 0,
      materialCost: 0,
      laborCost: 0,
      overheadCost: 0,
    },
  },
  productVariants: [],
  wholesalePricing: {
    offersWholesale: false,
    minimumQuantity: 10,
    wholesaleDiscountPercentage: 30,
    wholesaleTiers: [],
    wholesaleTerms: "",
    paymentTerms: "net_30",
  },
  commissionPricing: {
    offersCommissions: true,
    baseCommissionRate: 150,
    commissionTypes: [],
    depositPercentage: 50,
    rushOrderSurcharge: 25,
    revisionPolicy: {
      includedRevisions: 2,
      additionalRevisionCost: 50,
    },
  },
  specialPricing: {
    seasonalAdjustments: [],
    bulkDiscounts: [],
    memberDiscounts: {
      offersDiscounts: false,
      discountPercentage: 10,
      membershipTiers: [],
    },
  },
  skuGeneration: {
    useAutoGeneration: true,
    prefix: "ALN",
    includeArtistInitials: true,
    includeProductCode: true,
    includeSizeCode: true,
    includeMediaCode: true,
    includeFrameCode: true,
    separator: "-",
  },
  priceDisplay: {
    showPricesOnWebsite: true,
    showStartingAtPrices: true,
    showPriceRanges: false,
    hideOutOfStockPrices: false,
    showDiscountedPrices: true,
    priceFormat: "$0.00",
  },
}

// Common pricing strategies with descriptions
export const pricingStrategiesInfo = [
  {
    value: "cost_plus",
    label: "Cost Plus",
    description: "Add a fixed markup percentage to your costs",
    pros: ["Simple to calculate", "Ensures profit margin", "Easy to adjust"],
    cons: ["May not reflect market value", "Ignores competition"],
  },
  {
    value: "market_based", 
    label: "Market Based",
    description: "Price based on what similar artists charge",
    pros: ["Competitive positioning", "Market alignment", "Customer acceptance"],
    cons: ["Requires market research", "May limit profit margins"],
  },
  {
    value: "value_based",
    label: "Value Based", 
    description: "Price based on perceived value to customers",
    pros: ["Maximizes revenue potential", "Reflects unique value", "Premium positioning"],
    cons: ["Harder to determine", "Requires strong brand", "Market education needed"],
  },
  {
    value: "competitive",
    label: "Competitive",
    description: "Match or beat competitor pricing",
    pros: ["Easy market entry", "Clear positioning", "Customer familiarity"],
    cons: ["May reduce margins", "Race to bottom", "Limited differentiation"],
  },
  {
    value: "custom",
    label: "Custom Strategy",
    description: "Combination of multiple approaches",
    pros: ["Flexible", "Tailored to business", "Can optimize by product"],
    cons: ["Complex to manage", "Requires expertise", "Time intensive"],
  },
] as const

// Standard product types for SKU generation
export const productTypeCodes = {
  "unframed_print": "PRNT",
  "framed_print": "FRMD", 
  "canvas_wrap": "CANV",
  "metal_print": "METL",
  "acrylic_print": "ACRL",
  "greeting_card": "CARD",
  "postcard": "POST",
  "poster": "PSTR",
  "sticker": "STKR",
  "custom": "CSTM",
} as const

// Standard size codes for SKU generation
export const sizeCodes = {
  "5x7": "5X7",
  "8x10": "8X10", 
  "11x14": "11X14",
  "12x16": "12X16",
  "16x20": "16X20",
  "18x24": "18X24",
  "24x30": "24X30",
  "24x36": "24X36",
} as const

// Standard media codes for SKU generation
export const mediaCodes = {
  "Fine Art Rag": "RAG",
  "Photo Satin": "SAT",
  "Canvas": "CNV", 
  "Metallic Paper": "MET",
  "Photo Glossy": "GLS",
  "Photo Matte": "MAT",
} as const

// Standard frame color codes for SKU generation
export const frameColorCodes = {
  "Black": "BLK",
  "White": "WHT",
  "Natural Wood": "NAT",
  "Dark Wood": "DRK", 
  "Silver": "SLV",
  "Gold": "GLD",
} as const

// Helper function to generate SKU
export function generateSKU(
  artistInitials: string,
  productType: keyof typeof productTypeCodes,
  size: string,
  media: string,
  frameColor?: string,
  options: {
    prefix?: string
    separator?: string
    includeArtistInitials?: boolean
    includeProductCode?: boolean
    includeSizeCode?: boolean
    includeMediaCode?: boolean
    includeFrameCode?: boolean
  } = {}
): string {
  const {
    prefix = "ALN",
    separator = "-",
    includeArtistInitials = true,
    includeProductCode = true,
    includeSizeCode = true,
    includeMediaCode = true,
    includeFrameCode = true,
  } = options

  const parts: string[] = [prefix]

  if (includeArtistInitials && artistInitials) {
    parts.push(artistInitials.toUpperCase())
  }

  if (includeProductCode) {
    parts.push(productTypeCodes[productType])
  }

  if (includeSizeCode) {
    const sizeCode = sizeCodes[size as keyof typeof sizeCodes] || size.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    parts.push(sizeCode)
  }

  if (includeMediaCode) {
    const mediaCode = mediaCodes[media as keyof typeof mediaCodes] || media.substring(0, 3).toUpperCase()
    parts.push(mediaCode)
  }

  if (includeFrameCode && frameColor) {
    const frameCode = frameColorCodes[frameColor as keyof typeof frameColorCodes] || frameColor.substring(0, 3).toUpperCase()
    parts.push(frameCode)
  }

  return parts.join(separator)
}

// Helper function to calculate final price
export function calculateFinalPrice(
  baseCost: number,
  markupPercentage: number,
  options: {
    isLimitedEdition?: boolean
    limitedEditionSurcharge?: number
    isSigned?: boolean
    signedSurcharge?: number
    discount?: number
    taxRate?: number
    includesTax?: boolean
  } = {}
): number {
  const {
    isLimitedEdition = false,
    limitedEditionSurcharge = 0,
    isSigned = false,
    signedSurcharge = 0,
    discount = 0,
    taxRate = 0,
    includesTax = false,
  } = options

  let price = baseCost * (1 + markupPercentage / 100)

  if (isLimitedEdition) {
    price += limitedEditionSurcharge
  }

  if (isSigned) {
    price += signedSurcharge
  }

  if (discount > 0) {
    price *= (1 - discount / 100)
  }

  if (includesTax && taxRate > 0) {
    price *= (1 + taxRate / 100)
  }

  return Math.round(price * 100) / 100 // Round to 2 decimal places
}
